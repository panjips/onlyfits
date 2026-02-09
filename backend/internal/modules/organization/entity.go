package organization

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Organization struct {
	ID        uuid.UUID       `db:"id"`
	Name      string          `db:"name"`
	Slug      string          `db:"slug"`
	LogoURL   *string         `db:"logo_url"`
	Config    json.RawMessage `db:"config"`
	Modules   []ModuleInfo    `db:"-"` // Not a DB column, populated separately
	CreatedAt time.Time       `db:"created_at"`
	UpdatedAt time.Time       `db:"updated_at"`
}

type OrganizationModule struct {
	OrganizationId uuid.UUID        `db:"organization_id"`
	ModuleId       uuid.UUID        `db:"module_id"`
	IsEnabled      *bool            `db:"is_enabled"`
	Config         *json.RawMessage `db:"config"`
	EnabledAt      *time.Time       `db:"enabled_at"`
}

func (o *Organization) ToResponse() *OrganizationResponse {
	return &OrganizationResponse{
		ID:        o.ID,
		Name:      o.Name,
		Slug:      o.Slug,
		LogoURL:   o.LogoURL,
		Config:    o.Config,
		Modules:   o.Modules,
		UpdatedAt: &o.UpdatedAt,
	}
}

