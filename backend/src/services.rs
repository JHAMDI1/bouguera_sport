use chrono::Utc;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use actix_web::web;
use reqwest;

use crate::config::Config;
use crate::models::{ReceiptData, User};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub role: String,
    pub exp: usize,
    pub iat: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClerkUserData {
    pub clerk_id: String,
    pub email: String,
    pub full_name: String,
}

/// Réponse de l'API Clerk pour /oauth/userinfo
#[derive(Debug, Deserialize)]
struct ClerkUserInfoResponse {
    sub: String,
    email: Option<String>,
    name: Option<String>,
    given_name: Option<String>,
    family_name: Option<String>,
}

/// Réponse de l'API Clerk pour /v1/tokens/verify
#[allow(dead_code)]
#[derive(Debug, Deserialize)]
struct ClerkTokenVerifyResponse {
    user_id: Option<String>,
    sub: Option<String>,
    email: Option<String>,
}

pub fn generate_jwt(user: &User, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let exp = now + chrono::Duration::hours(24);

    let claims = Claims {
        sub: user.id.clone(),
        email: user.email.clone(),
        role: format!("{:?}", user.role).to_lowercase(),
        exp: exp.timestamp() as usize,
        iat: now.timestamp() as usize,
    };

    let header = Header::new(Algorithm::HS256);
    encode(
        &header,
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

#[allow(unused)]
pub fn verify_jwt(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::HS256);
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )?;
    Ok(token_data.claims)
}

/// Vérifie un token de session Clerk contre l'API Clerk.
///
/// Stratégie :
/// 1. Appel à GET https://api.clerk.com/oauth/userinfo avec le token en Bearer
///    → retourne les infos utilisateur si le token est valide
/// 2. En cas d'échec, retourne une erreur explicite
pub async fn verify_clerk_token(
    token: &str,
    config: web::Data<Config>,
) -> Result<ClerkUserData, String> {
    if token.is_empty() {
        return Err("Token Clerk manquant".to_string());
    }

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Erreur création client HTTP: {}", e))?;

    // Étape 1 : Utiliser /oauth/userinfo avec le session token
    let userinfo_url = "https://api.clerk.com/oauth/userinfo";
    let response = client
        .get(userinfo_url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .send()
        .await
        .map_err(|e| format!("Erreur appel Clerk API: {}", e))?;

    if response.status().is_success() {
        let user_info: ClerkUserInfoResponse = response
            .json()
            .await
            .map_err(|e| format!("Erreur parsing réponse Clerk: {}", e))?;

        let full_name = user_info.name
            .or_else(|| {
                match (user_info.given_name, user_info.family_name) {
                    (Some(g), Some(f)) => Some(format!("{} {}", g, f)),
                    (Some(g), None) => Some(g),
                    (None, Some(f)) => Some(f),
                    _ => None,
                }
            })
            .unwrap_or_else(|| "Utilisateur inconnu".to_string());

        return Ok(ClerkUserData {
            clerk_id: user_info.sub,
            email: user_info.email.unwrap_or_default(),
            full_name,
        });
    }

    let status = response.status();

    // Étape 2 : Si /oauth/userinfo échoue, essayer via le secret key
    // Cette méthode utilise l'API Clerk backend avec CLERK_SECRET_KEY
    if !config.clerk_secret_key.is_empty() {
        let verify_url = "https://api.clerk.com/v1/tokens/verify";
        let backend_response = client
            .post(verify_url)
            .header("Authorization", format!("Bearer {}", config.clerk_secret_key))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(format!("token={}", token))
            .send()
            .await
            .map_err(|e| format!("Erreur vérification backend Clerk: {}", e))?;

        if backend_response.status().is_success() {
            let verify_data: ClerkTokenVerifyResponse = backend_response
                .json()
                .await
                .map_err(|e| format!("Erreur parsing vérification Clerk: {}", e))?;

            let user_id = verify_data.user_id
                .or(verify_data.sub)
                .ok_or_else(|| "user_id manquant dans la réponse Clerk".to_string())?;

            return Ok(ClerkUserData {
                clerk_id: user_id,
                email: verify_data.email.unwrap_or_default(),
                full_name: "Utilisateur Clerk".to_string(),
            });
        }
    }

    // Les deux méthodes ont échoué
    Err(format!(
        "Token Clerk invalide ou expiré (HTTP {}). Assurez-vous d'envoyer un session token valide.",
        status
    ))
}

pub fn generate_receipt_number() -> String {
    let timestamp = Utc::now().timestamp();
    let random_suffix = rand::random::<u16>() % 10000;
    format!("REC-{}-{:04}", timestamp, random_suffix)
}

pub fn generate_receipt_pdf(receipt_data: &ReceiptData) -> Result<Vec<u8>, String> {
    // In production, use a PDF generation library like printpdf or genpdf
    // For now, return mock PDF bytes
    // This would generate a professional receipt with:
    // - Club logo
    // - Receipt number
    // - Member details
    // - Payment details
    // - Authorized signature
    // - QR code for verification
    
    let mock_pdf = format!(
        "%PDF-1.4\nReceipt: {}\nMember: {}\nAmount: {:.3} TND\nDate: {}\nPaid by: {}\n%%EOF",
        receipt_data.receipt_number,
        receipt_data.member_name,
        receipt_data.amount,
        receipt_data.payment_date,
        receipt_data.received_by
    );
    
    Ok(mock_pdf.into_bytes())
}

// Convex API client configuration
pub struct ConvexClient {
    base_url: String,
    api_key: String,
    client: reqwest::Client,
}

impl ConvexClient {
    pub fn new(base_url: String, api_key: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");
        
        Self {
            base_url,
            api_key,
            client,
        }
    }

    pub async fn query(
        &self,
        query_name: &str,
        args: serde_json::Value,
    ) -> Result<serde_json::Value, String> {
        let url = format!("{}/api/query", self.base_url);
        
        let payload = serde_json::json!({
            "path": query_name,
            "args": args,
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Convex query failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Convex API error ({}): {}", status, error_text));
        }

        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Convex response: {}", e))?;

        Ok(result)
    }

    pub async fn mutation(
        &self,
        mutation_name: &str,
        args: serde_json::Value,
    ) -> Result<serde_json::Value, String> {
        let url = format!("{}/api/mutation", self.base_url);
        
        let payload = serde_json::json!({
            "path": mutation_name,
            "args": args,
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Convex mutation failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Convex API error ({}): {}", status, error_text));
        }

        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Convex response: {}", e))?;

        Ok(result)
    }

    pub async fn action(
        &self,
        action_name: &str,
        args: serde_json::Value,
    ) -> Result<serde_json::Value, String> {
        let url = format!("{}/api/action", self.base_url);
        
        let payload = serde_json::json!({
            "path": action_name,
            "args": args,
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Convex action failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Convex API error ({}): {}", status, error_text));
        }

        let result: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse Convex response: {}", e))?;

        Ok(result)
    }
}

// Global client instance (initialized once)
use std::sync::OnceLock;

static CONVEX_CLIENT: OnceLock<ConvexClient> = OnceLock::new();

pub fn init_convex_client(config: &Config) {
    let client = ConvexClient::new(
        config.convex_url.clone(),
        config.convex_key.clone(),
    );
    let _ = CONVEX_CLIENT.set(client);
}

pub fn get_convex_client() -> Option<&'static ConvexClient> {
    CONVEX_CLIENT.get()
}
