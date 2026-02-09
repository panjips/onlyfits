-- +goose Up
-- +goose StatementBegin
ALTER TABLE invoices ADD COLUMN external_id UUID;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE invoices DROP COLUMN external_id;
-- +goose StatementEnd
