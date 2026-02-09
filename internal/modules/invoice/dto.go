package invoice

import (
	"time"

	"github.com/google/uuid"
)

type CreateInvoiceRequest struct {
	InvoiceNumber  string     `json:"invoiceNumber,omitempty"`
	MemberID       uuid.UUID  `json:"memberId" validate:"required"`
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	SubscriptionID *uuid.UUID `json:"subscriptionId,omitempty"`
	ExternalID     *uuid.UUID `json:"externalId,omitempty"`
	Amount         float64    `json:"amount" validate:"required,gte=0"`
	TaxAmount      float64    `json:"taxAmount,omitempty" validate:"gte=0"`
	Status         string     `json:"status,omitempty"`
	DueDate        *time.Time `json:"dueDate,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
}

type UpdateInvoiceRequest struct {
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	SubscriptionID *uuid.UUID `json:"subscriptionId,omitempty"`
	Amount         *float64   `json:"amount,omitempty" validate:"omitempty,gte=0"`
	TaxAmount      *float64   `json:"taxAmount,omitempty" validate:"omitempty,gte=0"`
	Status         *string    `json:"status,omitempty"`
	DueDate        *time.Time `json:"dueDate,omitempty"`
	PaidAt         *time.Time `json:"paidAt,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
}

type ListInvoicesFilter struct {
	Page  int `json:"page,omitempty"`
	Limit int `json:"limit,omitempty"`

	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	OrganizationID *uuid.UUID `json:"organizationId,omitempty"`
	MemberID       *uuid.UUID `json:"memberId,omitempty"`
	SubscriptionID *uuid.UUID `json:"subscriptionId,omitempty"`
	Status         *string    `json:"status,omitempty"`

	DateField string     `json:"dateField,omitempty"`
	StartDate *time.Time `json:"startDate,omitempty"`
	EndDate   *time.Time `json:"endDate,omitempty"`
}
