from fastapi import APIRouter, HTTPException, Depends
from app.schemas import WellnessAnalysisRequest, WellnessAnalysisResponse
from app.services.wellness_service import WellnessService

router = APIRouter()

async def get_wellness_service():
    return WellnessService()

@router.post("/wellness", response_model=WellnessAnalysisResponse)
async def analyze_wellness(
    request: WellnessAnalysisRequest,
    service: WellnessService = Depends(get_wellness_service)
):
    try:
        result = await service.analyze_wellness(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
