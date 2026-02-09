package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID  `json:"id"`
	Email     string     `json:"email"`
	Password  string     `json:"-"`
	FirstName string     `json:"first_name"`
	LastName  string     `json:"last_name"`
	Role      string     `json:"role"`
	IsActive  bool       `json:"is_active"`
	CreatedAt *time.Time `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
}

type UserProfile struct {
	User
	BranchID *uuid.UUID `json:"branch_id"`
	OrganizationID *uuid.UUID `json:"organization_id"`
	MemberID *uuid.UUID `json:"member_id"`
	SubscriptionID *uuid.UUID `json:"subscription_id"`
	StartDate *time.Time `json:"start_date"`
	EndDate *time.Time `json:"end_date"`
	Status *string `json:"status"`
}