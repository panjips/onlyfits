package plans

import (
	"time"

	"github.com/google/uuid"
)

type Plan struct {
	ID             uuid.UUID  `db:"id"`
	OrganizationID uuid.UUID  `db:"organization_id"`
	BranchIDs      []string   `db:"branch_ids"`
	Name           string     `db:"name"`
	Description    *string    `db:"description"`
	Price          float64    `db:"price"`
	DurationDays   int        `db:"duration_days"`
	IsActive       *bool      `db:"is_active"`
	CreatedAt      time.Time  `db:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"`
	DeletedAt      *time.Time `db:"deleted_at"`
}

func (p *Plan) ToResponse() *PlanResponse {
	branchIDs := make([]uuid.UUID, 0, len(p.BranchIDs))
	for _, id := range p.BranchIDs {
		if uid, err := uuid.Parse(id); err == nil {
			branchIDs = append(branchIDs, uid)
		}
	}

	return &PlanResponse{
		ID:             p.ID,
		OrganizationID: p.OrganizationID,
		BranchIDs:      branchIDs,
		Name:           p.Name,
		Description:    p.Description,
		Price:          p.Price,
		DurationDays:   p.DurationDays,
		IsActive:       p.IsActive,
	}
}
