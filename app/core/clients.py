from openai import AsyncOpenAI
import opik
from app.core.config import settings

opik_client = opik.Opik(
    project_name=settings.PROJECT_NAME,
    api_key=settings.OPIK_API_KEY
)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

def get_openai_client():
    return client

def get_opik_client():
    return opik_client
