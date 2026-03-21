use actix_web::{web, HttpResponse, Responder};
use serde_json::json;

use crate::config::Config;
use crate::models::{
    AuthRequest, AuthResponse, CreateExpenseRequest, CreatePaymentRequest,
    CreatePaymentResponse, ErrorResponse, ReceiptData, User, UserRole,
};
use crate::services::{generate_receipt_pdf, generate_receipt_number, verify_clerk_token};

pub async fn health_check() -> impl Responder {
    HttpResponse::Ok().json(json!({
        "status": "healthy",
        "service": "gym-management-backend",
        "version": "0.1.0"
    }))
}

pub async fn auth(
    req: web::Json<AuthRequest>,
    config: web::Data<Config>,
) -> impl Responder {
    match verify_clerk_token(&req.token, config.clone()).await {
        Ok(user_data) => {
            let user = User {
                id: uuid::Uuid::new_v4().to_string(),
                clerk_id: user_data.clerk_id,
                email: user_data.email,
                full_name: user_data.full_name,
                role: UserRole::Admin, // This should come from your database
                is_active: true,
                created_at: chrono::Utc::now(),
            };

            // Generate JWT token
            let access_token = match crate::services::generate_jwt(&user, &config.jwt_secret) {
                Ok(token) => token,
                Err(e) => {
                    return HttpResponse::InternalServerError().json(ErrorResponse {
                        error: "token_generation_failed".to_string(),
                        message: format!("Failed to generate token: {}", e),
                        status_code: 500,
                    });
                }
            };

            HttpResponse::Ok().json(AuthResponse {
                user,
                access_token,
            })
        }
        Err(e) => HttpResponse::Unauthorized().json(ErrorResponse {
            error: "authentication_failed".to_string(),
            message: e,
            status_code: 401,
        }),
    }
}

pub async fn create_payment(
    req: web::Json<CreatePaymentRequest>,
    _config: web::Data<Config>,
) -> impl Responder {
    // Validate request
    if req.amount <= 0.0 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "invalid_amount".to_string(),
            message: "Amount must be greater than 0".to_string(),
            status_code: 400,
        });
    }

    if req.member_id.is_none() && req.family_id.is_none() {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "missing_beneficiary".to_string(),
            message: "Either member_id or family_id must be provided".to_string(),
            status_code: 400,
        });
    }

    // Generate receipt number
    let receipt_number = generate_receipt_number();
    let payment_id = uuid::Uuid::new_v4().to_string();
    let payment_date = chrono::Utc::now();

    // In a real implementation, you would:
    // 1. Call Convex to create the payment
    // 2. Update member/family subscription status
    // 3. Generate and store receipt PDF
    // 4. Send notification if needed

    let response = CreatePaymentResponse {
        payment_id,
        receipt_number,
        amount: req.amount,
        payment_date,
    };

    HttpResponse::Created().json(response)
}

pub async fn generate_receipt(
    receipt_number: web::Path<String>,
    _config: web::Data<Config>,
) -> impl Responder {
    // Mock receipt data - in production, fetch from database
    let receipt_data = ReceiptData {
        receipt_number: receipt_number.to_string(),
        member_name: "John Doe".to_string(),
        amount: 50.000,
        month: "Mars".to_string(),
        year: 2026,
        payment_date: chrono::Utc::now().format("%d/%m/%Y").to_string(),
        received_by: "Admin User".to_string(),
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
            message: format!("Failed to generate PDF: {}", e),
            status_code: 500,
        }),
    }
}

pub async fn get_dashboard_stats(_config: web::Data<Config>) -> impl Responder {
    // In production, fetch real data from Convex
    let stats = json!({
        "total_active_members": 150,
        "monthly_revenue": 7500.0,
        "monthly_expenses": 3200.0,
        "net_profit": 4300.0,
        "unpaid_count": 12,
        "new_members_this_month": 8,
        "expiring_certificates_count": 3,
    });

    HttpResponse::Ok().json(stats)
}

pub async fn create_expense(
    req: web::Json<CreateExpenseRequest>,
    _config: web::Data<Config>,
) -> impl Responder {
    if req.amount <= 0.0 {
        return HttpResponse::BadRequest().json(ErrorResponse {
            error: "invalid_amount".to_string(),
            message: "Amount must be greater than 0".to_string(),
            status_code: 400,
        });
    }

    let expense_id = uuid::Uuid::new_v4().to_string();

    // In production, save to Convex
    HttpResponse::Created().json(json!({
        "expense_id": expense_id,
        "message": "Expense recorded successfully"
    }))
}

pub async fn cancel_payment(
    payment_id: web::Path<String>,
    _config: web::Data<Config>,
) -> impl Responder {
    // Only SuperAdmin can cancel payments
    // In production:
    // 1. Verify user has SuperAdmin role
    // 2. Log the cancellation with reason
    // 3. Update payment status in Convex
    // 4. Recalculate member's subscription status

    HttpResponse::Ok().json(json!({
        "message": "Payment cancelled successfully",
        "payment_id": payment_id.to_string(),
        "cancelled_at": chrono::Utc::now().to_rfc3339(),
    }))
}
