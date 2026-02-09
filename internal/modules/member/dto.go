package member

import (
	"time"

	"github.com/google/uuid"
)

type CreateMemberRequest struct {
	Email          string     `json:"email,omitempty"`
	CreateNewUser  *bool      `json:"createNewUser,omitempty"` // If true, force create new user; if false, require existing user; if nil, auto-detect
	OrganizationID uuid.UUID  `json:"organizationId" validate:"required"`
	HomeBranchID   *uuid.UUID `json:"homeBranchId,omitempty"`
	PlanID         *uuid.UUID `json:"planId,omitempty"`
	FirstName      string     `json:"firstName" validate:"required"`
	LastName       string     `json:"lastName" validate:"required"`
	Phone          *string    `json:"phone,omitempty"`
	DateOfBirth    *string    `json:"dateOfBirth,omitempty"`
	Status         *string    `json:"status,omitempty"`
	JoinDate       *string    `json:"joinDate,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
}

type UpdateMemberRequest struct {
	UserID       *uuid.UUID `json:"userId,omitempty"`
	HomeBranchID *uuid.UUID `json:"homeBranchId,omitempty"`
	FirstName    string     `json:"firstName,omitempty"`
	LastName     string     `json:"lastName,omitempty"`
	Phone        *string    `json:"phone,omitempty"`
	DateOfBirth  *string    `json:"dateOfBirth,omitempty"`
	Status       *string    `json:"status,omitempty"`
	JoinDate     *string    `json:"joinDate,omitempty"`
	Notes        *string    `json:"notes,omitempty"`
}

type MemberResponse struct {
	ID             uuid.UUID  `json:"id"`
	UserID         *uuid.UUID `json:"userId,omitempty"`
	OrganizationID uuid.UUID  `json:"organizationId"`
	HomeBranchID   *uuid.UUID `json:"homeBranchId,omitempty"`
	FirstName      string     `json:"firstName"`
	LastName       string     `json:"lastName"`
	Phone          *string    `json:"phone,omitempty"`
	DateOfBirth    *string    `json:"dateOfBirth,omitempty"`
	Status         string     `json:"status"`
	JoinDate       *string    `json:"joinDate,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
}

type CreateMemberResponse struct {
	ID             uuid.UUID  `json:"id"`
	SubscriptionID uuid.UUID  `json:"subscriptionId"`
	PlanID         *uuid.UUID `json:"planId,omitempty"`
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	InvoiceID      *uuid.UUID `json:"invoiceId,omitempty"`
}

type MemberListFilter struct {
	OrganizationID *uuid.UUID `json:"organizationId,omitempty"`
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	Status         *string    `json:"status,omitempty"`
	Page           int        `json:"page"`
	Limit          int        `json:"limit"`
}

type QRCodeResponse struct {
	Token string `json:"token"`
}

type ClaimQr struct {
	UID       uuid.UUID `json:"uid"`
	MID       uuid.UUID `json:"mid"`
	Type      string    `json:"type"`
	ExpiresAt time.Time `json:"expires_at"`
}

type CheckInWithMemberResponse struct {
	ID             uuid.UUID  `json:"id"`
	BranchID       uuid.UUID  `json:"branch_id"`
	MemberID       uuid.UUID  `json:"member_id"`
	SubscriptionID uuid.UUID  `json:"subscription_id"`
	CheckInTime    time.Time  `json:"check_in_time"`
	CheckOutTime   *time.Time `json:"check_out_time,omitempty"`
	Method         string     `json:"method,omitempty"`
	MemberName     string     `json:"member_name"`
}

type VisitorCountResponse struct {
	Count    int    `json:"count"`
	BranchID string `json:"branchId"`
}

type UserProfile struct {
	UserID   string  `json:"user_id"`
	Age      int     `json:"age"`
	Gender   string  `json:"gender"`
	JoinDate *string `json:"join_date,omitempty"`
}

type ActivityData struct {
	Last30DaysCheckins      []string `json:"last_30_days_checkins"`
	AverageDurationMinutes  float64  `json:"average_duration_minutes"`
	TotalSessionsLast30Days int      `json:"total_sessions_last_30_days"`
	MostCommonTime          *string  `json:"most_common_time,omitempty"`
}

type MembershipInfo struct {
	DaysUntilRenewal int      `json:"days_until_renewal"`
	RenewalHistory   []string `json:"renewal_history"`
}

type WellnessAnalysisRequest struct {
	UserProfile    UserProfile     `json:"user_profile"`
	ActivityData   ActivityData    `json:"activity_data"`
	MembershipInfo *MembershipInfo `json:"membership_info,omitempty"`
}

type AttendanceAnalysis struct {
	Score                  int    `json:"score"`
	ConsistencyLevel       string `json:"consistency_level"`
	ScoreExplanation       string `json:"score_explanation"`
	PatternInsight         string `json:"pattern_insight"`
	RenewalBehaviorInsight string `json:"renewal_behavior_insight"`
	PositiveNudge          string `json:"positive_nudge"`
	Recommendation         string `json:"recommendation"`
}

type BurnoutKeyMetrics struct {
	AvgSessionsPerWeek         float64 `json:"avg_sessions_per_week"`
	ConsecutiveTrainingDaysMax int     `json:"consecutive_training_days_max"`
	RestDaysLast30             int     `json:"rest_days_last_30"`
}

type BurnoutAnalysis struct {
	RiskScore          int               `json:"risk_score"`
	RiskLevel          string            `json:"risk_level"`
	WarningSigns       []string          `json:"warning_signs"`
	RecoverySuggestion string            `json:"recovery_suggestion"`
	KeyMetrics         BurnoutKeyMetrics `json:"key_metrics"`
}

type WellnessAnalysisResponse struct {
	AttendanceAnalysis AttendanceAnalysis `json:"attendance_analysis"`
	BurnoutAnalysis    BurnoutAnalysis    `json:"burnout_analysis"`
}

type ChatbotRequest struct {
	Query   string                  `json:"query"`
	Context WellnessAnalysisRequest `json:"context"`
}

type ChatbotResponse struct {
	Answer           string   `json:"answer"`
	SuggestedActions []string `json:"suggested_actions,omitempty"`
}
