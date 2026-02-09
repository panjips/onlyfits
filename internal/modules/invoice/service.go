package invoice

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CreateInvoice(ctx context.Context, req *CreateInvoiceRequest) (*Invoice, error)
	UpdateInvoice(ctx context.Context, id uuid.UUID, req *UpdateInvoiceRequest) (*Invoice, error)
	DeleteInvoice(ctx context.Context, id uuid.UUID) error
	GetInvoice(ctx context.Context, id uuid.UUID) (*Invoice, error)
	GetInvoiceByExternalID(ctx context.Context, id uuid.UUID) (*Invoice, error)
	ListInvoices(ctx context.Context, filter ListInvoicesFilter) ([]*Invoice, error)
}

type serviceImpl struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &serviceImpl{
		repo: repo,
	}
}

func (s *serviceImpl) CreateInvoice(ctx context.Context, req *CreateInvoiceRequest) (*Invoice, error) {
	log.Printf("Service: CreateInvoice called for member ID: %s, amount: %.2f", req.MemberID, req.Amount)

	if req.MemberID == uuid.Nil {
		log.Printf("Service: CreateInvoice failed - memberId is required")
		return nil, fmt.Errorf("memberId is required")
	}
	if req.Amount < 0 {
		log.Printf("Service: CreateInvoice failed - amount must be >= 0, got: %f", req.Amount)
		return nil, fmt.Errorf("amount must be >= 0")
	}
	if req.TaxAmount < 0 {
		log.Printf("Service: CreateInvoice failed - taxAmount must be >= 0, got: %f", req.TaxAmount)
		return nil, fmt.Errorf("taxAmount must be >= 0")
	}

	invNumber := strings.TrimSpace(req.InvoiceNumber)
	if invNumber == "" {
		invNumber = generateInvoiceNumber()
	}

	status := "pending"
	if strings.TrimSpace(req.Status) != "" {
		status = strings.ToLower(strings.TrimSpace(req.Status))
	}

	inv := &Invoice{
		ID:             uuid.Nil,
		InvoiceNumber:  invNumber,
		MemberID:       req.MemberID,
		BranchID:       req.BranchID,
		SubscriptionID: req.SubscriptionID,
		Amount:         req.Amount,
		TaxAmount:      req.TaxAmount,
		Status:         status,
		DueDate:        req.DueDate,
		PaidAt:         nil,
		Notes:          req.Notes,
		ExternalID:     req.ExternalID,
	}

	log.Printf("Service: Creating invoice in repository for member ID: %s, invoice number: %s", req.MemberID, invNumber)
	if err := s.repo.Create(ctx, inv); err != nil {
		log.Printf("Service: CreateInvoice failed - repository error for member ID %s: %v", req.MemberID, err)
		return nil, err
	}

	log.Printf("Service: Invoice created successfully with ID: %s for member ID: %s", inv.ID, req.MemberID)
	return inv, nil
}

func (s *serviceImpl) UpdateInvoice(ctx context.Context, id uuid.UUID, req *UpdateInvoiceRequest) (*Invoice, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("invalid invoice id")
	}

	inv, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.BranchID != nil {
		inv.BranchID = req.BranchID
	}
	if req.SubscriptionID != nil {
		inv.SubscriptionID = req.SubscriptionID
	}
	if req.Amount != nil {
		if *req.Amount < 0 {
			return nil, fmt.Errorf("amount must be >= 0")
		}
		inv.Amount = *req.Amount
	}
	if req.TaxAmount != nil {
		if *req.TaxAmount < 0 {
			return nil, fmt.Errorf("taxAmount must be >= 0")
		}
		inv.TaxAmount = *req.TaxAmount
	}
	if req.Status != nil {
		newStatus := strings.ToLower(strings.TrimSpace(*req.Status))
		if newStatus != "" {
			inv.Status = newStatus
		}
	}
	if req.DueDate != nil {
		inv.DueDate = req.DueDate
	}
	if req.PaidAt != nil {
		inv.PaidAt = req.PaidAt
	}
	if req.Notes != nil {
		inv.Notes = req.Notes
	}

	if err := s.repo.Update(ctx, inv); err != nil {
		return nil, err
	}
	return inv, nil
}

func (s *serviceImpl) DeleteInvoice(ctx context.Context, id uuid.UUID) error {
	if id == uuid.Nil {
		return fmt.Errorf("invalid invoice id")
	}
	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetInvoice(ctx context.Context, id uuid.UUID) (*Invoice, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("invalid invoice id")
	}
	return s.repo.GetByID(ctx, id)
}

func (s *serviceImpl) GetInvoiceByExternalID(ctx context.Context, id uuid.UUID) (*Invoice, error) {
	if id == uuid.Nil {
		return nil, fmt.Errorf("invalid invoice id")
	}
	return s.repo.GetByExternalID(ctx, id)
}

func (s *serviceImpl) ListInvoices(ctx context.Context, filter ListInvoicesFilter) ([]*Invoice, error) {

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}

	filter.StartDate, filter.EndDate = normalizeDateRange(filter.StartDate, filter.EndDate)

	if strings.TrimSpace(filter.DateField) == "" {
		filter.DateField = "created_at"
	} else {
		df := strings.ToLower(strings.TrimSpace(filter.DateField))
		switch df {
		case "created_at", "due_date":
			filter.DateField = df
		default:
			filter.DateField = "created_at"
		}
	}

	return s.repo.List(ctx, filter)
}

func generateInvoiceNumber() string {
	year := time.Now().UTC().Year()
	u := uuid.New()
	return fmt.Sprintf("INV-%d-%s", year, strings.Split(u.String(), "-")[0])
}
