use actix_web::web;
use serde_json::json;

use crate::handlers::{
    auth, cancel_payment, create_expense, create_payment, generate_receipt,
    get_dashboard_stats, health_check,
};
use crate::middleware::{JwtAuth, RequireRole, UserRole};

pub fn app_routes(cfg: &mut web::ServiceConfig) {
    // Root route - API status (public)
    cfg.route(
        "/",
        web::get().to(|| async {
            actix_web::HttpResponse::Ok().json(json!({
                "name": "Gym Management API",
                "version": "1.0.0",
                "status": "running",
                "endpoints": [
                    "GET  /api/health",
                    "POST /api/auth",
                    "POST /api/payments",
                    "POST /api/payments/{id}/cancel",
                    "GET  /api/receipts/{number}/pdf",
                    "GET  /api/dashboard/stats",
                    "POST /api/expenses"
                ]
            }))
        }),
    );

    cfg.service(
        web::scope("/api")
            // Health check (public)
            .route("/health", web::get().to(health_check))
            
            // Authentication (public)
            .route("/auth", web::post().to(auth))
            
            // Protected routes with JWT
            .service(
                web::scope("/protected")
                    .wrap(JwtAuth)
                    // Payments - Cashier and above
                    .service(
                        web::scope("/payments")
                            .wrap(RequireRole::new(UserRole::Cashier))
                            .route("", web::post().to(create_payment))
                            .route("/{id}/cancel", web::post().to(cancel_payment))
                    )
                    // Receipts - All authenticated users
                    .route("/receipts/{receipt_number}/pdf", web::get().to(generate_receipt))
                    // Dashboard - Coach and above
                    .service(
                        web::scope("/dashboard")
                            .wrap(RequireRole::new(UserRole::Coach))
                            .route("/stats", web::get().to(get_dashboard_stats))
                    )
                    // Expenses - Admin and above
                    .service(
                        web::scope("/expenses")
                            .wrap(RequireRole::new(UserRole::Admin))
                            .route("", web::post().to(create_expense))
                    )
            )
            // Legacy routes (backward compatibility, will be removed)
            .route("/payments", web::post().to(create_payment))
            .route("/payments/{id}/cancel", web::post().to(cancel_payment))
            .route("/receipts/{receipt_number}/pdf", web::get().to(generate_receipt))
            .route("/dashboard/stats", web::get().to(get_dashboard_stats))
            .route("/expenses", web::post().to(create_expense)),
    );
}
