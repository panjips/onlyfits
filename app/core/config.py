from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Onlyfits Service"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "Onlyfits Service API"
    
    DEBUG: bool = False
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPIK_API_KEY: str
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
