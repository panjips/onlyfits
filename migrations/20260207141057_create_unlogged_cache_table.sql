-- +goose Up
-- +goose StatementBegin
CREATE UNLOGGED TABLE IF NOT EXISTS unlogged_cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_unlogged_cache_expires_at ON unlogged_cache(expires_at);

-- Schedule pg_cron job to delete expired entries every 1 hour
SELECT cron.schedule('cleanup_expired_cache', '0 * * * *', $$DELETE FROM unlogged_cache WHERE expires_at < NOW()$$);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT cron.unschedule('cleanup_expired_cache');
DROP TABLE IF EXISTS unlogged_cache;
-- +goose StatementEnd
