package cache

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	Set(ctx context.Context, key string, value []byte, expiresAt time.Time) error
	Get(ctx context.Context, key string) ([]byte, error)
	Delete(ctx context.Context, key string) error
}

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) Set(ctx context.Context, key string, value []byte, expiresAt time.Time) error {
	query := `
		INSERT INTO unlogged_cache (key, value, expires_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (key) DO UPDATE
		SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
	`
	_, err := r.db.Exec(ctx, query, key, value, expiresAt)
	return err
}

func (r *repository) Get(ctx context.Context, key string) ([]byte, error) {
	query := `SELECT value FROM unlogged_cache WHERE key = $1 AND expires_at > NOW()`
	var value []byte
	err := r.db.QueryRow(ctx, query, key).Scan(&value)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil // Return nil if not found or expired
		}
		return nil, err
	}
	return value, nil
}

func (r *repository) Delete(ctx context.Context, key string) error {
	query := `DELETE FROM unlogged_cache WHERE key = $1`
	_, err := r.db.Exec(ctx, query, key)
	return err
}
