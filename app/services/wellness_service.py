from app.core.clients import get_openai_client
from app.core.prompts import get_attendance_prompt, get_burnout_prompt
from opik import track
from app.schemas import WellnessAnalysisRequest, WellnessAnalysisResponse, AttendanceAnalysis, BurnoutAnalysis
import json
from app.core.config import settings

client = get_openai_client()

class WellnessService:
    @track(name="analyze_wellness", project_name=settings.PROJECT_NAME)
    async def analyze_wellness(self, request: WellnessAnalysisRequest) -> WellnessAnalysisResponse:
        context = {
            "age": request.user_profile.age,
            "gender": request.user_profile.gender,
            "sessions_count": request.activity_data.total_sessions_last_30_days,
            "avg_duration": request.activity_data.average_duration_minutes,
            "checkins": request.activity_data.last_30_days_checkins,
            "membership": request.membership_info.model_dump() if request.membership_info else None,
        }
        
        attendance = await self._generate_attendance_insight(context)
        burnout = await self._generate_burnout_insight(context)
        
        return WellnessAnalysisResponse(
            attendance_analysis=attendance,
            burnout_analysis=burnout
        )

    @track(name="generate_attendance", project_name=settings.PROJECT_NAME)
    async def _generate_attendance_insight(self, context: dict) -> AttendanceAnalysis:
        sessions = context['sessions_count']
        consistency_score = min(100, sessions * 8)
        consistency_level = "High" if consistency_score > 75 else "Medium" if consistency_score > 40 else "Low"
        
        prompt = get_attendance_prompt(context, sessions, consistency_score, consistency_level)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        return AttendanceAnalysis(
            score=consistency_score,
            consistency_level=consistency_level,
            **data
        )

    @track(name="generate_burnout", project_name=settings.PROJECT_NAME)
    async def _generate_burnout_insight(self, context: dict) -> BurnoutAnalysis:
        prompt = get_burnout_prompt(context)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        data = json.loads(response.choices[0].message.content)
        return BurnoutAnalysis(**data)
