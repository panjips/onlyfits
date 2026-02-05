from google import genai
import opik
from app.core.config import settings

opik_client = opik.Opik(
    project_name=settings.PROJECT_NAME,
    api_key=settings.OPIK_API_KEY
)

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

def get_gemini_client():
    return client

def get_opik_client():
    return opik_client
