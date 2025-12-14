from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    external_api_base_url: str = "https://g9-capstone-project-ll.onrender.com"
    external_api_timeout: int = 30
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "8001"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
