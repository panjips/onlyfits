package plans

import (
	"github.com/google/uuid"
)

type CreatePlanRequest struct {
	OrganizationID uuid.UUID   `json:"organizationId" validate:"required"`
	BranchIDs      []uuid.UUID `json:"branchIds,omitempty"`
	Name           string      `json:"name" validate:"required"`
	Description    *string     `json:"description,omitempty"`
	Price          float64     `json:"price" validate:"required,gte=0"`
	DurationDays   int         `json:"durationDays" validate:"required,gt=0"`
}

type UpdatePlanRequest struct {
	BranchIDs    []uuid.UUID `json:"branchIds,omitempty"`
	Name         string      `json:"name,omitempty"`
	Description  *string     `json:"description,omitempty"`
	Price        *float64    `json:"price,omitempty"`
	DurationDays *int        `json:"durationDays,omitempty"`
	IsActive     *bool       `json:"isActive,omitempty"`
}

type PlanResponse struct {
	ID             uuid.UUID   `json:"id"`
	OrganizationID uuid.UUID   `json:"organizationId"`
	BranchIDs      []uuid.UUID `json:"branchIds,omitempty"`
	Name           string      `json:"name"`
	Description    *string     `json:"description,omitempty"`
	Price          float64     `json:"price"`
	DurationDays   int         `json:"durationDays"`
	IsActive       *bool       `json:"isActive,omitempty"`
}
