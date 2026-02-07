from app.core.clients import get_openai_client
from app.core.prompts import get_chatbot_prompt
from opik import track
from app.schemas import ChatbotRequest, ChatbotResponse
import json
from app.core.config import settings

client = get_openai_client()

class ChatbotService:
    @track(name="chat_with_gym_context", project_name=settings.PROJECT_NAME)
    async def chat_with_gym_context(self, request: ChatbotRequest) -> ChatbotResponse:
        request_context = request.context
        context = {
            "age": request_context.user_profile.age,
            "gender": request_context.user_profile.gender,
            "sessions_count": request_context.activity_data.total_sessions_last_30_days,
            "avg_duration": request_context.activity_data.average_duration_minutes,
            "checkins": request_context.activity_data.last_30_days_checkins,
            "membership": request_context.membership_info.model_dump() if request_context.membership_info else None,
        }
        
        prompt = get_chatbot_prompt(request.query, context)

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        return ChatbotResponse(**data)
