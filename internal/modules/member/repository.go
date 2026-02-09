package member

import (
	"context"
	"encoding/json"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Create(ctx context.Context, member *Member) error
	CreateWithUser(ctx context.Context, member *Member, email string, encryptedPassword string) error
	Update(ctx context.Context, member *Member) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*Member, error)
	GetByUserID(ctx context.Context, id uuid.UUID) (*Member, error)
	GetSessionActivity(ctx context.Context, id uuid.UUID) (*CheckIn, error)
	GetSessionActivities(ctx context.Context, branchIDanchID uuid.UUID) ([]*CheckInWithMember, error)
	UpsertSessionActivity(ctx context.Context, checkIn *CheckIn) error
	GetVisitorCount(ctx context.Context, branchID uuid.UUID) (int, error)
	List(ctx context.Context, limit, offset int) ([]*Member, error)
	ListByOrganizationID(ctx context.Context, organizationID uuid.UUID, limit, offset int) ([]*Member, error)
	ListWithFilter(ctx context.Context, filter *MemberListFilter) ([]*Member, error)
	GetAttendance(ctx context.Context, memberID uuid.UUID, startDate, endDate string) ([]*Attendance, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) Create(ctx context.Context, member *Member) error {
	query := `
		SELECT id, created_at, updated_at FROM create_new_member(
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`
	return r.db.QueryRow(ctx, query,
		member.UserID,
		member.OrganizationID,
		member.HomeBranchID,
		member.FirstName,
		member.LastName,
		member.Phone,
		member.DateOfBirth,
		member.Status,
		member.JoinDate,
		member.Notes,
	).Scan(&member.ID, &member.CreatedAt, &member.UpdatedAt)
}

func (r *repositoryImpl) CreateWithUser(ctx context.Context, member *Member, email string, encryptedPassword string) error {
	query := `
		SELECT create_new_member_with_user(
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10
		)
	`
	var resultStr string
	err := r.db.QueryRow(ctx, query,
		member.FirstName,
		member.LastName,
		email,
		encryptedPassword,
		member.Phone,
		member.DateOfBirth,
		member.HomeBranchID,
		member.Status,
		member.JoinDate,
		member.Notes,
	).Scan(&resultStr)

	if err != nil {
		return err
	}

	// Parse JSONB result
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(resultStr), &result); err != nil {
		return err
	}

	// Extract values from JSON result
	if memberID, ok := result["member_id"].(string); ok {
		if id, err := uuid.Parse(memberID); err == nil {
			member.ID = id
		}
	}
	if userID, ok := result["user_id"].(string); ok {
		if id, err := uuid.Parse(userID); err == nil {
			member.UserID = &id
		}
	}
	if createdAtStr, ok := result["created_at"].(string); ok {
		// Try different timestamp formats
		formats := []string{
			time.RFC3339,
			time.RFC3339Nano,
			"2006-01-02T15:04:05.999999Z07:00",
			"2006-01-02T15:04:05Z07:00",
			"2006-01-02 15:04:05.999999-07",
			"2006-01-02 15:04:05-07",
		}
		for _, format := range formats {
			if createdAt, err := time.Parse(format, createdAtStr); err == nil {
				member.CreatedAt = createdAt
				break
			}
		}
	}
	if updatedAtStr, ok := result["updated_at"].(string); ok {
		// Try different timestamp formats
		formats := []string{
			time.RFC3339,
			time.RFC3339Nano,
			"2006-01-02T15:04:05.999999Z07:00",
			"2006-01-02T15:04:05Z07:00",
			"2006-01-02 15:04:05.999999-07",
			"2006-01-02 15:04:05-07",
		}
		for _, format := range formats {
			if updatedAt, err := time.Parse(format, updatedAtStr); err == nil {
				member.UpdatedAt = updatedAt
				break
			}
		}
	}

	return nil
}

func (r *repositoryImpl) Update(ctx context.Context, member *Member) error {
	query := `
		UPDATE members
		SET user_id = $1, home_branch_id = $2, first_name = $3, last_name = $4, phone = $5, date_of_birth = $6, status = $7, join_date = $8, notes = $9, updated_at = NOW()
		WHERE id = $10 AND deleted_at IS NULL
		RETURNING updated_at
	`
	return r.db.QueryRow(ctx, query,
		member.UserID,
		member.HomeBranchID,
		member.FirstName,
		member.LastName,
		member.Phone,
		member.DateOfBirth,
		member.Status,
		member.JoinDate,
		member.Notes,
		member.ID,
	).Scan(&member.UpdatedAt)
}

func (r *repositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE members SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*Member, error) {
	query := `
		SELECT id, user_id, organization_id, home_branch_id, first_name, last_name, phone, date_of_birth, status, join_date, notes, created_at, updated_at
		FROM members
		WHERE id = $1 AND deleted_at IS NULL
	`
	var member Member
	err := r.db.QueryRow(ctx, query, id).Scan(
		&member.ID,
		&member.UserID,
		&member.OrganizationID,
		&member.HomeBranchID,
		&member.FirstName,
		&member.LastName,
		&member.Phone,
		&member.DateOfBirth,
		&member.Status,
		&member.JoinDate,
		&member.Notes,
		&member.CreatedAt,
		&member.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *repositoryImpl) GetByUserID(ctx context.Context, id uuid.UUID) (*Member, error) {
	query := `
		SELECT id, user_id, organization_id, home_branch_id, first_name, last_name, phone, date_of_birth, status, join_date, notes, created_at, updated_at
		FROM members
		WHERE user_id = $1 AND deleted_at IS NULL
	`
	var member Member
	err := r.db.QueryRow(ctx, query, id).Scan(
		&member.ID,
		&member.UserID,
		&member.OrganizationID,
		&member.HomeBranchID,
		&member.FirstName,
		&member.LastName,
		&member.Phone,
		&member.DateOfBirth,
		&member.Status,
		&member.JoinDate,
		&member.Notes,
		&member.CreatedAt,
		&member.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *repositoryImpl) GetAttendance(ctx context.Context, memberID uuid.UUID, startDate, endDate string) ([]*Attendance, error) {
	log.Printf("Repository: GetAttendance started for memberID: %s, startDate: %s, endDate: %s", memberID, startDate, endDate)

	query := `
		SELECT date::text, is_attendance, duration
		FROM get_member_attendance($1, $2, $3)
	`
	log.Printf("Repository: GetAttendance executing query with parameters - memberID: %s, startDate: %s, endDate: %s", memberID, startDate, endDate)

	rows, err := r.db.Query(ctx, query, startDate, endDate, memberID)
	if err != nil {
		log.Printf("Repository: GetAttendance failed - query error for memberID %s: %v", memberID, err)
		return nil, err
	}
	defer rows.Close()

	var attendance []*Attendance
	for rows.Next() {
		record := &Attendance{}
		err := rows.Scan(
			&record.Date,
			&record.IsAttendance,
			&record.Duration,
		)
		if err != nil {
			log.Printf("Repository: GetAttendance failed - scan error for memberID %s: %v", memberID, err)
			return nil, err
		}
		attendance = append(attendance, record)
	}

	if err = rows.Err(); err != nil {
		log.Printf("Repository: GetAttendance failed - rows error for memberID %s: %v", memberID, err)
		return nil, err
	}

	log.Printf("Repository: GetAttendance succeeded for memberID: %s - found %d records", memberID, len(attendance))
	return attendance, nil
}

func (r *repositoryImpl) GetSessionActivity(ctx context.Context, id uuid.UUID) (*CheckIn, error) {
	query := `
		SELECT id, member_id, branch_id, subscription_id, check_in_time, check_out_time
		FROM check_ins
		WHERE member_id = $1 AND deleted_at IS NULL
		ORDER BY check_in_time DESC
		LIMIT 1
	`
	var checkIn CheckIn
	err := r.db.QueryRow(ctx, query, id).Scan(
		&checkIn.ID,
		&checkIn.MemberID,
		&checkIn.BranchID,
		&checkIn.SubscriptionID,
		&checkIn.CheckInTime,
		&checkIn.CheckOutTime,
	)
	if err != nil {
		return nil, err
	}
	return &checkIn, nil
}

func (r *repositoryImpl) GetSessionActivities(ctx context.Context, branchID uuid.UUID) ([]*CheckInWithMember, error) {
	query := `
		SELECT
			c.id,
			c.member_id,
			c.branch_id,
			c.subscription_id,
			c.check_in_time,
			c.check_out_time,
			c.method,
			CONCAT(m.first_name, ' ', m.last_name) as member_name
		FROM check_ins c
		JOIN members m ON c.member_id = m.id
		WHERE c.branch_id = $1 AND c.deleted_at IS NULL
		ORDER BY c.check_in_time DESC
	`
	rows, err := r.db.Query(ctx, query, branchID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var checkIns []*CheckInWithMember
	for rows.Next() {
		var checkIn CheckInWithMember
		err := rows.Scan(
			&checkIn.ID,
			&checkIn.MemberID,
			&checkIn.BranchID,
			&checkIn.SubscriptionID,
			&checkIn.CheckInTime,
			&checkIn.CheckOutTime,
			&checkIn.Method,
			&checkIn.MemberName,
		)
		if err != nil {
			return nil, err
		}
		checkIns = append(checkIns, &checkIn)
	}
	return checkIns, nil
}

func (r *repositoryImpl) UpsertSessionActivity(ctx context.Context, checkIn *CheckIn) error {
	if checkIn.CheckOutTime != nil {
		query := `
			UPDATE check_ins
			SET check_out_time = $1
			WHERE id = $2 AND deleted_at IS NULL
		`
		_, err := r.db.Exec(ctx, query, checkIn.CheckOutTime, checkIn.ID)
		return err
	}

	query := `
		INSERT INTO check_ins (member_id, branch_id, subscription_id, check_in_time, method)
		VALUES ($1, $2, $3, NOW(), $4)
	`
	_, err := r.db.Exec(ctx, query,
		checkIn.MemberID,
		checkIn.BranchID,
		checkIn.SubscriptionID,
		checkIn.Method,
	)
	return err
}

func (r *repositoryImpl) GetVisitorCount(ctx context.Context, branchID uuid.UUID) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM check_ins
		WHERE branch_id = $1
			AND check_in_time IS NOT NULL
			AND check_out_time IS NULL
			AND deleted_at IS NULL
	`
	var count int
	err := r.db.QueryRow(ctx, query, branchID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repositoryImpl) List(ctx context.Context, limit, offset int) ([]*Member, error) {
	query := `
		SELECT id, user_id, organization_id, home_branch_id, first_name, last_name, phone, date_of_birth, status, join_date, notes, created_at, updated_at
		FROM members
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*Member
	for rows.Next() {
		var member Member
		if err := rows.Scan(
			&member.ID,
			&member.UserID,
			&member.OrganizationID,
			&member.HomeBranchID,
			&member.FirstName,
			&member.LastName,
			&member.Phone,
			&member.DateOfBirth,
			&member.Status,
			&member.JoinDate,
			&member.Notes,
			&member.CreatedAt,
			&member.UpdatedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, &member)
	}
	return members, nil
}

func (r *repositoryImpl) ListByOrganizationID(ctx context.Context, organizationID uuid.UUID, limit, offset int) ([]*Member, error) {
	query := `
		SELECT id, user_id, organization_id, home_branch_id, first_name, last_name, phone, date_of_birth, status, join_date, notes, created_at, updated_at
		FROM members
		WHERE organization_id = $1 AND deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(ctx, query, organizationID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*Member
	for rows.Next() {
		var member Member
		if err := rows.Scan(
			&member.ID,
			&member.UserID,
			&member.OrganizationID,
			&member.HomeBranchID,
			&member.FirstName,
			&member.LastName,
			&member.Phone,
			&member.DateOfBirth,
			&member.Status,
			&member.JoinDate,
			&member.Notes,
			&member.CreatedAt,
			&member.UpdatedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, &member)
	}
	return members, nil
}

func (r *repositoryImpl) ListWithFilter(ctx context.Context, filter *MemberListFilter) ([]*Member, error) {
	baseQuery := `
		SELECT id, user_id, organization_id, home_branch_id, first_name, last_name, phone, date_of_birth, status, join_date, notes, created_at, updated_at
		FROM members
		WHERE deleted_at IS NULL
	`

	var conditions []string
	var args []interface{}
	argIndex := 1

	if filter.OrganizationID != nil {
		conditions = append(conditions, "organization_id = $"+strconv.Itoa(argIndex))
		args = append(args, *filter.OrganizationID)
		argIndex++
	}

	if filter.BranchID != nil {
		conditions = append(conditions, "home_branch_id = $"+strconv.Itoa(argIndex))
		args = append(args, *filter.BranchID)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, "status = $"+strconv.Itoa(argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}

	query := baseQuery
	for _, cond := range conditions {
		query += " AND " + cond
	}

	query += " ORDER BY created_at DESC"

	// Pagination
	page := filter.Page
	limit := filter.Limit
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	query += " LIMIT $" + strconv.Itoa(argIndex) + " OFFSET $" + strconv.Itoa(argIndex+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*Member
	for rows.Next() {
		var member Member
		if err := rows.Scan(
			&member.ID,
			&member.UserID,
			&member.OrganizationID,
			&member.HomeBranchID,
			&member.FirstName,
			&member.LastName,
			&member.Phone,
			&member.DateOfBirth,
			&member.Status,
			&member.JoinDate,
			&member.Notes,
			&member.CreatedAt,
			&member.UpdatedAt,
		); err != nil {
			return nil, err
		}
		members = append(members, &member)
	}
	return members, nil
}
