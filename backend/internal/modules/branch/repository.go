package branch

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, branch *Branch) error
	Update(ctx context.Context, branch *Branch) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*Branch, error)
	List(ctx context.Context, limit, offset int) ([]*Branch, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, branch *Branch) error {
	query := `
		INSERT INTO branches (organization_id, name, code, address, phone, email, timezone, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, updated_at
	`
	return r.db.QueryRow(ctx, query,
		branch.OrganizationID,
		branch.Name,
		branch.Code,
		branch.Address,
		branch.Phone,
		branch.Email,
		branch.Timezone,
		branch.IsActive,
	).Scan(&branch.ID, &branch.UpdatedAt)
}

func (r *repositoryImpl) Update(ctx context.Context, branch *Branch) error {
	query := `
		UPDATE branches
		SET name = $1, code = $2, address = $3, phone = $4, email = $5, timezone = $6, is_active = $7, updated_at = NOW()
		WHERE id = $8 AND deleted_at IS NULL
		RETURNING updated_at
	`
	return r.db.QueryRow(ctx, query,
		branch.Name,
		branch.Code,
		branch.Address,
		branch.Phone,
		branch.Email,
		branch.Timezone,
		branch.IsActive,
		branch.ID,
	).Scan(&branch.UpdatedAt)
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE branches SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*Branch, error) {
	query := `
		SELECT id, organization_id, name, code, address, phone, email, timezone, is_active, updated_at
		FROM branches
		WHERE id = $1 AND deleted_at IS NULL
	`
	var branch Branch
	err := r.db.QueryRow(ctx, query, id).Scan(
		&branch.ID,
		&branch.OrganizationID,
		&branch.Name,
		&branch.Code,
		&branch.Address,
		&branch.Phone,
		&branch.Email,
		&branch.Timezone,
		&branch.IsActive,
		&branch.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *repositoryImpl) List(ctx context.Context, limit, offset int) ([]*Branch, error) {
	query := `
		SELECT id, organization_id, name, code, address, phone, email, timezone, is_active, updated_at
		FROM branches
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var branches []*Branch
	for rows.Next() {
		var branch Branch
		if err := rows.Scan(
			&branch.ID,
			&branch.OrganizationID,
			&branch.Name,
			&branch.Code,
			&branch.Address,
			&branch.Phone,
			&branch.Email,
			&branch.Timezone,
			&branch.IsActive,
			&branch.UpdatedAt,
		); err != nil {
			return nil, err
		}
		branches = append(branches, &branch)
	}
	return branches, nil
}
