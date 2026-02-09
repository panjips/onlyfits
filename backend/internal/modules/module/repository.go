package module

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, module *Module) error
	Update(ctx context.Context, module *Module) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*Module, error)
	GetByKey(ctx context.Context, key string) (*Module, error)
	List(ctx context.Context, limit, offset int) ([]*Module, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, module *Module) error {
	query := `
		INSERT INTO modules (key, name, description)
		VALUES ($1, $2, $3)
		RETURNING id
	`
	return r.db.QueryRow(ctx, query,
		module.Key,
		module.Name,
		module.Description,
	).Scan(&module.ID)
}

func (r *repositoryImpl) Update(ctx context.Context, module *Module) error {
	query := `
		UPDATE modules
		SET key = $1, name = $2, description = $3
		WHERE id = $4 AND deleted_at IS NULL
	`
	_, err := r.db.Exec(ctx, query,
		module.Key,
		module.Name,
		module.Description,
		module.ID,
	)
	return err
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	// Soft delete: set deleted_at instead of removing the row
	query := `UPDATE modules SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*Module, error) {
	query := `
		SELECT id, key, name, description, created_at
		FROM modules
		WHERE id = $1 AND deleted_at IS NULL
	`
	var module Module
	err := r.db.QueryRow(ctx, query, id).Scan(
		&module.ID,
		&module.Key,
		&module.Name,
		&module.Description,
		&module.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &module, nil
}

func (r *repositoryImpl) GetByKey(ctx context.Context, key string) (*Module, error) {
	query := `
		SELECT id, key, name, description, created_at
		FROM modules
		WHERE key = $1 AND deleted_at IS NULL
	`
	var module Module
	err := r.db.QueryRow(ctx, query, key).Scan(
		&module.ID,
		&module.Key,
		&module.Name,
		&module.Description,
		&module.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &module, nil
}

func (r *repositoryImpl) List(ctx context.Context, limit, offset int) ([]*Module, error) {
	query := `
		SELECT id, key, name, description
		FROM modules
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	fmt.Printf("Executing List query with limit=%d, offset=%d\n", limit, offset)
	
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		fmt.Printf("Error executing query: %v\n", err)
		return nil, err
	}
	defer rows.Close()
	
	var modules []*Module
	for rows.Next() {
		var module Module

		if err := rows.Scan(
			&module.ID,
			&module.Key,
			&module.Name,
			&module.Description,
		); err != nil {
			fmt.Printf("Error scanning module row: %v\n", err)
			return nil, err
		}

		modules = append(modules, &module)
	}
	
	if err := rows.Err(); err != nil {
		fmt.Printf("Error after iterating rows: %v\n", err)
		return nil, err
	}
	
	fmt.Printf("Successfully retrieved %d modules\n", len(modules))
	return modules, nil
}
