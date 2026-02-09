package branch

import (
	"context"

	"github.com/google/uuid"
)

type Service interface {
	CreateBranch(ctx context.Context, req *CreateBranchRequest) (*Branch, error)
	UpdateBranch(ctx context.Context, id uuid.UUID, req *UpdateBranchRequest) (*Branch, error)
	DeleteBranch(ctx context.Context, id uuid.UUID) error
	GetBranch(ctx context.Context, id uuid.UUID) (*Branch, error)
	ListBranches(ctx context.Context, page, limit int) ([]*Branch, error)
}

type serviceImpl struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &serviceImpl{repo: repo}
}

func (s *serviceImpl) CreateBranch(ctx context.Context, req *CreateBranchRequest) (*Branch, error) {
	branch := &Branch{
		OrganizationID: req.OrganizationID,
		Name:           req.Name,
		Code:           req.Code,
		Address:        req.Address,
		Phone:          req.Phone,
		Email:          req.Email,
		Timezone:       req.Timezone,
		IsActive:       nil, // DB default is true
	}
	// default isActive to true if not specified?
	// The DB defaults to true. If we pass nil, it depends on how we handle it.
	// In Create, we pass *bool. If nil, pgx handles it? Not exactly, if we pass nil to a pointer field in struct, and use standard VALUES ($8), PG will receive NULL.
	// DB schema: is_active BOOLEAN DEFAULT TRUE. If we pass NULL, it inserts NULL.
	// We want DEFAULT. So we should probably set it to true if not provided, OR ensure the pointer is handled.
	// Actually better to let business logic define defaults.
	isActive := true
	branch.IsActive = &isActive

	if err := s.repo.Create(ctx, branch); err != nil {
		return nil, err
	}
	return branch, nil
}

func (s *serviceImpl) UpdateBranch(ctx context.Context, id uuid.UUID, req *UpdateBranchRequest) (*Branch, error) {
	branch, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		branch.Name = req.Name
	}
	if req.Code != nil {
		branch.Code = req.Code
	}
	if req.Address != nil {
		branch.Address = req.Address
	}
	if req.Phone != nil {
		branch.Phone = req.Phone
	}
	if req.Email != nil {
		branch.Email = req.Email
	}
	if req.Timezone != nil {
		branch.Timezone = req.Timezone
	}
	if req.IsActive != nil {
		branch.IsActive = req.IsActive
	}

	if err := s.repo.Update(ctx, branch); err != nil {
		return nil, err
	}
	return branch, nil
}

func (s *serviceImpl) DeleteBranch(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetBranch(ctx context.Context, id uuid.UUID) (*Branch, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *serviceImpl) ListBranches(ctx context.Context, page, limit int) ([]*Branch, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.List(ctx, limit, offset)
}
