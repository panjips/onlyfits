package user

import (
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type CreateUserRequest struct {
	Email     string     `json:"email" validate:"required,email"`
	Password  string     `json:"password" validate:"required,min=8"`
	FirstName string     `json:"firstName" validate:"required"`
	LastName  string     `json:"lastName" validate:"required"`
	Role      string     `json:"role,omitempty"`
	BranchId  *uuid.UUID `json:"branchId,omitempty"`
}

type UpdateUserRequest struct {
	Email     string     `json:"email,omitempty" validate:"omitempty,email"`
	FirstName string     `json:"firstName,omitempty"`
	LastName  string     `json:"lastName,omitempty"`
	Role      string     `json:"role,omitempty"`
	BranchId  *uuid.UUID `json:"branchId,omitempty"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required,min=8"`
}

type UserResponse struct {
	ID        uuid.UUID  `json:"id"`
	Email     string     `json:"email"`
	FirstName string     `json:"firstName"`
	LastName  string     `json:"lastName"`
	FullName  string     `json:"fullName"`
	Role      string     `json:"role"`
	IsActive  bool       `json:"isActive"`
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

type UserListResponse struct {
	Users      []UserResponse `json:"users"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	Total      int            `json:"total"`
	TotalPages int            `json:"totalPages"`
}

type UserListFilter struct {
	OrganizationID *uuid.UUID `json:"organizationId,omitempty" form:"organizationId"`
	BranchID       *uuid.UUID `json:"branchId,omitempty" form:"branchId"`
	Role           string     `json:"role,omitempty" form:"role"`
	Page           int        `json:"page" form:"page" validate:"min=1"`
	Limit          int        `json:"limit" form:"limit" validate:"min=1,max=100"`
}

type UserListFilterQuery struct {
	OrganizationID string `json:"organizationId,omitempty" form:"organizationId"`
	BranchID       string `json:"branchId,omitempty" form:"branchId"`
	Role           string `json:"role,omitempty" form:"role"`
	Page           string `json:"page,omitempty" form:"page"`
	Limit          string `json:"limit,omitempty" form:"limit"`
}

type Member struct {
	MemberId       *uuid.UUID `json:"memberId,omitempty"`
	SubscriptionId *uuid.UUID `json:"subscriptionId,omitempty"`
	StartDate      *time.Time `json:"startDate,omitempty"`
	EndDate        *time.Time `json:"endDate,omitempty"`
	Status         *string    `json:"status,omitempty"`
}

type UserProfileResponse struct {
	UserResponse
	BranchID       *uuid.UUID `json:"branchId,omitempty"`
	OrganizationID *uuid.UUID `json:"organizationId,omitempty"`
	Member         *Member    `json:"member,omitempty"`
}

func (q *UserListFilterQuery) ToFilter() (*UserListFilter, error) {
	filter := &UserListFilter{}

	// Parse Organization ID
	if q.OrganizationID != "" {
		orgID, err := uuid.Parse(q.OrganizationID)
		if err != nil {
			return nil, fmt.Errorf("invalid organization ID: %v", err)
		}
		filter.OrganizationID = &orgID
	}

	// Parse Branch ID
	if q.BranchID != "" {
		branchID, err := uuid.Parse(q.BranchID)
		if err != nil {
			return nil, fmt.Errorf("invalid branch ID: %v", err)
		}
		filter.BranchID = &branchID
	}

	// Set Role
	filter.Role = q.Role

	// Parse Page
	if q.Page != "" {
		page, err := strconv.Atoi(q.Page)
		if err != nil {
			return nil, fmt.Errorf("invalid page number: %v", err)
		}
		if page < 1 {
			page = 1
		}
		filter.Page = page
	} else {
		filter.Page = 1
	}

	// Parse Limit
	if q.Limit != "" {
		limit, err := strconv.Atoi(q.Limit)
		if err != nil {
			return nil, fmt.Errorf("invalid limit number: %v", err)
		}
		if limit < 1 {
			limit = 10
		}
		if limit > 100 {
			limit = 100
		}
		filter.Limit = limit
	} else {
		filter.Limit = 10
	}

	return filter, nil
}

// DefaultFilter returns a filter with default values
func DefaultUserListFilter() *UserListFilter {
	return &UserListFilter{
		Page:  1,
		Limit: 10,
	}
}

func (u *UserProfile) ToProfileResponse() *UserProfileResponse {
	resp := &UserProfileResponse{
		UserResponse: UserResponse{
			ID:        u.ID,
			Email:     u.Email,
			FirstName: u.FirstName,
			LastName:  u.LastName,
			FullName:  u.FirstName + " " + u.LastName,
			Role:      u.Role,
			IsActive:  u.IsActive,
			CreatedAt: u.CreatedAt,
			UpdatedAt: u.UpdatedAt,
		},
		BranchID:       u.BranchID,
		OrganizationID: u.OrganizationID,
	}

	if u.MemberID != nil {
		resp.Member = &Member{
			MemberId:       u.MemberID,
			SubscriptionId: u.SubscriptionID,
			StartDate:      u.StartDate,
			EndDate:        u.EndDate,
			Status:         u.Status,
		}
	}

	return resp
}

func (u *User) ToResponse() *UserResponse {
	return &UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		FullName:  u.FirstName + " " + u.LastName,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func ToResponseList(users []*User) []UserResponse {
	responses := make([]UserResponse, len(users))
	for i, user := range users {
		responses[i] = *user.ToResponse()
	}
	return responses
}
