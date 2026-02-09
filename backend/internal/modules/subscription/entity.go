package subscription

import (
	"time"

	"github.com/google/uuid"
)

type SubscriptionStatus string

const (
	StatusActive    SubscriptionStatus = "active"
	StatusCancelled SubscriptionStatus = "cancelled"
	StatusPastDue   SubscriptionStatus = "past_due"
	StatusExpired   SubscriptionStatus = "expired"
)

type Subscription struct {
	ID        uuid.UUID          `db:"id"`
	MemberID  uuid.UUID          `db:"member_id"`
	PlanID    *uuid.UUID         `db:"plan_id"`
	BranchID  *uuid.UUID         `db:"branch_id"`
	StartDate time.Time          `db:"start_date"`
	EndDate   time.Time          `db:"end_date"`
	Status    SubscriptionStatus `db:"status"`
	CreatedAt time.Time          `db:"created_at"`
	UpdatedAt time.Time          `db:"updated_at"`
}

func (s *Subscription) ToResponse() *SubscriptionResponse {
	return &SubscriptionResponse{
		ID:        s.ID,
		MemberID:  s.MemberID,
		PlanID:    s.PlanID,
		BranchID:  s.BranchID,
		StartDate: s.StartDate.Format("2006-01-02"),
		EndDate:   s.EndDate.Format("2006-01-02"),
		Status:    string(s.Status),
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

func (s *Subscription) IsActive() bool {
	return s.Status == StatusActive && time.Now().Before(s.EndDate)
}

func (s *Subscription) IsExpired() bool {
	return time.Now().After(s.EndDate)
}
