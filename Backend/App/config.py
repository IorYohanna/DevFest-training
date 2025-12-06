from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Configuration
    APP_NAME: str = "ALBERT Complexity Classifier API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False
    
    # Model Configuration
    MODEL_DIR: str = "./albert_complexity_model"
    MODEL_NAME: str = "albert-base-v2"
    MAX_LENGTH: int = 64
    DEVICE: str = "cuda"  # ou "cpu"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
