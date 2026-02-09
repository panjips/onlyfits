export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  organizationId?: string;
  branchId?: string;
  member?: {
    memberId?: string;
    subscriptionId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  };
}

export interface QRCodeResponse {
  token: string;
}

export interface VisitorCountResponse {
  count: number;
  branchId: string;
}

export interface AttendanceAnalysisData {
  score: number;
  consistency_level: string;
  score_explanation: string;
  pattern_insight: string;
  renewal_behavior_insight: string;
  positive_nudge: string;
  recommendation: string;
}

export interface BurnoutAnalysisData {
  risk_score: number;
  risk_level: string;
  warning_signs: string[];
  recovery_suggestion: string;
  key_metrics: {
    avg_sessions_per_week: number;
    consecutive_training_days_max: number;
    rest_days_last_30: number;
  };
}

export interface WellnessAnalysisResponse {
  attendance_analysis: AttendanceAnalysisData;
  burnout_analysis: BurnoutAnalysisData;
}

export interface AttendanceData {
  date: string;
  isAttendance: boolean;
  duration: number;
}

export type DateRangeFilter =
  | "last_7_days"
  | "last_14_days"
  | "month_to_date"
  | "last_30_days"
  | "last_3_months";
