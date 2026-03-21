use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub clerk_id: String,
    pub email: String,
    pub full_name: String,
    pub role: UserRole,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UserRole {
    Admin,
    Coach,
    Cashier,
    SuperAdmin,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Member {
    pub id: String,
    pub first_name: String,
    pub last_name: String,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub gender: String,
    pub birth_date: Option<DateTime<Utc>>,
    pub group_id: Option<String>,
    pub family_id: Option<String>,
    pub is_active: bool,
    pub enrollment_date: DateTime<Utc>,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Payment {
    pub id: String,
    pub member_id: Option<String>,
    pub family_id: Option<String>,
    pub amount: f64,
    pub month_covered: i32,
    pub year_covered: i32,
    pub payment_date: DateTime<Utc>,
    pub receipt_number: String,
    pub notes: Option<String>,
    pub received_by: String,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Expense {
    pub id: String,
    pub category_id: String,
    pub amount: f64,
    pub description: String,
    pub expense_date: DateTime<Utc>,
    pub receipt_url: Option<String>,
    pub recorded_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiptData {
    pub receipt_number: String,
    pub member_name: String,
    pub amount: f64,
    pub month: String,
    pub year: i32,
    pub payment_date: String,
    pub received_by: String,
}

// Request/Response DTOs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePaymentRequest {
    pub member_id: Option<String>,
    pub family_id: Option<String>,
    pub amount: f64,
    pub month_covered: i32,
    pub year_covered: i32,
    pub notes: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePaymentResponse {
    pub payment_id: String,
    pub receipt_number: String,
    pub amount: f64,
    pub payment_date: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateExpenseRequest {
    pub category_id: String,
    pub amount: f64,
    pub description: String,
    pub expense_date: DateTime<Utc>,
    pub receipt_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthRequest {
    pub token: String,
}

#[allow(dead_code)]
#[allow(unused)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthResponse {
    pub user: User,
    pub access_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    pub status_code: u16,
}
