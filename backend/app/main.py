from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager
import logging
from .config import Settings
from .api import routes
from .services.model_service import ModelService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global services
settings = Settings()
model_service = ModelService(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle"""
    logger.info("🚀 Starting Kronos Platform...")
    # Initialize services
    model_service.initialize()
    yield
    # Cleanup
    logger.info("👋 Shutting down Kronos Platform...")
    model_service.cleanup()


# Create FastAPI application
app = FastAPI(
    title="Kronos Financial Prediction Platform",
    description="AI-powered financial K-line prediction system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routes
app.include_router(routes.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Kronos Financial Prediction Platform",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "api": "/api"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model_service.is_model_loaded(),
        "available_models": model_service.get_available_models()
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.api_port,
        reload=settings.debug_mode
    )
