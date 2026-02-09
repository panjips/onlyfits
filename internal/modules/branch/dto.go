package branch

import (
	"time"

	"github.com/google/uuid"
)

type CreateBranchRequest struct {
	OrganizationID uuid.UUID `json:"organizationId" validate:"required"`
	Name           string    `json:"name" validate:"required"`
	Code           *string   `json:"code,omitempty"`
	Address        *string   `json:"address,omitempty"`
	Phone          *string   `json:"phone,omitempty"`
	Email          *string   `json:"email,omitempty"`
	Timezone       *string   `json:"timezone,omitempty"`
}

type UpdateBranchRequest struct {
	Name     string  `json:"name,omitempty"`
	Code     *string `json:"code,omitempty"`
	Address  *string `json:"address,omitempty"`
	Phone    *string `json:"phone,omitempty"`
	Email    *string `json:"email,omitempty"`
	Timezone *string `json:"timezone,omitempty"`
	IsActive *bool   `json:"isActive,omitempty"`
}

type BranchResponse struct {
	ID             uuid.UUID  `json:"id"`
	OrganizationID uuid.UUID  `json:"organizationId"`
	Name           string     `json:"name"`
	Code           *string    `json:"code,omitempty"`
	Address        *string    `json:"address,omitempty"`
	Phone          *string    `json:"phone,omitempty"`
	Email          *string    `json:"email,omitempty"`
	Timezone       *string    `json:"timezone,omitempty"`
	IsActive       *bool      `json:"isActive,omitempty"`
	UpdatedAt      *time.Time `json:"updatedAt,omitempty"`
}
