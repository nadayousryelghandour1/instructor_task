from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    similarity_threshold: float = 0.015
    openai_api_key: str
    groq_api_key: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    cors_origins: str = "http://localhost:5173"  # NEW: comma-separated list

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()