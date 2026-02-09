package subscription

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"fitcore/internal/config"
	"fitcore/internal/middleware"
	"fitcore/internal/modules/invoice"
	"fitcore/internal/modules/plans"
	"fitcore/internal/modules/user"
	"fitcore/pkg/email"
	"fitcore/pkg/polar"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// measureTime logs the duration of an operation
func measureTime(operation string, start time.Time) {
	elapsed := time.Since(start)
	log.Printf("TIMING: %s took %v", operation, elapsed)
}

var (
	ErrSubscriptionNotFound = errors.New("subscription not found")
	ErrMemberNotFound       = errors.New("member not found")
	ErrPlanNotFound         = errors.New("plan not found")
	ErrInvalidDateRange     = errors.New("end date must be after start date")
	ErrNoActiveSubscription = errors.New("no active subscription found")
)

type Service interface {
	CreateSubscription(ctx context.Context, req *CreateSubscriptionRequest, çç string) (*CreateSubscriptionResponse, error)
	UpdateSubscription(ctx context.Context, id uuid.UUID, req *UpdateSubscriptionRequest) (*Subscription, error)
	DeleteSubscription(ctx context.Context, id uuid.UUID) error
	GetSubscription(ctx context.Context, id uuid.UUID) (*Subscription, error)
	GetActiveSubscription(ctx context.Context, memberID uuid.UUID) (*Subscription, error)
	ListSubscriptions(ctx context.Context, filter *SubscriptionListFilter) ([]*Subscription, error)
	RenewSubscription(ctx context.Context, memberID uuid.UUID, req *RenewSubscriptionRequest) (*Subscription, error)
	ExpireOldSubscriptions(ctx context.Context) (int64, error)
}

type serviceImpl struct {
	repo       Repository
	plansSvc   plans.Service
	invoiceSvc invoice.Service
	polarSvc   *polar.Service
	emailSvc   email.Service
	userRepo   user.Repository
}

func NewService(repo Repository, plansSvc plans.Service, invoiceSvc invoice.Service, polarSvc *polar.Service, emailSvc email.Service, userRepo user.Repository) Service {
	return &serviceImpl{
		repo:       repo,
		plansSvc:   plansSvc,
		invoiceSvc: invoiceSvc,
		polarSvc:   polarSvc,
		emailSvc:   emailSvc,
		userRepo:   userRepo,
	}
}

func (s *serviceImpl) CreateSubscription(ctx context.Context, req *CreateSubscriptionRequest, paymentType string) (*CreateSubscriptionResponse, error) {
	totalStart := time.Now()
	defer measureTime("CreateSubscription total", totalStart)

	log.Printf("Service: CreateSubscription called for member ID: %s, start date: %s", req.MemberID, req.StartDate)

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		log.Printf("Service: CreateSubscription failed - invalid start date format for member ID %s: %v", req.MemberID, err)
		return nil, err
	}

	getPlanStart := time.Now()
	plan, err := s.plansSvc.GetPlan(ctx, *req.PlanID)
	measureTime("GetPlan", getPlanStart)
	if err != nil {
		log.Printf("Service: CreateSubscription failed - plans service error for member ID %s: %v", req.MemberID, err)
		return nil, err
	}

	startTime, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		log.Printf("Service: CreateSubscription failed - invalid start date format for member ID %s: %v", req.MemberID, err)
		return nil, err
	}
	endTime := startTime.AddDate(0, 0, plan.DurationDays)

	status := StatusActive
	if req.Status != nil {
		status = SubscriptionStatus(*req.Status)
	}

	sub := &Subscription{
		MemberID:  req.MemberID,
		PlanID:    req.PlanID,
		BranchID:  req.BranchID,
		StartDate: startDate,
		EndDate:   endTime,
		Status:    status,
	}

	log.Printf("Service: Creating subscription in repository for member ID: %s", req.MemberID)
	createSubStart := time.Now()
	if err := s.repo.Create(ctx, sub); err != nil {
		log.Printf("Service: CreateSubscription failed - repository error for member ID %s: %v", req.MemberID, err)
		return nil, err
	}
	measureTime("Create subscription (DB)", createSubStart)

	subsResponse := &CreateSubscriptionResponse{
		ID:       sub.ID,
		MemberID: sub.MemberID,
		PlanID:   sub.PlanID,
		BranchID: sub.BranchID,
	}

	baseUrl := config.Get().App.BaseURL
	claims := ctx.Value(middleware.UserClaimsKey).(jwt.MapClaims)
	successUrl := fmt.Sprintf("%s/login", baseUrl)

	if sub.PlanID != nil {
		polarStart := time.Now()
		res, err := s.polarSvc.CreateCheckout(ctx, []string{sub.PlanID.String()}, claims["email"].(string), successUrl, "new")
		measureTime("Polar CreateCheckout API", polarStart)
		if err != nil {
			log.Printf("Service: CreateSubscription failed - polar service error for member ID %s: %v", req.MemberID, err)
			return nil, err
		}

		var taxAmount float64
		if res.Checkout.TaxAmount != nil {
			taxAmount = float64(*res.Checkout.TaxAmount)
		}

		var externalID *uuid.UUID
		if res.Checkout.ID != "" {
			if parsedID, err := uuid.Parse(res.Checkout.ID); err == nil {
				externalID = &parsedID
			}
		}

		reqInvoice := &invoice.CreateInvoiceRequest{
			MemberID:       sub.MemberID,
			SubscriptionID: &sub.ID,
			BranchID:       sub.BranchID,
			Amount:         float64(res.Checkout.Amount),
			TaxAmount:      taxAmount,
			ExternalID:     externalID,
			DueDate:        &res.Checkout.ExpiresAt,
		}

		invoiceStart := time.Now()
		resInvoice, err := s.invoiceSvc.CreateInvoice(ctx, reqInvoice)
		measureTime("CreateInvoice (DB)", invoiceStart)
		if err != nil {
			log.Printf("Service: CreateSubscription failed - invoice service error for member ID %s: %v", req.MemberID, err)
			return nil, err
		}
		subsResponse.InvoiceID = &resInvoice.ID
		subsResponse.CheckoutURL = res.Checkout.URL

		getUserStart := time.Now()
		user, err := s.userRepo.GetUserByMemberID(ctx, sub.MemberID)
		measureTime("GetUserByMemberID (DB)", getUserStart)
		if err != nil {
			log.Printf("Service: CreateSubscription failed - user service error for member ID %s: %v", req.MemberID, err)
			return nil, err
		}

		// Send email asynchronously to avoid blocking the API response
		go func(email, checkoutURL string) {
			// Create a new context for the background operation since the request context may be cancelled
			bgCtx := context.Background()
			if err := s.emailSvc.SendPaymentEmail(bgCtx, email, checkoutURL); err != nil {
				log.Printf("Service: Async email sending failed for member ID %s: %v", req.MemberID, err)
			} else {
				log.Printf("Service: Payment email sent successfully to %s", email)
			}
		}(user.Email, res.Checkout.URL)
	}

	log.Printf("Service: Subscription created successfully with ID: %s for member ID: %s", sub.ID, req.MemberID)
	return subsResponse, nil
}

func (s *serviceImpl) UpdateSubscription(ctx context.Context, id uuid.UUID, req *UpdateSubscriptionRequest) (*Subscription, error) {
	sub, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrSubscriptionNotFound
	}

	if req.PlanID != nil {
		sub.PlanID = req.PlanID
	}

	if req.BranchID != nil {
		sub.BranchID = req.BranchID
	}

	if req.StartDate != nil {
		startDate, err := time.Parse("2006-01-02", *req.StartDate)
		if err != nil {
			return nil, err
		}
		sub.StartDate = startDate
	}

	if req.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *req.EndDate)
		if err != nil {
			return nil, err
		}
		sub.EndDate = endDate
	}

	if !sub.EndDate.After(sub.StartDate) {
		return nil, ErrInvalidDateRange
	}

	if req.Status != nil {
		sub.Status = SubscriptionStatus(*req.Status)
	}

	if err := s.repo.Update(ctx, sub); err != nil {
		return nil, err
	}

	return sub, nil
}

func (s *serviceImpl) DeleteSubscription(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetSubscription(ctx context.Context, id uuid.UUID) (*Subscription, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *serviceImpl) GetActiveSubscription(ctx context.Context, memberID uuid.UUID) (*Subscription, error) {
	return s.repo.GetActiveByMemberID(ctx, memberID)
}

func (s *serviceImpl) ListSubscriptions(ctx context.Context, filter *SubscriptionListFilter) ([]*Subscription, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 {
		filter.Limit = 10
	}
	return s.repo.List(ctx, filter)
}

func (s *serviceImpl) RenewSubscription(ctx context.Context, memberID uuid.UUID, req *RenewSubscriptionRequest) (*Subscription, error) {
	// Get current active subscription
	currentSub, err := s.repo.GetActiveByMemberID(ctx, memberID)
	if err != nil {
		return nil, ErrNoActiveSubscription
	}

	// Determine which plan to use for renewal
	planID := currentSub.PlanID
	if req.PlanID != nil {
		planID = req.PlanID
	}

	// Get plan details to calculate new end date
	var durationDays int
	if planID != nil {
		plan, err := s.plansSvc.GetPlan(ctx, *planID)
		if err != nil {
			return nil, ErrPlanNotFound
		}
		durationDays = plan.DurationDays
	} else {
		// If no plan, use the same duration as current subscription
		durationDays = int(currentSub.EndDate.Sub(currentSub.StartDate).Hours() / 24)
	}

	// Determine which branch to use
	branchID := currentSub.BranchID
	if req.BranchID != nil {
		branchID = req.BranchID
	}

	// Mark current subscription as expired
	currentSub.Status = StatusExpired
	if err := s.repo.Update(ctx, currentSub); err != nil {
		return nil, err
	}

	// Create new subscription starting from current subscription end date
	newSub := &Subscription{
		MemberID:  memberID,
		PlanID:    planID,
		BranchID:  branchID,
		StartDate: currentSub.EndDate,
		EndDate:   currentSub.EndDate.AddDate(0, 0, durationDays),
		Status:    StatusActive,
	}

	if err := s.repo.Create(ctx, newSub); err != nil {
		return nil, err
	}

	return newSub, nil
}

func (s *serviceImpl) ExpireOldSubscriptions(ctx context.Context) (int64, error) {
	return s.repo.ExpireOldSubscriptions(ctx)
}
