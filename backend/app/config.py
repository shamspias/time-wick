from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application configuration settings"""

    # Application
    app_name: str = "Kronos Platform"
    api_port: int = 8000
    debug_mode: bool = False

    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Model Configuration
    model_cache_dir: Path = Path("./models")
    default_device: str = "cpu"
    max_context_length: int = 512

    # Data Configuration
    data_dir: Path = Path("./data")
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_extensions: List[str] = [".csv", ".feather", ".parquet"]

    # Prediction Configuration
    default_lookback: int = 400
    default_pred_len: int = 120
    default_temperature: float = 1.0
    default_top_p: float = 0.9
    default_sample_count: int = 1

    # Security
    secret_key: str = "your-secret-key-change-this"

    # Database (optional)
    database_url: str = "sqlite:///./kronos.db"

    # Redis (optional for caching)
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create necessary directories
        self.model_cache_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)
