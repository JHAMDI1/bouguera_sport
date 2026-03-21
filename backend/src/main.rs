use actix_web::{middleware as actix_middleware, web, App, HttpServer};
use dotenv::dotenv;
use env_logger;

mod config;
mod handlers;
mod middleware;
mod middlewares;
mod models;
mod routes;
mod services;

use crate::config::Config;
pub use middleware::{JwtAuth, RequireRole, UserRole};
use crate::routes::app_routes;
use crate::services::init_convex_client;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = Config::from_env();
    
    // Initialize Convex client
    init_convex_client(&config);
    log::info!("Convex client initialized");
    
    let host = config.host.clone();
    let port = config.port;

    log::info!("Starting backend server on {}:{}", host, port);
    log::info!("Environment: {:?}", config.environment);

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(config.clone()))
            .wrap(actix_middleware::Logger::default())
            .wrap(actix_middleware::Compress::default())
            .wrap(middlewares::cors_middleware())
            .configure(app_routes)
    })
    .bind(format!("{}:{}", host, port))?
    .run()
    .await
}
