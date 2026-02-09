package user

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, user *User) error
	CreateWithBranch(ctx context.Context, user *User, branchId uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetUserByMemberID(ctx context.Context, id uuid.UUID) (*User, error)
	Update(ctx context.Context, user *User) error
	UpdatePassword(ctx context.Context, id uuid.UUID, hashedPassword string) error
	Delete(ctx context.Context, id uuid.UUID) error
	ExistsByEmail(ctx context.Context, email string) (bool, error)
	ProfileByRole(ctx context.Context, id uuid.UUID, role string) (*UserProfile, error)
	ListWithFilter(ctx context.Context, filter *UserListFilter) ([]*User, error)
	GetUserBranchIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
	GetMemberBranchID(ctx context.Context, userID uuid.UUID) (*uuid.UUID, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, user *User) error {
	query := `
		INSERT INTO users (email, encrypted_password, first_name, last_name, role)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.Role,
	)
	return err
}

func (r *repositoryImpl) CreateWithBranch(ctx context.Context, user *User, branchId uuid.UUID) error {
	query := `
		SELECT create_new_user_with_branch(
			$1, $2, $3, $4, $5, $6
		)
	`
	return r.db.QueryRow(ctx, query,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.Role,
		branchId,
	).Scan(&user.ID)
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	query := `
		SELECT id, email, encrypted_password, first_name, last_name, role, is_active, created_at, updated_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`
	row := r.db.QueryRow(ctx, query, id)

	var user User
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repositoryImpl) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, encrypted_password, first_name, last_name, role, is_active, created_at, updated_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`
	row := r.db.QueryRow(ctx, query, email)

	var user User
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repositoryImpl) GetUserByMemberID(ctx context.Context, id uuid.UUID) (*User, error) {
	query := `
		SELECT u.id, u.email, u.encrypted_password, u.first_name, u.last_name, u.role, u.is_active, u.created_at, u.updated_at
		FROM members m
		  INNER JOIN users u ON m.user_id = u.id
		WHERE m.id = $1 AND m.deleted_at IS NULL
	`
	row := r.db.QueryRow(ctx, query, id)

	var user User
	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.Role,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *repositoryImpl) Update(ctx context.Context, user *User) error {
	query := `
		UPDATE users
		SET email = $1, encrypted_password = $2, first_name = $3, last_name = $4, role = $5, is_active = $6, updated_at = NOW()
		WHERE id = $7 AND deleted_at IS NULL
	`
	_, err := r.db.Exec(ctx, query,
		user.Email,
		user.Password,
		user.FirstName,
		user.LastName,
		user.Role,
		user.IsActive,
		user.ID,
	)
	return err
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)`
	var exists bool
	err := r.db.QueryRow(ctx, query, email).Scan(&exists)
	return exists, err
}

func (r *repositoryImpl) UpdatePassword(ctx context.Context, id uuid.UUID, hashedPassword string) error {
	query := `
		UPDATE users
		SET encrypted_password = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
	`
	_, err := r.db.Exec(ctx, query, hashedPassword, id)
	return err
}

func (r *repositoryImpl) ProfileByRole(ctx context.Context, id uuid.UUID, role string) (*UserProfile, error) {
	query := `SELECT * FROM get_user_profile($1, $2)`

	var jsonData []byte
	err := r.db.QueryRow(ctx, query, id, role).Scan(&jsonData)
	if err != nil {
		return nil, fmt.Errorf("failed to query profile: %w", err)
	}

	log.Printf("Repository: ProfileByRole response: %s", string(jsonData))

	var user UserProfile
	if err := json.Unmarshal(jsonData, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal profile: %w", err)
	}

	return &user, nil
}

func (r *repositoryImpl) ListWithFilter(ctx context.Context, filter *UserListFilter) ([]*User, error) {
	log.Printf("Repository: ListWithFilter called with filter: %+v", filter)

	var args []interface{}
	argIndex := 1

	if filter.OrganizationID != nil {
		args = append(args, *filter.OrganizationID)
		log.Printf("Repository: Added OrganizationID to args: %v", *filter.OrganizationID)
		argIndex++
	}

	if filter.BranchID != nil {
		args = append(args, *filter.BranchID)
		log.Printf("Repository: Added BranchID to args: %v", *filter.BranchID)
		argIndex++
	} else {
		args = append(args, nil)
		log.Printf("Repository: BranchID: NULL")
	}

	if filter.Role != "" {
		args = append(args, filter.Role)
		log.Printf("Repository: Added Role to args: %s", filter.Role)
		argIndex++
	} else {
		args = append(args, nil)
		log.Printf("Repository: Role: NULL")
	}

	query := `SELECT * FROM list_users_with_filter($1, $2, $3, $4, $5)`

	page := filter.Page
	limit := filter.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	args = append(args, limit, offset)
	log.Printf("Repository: Final args count: %d, values: %v", len(args), args)

	log.Printf("Repository: Executing query with %d args", len(args))
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		log.Printf("Repository: Error querying users with filter: %v", err)
		return nil, err
	}
	defer rows.Close()

	var users []*User
	userCount := 0
	for rows.Next() {
		userCount++
		var user User
		if err := rows.Scan(
			&user.ID,
			&user.Email,
			&user.Password,
			&user.FirstName,
			&user.LastName,
			&user.Role,
			&user.IsActive,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			log.Printf("Repository: Error scanning user row %d: %v", userCount, err)
			return nil, err
		}
		users = append(users, &user)
	}

	log.Printf("Repository: Successfully retrieved %d users", len(users))
	return users, nil
}

func (r *repositoryImpl) GetUserBranchIDs(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	query := `
		SELECT branch_id
		FROM user_branches
		WHERE user_id = $1
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var branchIDs []uuid.UUID
	for rows.Next() {
		var branchID uuid.UUID
		if err := rows.Scan(&branchID); err != nil {
			return nil, err
		}
		branchIDs = append(branchIDs, branchID)
	}

	return branchIDs, nil
}

func (r *repositoryImpl) GetMemberBranchID(ctx context.Context, userID uuid.UUID) (*uuid.UUID, error) {
	query := `
		SELECT home_branch_id
		FROM members
		WHERE user_id = $1
	`

	validUserID := userID
	if validUserID == uuid.Nil {
		return nil, errors.New("invalid user id")
	}

	var branchID *uuid.UUID
	err := r.db.QueryRow(ctx, query, validUserID).Scan(&branchID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // Member not found or logic should determine this
		}
		return nil, err
	}

	return branchID, nil
}
