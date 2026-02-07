from fastapi import FastAPI
from app.core.config import settings
from app.api import analyze, chat

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
)

app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analyze"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}
