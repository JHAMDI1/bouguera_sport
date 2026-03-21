use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub environment: Environment,
    pub jwt_secret: String,
    pub convex_url: String,
    pub convex_key: String,
    /// Clerk Secret Key (sk_test_... or sk_live_...) — used to call Clerk REST API
    pub clerk_secret_key: String,
    /// Clerk JWKS URL — used to verify session tokens locally via public keys
    pub clerk_jwks_url: String,
    /// Clerk Issuer — used to validate the `iss` claim in JWTs
    pub clerk_issuer: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Environment {
    Development,
    Production,
    Test,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            host: std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .expect("PORT must be a valid u16"),
            environment: match std::env::var("ENVIRONMENT")
                .unwrap_or_else(|_| "development".to_string())
                .as_str()
            {
                "production" => Environment::Production,
                "test" => Environment::Test,
                _ => Environment::Development,
            },
            jwt_secret: std::env::var("JWT_SECRET").unwrap_or_else(|_| {
                "your-secret-key-change-this-in-production".to_string()
            }),
            convex_url: std::env::var("CONVEX_URL")
                .unwrap_or_else(|_| "https://your-deployment.convex.cloud".to_string()),
            convex_key: std::env::var("CONVEX_KEY").unwrap_or_else(|_| "".to_string()),
            clerk_secret_key: std::env::var("CLERK_SECRET_KEY")
                .unwrap_or_else(|_| "".to_string()),
            clerk_jwks_url: std::env::var("CLERK_JWKS_URL")
                .unwrap_or_else(|_| "".to_string()),
            clerk_issuer: std::env::var("CLERK_ISSUER")
                .unwrap_or_else(|_| "".to_string()),
        }
    }
}
