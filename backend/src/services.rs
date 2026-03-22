use chrono::Utc;
use jsonwebtoken::{decode, decode_header, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use actix_web::web;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use printpdf::*;
use std::io::Cursor;

use crate::config::Config;
use crate::models::{ReceiptData, User};

// ─── Claims JWT internes ──────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub role: String,
    pub exp: usize,
    pub iat: usize,
}

// ─── Données utilisateur Clerk retournées après vérification ─────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ClerkUserData {
    pub clerk_id: String,
    pub email: String,
    pub full_name: String,
}

// ─── Structs pour le parsing des réponses Clerk ───────────────────────────────

/// Réponse de /oauth/userinfo
#[derive(Debug, Deserialize)]
struct ClerkUserInfoResponse {
    sub: String,
    email: Option<String>,
    name: Option<String>,
    given_name: Option<String>,
    family_name: Option<String>,
}

/// Clé individuelle dans la réponse JWKS
#[derive(Debug, Deserialize, Clone)]
struct JwksKey {
    #[serde(rename = "kty")]
    key_type: String,
    #[serde(rename = "kid")]
    key_id: Option<String>,
    n: Option<String>, // RSA modulus (base64url)
    e: Option<String>, // RSA exponent (base64url)
}

/// Réponse complète du endpoint JWKS
#[derive(Debug, Deserialize)]
struct JwksResponse {
    keys: Vec<JwksKey>,
}

// ─── JWT interne ──────────────────────────────────────────────────────────────

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

pub fn verify_jwt(token: &str, secret: &str) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::new(Algorithm::HS256);
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )?;
    Ok(token_data.claims)
}

// ─── Vérification Clerk ───────────────────────────────────────────────────────

/// Vérifie un token de session Clerk.
///
/// Stratégie (du plus sécurisé au plus simple) :
/// 1. JWKS : valide la signature JWT via les clés publiques Clerk (local, rapide)
/// 2. Fallback REST : GET /oauth/userinfo si JWKS non configuré ou indisponible
pub async fn verify_clerk_token(
    token: &str,
    config: web::Data<Config>,
) -> Result<ClerkUserData, String> {
    if token.is_empty() {
        return Err("Token Clerk manquant".to_string());
    }

    // Méthode 1 : JWKS (locale, rapide, sécurisée)
    if !config.clerk_jwks_url.is_empty() {
        match verify_via_jwks(token, &config).await {
            Ok(user_data) => return Ok(user_data),
            Err(e) => log::warn!("Vérification JWKS échouée ({}), fallback REST API", e),
        }
    }

    // Méthode 2 : REST API Clerk (fallback)
    verify_via_rest_api(token, &config).await
}

/// Vérifie le token en validant sa signature via les clés publiques JWKS de Clerk
async fn verify_via_jwks(token: &str, config: &Config) -> Result<ClerkUserData, String> {
    // Récupérer le kid du header JWT
    let header = decode_header(token)
        .map_err(|e| format!("Header JWT invalide: {}", e))?;
    let kid = header.kid.unwrap_or_default();

    // Télécharger les clés JWKS
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Erreur client HTTP: {}", e))?;

    let jwks: JwksResponse = client
        .get(&config.clerk_jwks_url)
        .send()
        .await
        .map_err(|e| format!("Impossible de télécharger JWKS: {}", e))?
        .json()
        .await
        .map_err(|e| format!("Erreur parsing JWKS: {}", e))?;

    // Trouver la clé RSA correspondante au kid
    let key = jwks
        .keys
        .iter()
        .find(|k| {
            k.key_type == "RSA"
                && (kid.is_empty() || k.key_id.as_deref().unwrap_or("") == kid)
        })
        .ok_or_else(|| format!("Clé JWKS RSA non trouvée pour kid='{}'", kid))?;

    let n_b64 = key.n.as_deref().ok_or("Modulus RSA manquant dans JWKS")?;
    let e_b64 = key.e.as_deref().ok_or("Exposant RSA manquant dans JWKS")?;

    let n_bytes = URL_SAFE_NO_PAD
        .decode(n_b64)
        .map_err(|e| format!("Décodage modulus RSA: {}", e))?;
    let e_bytes = URL_SAFE_NO_PAD
        .decode(e_b64)
        .map_err(|e| format!("Décodage exposant RSA: {}", e))?;

    let decoding_key = DecodingKey::from_rsa_raw_components(&n_bytes, &e_bytes);

    // Valider le JWT (signature + expiration + issuer)
    let mut validation = Validation::new(Algorithm::RS256);
    if !config.clerk_issuer.is_empty() {
        validation.set_issuer(&[&config.clerk_issuer]);
    }
    validation.validate_exp = true;

    let token_data = decode::<serde_json::Value>(token, &decoding_key, &validation)
        .map_err(|e| format!("Signature JWT Clerk invalide: {}", e))?;

    let claims = &token_data.claims;

    let clerk_id = claims["sub"]
        .as_str()
        .ok_or("Claim 'sub' manquant")?
        .to_string();

    let email = claims["email"].as_str().unwrap_or("").to_string();

    let full_name = {
        let name = claims["name"].as_str();
        let first = claims["given_name"].as_str().unwrap_or("");
        let last = claims["family_name"].as_str().unwrap_or("");
        name.map(|s| s.to_string())
            .or_else(|| {
                if first.is_empty() && last.is_empty() {
                    None
                } else {
                    Some(format!("{} {}", first, last).trim().to_string())
                }
            })
            .unwrap_or_else(|| "Utilisateur".to_string())
    };

    Ok(ClerkUserData {
        clerk_id,
        email,
        full_name,
    })
}

/// Fallback : vérifie en appelant l'API REST Clerk (appel externe par requête)
async fn verify_via_rest_api(token: &str, _config: &Config) -> Result<ClerkUserData, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Erreur client HTTP: {}", e))?;

    let response = client
        .get("https://api.clerk.com/oauth/userinfo")
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| format!("Erreur appel Clerk API: {}", e))?;

    if response.status().is_success() {
        let user_info: ClerkUserInfoResponse = response
            .json()
            .await
            .map_err(|e| format!("Erreur parsing réponse Clerk: {}", e))?;

        let full_name = user_info
            .name
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

    Err(format!(
        "Token Clerk invalide ou expiré (HTTP {})",
        response.status()
    ))
}

// ─── Numéro de reçu ───────────────────────────────────────────────────────────

pub fn generate_receipt_number() -> String {
    let timestamp = Utc::now().timestamp();
    let random_suffix = rand::random::<u16>() % 10000;
    format!("REC-{}-{:04}", timestamp, random_suffix)
}

// ─── Génération PDF reçu ──────────────────────────────────────────────────────

pub fn generate_receipt_pdf(receipt_data: &ReceiptData) -> Result<Vec<u8>, String> {
    // Format A6 (105mm x 148mm) - idéal pour un reçu
    let (doc, page1, layer1) = PdfDocument::new(
        "Reçu de Paiement",
        Mm(105.0),
        Mm(148.0),
        "Layer 1",
    );

    let current_layer = doc.get_page(page1).get_layer(layer1);

    // Charger les polices intégrées (pas besoin de fichier externe .ttf)
    let font_regular = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| format!("Erreur police: {}", e))?;
    let font_bold = doc
        .add_builtin_font(BuiltinFont::HelveticaBold)
        .map_err(|e| format!("Erreur police: {}", e))?;

    // Ajouter le texte du reçu
    current_layer.use_text("SAHBI SPORT", 18.0, Mm(10.0), Mm(130.0), &font_bold);
    current_layer.use_text("Reçu de Paiement", 14.0, Mm(10.0), Mm(120.0), &font_bold);

    current_layer.use_text(
        format!("N° Reçu: {}", receipt_data.receipt_number),
        10.0,
        Mm(10.0),
        Mm(105.0),
        &font_regular,
    );
    current_layer.use_text(
        format!("Date: {}", receipt_data.payment_date),
        10.0,
        Mm(10.0),
        Mm(95.0),
        &font_regular,
    );
    current_layer.use_text(
        format!("Adhérent: {}", receipt_data.member_name),
        10.0,
        Mm(10.0),
        Mm(85.0),
        &font_regular,
    );

    // Montant mis en valeur
    current_layer.use_text(
        format!("Montant payé: {:.3} TND", receipt_data.amount),
        12.0,
        Mm(10.0),
        Mm(70.0),
        &font_bold,
    );
    
    let end_month = if receipt_data.month.is_empty() {
        "N/A".to_string()
    } else {
        format!("{}/{}", receipt_data.month, receipt_data.year)
    };
    current_layer.use_text(
        format!("Période couverte: {}", end_month),
        10.0,
        Mm(10.0),
        Mm(60.0),
        &font_regular,
    );

    current_layer.use_text(
        format!("Encaissé par: {}", receipt_data.received_by),
        8.0,
        Mm(10.0),
        Mm(40.0),
        &font_regular,
    );
    current_layer.use_text(
        "Merci de votre confiance !",
        10.0,
        Mm(30.0),
        Mm(20.0),
        &font_bold,
    );

    // Générer le buffer PDF
    let mut buf = std::io::BufWriter::new(Vec::new());
    doc.save(&mut buf)
        .map_err(|e| format!("Erreur création PDF: {}", e))?;

    let bytes = buf.into_inner().map_err(|e| format!("Erreur flush PDF: {}", e))?;

    Ok(bytes)
}

// ─── Client Convex ────────────────────────────────────────────────────────────

/// Client HTTP vers l'API HTTP Convex
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
}

// ─── Singleton Convex ─────────────────────────────────────────────────────────

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
