-- +goose Up
-- +goose StatementBegin

-- Add deleted_at column to all tables for soft delete functionality

-- 1. Organization
ALTER TABLE organization ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_organization_deleted_at ON organization(deleted_at);

-- 2. Modules
ALTER TABLE modules ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_modules_deleted_at ON modules(deleted_at);

-- 3. Organization Modules
ALTER TABLE organization_modules ADD COLUMN deleted_at TIMESTAMPTZ;

-- 4. Users
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- 5. Refresh Tokens
ALTER TABLE refresh_tokens ADD COLUMN deleted_at TIMESTAMPTZ;

-- 6. Branches
ALTER TABLE branches ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_branches_deleted_at ON branches(deleted_at);

-- 7. User Branches
ALTER TABLE user_branches ADD COLUMN deleted_at TIMESTAMPTZ;

-- 8. Membership Plans
ALTER TABLE membership_plans ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_membership_plans_deleted_at ON membership_plans(deleted_at);

-- 9. Members
ALTER TABLE members ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_members_deleted_at ON members(deleted_at);

-- 10. Subscriptions
ALTER TABLE subscriptions ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_subscriptions_deleted_at ON subscriptions(deleted_at);

-- 11. Invoices
ALTER TABLE invoices ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);

-- 12. Check-ins
ALTER TABLE check_ins ADD COLUMN deleted_at TIMESTAMPTZ;

-- 13. Password Reset Tokens
ALTER TABLE password_reset_tokens ADD COLUMN deleted_at TIMESTAMPTZ;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Remove deleted_at column from all tables

ALTER TABLE password_reset_tokens DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE check_ins DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE invoices DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE subscriptions DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE members DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE membership_plans DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE user_branches DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE branches DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE refresh_tokens DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE users DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE organization_modules DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE modules DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE organization DROP COLUMN IF EXISTS deleted_at;

-- +goose StatementEnd
