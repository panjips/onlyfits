from openai import AsyncOpenAI
import opik
from opik.integrations.openai import track_openai
from app.core.config import settings

opik_client = opik.Opik(
    project_name=settings.PROJECT_NAME,
    api_key=settings.OPIK_API_KEY
)

_openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
openai_client = track_openai(_openai_client, project_name=settings.PROJECT_NAME)

def get_openai_client():
    return openai_client

def get_opik_client():
    return opik_client
