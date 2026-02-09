package invoice

import (
	"time"

	"github.com/google/uuid"
)

// Invoice represents the invoices table entity based on the migration schema.
type Invoice struct {
	ID             uuid.UUID  `db:"id"`
	InvoiceNumber  string     `db:"invoice_number"`
	MemberID       uuid.UUID  `db:"member_id"`
	BranchID       *uuid.UUID `db:"branch_id"`
	SubscriptionID *uuid.UUID `db:"subscription_id"`
	Amount         float64    `db:"amount"`
	TaxAmount      float64    `db:"tax_amount"`
	TotalAmount    float64    `db:"total_amount"`
	Status         string     `db:"status"`
	DueDate        *time.Time `db:"due_date"`
	PaidAt         *time.Time `db:"paid_at"`
	Notes          *string    `db:"notes"`
	ExternalID     *uuid.UUID `db:"external_id"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
}

// InvoiceResponse is the API-facing representation of an invoice.
type InvoiceResponse struct {
	ID             uuid.UUID  `json:"id"`
	InvoiceNumber  string     `json:"invoiceNumber"`
	MemberID       uuid.UUID  `json:"memberId"`
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	SubscriptionID *uuid.UUID `json:"subscriptionId,omitempty"`
	Amount         float64    `json:"amount"`
	TaxAmount      float64    `json:"taxAmount"`
	TotalAmount    float64    `json:"totalAmount"`
	Status         string     `json:"status"`
	ExternalID     *uuid.UUID `json:"externalId,omitempty"`
	DueDate        *time.Time `json:"dueDate,omitempty"`
	PaidAt         *time.Time `json:"paidAt,omitempty"`
	Notes          *string    `json:"notes,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

// ToResponse maps the Invoice entity to its response DTO.
func (i *Invoice) ToResponse() *InvoiceResponse {
	return &InvoiceResponse{
		ID:             i.ID,
		InvoiceNumber:  i.InvoiceNumber,
		MemberID:       i.MemberID,
		BranchID:       i.BranchID,
		SubscriptionID: i.SubscriptionID,
		Amount:         i.Amount,
		TaxAmount:      i.TaxAmount,
		TotalAmount:    i.TotalAmount,
		Status:         i.Status,
		DueDate:        i.DueDate,
		PaidAt:         i.PaidAt,
		Notes:          i.Notes,
		ExternalID:     i.ExternalID,
		CreatedAt:      i.CreatedAt,
		UpdatedAt:      i.UpdatedAt,
	}
}
