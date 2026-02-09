-- +goose Up
-- +goose StatementBegin
-- 1. Create the type
CREATE TYPE payment_method_enum AS ENUM ('cash', 'credit_card', 'bank_transfer', 'e_wallet', 'qris');

-- 2. Add to table
ALTER TABLE invoices ADD COLUMN payment_method payment_method_enum;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE invoices DROP COLUMN payment_method;
-- +goose StatementEnd
