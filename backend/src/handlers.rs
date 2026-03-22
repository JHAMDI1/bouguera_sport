use actix_web::{web, HttpResponse, Responder};
use serde_json::json;

use crate::config::Config;
use crate::models::{
    AuthRequest, AuthResponse, CreateExpenseRequest, CreatePaymentRequest,
    CreatePaymentResponse, ErrorResponse, ReceiptData, User, UserRole,
};
use crate::services::{
    generate_receipt_pdf, generate_receipt_number, get_convex_client, verify_clerk_token,
};

// ─── Health ───────────────────────────────────────────────────────────────────

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "gym-management-backend",
        "version": "0.1.0"
    }))
}

// ─── Authentification ─────────────────────────────────────────────────────────

/// Vérifie le token Clerk, récupère le rôle depuis Convex, retourne un JWT interne
pub async fn auth(
    req: web::Json<AuthRequest>,
    config: web::Data<Config>,
) -> impl Responder {
    // 1. Vérification du token Clerk (JWKS ou REST)
    let clerk_user = match verify_clerk_token(&req.token, config.clone()).await {
        Ok(u) => u,
        Err(e) => {
            return HttpResponse::Unauthorized().json(ErrorResponse {
                error: "authentication_failed".to_string(),
                message: e,
                status_code: 401,
            })
        }
    };

    // 2. Récupération du rôle depuis Convex (table users)
    let role = if let Some(convex) = get_convex_client() {
        match convex
            .query(
                "users:getUserByClerkId",
                json!({ "clerkId": clerk_user.clerk_id }),
            )
            .await
        {
            Ok(result) => {
                let role_str = result["value"]["role"].as_str().unwrap_or("coach");
                match role_str {
                    "superadmin" => UserRole::SuperAdmin,
                    "admin" => UserRole::Admin,
                    "cashier" => UserRole::Cashier,
                    _ => UserRole::Coach,
                }
            }
            Err(e) => {
                log::warn!("Impossible de récupérer le rôle depuis Convex: {}. Défaut: Coach", e);
                UserRole::Coach
            }
        }
    } else {
        log::warn!("ConvexClient non initialisé, rôle par défaut: Coach");
        UserRole::Coach
    };

    let user = User {
        id: uuid::Uuid::new_v4().to_string(),
        clerk_id: clerk_user.clerk_id,
        email: clerk_user.email,
        full_name: clerk_user.full_name,
        role,
        is_active: true,
        created_at: chrono::Utc::now(),
    };

    // 3. Génération du JWT interne
    match crate::services::generate_jwt(&user, &config.jwt_secret) {
        Ok(access_token) => HttpResponse::Ok().json(AuthResponse { user, access_token }),
        Err(e) => HttpResponse::InternalServerError().json(ErrorResponse {
            error: "token_generation_failed".to_string(),
            message: format!("Erreur génération JWT: {}", e),
            status_code: 500,
        }),
    }
}

// ─── Paiements ────────────────────────────────────────────────────────────────

pub async fn create_payment(
    req: web::Json<CreatePaymentRequest>,
    _config: web::Data<Config>,
) -> impl Responder {
    // Validation
    if req.amount <= 0.0 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "invalid_amount".to_string(),
            message: "Le montant doit être supérieur à 0".to_string(),
            status_code: 400,
        });
    }
    if req.member_id.is_none() && req.family_id.is_none() {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "missing_beneficiary".to_string(),
            message: "member_id ou family_id est requis".to_string(),
            status_code: 400,
        });
    }
    if req.month_covered < 1 || req.month_covered > 12 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "invalid_month".to_string(),
            message: "month_covered doit être entre 1 et 12".to_string(),
            status_code: 400,
        });
    }

    let receipt_number = generate_receipt_number();
    let payment_date = chrono::Utc::now();

    // Persister dans Convex
    let convex = match get_convex_client() {
        Some(c) => c,
        None => {
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "convex_unavailable".to_string(),
                message: "Service de base de données indisponible".to_string(),
                status_code: 503,
            })
        }
    };

    let convex_args = json!({
        "memberId": req.member_id,
        "familyId": req.family_id,
        "amount": req.amount,
        "monthCovered": req.month_covered,
        "yearCovered": req.year_covered,
        "paymentMethod": "cash",
        "receiptNumber": receipt_number,
        "notes": req.notes,
        "paymentDate": payment_date.timestamp_millis(),
    });

    match convex.mutation("mutations:createPayment", convex_args).await {
        Ok(result) => {
            let payment_id = result["value"]
                .as_str()
                .unwrap_or("")
                .to_string();

            HttpResponse::Created().json(CreatePaymentResponse {
                payment_id,
                receipt_number,
                amount: req.amount,
                payment_date,
            })
        }
        Err(e) => {
            log::error!("Erreur création paiement Convex: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "payment_creation_failed".to_string(),
                message: format!("Impossible de créer le paiement: {}", e),
                status_code: 500,
            })
        }
    }
}

pub async fn cancel_payment(
    payment_id: web::Path<String>,
    _config: web::Data<Config>,
) -> impl Responder {
    let convex = match get_convex_client() {
        Some(c) => c,
        None => {
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "convex_unavailable".to_string(),
                message: "Service de base de données indisponible".to_string(),
                status_code: 503,
            })
        }
    };

    let cancelled_at = chrono::Utc::now();

    match convex
        .mutation(
            "payments:cancelPayment",
            json!({
                "paymentId": payment_id.to_string(),
                "cancelledAt": cancelled_at.timestamp_millis(),
            }),
        )
        .await
    {
        Ok(_) => HttpResponse::Ok().json(json!({
            "message": "Paiement annulé avec succès",
            "payment_id": payment_id.to_string(),
            "cancelled_at": cancelled_at.to_rfc3339(),
        })),
        Err(e) => {
            log::error!("Erreur annulation paiement Convex: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "cancellation_failed".to_string(),
                message: format!("Impossible d'annuler le paiement: {}", e),
                status_code: 500,
            })
        }
    }
}

// ─── Reçus ────────────────────────────────────────────────────────────────────

pub async fn generate_receipt(
    receipt_number: web::Path<String>,
    _config: web::Data<Config>,
) -> impl Responder {
    // Récupérer les données réelles depuis Convex
    let receipt_data = if let Some(convex) = get_convex_client() {
        match convex
            .query(
                "payments:getPaymentByReceipt",
                json!({ "receiptNumber": receipt_number.to_string() }),
            )
            .await
        {
            Ok(result) => {
                let val = &result["value"];
                ReceiptData {
                    receipt_number: receipt_number.to_string(),
                    member_name: val["memberName"].as_str().unwrap_or("Adhérent").to_string(),
                    amount: val["amount"].as_f64().unwrap_or(0.0),
                    month: val["monthCovered"].as_str().unwrap_or("").to_string(),
                    year: val["yearCovered"].as_i64().unwrap_or(2026) as i32,
                    payment_date: val["paymentDate"].as_str().unwrap_or("").to_string(),
                    received_by: val["receivedBy"].as_str().unwrap_or("Admin").to_string(),
                }
            }
            Err(e) => {
                log::warn!("Paiement non trouvé dans Convex ({}), reçu minimal", e);
                ReceiptData {
                    receipt_number: receipt_number.to_string(),
                    member_name: "Adhérent".to_string(),
                    amount: 0.0,
                    month: "".to_string(),
                    year: chrono::Utc::now().format("%Y").to_string().parse().unwrap_or(2026),
                    payment_date: chrono::Utc::now().format("%d/%m/%Y").to_string(),
                    received_by: "Admin".to_string(),
                }
            }
        }
    } else {
        ReceiptData {
            receipt_number: receipt_number.to_string(),
            member_name: "Adhérent".to_string(),
            amount: 0.0,
            month: "".to_string(),
            year: 2026,
            payment_date: chrono::Utc::now().format("%d/%m/%Y").to_string(),
            received_by: "Admin".to_string(),
        }
    };

    match generate_receipt_pdf(&receipt_data) {
        Ok(pdf_bytes) => HttpResponse::Ok()
            .content_type("application/pdf")
            .append_header((
                "Content-Disposition",
                format!("attachment; filename=\"receipt_{}.pdf\"", receipt_number),
            ))
            .body(pdf_bytes),
        Err(e) => HttpResponse::InternalServerError().json(ErrorResponse {
            error: "pdf_generation_failed".to_string(),
            message: format!("Erreur génération PDF: {}", e),
            status_code: 500,
        }),
    }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

pub async fn get_dashboard_stats(_config: web::Data<Config>) -> impl Responder {
    let convex = match get_convex_client() {
        Some(c) => c,
        None => {
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "convex_unavailable".to_string(),
                message: "Service de base de données indisponible".to_string(),
                status_code: 503,
            })
        }
    };

    match convex
        .query("dashboard:getDashboardStats", json!({}))
        .await
    {
        Ok(result) => HttpResponse::Ok().json(result["value"].clone()),
        Err(e) => {
            log::error!("Erreur récupération dashboard Convex: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "dashboard_fetch_failed".to_string(),
                message: format!("Impossible de récupérer les statistiques: {}", e),
                status_code: 500,
            })
        }
    }
}

// ─── Dépenses ─────────────────────────────────────────────────────────────────

pub async fn create_expense(
    req: web::Json<CreateExpenseRequest>,
    _config: web::Data<Config>,
) -> impl Responder {
    if req.amount <= 0.0 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "invalid_amount".to_string(),
            message: "Le montant doit être supérieur à 0".to_string(),
            status_code: 400,
        });
    }

    let convex = match get_convex_client() {
        Some(c) => c,
        None => {
            return HttpResponse::InternalServerError().json(ErrorResponse {
                error: "convex_unavailable".to_string(),
                message: "Service de base de données indisponible".to_string(),
                status_code: 503,
            })
        }
    };

    let convex_args = json!({
        "categoryId": req.category_id,
        "amount": req.amount,
        "description": req.description,
        "expenseDate": req.expense_date.timestamp_millis(),
        "receiptUrl": req.receipt_url,
    });

    match convex.mutation("coaches:createExpense", convex_args).await {
        Ok(result) => {
            let expense_id = result["value"].as_str().unwrap_or("").to_string();
            HttpResponse::Created().json(json!({
                "expense_id": expense_id,
                "message": "Dépense enregistrée avec succès"
            }))
        }
        Err(e) => {
            log::error!("Erreur création dépense Convex: {}", e);
            HttpResponse::InternalServerError().json(ErrorResponse {
                error: "expense_creation_failed".to_string(),
                message: format!("Impossible d'enregistrer la dépense: {}", e),
                status_code: 500,
            })
        }
    }
}

// ─── Tests Unitaires ──────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, App};

    fn create_mock_config() -> Config {
        Config {
            port: 8080,
            jwt_secret: "test_secret".to_string(),
            clerk_secret_key: "test_key".to_string(),
            clerk_jwks_url: "https://test.clerk.com/.well-known/jwks.json".to_string(),
            clerk_issuer: "https://test.clerk.com".to_string(),
            convex_url: "https://test.convex.cloud".to_string(),
            convex_key: "test_key".to_string(),
        }
    }

    #[actix_web::test]
    async fn test_health_check_ok() {
        let mut app = test::init_service(App::new().route("/health", web::get().to(health_check))).await;
        let req = test::TestRequest::get().uri("/health").to_request();
        let resp = test::call_service(&mut app, req).await;
        
        assert!(resp.status().is_success());
    }

    #[actix_web::test]
    async fn test_create_payment_invalid_amount() {
        let config = web::Data::new(create_mock_config());
        let mut app = test::init_service(
            App::new()
                .app_data(config.clone())
                .route("/payments", web::post().to(create_payment))
        ).await;

        let payload = CreatePaymentRequest {
            member_id: Some("member_123".to_string()),
            family_id: None,
            amount: -10.0, // Invalid amount
            month_covered: 5,
            year_covered: 2026,
            notes: None,
        };

        let req = test::TestRequest::post()
            .uri("/payments")
            .set_json(&payload)
            .to_request();
            
        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.status(), 400); // Bad Request expected
    }

    #[actix_web::test]
    async fn test_create_payment_invalid_month() {
        let config = web::Data::new(create_mock_config());
        let mut app = test::init_service(
            App::new()
                .app_data(config.clone())
                .route("/payments", web::post().to(create_payment))
        ).await;

        let payload = CreatePaymentRequest {
            member_id: Some("member_123".to_string()),
            family_id: None,
            amount: 50.0,
            month_covered: 13, // Invalid month
            year_covered: 2026,
            notes: None,
        };

        let req = test::TestRequest::post()
            .uri("/payments")
            .set_json(&payload)
            .to_request();
            
        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.status(), 400); // Bad Request expected
    }

    #[actix_web::test]
    async fn test_create_payment_missing_beneficiary() {
        let config = web::Data::new(create_mock_config());
        let mut app = test::init_service(
            App::new()
                .app_data(config.clone())
                .route("/payments", web::post().to(create_payment))
        ).await;

        let payload = CreatePaymentRequest {
            member_id: None, // Missing
            family_id: None, // Missing
            amount: 50.0,
            month_covered: 5,
            year_covered: 2026,
            notes: None,
        };

        let req = test::TestRequest::post()
            .uri("/payments")
            .set_json(&payload)
            .to_request();
            
        let resp = test::call_service(&mut app, req).await;
        assert_eq!(resp.status(), 400); // Bad Request expected
    }
}
