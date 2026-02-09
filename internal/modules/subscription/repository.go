package subscription

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, sub *Subscription) error
	Update(ctx context.Context, sub *Subscription) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*Subscription, error)
	GetActiveByMemberID(ctx context.Context, memberID uuid.UUID) (*Subscription, error)
	List(ctx context.Context, filter *SubscriptionListFilter) ([]*Subscription, error)
	Count(ctx context.Context, filter *SubscriptionListFilter) (int, error)
	ExpireOldSubscriptions(ctx context.Context) (int64, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, sub *Subscription) error {
	log.Printf("Creating subscription for member ID: %s", sub.MemberID)

	query := `
		INSERT INTO subscriptions (member_id, plan_id, branch_id, start_date, end_date, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at
	`
	err := r.db.QueryRow(ctx, query,
		sub.MemberID,
		sub.PlanID,
		sub.BranchID,
		sub.StartDate,
		sub.EndDate,
		sub.Status,
	).Scan(&sub.ID, &sub.CreatedAt, &sub.UpdatedAt)

	if err != nil {
		log.Printf("Failed to create subscription for member ID %s: %v", sub.MemberID, err)
		return err
	}

	log.Printf("Subscription created successfully with ID: %s for member ID: %s", sub.ID, sub.MemberID)
	return nil
}

func (r *repositoryImpl) Update(ctx context.Context, sub *Subscription) error {
	query := `
		UPDATE subscriptions
		SET plan_id = $1, branch_id = $2, start_date = $3, end_date = $4, status = $5, updated_at = NOW()
		WHERE id = $6
		RETURNING updated_at
	`
	return r.db.QueryRow(ctx, query,
		sub.PlanID,
		sub.BranchID,
		sub.StartDate,
		sub.EndDate,
		sub.Status,
		sub.ID,
	).Scan(&sub.UpdatedAt)
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM subscriptions WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*Subscription, error) {
	query := `
		SELECT id, member_id, plan_id, branch_id, start_date, end_date, status, created_at, updated_at
		FROM subscriptions
		WHERE id = $1
	`
	var sub Subscription
	err := r.db.QueryRow(ctx, query, id).Scan(
		&sub.ID,
		&sub.MemberID,
		&sub.PlanID,
		&sub.BranchID,
		&sub.StartDate,
		&sub.EndDate,
		&sub.Status,
		&sub.CreatedAt,
		&sub.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *repositoryImpl) GetActiveByMemberID(ctx context.Context, memberID uuid.UUID) (*Subscription, error) {
	query := `
		SELECT id, member_id, plan_id, branch_id, start_date, end_date, status, created_at, updated_at
		FROM subscriptions
		WHERE member_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE
		ORDER BY end_date DESC
		LIMIT 1
	`
	var sub Subscription
	err := r.db.QueryRow(ctx, query, memberID).Scan(
		&sub.ID,
		&sub.MemberID,
		&sub.PlanID,
		&sub.BranchID,
		&sub.StartDate,
		&sub.EndDate,
		&sub.Status,
		&sub.CreatedAt,
		&sub.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *repositoryImpl) List(ctx context.Context, filter *SubscriptionListFilter) ([]*Subscription, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	// Build WHERE conditions based on filter
	if filter.OrganizationID != nil {
		conditions = append(conditions, fmt.Sprintf("m.organization_id = $%d", argIndex))
		args = append(args, *filter.OrganizationID)
		argIndex++
	}

	if filter.BranchID != nil {
		conditions = append(conditions, fmt.Sprintf("s.branch_id = $%d", argIndex))
		args = append(args, *filter.BranchID)
		argIndex++
	}

	if filter.MemberID != nil {
		conditions = append(conditions, fmt.Sprintf("s.member_id = $%d", argIndex))
		args = append(args, *filter.MemberID)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("s.status = $%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Calculate pagination
	limit := filter.Limit
	if limit < 1 {
		limit = 10
	}
	page := filter.Page
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	query := fmt.Sprintf(`
		SELECT s.id, s.member_id, s.plan_id, s.branch_id, s.start_date, s.end_date, s.status, s.created_at, s.updated_at
		FROM subscriptions s
		LEFT JOIN members m ON s.member_id = m.id
		%s
		ORDER BY s.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subscriptions []*Subscription
	for rows.Next() {
		var sub Subscription
		if err := rows.Scan(
			&sub.ID,
			&sub.MemberID,
			&sub.PlanID,
			&sub.BranchID,
			&sub.StartDate,
			&sub.EndDate,
			&sub.Status,
			&sub.CreatedAt,
			&sub.UpdatedAt,
		); err != nil {
			return nil, err
		}
		subscriptions = append(subscriptions, &sub)
	}
	return subscriptions, nil
}

func (r *repositoryImpl) Count(ctx context.Context, filter *SubscriptionListFilter) (int, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if filter.OrganizationID != nil {
		conditions = append(conditions, fmt.Sprintf("m.organization_id = $%d", argIndex))
		args = append(args, *filter.OrganizationID)
		argIndex++
	}

	if filter.BranchID != nil {
		conditions = append(conditions, fmt.Sprintf("s.branch_id = $%d", argIndex))
		args = append(args, *filter.BranchID)
		argIndex++
	}

	if filter.MemberID != nil {
		conditions = append(conditions, fmt.Sprintf("s.member_id = $%d", argIndex))
		args = append(args, *filter.MemberID)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("s.status = $%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM subscriptions s
		LEFT JOIN members m ON s.member_id = m.id
		%s
	`, whereClause)

	var count int
	err := r.db.QueryRow(ctx, query, args...).Scan(&count)
	return count, err
}

func (r *repositoryImpl) ExpireOldSubscriptions(ctx context.Context) (int64, error) {
	query := `
		UPDATE subscriptions
		SET status = 'expired', updated_at = NOW()
		WHERE status = 'active'
		  AND end_date < CURRENT_DATE
	`
	result, err := r.db.Exec(ctx, query)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected(), nil
}
