pub mod auth;

// Re-exports pour faciliter l'utilisation
pub use auth::{JwtAuth, RequireRole, AuthenticatedUser, UserRole, get_authenticated_user};
