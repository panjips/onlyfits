package module

import (
	"context"

	"github.com/google/uuid"
)

type Service interface {
	CreateModule(ctx context.Context, req *CreateModuleRequest) (*Module, error)
	UpdateModule(ctx context.Context, id uuid.UUID, req *UpdateModuleRequest) (*Module, error)
	DeleteModule(ctx context.Context, id uuid.UUID) error
	GetModule(ctx context.Context, id uuid.UUID) (*Module, error)
	GetModuleByKey(ctx context.Context, key string) (*Module, error)
	ListModules(ctx context.Context, page, limit int) ([]*Module, error)
}

type serviceImpl struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &serviceImpl{repo: repo}
}

func (s *serviceImpl) CreateModule(ctx context.Context, req *CreateModuleRequest) (*Module, error) {
	module := &Module{
		Key:         req.Key,
		Name:        req.Name,
		Description: &req.Description,
	}

	if err := s.repo.Create(ctx, module); err != nil {
		return nil, err
	}
	return module, nil
}

func (s *serviceImpl) UpdateModule(ctx context.Context, id uuid.UUID, req *UpdateModuleRequest) (*Module, error) {
	module, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if req.Key != "" {
		module.Key = req.Key
	}
	if req.Name != "" {
		module.Name = req.Name
	}


	if err := s.repo.Update(ctx, module); err != nil {
		return nil, err
	}
	return module, nil
}

func (s *serviceImpl) DeleteModule(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) GetModule(ctx context.Context, id uuid.UUID) (*Module, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *serviceImpl) GetModuleByKey(ctx context.Context, key string) (*Module, error) {
	return s.repo.GetByKey(ctx, key)
}

func (s *serviceImpl) ListModules(ctx context.Context, page, limit int) ([]*Module,  error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit
	
	modules, err := s.repo.List(ctx, limit, offset)
	if err != nil {
		return nil, err
	}
	
	return modules, nil
}
