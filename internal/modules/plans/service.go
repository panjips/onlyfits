package plans

import (
	"context"
	"fitcore/pkg/polar"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
)

// PlanCache provides in-memory caching for plans
type PlanCache struct {
	mu       sync.RWMutex
	plans    map[uuid.UUID]*Plan
	expireAt map[uuid.UUID]time.Time
	ttl      time.Duration
}

func NewPlanCache(ttl time.Duration) *PlanCache {
	return &PlanCache{
		plans:    make(map[uuid.UUID]*Plan),
		expireAt: make(map[uuid.UUID]time.Time),
		ttl:      ttl,
	}
}

func (c *PlanCache) Get(id uuid.UUID) (*Plan, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if expiry, ok := c.expireAt[id]; ok && time.Now().After(expiry) {
		return nil, false
	}

	plan, ok := c.plans[id]
	return plan, ok
}

func (c *PlanCache) Set(plan *Plan) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.plans[plan.ID] = plan
	c.expireAt[plan.ID] = time.Now().Add(c.ttl)
}

func (c *PlanCache) Invalidate(id uuid.UUID) {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.plans, id)
	delete(c.expireAt, id)
}

func (c *PlanCache) InvalidateAll() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.plans = make(map[uuid.UUID]*Plan)
	c.expireAt = make(map[uuid.UUID]time.Time)
}

type Service interface {
	CreatePlan(ctx context.Context, req *CreatePlanRequest) (*Plan, error)
	UpdatePlan(ctx context.Context, id uuid.UUID, req *UpdatePlanRequest) (*Plan, error)
	DeletePlan(ctx context.Context, id uuid.UUID) error
	GetPlan(ctx context.Context, id uuid.UUID) (*Plan, error)
	ListPlans(ctx context.Context, page, limit int) ([]*Plan, error)
	ListPlansByOrganization(ctx context.Context, organizationID uuid.UUID, page, limit int) ([]*Plan, error)
}

type serviceImpl struct {
	repo     Repository
	polarSvc *polar.Service
	cache    *PlanCache
}

func NewService(repo Repository, polarSvc *polar.Service) Service {
	return &serviceImpl{
		repo:     repo,
		polarSvc: polarSvc,
		cache:    NewPlanCache(5 * time.Minute), // Cache plans for 5 minutes
	}
}

func (s *serviceImpl) CreatePlan(ctx context.Context, req *CreatePlanRequest) (*Plan, error) {
	branchIDs := make([]string, 0, len(req.BranchIDs))
	for _, id := range req.BranchIDs {
		branchIDs = append(branchIDs, id.String())
	}

	isActive := true
	plan := &Plan{
		OrganizationID: req.OrganizationID,
		BranchIDs:      branchIDs,
		Name:           req.Name,
		Description:    req.Description,
		Price:          req.Price,
		DurationDays:   req.DurationDays,
		IsActive:       &isActive,
	}

	price := int64(req.Price * 100)
	polarPlan, err := s.polarSvc.CreateProduct(ctx, price, req.Name, *req.Description)
	if err != nil {
		log.Printf("%v", err)
		return nil, err
	}

	plan.ID = uuid.MustParse(polarPlan.Product.ID)
	if err := s.repo.Create(ctx, plan); err != nil {
		return nil, err
	}

	// Cache the newly created plan
	s.cache.Set(plan)

	return plan, nil
}

func (s *serviceImpl) UpdatePlan(ctx context.Context, id uuid.UUID, req *UpdatePlanRequest) (*Plan, error) {
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	polarParams := polar.ProductUpdateParams{}

	if req.Name != "" {
		polarParams.Name = &req.Name
		plan.Name = req.Name
	}

	if req.Description != nil {
		polarParams.Description = req.Description
		plan.Description = req.Description
	}

	if req.Price != nil {
		price := int64(*req.Price * 100)
		polarParams.Price = &price
		plan.Price = *req.Price
	}

	if req.BranchIDs != nil {
		branchIDs := make([]string, 0, len(req.BranchIDs))
		for _, bid := range req.BranchIDs {
			branchIDs = append(branchIDs, bid.String())
		}
		plan.BranchIDs = branchIDs
	}

	if req.DurationDays != nil {
		plan.DurationDays = *req.DurationDays
	}

	if req.IsActive != nil {
		plan.IsActive = req.IsActive
	}

	if polarParams.Name != nil || polarParams.Description != nil || polarParams.Price != nil {
		_, err := s.polarSvc.UpdateProduct(ctx, id.String(), polarParams)
		if err != nil {
			return nil, err
		}
	}

	if err := s.repo.Update(ctx, plan); err != nil {
		return nil, err
	}

	// Invalidate cache on update
	s.cache.Invalidate(id)
	// Cache the updated plan
	s.cache.Set(plan)

	return plan, nil
}

func (s *serviceImpl) DeletePlan(ctx context.Context, id uuid.UUID) error {
	_, err := s.polarSvc.InactiveProduct(ctx, id.String())
	if err != nil {
		return err
	}

	// Invalidate cache on delete
	s.cache.Invalidate(id)

	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetPlan(ctx context.Context, id uuid.UUID) (*Plan, error) {
	// Check cache first
	if plan, ok := s.cache.Get(id); ok {
		log.Printf("Service: GetPlan cache hit for ID: %s", id)
		return plan, nil
	}

	log.Printf("Service: GetPlan cache miss for ID: %s, fetching from database", id)
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Cache the plan for future requests
	s.cache.Set(plan)

	return plan, nil
}

func (s *serviceImpl) ListPlans(ctx context.Context, page, limit int) ([]*Plan, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.List(ctx, limit, offset)
}

func (s *serviceImpl) ListPlansByOrganization(ctx context.Context, organizationID uuid.UUID, page, limit int) ([]*Plan, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.ListByOrganizationID(ctx, organizationID, limit, offset)
}
