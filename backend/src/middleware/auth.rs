use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    error::ErrorUnauthorized,
    http::header,
    web, Error, HttpMessage,
};
use futures_util::future::LocalBoxFuture;
use std::{
    future::{ready, Ready},
    rc::Rc,
};

use crate::config::Config;
use crate::services::verify_jwt;

// Extension trait pour ajouter les claims à la requête
#[derive(Clone)]
pub struct AuthenticatedUser {
    pub user_id: String,
    pub email: String,
    pub role: UserRole,
}

#[derive(Debug, Clone, PartialEq)]
pub enum UserRole {
    SuperAdmin,
    Admin,
    Coach,
    Cashier,
}

impl std::str::FromStr for UserRole {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "superadmin" => Ok(UserRole::SuperAdmin),
            "admin" => Ok(UserRole::Admin),
            "coach" => Ok(UserRole::Coach),
            "cashier" => Ok(UserRole::Cashier),
            _ => Err(format!("Rôle inconnu: {}", s)),
        }
    }
}

impl AuthenticatedUser {
    pub fn has_permission(&self, required_role: UserRole) -> bool {
        match (self.role.clone(), required_role) {
            // SuperAdmin peut tout faire
            (UserRole::SuperAdmin, _) => true,
            // Admin peut tout sauf certaines actions réservées au SuperAdmin
            (UserRole::Admin, UserRole::SuperAdmin) => false,
            (UserRole::Admin, _) => true,
            // Coach a accès limité
            (UserRole::Coach, UserRole::Coach) => true,
            (UserRole::Coach, UserRole::Cashier) => true,
            (UserRole::Coach, _) => false,
            // Cashier a accès aux paiements et encaissements
            (UserRole::Cashier, UserRole::Cashier) => true,
            (UserRole::Cashier, _) => false,
        }
    }
}

// Middleware de validation JWT
pub struct JwtAuth;

impl<S, B> Transform<S, ServiceRequest> for JwtAuth
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = JwtAuthMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(JwtAuthMiddleware {
            service: Rc::new(service),
        }))
    }
}

pub struct JwtAuthMiddleware<S> {
    service: Rc<S>,
}

impl<S, B> Service<ServiceRequest> for JwtAuthMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();

        Box::pin(async move {
            // Récupérer le header Authorization
            let auth_header = req
                .headers()
                .get(header::AUTHORIZATION)
                .and_then(|h| h.to_str().ok());

            let token = match auth_header {
                Some(header) if header.starts_with("Bearer ") => {
                    header.trim_start_matches("Bearer ").trim()
                }
                _ => {
                    return Err(ErrorUnauthorized("Token manquant ou invalide"));
                }
            };

            // Récupérer la configuration
            let config = req.app_data::<web::Data<Config>>()
                .ok_or_else(|| ErrorUnauthorized("Configuration manquante"))?;

            // Vérifier le JWT
            let claims = match verify_jwt(token, &config.jwt_secret) {
                Ok(claims) => claims,
                Err(_) => {
                    return Err(ErrorUnauthorized("Token invalide ou expiré"));
                }
            };

            // Parser le rôle
            let role = match claims.role.parse::<UserRole>() {
                Ok(role) => role,
                Err(_) => {
                    return Err(ErrorUnauthorized("Rôle utilisateur invalide"));
                }
            };

            // Créer l'utilisateur authentifié
            let user = AuthenticatedUser {
                user_id: claims.sub,
                email: claims.email,
                role,
            };

            // Ajouter l'utilisateur aux extensions de la requête
            req.extensions_mut().insert(user);

            // Continuer avec la requête
            service.call(req).await
        })
    }
}

// Middleware RBAC (Role-Based Access Control)
pub struct RequireRole {
    role: UserRole,
}

impl RequireRole {
    pub fn new(role: UserRole) -> Self {
        Self { role }
    }
}

impl<S, B> Transform<S, ServiceRequest> for RequireRole
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Transform = RbacMiddleware<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(RbacMiddleware {
            service: Rc::new(service),
            required_role: self.role.clone(),
        }))
    }
}

pub struct RbacMiddleware<S> {
    service: Rc<S>,
    required_role: UserRole,
}

impl<S, B> Service<ServiceRequest> for RbacMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error> + 'static,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let service = self.service.clone();
        let required_role = self.required_role.clone();

        Box::pin(async move {
            // Récupérer l'utilisateur authentifié
            let user = req
                .extensions()
                .get::<AuthenticatedUser>()
                .cloned()
                .ok_or_else(|| ErrorUnauthorized("Utilisateur non authentifié"))?;

            // Vérifier les permissions
            if !user.has_permission(required_role) {
                return Err(ErrorUnauthorized(
                    "Permissions insuffisantes pour cette action",
                ));
            }

            service.call(req).await
        })
    }
}

pub fn get_authenticated_user(req: &ServiceRequest) -> Option<AuthenticatedUser> {
    req.extensions().get::<AuthenticatedUser>().cloned()
}
