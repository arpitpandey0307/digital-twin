from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # Server
    port: int = 8000
    debug: bool = True

    # Database
    database_url: str = "sqlite:///./city_twin.db"

    # Auth
    secret_key: str = "hackathon-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # Gemini AI
    gemini_api_key: str = ""

    # External APIs
    openweather_api_key: str = ""
    aqicn_api_key: str = ""
    tomtom_api_key: str = ""

    # City Configuration
    city_name: str = "Mumbai"
    city_lat: float = 19.0760
    city_lng: float = 72.8777

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings():
    return Settings()
