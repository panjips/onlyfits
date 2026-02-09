package member

import (
	"time"

	"github.com/google/uuid"
)

type MemberStatus string

const (
	MemberStatusLead    MemberStatus = "lead"
	MemberStatusActive  MemberStatus = "active"
	MemberStatusExpired MemberStatus = "expired"
	MemberStatusFrozen  MemberStatus = "frozen"
)

type Member struct {
	ID             uuid.UUID    `db:"id"`
	UserID         *uuid.UUID   `db:"user_id"`
	OrganizationID uuid.UUID    `db:"organization_id"`
	HomeBranchID   *uuid.UUID   `db:"home_branch_id"`
	FirstName      string       `db:"first_name"`
	LastName       string       `db:"last_name"`
	Phone          *string      `db:"phone"`
	DateOfBirth    *time.Time   `db:"date_of_birth"`
	Status         MemberStatus `db:"status"`
	JoinDate       *time.Time   `db:"join_date"`
	Notes          *string      `db:"notes"`
	CreatedAt      time.Time    `db:"created_at"`
	UpdatedAt      time.Time    `db:"updated_at"`
	DeletedAt      *time.Time   `db:"deleted_at"`
}

func (m *Member) ToResponse() *MemberResponse {
	var dateOfBirth *string
	if m.DateOfBirth != nil {
		formatted := m.DateOfBirth.Format("2006-01-02")
		dateOfBirth = &formatted
	}

	var joinDate *string
	if m.JoinDate != nil {
		formatted := m.JoinDate.Format("2006-01-02")
		joinDate = &formatted
	}

	return &MemberResponse{
		ID:             m.ID,
		UserID:         m.UserID,
		OrganizationID: m.OrganizationID,
		HomeBranchID:   m.HomeBranchID,
		FirstName:      m.FirstName,
		LastName:       m.LastName,
		Phone:          m.Phone,
		DateOfBirth:    dateOfBirth,
		Status:         string(m.Status),
		JoinDate:       joinDate,
		Notes:          m.Notes,
	}
}

type CheckIn struct {
	ID             uuid.UUID  `db:"id"`
	BranchID       uuid.UUID  `db:"branch_id"`
	MemberID       uuid.UUID  `db:"member_id"`
	SubscriptionID uuid.UUID  `db:"subscription_id"`
	CheckInTime    time.Time  `db:"check_in_time"`
	CheckOutTime   *time.Time `db:"check_out_time"`
	Method         string     `db:"method"`
}

type CheckInWithMember struct {
	ID             uuid.UUID  `db:"id"`
	BranchID       uuid.UUID  `db:"branch_id"`
	MemberID       uuid.UUID  `db:"member_id"`
	SubscriptionID uuid.UUID  `db:"subscription_id"`
	CheckInTime    time.Time  `db:"check_in_time"`
	CheckOutTime   *time.Time `db:"check_out_time"`
	Method         string     `db:"method"`
	MemberName     string     `db:"member_name"`
}

func (c *CheckInWithMember) ToResponse() *CheckInWithMemberResponse {
	return &CheckInWithMemberResponse{
		ID:             c.ID,
		BranchID:       c.BranchID,
		MemberID:       c.MemberID,
		SubscriptionID: c.SubscriptionID,
		CheckInTime:    c.CheckInTime,
		CheckOutTime:   c.CheckOutTime,
		Method:         c.Method,
		MemberName:     c.MemberName,
	}
}

type Attendance struct {
	Date         string  `db:"date" json:"date"`
	IsAttendance bool    `db:"is_attendance" json:"isAttendance"`
	Duration     float32 `db:"duration" json:"duration"`
}