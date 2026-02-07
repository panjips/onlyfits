from fastapi import APIRouter, HTTPException, Depends
from app.schemas import ChatbotRequest, ChatbotResponse
from app.services.chatbot_service import ChatbotService

router = APIRouter()

async def get_chatbot_service():
    return ChatbotService()

@router.post("/", response_model=ChatbotResponse)
async def chat(
    request: ChatbotRequest,
    service: ChatbotService = Depends(get_chatbot_service)
):
    try:
        result = await service.chat_with_gym_context(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
