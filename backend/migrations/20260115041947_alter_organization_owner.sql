-- +goose Up
-- +goose StatementBegin
ALTER TABLE organization ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX idx_organization_user_id ON organization(user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_organization_user_id;
ALTER TABLE organization DROP COLUMN IF EXISTS user_id;
-- +goose StatementEnd
