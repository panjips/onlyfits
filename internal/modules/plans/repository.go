package plans

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, plan *Plan) error
	Update(ctx context.Context, plan *Plan) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*Plan, error)
	List(ctx context.Context, limit, offset int) ([]*Plan, error)
	ListByOrganizationID(ctx context.Context, organizationID uuid.UUID, limit, offset int) ([]*Plan, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, plan *Plan) error {
	query := `
		INSERT INTO membership_plans (id, organization_id, branch_ids, name, description, price, duration_days, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		plan.ID,
		plan.OrganizationID,
		plan.BranchIDs,
		plan.Name,
		plan.Description,
		plan.Price,
		plan.DurationDays,
		plan.IsActive,
	).Scan(&plan.ID, &plan.CreatedAt, &plan.UpdatedAt)
}

func (r *repositoryImpl) Update(ctx context.Context, plan *Plan) error {
	query := `
		UPDATE membership_plans
		SET branch_ids = $1, name = $2, description = $3, price = $4, duration_days = $5, is_active = $6, updated_at = NOW()
		WHERE id = $7 AND deleted_at IS NULL
		RETURNING updated_at
	`
	return r.db.QueryRow(ctx, query,
		plan.BranchIDs,
		plan.Name,
		plan.Description,
		plan.Price,
		plan.DurationDays,
		plan.IsActive,
		plan.ID,
	).Scan(&plan.UpdatedAt)
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE membership_plans
		SET deleted_at = NOW(), is_active = FALSE
		WHERE id = $1 AND deleted_at IS NULL AND is_active IS TRUE
	`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*Plan, error) {
	query := `
		SELECT id, organization_id, branch_ids, name, description, price, duration_days, is_active, created_at, updated_at
		FROM membership_plans
		WHERE id = $1 AND deleted_at IS NULL
	`
	var plan Plan
	err := r.db.QueryRow(ctx, query, id).Scan(
		&plan.ID,
		&plan.OrganizationID,
		&plan.BranchIDs,
		&plan.Name,
		&plan.Description,
		&plan.Price,
		&plan.DurationDays,
		&plan.IsActive,
		&plan.CreatedAt,
		&plan.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *repositoryImpl) List(ctx context.Context, limit, offset int) ([]*Plan, error) {
	query := `
		SELECT id, organization_id, branch_ids, name, description, price, duration_days, is_active, created_at, updated_at
		FROM membership_plans
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []*Plan
	for rows.Next() {
		var plan Plan
		if err := rows.Scan(
			&plan.ID,
			&plan.OrganizationID,
			&plan.BranchIDs,
			&plan.Name,
			&plan.Description,
			&plan.Price,
			&plan.DurationDays,
			&plan.IsActive,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		); err != nil {
			return nil, err
		}
		plans = append(plans, &plan)
	}
	return plans, nil
}

func (r *repositoryImpl) ListByOrganizationID(ctx context.Context, organizationID uuid.UUID, limit, offset int) ([]*Plan, error) {
	query := `
		SELECT id, organization_id, branch_ids, name, description, price, duration_days, is_active, created_at, updated_at
		FROM membership_plans
		WHERE organization_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(ctx, query, organizationID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []*Plan
	for rows.Next() {
		var plan Plan
		if err := rows.Scan(
			&plan.ID,
			&plan.OrganizationID,
			&plan.BranchIDs,
			&plan.Name,
			&plan.Description,
			&plan.Price,
			&plan.DurationDays,
			&plan.IsActive,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		); err != nil {
			return nil, err
		}
		plans = append(plans, &plan)
	}
	return plans, nil
}
