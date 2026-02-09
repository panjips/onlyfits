-- +goose Up
-- +goose StatementBegin
DROP FUNCTION IF EXISTS create_new_user_with_branch(TEXT, TEXT, TEXT, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION create_new_user_with_branch(
    email TEXT,
    encrypted_password TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    branch_id UUID
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    INSERT INTO users (email, encrypted_password, first_name, last_name, role)
    VALUES ($1, $2, $3, $4, $5::user_role_enum)
	RETURNING id INTO user_id;

    -- Only link branch for staff/admin, not members
	IF $5 != 'member' THEN
		INSERT INTO user_branches (user_id, branch_id, assigned_at)
		VALUES (user_id, $6, NOW());
	END IF;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Reverting to the old signature (VOID return)
DROP FUNCTION IF EXISTS create_new_user_with_branch(TEXT, TEXT, TEXT, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION create_new_user_with_branch(
    email TEXT,
    encrypted_password TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    branch_id UUID
)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    INSERT INTO users (email, encrypted_password, first_name, last_name, role)
    VALUES ($1, $2, $3, $4, $5::user_role_enum)
	RETURNING id INTO user_id;

	INSERT INTO user_branches (user_id, branch_id, assigned_at)
	VALUES (user_id, $6, NOW());
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd
