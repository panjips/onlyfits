package subscription

import (
	"time"

	"github.com/google/uuid"
)

type CreateSubscriptionRequest struct {
	MemberID  uuid.UUID  `json:"memberId" validate:"required"`
	PlanID    *uuid.UUID `json:"planId,omitempty"`
	BranchID  *uuid.UUID `json:"branchId,omitempty"`
	StartDate string     `json:"startDate" validate:"required"`
	Status    *string    `json:"status,omitempty"`
}

type UpdateSubscriptionRequest struct {
	PlanID    *uuid.UUID `json:"planId,omitempty"`
	BranchID  *uuid.UUID `json:"branchId,omitempty"`
	StartDate *string    `json:"startDate,omitempty"`
	EndDate   *string    `json:"endDate,omitempty"`
	Status    *string    `json:"status,omitempty"`
}

type RenewSubscriptionRequest struct {
	PlanID   *uuid.UUID `json:"planId,omitempty"`
	BranchID *uuid.UUID `json:"branchId,omitempty"`
}

type SubscriptionResponse struct {
	ID        uuid.UUID  `json:"id"`
	MemberID  uuid.UUID  `json:"memberId"`
	PlanID    *uuid.UUID `json:"planId,omitempty"`
	BranchID  *uuid.UUID `json:"branchId,omitempty"`
	StartDate string     `json:"startDate"`
	EndDate   string     `json:"endDate"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

type CreateSubscriptionResponse struct {
	ID          uuid.UUID  `json:"id"`
	MemberID    uuid.UUID  `json:"memberId"`
	PlanID      *uuid.UUID `json:"planId,omitempty"`
	BranchID    *uuid.UUID `json:"branchId,omitempty"`
	InvoiceID   *uuid.UUID `json:"invoiceId,omitempty"`
	CheckoutURL string     `json:"checkoutUrl,omitempty"`
}

type SubscriptionListFilter struct {
	OrganizationID *uuid.UUID `json:"organizationId,omitempty"`
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	MemberID       *uuid.UUID `json:"memberId,omitempty"`
	Status         *string    `json:"status,omitempty"`
	Page           int        `json:"page"`
	Limit          int        `json:"limit"`
}
