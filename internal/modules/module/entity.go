package module

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Module struct {
	ID          uuid.UUID `db:"id"`
	Key         string    `db:"key"`
	Name        string    `db:"name"`
	Description *string    `db:"description"`
	CreatedAt   *time.Time `db:"created_at"`
}

type OrganizationModule struct {
	OrganizationID uuid.UUID       `db:"organization_id"`
	ModuleID       uuid.UUID       `db:"module_id"`
	IsEnabled      bool            `db:"is_enabled"`
	Config         json.RawMessage `db:"config"`
	EnabledAt      time.Time       `db:"enabled_at"`
}

type ModuleResponse struct {
	ID          uuid.UUID `json:"id"`
	Key         string    `json:"key"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
}

func (m *Module) ToResponse() *ModuleResponse {
	return &ModuleResponse{
		ID:          m.ID,
		Key:         m.Key,
		Name:        m.Name,
		Description: m.Description,
	}
}
