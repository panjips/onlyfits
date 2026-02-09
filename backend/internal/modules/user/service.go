package user

import (
	"context"
	"errors"

	"fitcore/pkg/hash"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound     = errors.New("user not found")
	ErrEmailAlreadyUsed = errors.New("email already in use")
	ErrInvalidPassword  = errors.New("invalid password")
)

type Service interface {
	CreateUser(ctx context.Context, req *CreateUserRequest) (*User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetUserByEmail(ctx context.Context, email string) (*User, error)
	UpdateUser(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*User, error)
	DeleteUser(ctx context.Context, id uuid.UUID) error
	ChangePassword(ctx context.Context, id uuid.UUID, oldPassword, newPassword string) error
	ProfileByRole(ctx context.Context, id uuid.UUID, role string) (*UserProfileResponse, error)
	ListUsersWithFilter(ctx context.Context, filter *UserListFilter) ([]*User, error)
	GetUserBranchIDs(ctx context.Context, userID uuid.UUID, userRole string) ([]uuid.UUID, error)
}

type serviceImpl struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &serviceImpl{repo: repo}
}

func (s *serviceImpl) CreateUser(ctx context.Context, req *CreateUserRequest) (*User, error) {

	exists, err := s.repo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailAlreadyUsed
	}

	hashedPassword, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &User{
		ID:        uuid.New(),
		Email:     req.Email,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      req.Role,
		IsActive:  true,
	}

	if user.Role == "" {
		user.Role = "member"
	}

	if err := s.repo.CreateWithBranch(ctx, user, *req.BranchId); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *serviceImpl) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *serviceImpl) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *serviceImpl) UpdateUser(ctx context.Context, id uuid.UUID, req *UpdateUserRequest) (*User, error) {

	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if req.Email != "" && req.Email != user.Email {
		exists, err := s.repo.ExistsByEmail(ctx, req.Email)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, ErrEmailAlreadyUsed
		}
		user.Email = req.Email
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Role != "" {
		user.Role = req.Role
	}

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *serviceImpl) DeleteUser(ctx context.Context, id uuid.UUID) error {

	_, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return ErrUserNotFound
	}

	return s.repo.Delete(ctx, id)
}

func (s *serviceImpl) ChangePassword(ctx context.Context, id uuid.UUID, oldPassword, newPassword string) error {

	user, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return ErrUserNotFound
	}

	if err := hash.VerifyPassword(user.Password, oldPassword); err != nil {
		return ErrInvalidPassword
	}

	hashedPassword, err := hash.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user.Password = hashedPassword
	return s.repo.Update(ctx, user)
}

func (s *serviceImpl) ProfileByRole(ctx context.Context, id uuid.UUID, role string) (*UserProfileResponse, error) {
	user, err := s.repo.ProfileByRole(ctx, id, role)
	if err != nil {
		return nil, err
	}
	return user.ToProfileResponse(), nil
}

func (s *serviceImpl) ListUsersWithFilter(ctx context.Context, filter *UserListFilter) ([]*User, error) {
	return s.repo.ListWithFilter(ctx, filter)
}

func (s *serviceImpl) GetUserBranchIDs(ctx context.Context, userID uuid.UUID, userRole string) ([]uuid.UUID, error) {
	if userRole == "member" {
		branchID, err := s.repo.GetMemberBranchID(ctx, userID)
		if err != nil {
			return nil, err
		}
		if branchID != nil {
			return []uuid.UUID{*branchID}, nil
		}
		return []uuid.UUID{}, nil
	}

	return s.repo.GetUserBranchIDs(ctx, userID)
}
