from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class UserProfile(BaseModel):
    user_id: str
    age: int
    gender: str
    membership_type: str
    join_date: Optional[str] = None

class ActivityData(BaseModel):
    last_30_days_checkins: List[str] 
    average_duration_minutes: float
    total_sessions_last_30_days: int
    most_common_time: Optional[str] = None

class MembershipInfo(BaseModel):
    days_until_renewal: int
    renewal_history: List[str]

class WellnessAnalysisRequest(BaseModel):
    user_profile: UserProfile
    activity_data: ActivityData
    membership_info: Optional[MembershipInfo] = None

class AttendanceAnalysis(BaseModel):
    score: int = Field(..., description="Consistency score 0-100")
    consistency_level: str = Field(..., description="e.g. High, Medium, Low")
    score_explanation: str
    pattern_insight: str
    renewal_behavior_insight: str
    positive_nudge: str
    recommendation: str

class BurnoutKeyMetrics(BaseModel):
    avg_sessions_per_week: float
    consecutive_training_days_max: int
    rest_days_last_30: int

class BurnoutAnalysis(BaseModel):
    risk_score: int = Field(..., description="Risk score 0-100")
    risk_level: str = Field(..., description="e.g. Low, Moderate, High")
    warning_signs: List[str]
    recovery_suggestion: str
    key_metrics: BurnoutKeyMetrics

class WellnessAnalysisResponse(BaseModel):
    attendance_analysis: AttendanceAnalysis
    burnout_analysis: BurnoutAnalysis
