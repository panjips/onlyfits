package auth

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	CreateRefreshToken(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) (*RefreshToken, error)
	GetRefreshToken(ctx context.Context, token string) (*RefreshToken, error)
	GetRefreshTokenByID(ctx context.Context, id uuid.UUID) (*RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, token string) error
	RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error
	DeleteExpiredTokens(ctx context.Context) (int64, error)

	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error

	CreatePasswordResetToken(ctx context.Context, userID uuid.UUID, expiresAt time.Time) (*PasswordResetToken, error)
	GetPasswordResetToken(ctx context.Context, token string) (*PasswordResetToken, error)
	MarkPasswordResetTokenUsed(ctx context.Context, token string) error
	DeleteExpiredPasswordResetTokens(ctx context.Context) (int64, error)
}

type repositoryImpl struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repositoryImpl{db: db}
}

func (r *repositoryImpl) CreateRefreshToken(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) (*RefreshToken, error) {
	query := `
		INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, token, expires_at, created_at
	`

	id := uuid.New()
	createdAt := time.Now()

	row := r.db.QueryRow(ctx, query, id, userID, token, expiresAt, createdAt)

	var refreshToken RefreshToken
	err := row.Scan(
		&refreshToken.ID,
		&refreshToken.UserID,
		&refreshToken.Token,
		&refreshToken.ExpiresAt,
		&refreshToken.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &refreshToken, nil
}

func (r *repositoryImpl) GetRefreshToken(ctx context.Context, token string) (*RefreshToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, revoked_at, created_at
		FROM refresh_tokens
		WHERE token = $1
	`

	row := r.db.QueryRow(ctx, query, token)

	var refreshToken RefreshToken
	err := row.Scan(
		&refreshToken.ID,
		&refreshToken.UserID,
		&refreshToken.Token,
		&refreshToken.ExpiresAt,
		&refreshToken.RevokedAt,
		&refreshToken.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &refreshToken, nil
}

func (r *repositoryImpl) GetRefreshTokenByID(ctx context.Context, id uuid.UUID) (*RefreshToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, revoked_at, created_at
		FROM refresh_tokens
		WHERE id = $1
	`

	row := r.db.QueryRow(ctx, query, id)

	var refreshToken RefreshToken
	err := row.Scan(
		&refreshToken.ID,
		&refreshToken.UserID,
		&refreshToken.Token,
		&refreshToken.ExpiresAt,
		&refreshToken.RevokedAt,
		&refreshToken.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &refreshToken, nil
}

func (r *repositoryImpl) RevokeRefreshToken(ctx context.Context, token string) error {
	query := `
		UPDATE refresh_tokens
		SET revoked_at = $1
		WHERE token = $2 AND revoked_at IS NULL
	`

	_, err := r.db.Exec(ctx, query, time.Now(), token)
	return err
}

func (r *repositoryImpl) RevokeAllUserTokens(ctx context.Context, userID uuid.UUID) error {
	query := `
		UPDATE refresh_tokens
		SET revoked_at = $1
		WHERE user_id = $2 AND revoked_at IS NULL
	`

	_, err := r.db.Exec(ctx, query, time.Now(), userID)
	return err
}

func (r *repositoryImpl) DeleteExpiredTokens(ctx context.Context) (int64, error) {
	query := `
		DELETE FROM refresh_tokens
		WHERE expires_at < $1 OR revoked_at IS NOT NULL
	`

	result, err := r.db.Exec(ctx, query, time.Now())
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}

func (r *repositoryImpl) UpdateLastLogin(ctx context.Context, userID uuid.UUID) error {
	query := `
		UPDATE users
		SET last_login_at = $1
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, time.Now(), userID)
	return err
}

func (r *repositoryImpl) CreatePasswordResetToken(ctx context.Context, userID uuid.UUID, expiresAt time.Time) (*PasswordResetToken, error) {
	query := `
		INSERT INTO password_reset_tokens (user_id, expires_at)
		VALUES ($1, $2)
		RETURNING id, user_id, token, expires_at, created_at
	`

	row := r.db.QueryRow(ctx, query, userID, expiresAt)

	var resetToken PasswordResetToken
	err := row.Scan(
		&resetToken.ID,
		&resetToken.UserID,
		&resetToken.Token,
		&resetToken.ExpiresAt,
		&resetToken.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &resetToken, nil
}

func (r *repositoryImpl) GetPasswordResetToken(ctx context.Context, token string) (*PasswordResetToken, error) {
	query := `
		SELECT id, user_id, token, expires_at, used_at, created_at
		FROM password_reset_tokens
		WHERE token = $1
	`

	row := r.db.QueryRow(ctx, query, token)

	var resetToken PasswordResetToken
	err := row.Scan(
		&resetToken.ID,
		&resetToken.UserID,
		&resetToken.Token,
		&resetToken.ExpiresAt,
		&resetToken.UsedAt,
		&resetToken.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &resetToken, nil
}

func (r *repositoryImpl) MarkPasswordResetTokenUsed(ctx context.Context, token string) error {
	query := `
		UPDATE password_reset_tokens
		SET used_at = $1
		WHERE token = $2 AND used_at IS NULL
	`

	_, err := r.db.Exec(ctx, query, time.Now(), token)
	return err
}

func (r *repositoryImpl) DeleteExpiredPasswordResetTokens(ctx context.Context) (int64, error) {
	query := `
		DELETE FROM password_reset_tokens
		WHERE expires_at < $1 OR used_at IS NOT NULL
	`

	result, err := r.db.Exec(ctx, query, time.Now())
	if err != nil {
		return 0, err
	}

	return result.RowsAffected(), nil
}
