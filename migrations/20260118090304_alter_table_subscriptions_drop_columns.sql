-- +goose Up
-- +goose StatementBegin
ALTER TABLE subscriptions DROP COLUMN auto_renew;
ALTER TABLE subscriptions DROP COLUMN cancelled_at;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE subscriptions ADD COLUMN auto_renew BOOLEAN DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN cancelled_at TIMESTAMPTZ;
-- +goose StatementEnd
