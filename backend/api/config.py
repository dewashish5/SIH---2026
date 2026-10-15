from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PORT: int = 8000
    DATA_SOURCE: str = "mock"
    DATABASE_URL: str = "sqlite+aiosqlite:///./skillgap.db"
    DATABASE_URL_SYNC: str = "sqlite:///./skillgap.db"
    JWT_SECRET: str = "super-secret-skillgap-jwt-key-sih-2026-min-32-chars"
    CORS_ORIGINS: list[str] = ["http://localhost:4000", "http://localhost:5173", "http://127.0.0.1:4000", "http://127.0.0.1:5173"]
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "skillgap123"
    NEO4J_DATABASE: str = "neo4j"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()

