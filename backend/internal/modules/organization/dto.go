package organization

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type CreateOrganizationRequest struct {
	Name      string          `json:"name" validate:"required"`
	Slug      string          `json:"slug" validate:"required"`
	LogoURL   *string         `json:"logoUrl"`
	Config    json.RawMessage `json:"config"`
	ModuleIds []uuid.UUID     `json:"moduleIds"`
}

type UpdateOrganizationRequest struct {
	Name      string          `json:"name,omitempty"`
	Slug      string          `json:"slug,omitempty"`
	LogoURL   *string         `json:"logoUrl,omitempty"`
	Config    json.RawMessage `json:"config,omitempty"`
	ModuleIds []uuid.UUID     `json:"moduleIds,omitempty"`
}

// ModuleInfo represents module details returned in organization response
type ModuleInfo struct {
	ID   uuid.UUID `json:"id"`
	Key  string    `json:"key"`
	Name string    `json:"name"`
}

type OrganizationResponse struct {
	ID        uuid.UUID       `json:"id"`
	Name      string          `json:"name"`
	Slug      string          `json:"slug"`
	LogoURL   *string         `json:"logoUrl"`
	Config    json.RawMessage `json:"config"`
	Modules   []ModuleInfo    `json:"modules,omitempty"`
	UpdatedAt *time.Time      `json:"updatedAt,omitempty"`
}

type OrganizationListResponse struct {
	Data       []*OrganizationResponse `json:"data"`
	Page       int                     `json:"page"`
	Limit      int                     `json:"limit"`
	Total      int                     `json:"total"`
	TotalPages int                     `json:"totalPages"`
}

