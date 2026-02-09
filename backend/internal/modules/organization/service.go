package organization

import (
	"context"

	"fitcore/internal/modules/branch"

	"github.com/google/uuid"
)

type Service interface {
	CreateOrganization(ctx context.Context, req *CreateOrganizationRequest) (*Organization, error)
	UpdateOrganization(ctx context.Context, id uuid.UUID, req *UpdateOrganizationRequest) (*Organization, error)
	DeleteOrganization(ctx context.Context, id uuid.UUID) error
	GetOrganization(ctx context.Context, id uuid.UUID) (*Organization, error)
	GetOrganizationBySlug(ctx context.Context, slug string) (*Organization, error)
	ListOrganizations(ctx context.Context, page, limit int) ([]*Organization, error)
	ListBranchesByOrganization(ctx context.Context, organizationID uuid.UUID, page, limit int) ([]*branch.Branch, error)
}

type serviceImpl struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &serviceImpl{repo: repo}
}

func (s *serviceImpl) CreateOrganization(ctx context.Context, req *CreateOrganizationRequest) (*Organization, error) {
	org := &Organization{
		Name:    req.Name,
		Slug:    req.Slug,
		LogoURL: req.LogoURL,
		Config:  req.Config,
	}
	if org.Config == nil {
		org.Config = []byte("{}")
	}

	if err := s.repo.Create(ctx, org); err != nil {
		return nil, err
	}

	// Upsert organization modules if moduleIds are provided
	if len(req.ModuleIds) > 0 {
		if err := s.repo.UpsertOrganizationModules(ctx, org.ID, req.ModuleIds); err != nil {
			return nil, err
		}
	}

	// Fetch modules to include in response
	modules, err := s.repo.GetModulesByOrganizationID(ctx, org.ID)
	if err != nil {
		return nil, err
	}
	org.Modules = modules

	return org, nil
}

func (s *serviceImpl) UpdateOrganization(ctx context.Context, id uuid.UUID, req *UpdateOrganizationRequest) (*Organization, error) {
	org, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		org.Name = req.Name
	}
	if req.Slug != "" {
		org.Slug = req.Slug
	}
	if req.LogoURL != nil {
		org.LogoURL = req.LogoURL
	}
	if req.Config != nil {
		org.Config = req.Config
	}

	if err := s.repo.Update(ctx, org); err != nil {
		return nil, err
	}

	// Upsert organization modules if moduleIds are provided
	if req.ModuleIds != nil {
		if err := s.repo.UpsertOrganizationModules(ctx, org.ID, req.ModuleIds); err != nil {
			return nil, err
		}
	}

	// Fetch modules to include in response
	modules, err := s.repo.GetModulesByOrganizationID(ctx, org.ID)
	if err != nil {
		return nil, err
	}
	org.Modules = modules

	return org, nil
}

func (s *serviceImpl) DeleteOrganization(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetOrganization(ctx context.Context, id uuid.UUID) (*Organization, error) {
	org, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Fetch modules to include in response
	modules, err := s.repo.GetModulesByOrganizationID(ctx, org.ID)
	if err != nil {
		return nil, err
	}
	org.Modules = modules

	return org, nil
}

func (s *serviceImpl) GetOrganizationBySlug(ctx context.Context, slug string) (*Organization, error) {
	return s.repo.GetBySlug(ctx, slug)
}

func (s *serviceImpl) ListOrganizations(ctx context.Context, page, limit int) ([]*Organization, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.List(ctx, limit, offset)
}

func (s *serviceImpl) ListBranchesByOrganization(ctx context.Context, organizationID uuid.UUID, page, limit int) ([]*branch.Branch, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	return s.repo.ListBranchesByOrganizationID(ctx, organizationID, limit, offset)
}
