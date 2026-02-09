package organization

import (
	"context"

	"fitcore/internal/modules/branch"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, org *Organization) error
	UpsertOrganizationModules(ctx context.Context, organizationID uuid.UUID, moduleIDs []uuid.UUID) error
	GetModulesByOrganizationID(ctx context.Context, organizationID uuid.UUID) ([]ModuleInfo, error)
	Update(ctx context.Context, org *Organization) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*Organization, error)
	GetBySlug(ctx context.Context, slug string) (*Organization, error)
	List(ctx context.Context, limit, offset int) ([]*Organization, error)
	ListBranchesByOrganizationID(ctx context.Context, organizationID uuid.UUID, limit, offset int) ([]*branch.Branch, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, org *Organization) error {
	query := `
		INSERT INTO organization (name, slug, logo_url, config)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	return r.db.QueryRow(ctx, query,
		org.Name,
		org.Slug,
		org.LogoURL,
		org.Config,
	).Scan(&org.ID, &org.CreatedAt, &org.UpdatedAt)
}

func (r *repositoryImpl) UpsertOrganizationModules(ctx context.Context, organizationID uuid.UUID, moduleIDs []uuid.UUID) error {
	// First, delete all existing modules for this organization
	deleteQuery := `DELETE FROM organization_modules WHERE organization_id = $1`
	_, err := r.db.Exec(ctx, deleteQuery, organizationID)
	if err != nil {
		return err
	}

	// If no modules to add, we're done
	if len(moduleIDs) == 0 {
		return nil
	}

	// Insert new modules
	insertQuery := `
		INSERT INTO organization_modules (organization_id, module_id, is_enabled)
		VALUES ($1, $2, TRUE)
	`

	batch := &pgx.Batch{}
	for _, moduleID := range moduleIDs {
		batch.Queue(insertQuery, organizationID, moduleID)
	}

	br := r.db.SendBatch(ctx, batch)
	defer br.Close()

	for range moduleIDs {
		if _, err := br.Exec(); err != nil {
			return err
		}
	}

	return nil
}

func (r *repositoryImpl) GetModulesByOrganizationID(ctx context.Context, organizationID uuid.UUID) ([]ModuleInfo, error) {
	query := `
		SELECT m.id, m.key, m.name
		FROM modules m
		INNER JOIN organization_modules om ON m.id = om.module_id
		WHERE om.organization_id = $1 AND om.is_enabled = TRUE AND m.deleted_at IS NULL
		ORDER BY m.name
	`

	rows, err := r.db.Query(ctx, query, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []ModuleInfo
	for rows.Next() {
		var module ModuleInfo
		if err := rows.Scan(&module.ID, &module.Key, &module.Name); err != nil {
			return nil, err
		}
		modules = append(modules, module)
	}

	return modules, nil
}
func (r *repositoryImpl) Update(ctx context.Context, org *Organization) error {
	query := `
		UPDATE organization
		SET name = $1, slug = $2, logo_url = $3, config = $4, updated_at = NOW()
		WHERE id = $5 AND deleted_at IS NULL
		RETURNING updated_at
	`
	return r.db.QueryRow(ctx, query,
		org.Name,
		org.Slug,
		org.LogoURL,
		org.Config,
		org.ID,
	).Scan(&org.UpdatedAt)
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE organization SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*Organization, error) {
	query := `
		SELECT id, name, slug, logo_url, config, created_at, updated_at
		FROM organization
		WHERE id = $1 AND deleted_at IS NULL
	`
	var org Organization
	err := r.db.QueryRow(ctx, query, id).Scan(
		&org.ID,
		&org.Name,
		&org.Slug,
		&org.LogoURL,
		&org.Config,
		&org.CreatedAt,
		&org.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &org, nil
}

func (r *repositoryImpl) GetBySlug(ctx context.Context, slug string) (*Organization, error) {
	query := `
		SELECT id, name, slug, logo_url, config, created_at, updated_at
		FROM organization
		WHERE slug = $1 AND deleted_at IS NULL
	`
	var org Organization
	err := r.db.QueryRow(ctx, query, slug).Scan(
		&org.ID,
		&org.Name,
		&org.Slug,
		&org.LogoURL,
		&org.Config,
		&org.CreatedAt,
		&org.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &org, nil
}

func (r *repositoryImpl) List(ctx context.Context, limit, offset int) ([]*Organization, error) {
	query := `
		SELECT id, name, slug, logo_url, config, created_at, updated_at
		FROM organization
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orgs []*Organization
	for rows.Next() {
		var org Organization
		if err := rows.Scan(
			&org.ID,
			&org.Name,
			&org.Slug,
			&org.LogoURL,
			&org.Config,
			&org.CreatedAt,
			&org.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orgs = append(orgs, &org)
	}

	return orgs, nil
}

func (r *repositoryImpl) ListBranchesByOrganizationID(ctx context.Context, organizationID uuid.UUID, limit, offset int) ([]*branch.Branch, error) {
	query := `
		SELECT id, organization_id, name, code, address, phone, email, timezone, is_active, updated_at
		FROM branches
		WHERE organization_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(ctx, query, organizationID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var branches []*branch.Branch
	for rows.Next() {
		var b branch.Branch
		if err := rows.Scan(
			&b.ID,
			&b.OrganizationID,
			&b.Name,
			&b.Code,
			&b.Address,
			&b.Phone,
			&b.Email,
			&b.Timezone,
			&b.IsActive,
			&b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		branches = append(branches, &b)
	}
	return branches, nil
}
