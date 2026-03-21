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
                    "POST /api/protected/payments        (JWT + Cashier role required)",
                    "POST /api/protected/payments/{id}/cancel  (JWT + Cashier role required)",
                    "GET  /api/protected/receipts/{number}/pdf (JWT required)",
                    "GET  /api/protected/dashboard/stats       (JWT + Coach role required)",
                    "POST /api/protected/expenses              (JWT + Admin role required)"
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

            // All business routes are protected — JWT required
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
            ),
    );
}
