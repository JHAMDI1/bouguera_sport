use actix_web::http::header;
use actix_cors::Cors;

pub fn cors_middleware() -> Cors {
    Cors::default()
        .allowed_origin_fn(|_origin, _req_head| {
            // Allow all origins in development
            // In production, restrict to specific origins
            true
        })
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
        .allowed_headers(vec![
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
            header::ORIGIN,
        ])
        .supports_credentials()
        .max_age(3600)
}
