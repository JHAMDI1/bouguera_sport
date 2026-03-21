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

pub async fn verify_clerk_token(
    _token: &str,
    _config: web::Data<Config>,
) -> Result<ClerkUserData, String> {
    // In production, verify the token against Clerk's API or JWKS
    // For now, we'll return mock data
    // You should implement actual Clerk verification
    
    // Example implementation would call Clerk's /verify endpoint
    // or verify JWT locally using Clerk's public keys
    
    Ok(ClerkUserData {
        clerk_id: "user_123".to_string(),
        email: "user@example.com".to_string(),
        full_name: "Test User".to_string(),
    })
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
