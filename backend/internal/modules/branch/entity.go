package branch

import (
	"time"

	"github.com/google/uuid"
)

type Branch struct {
	ID             uuid.UUID `db:"id"`
	OrganizationID uuid.UUID `db:"organization_id"`
	Name           string    `db:"name"`
	Code           *string   `db:"code"`
	Address        *string   `db:"address"`
	Phone          *string   `db:"phone"`
	Email          *string   `db:"email"`
	Timezone       *string   `db:"timezone"`
	IsActive       *bool     `db:"is_active"`
	CreatedAt      time.Time `db:"created_at"`
	UpdatedAt      time.Time `db:"updated_at"`
}

type UserBranch struct {
	UserID    uuid.UUID `db:"user_id"`
	BranchID  uuid.UUID `db:"branch_id"`
	AssignedAt time.Time `db:"assigned_at"`
}

func (b *Branch) ToResponse() *BranchResponse {
	return &BranchResponse{
		ID:             b.ID,
		OrganizationID: b.OrganizationID,
		Name:           b.Name,
		Code:           b.Code,
		Address:        b.Address,
		Phone:          b.Phone,
		Email:          b.Email,
		Timezone:       b.Timezone,
		IsActive:       b.IsActive,
		UpdatedAt:      &b.UpdatedAt,
	}
}
