-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION create_new_member_with_user(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_encrypted_password TEXT,
    p_phone TEXT,
    p_date_of_birth DATE,
    p_branch_id UUID,
    p_status TEXT,
    p_join_date DATE,
    p_notes TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_member_id UUID;
    v_member_created_at TIMESTAMPTZ;
    v_member_updated_at TIMESTAMPTZ;
    v_organization_id UUID;
    v_result JSONB;
BEGIN
    -- Check if user already exists (including soft-deleted to avoid unique constraint violation)
    SELECT id INTO v_user_id 
    FROM users 
    WHERE email = p_email;
    
    -- If user doesn't exist, create new user
    IF v_user_id IS NULL THEN
        SELECT create_new_user_with_branch(
            p_email,
            p_encrypted_password,
            p_first_name,
            p_last_name,
            'member',
            p_branch_id
        ) INTO v_user_id;
    ELSE
        -- If user exists but is soft-deleted, restore and update
        IF EXISTS (SELECT 1 FROM users WHERE id = v_user_id AND deleted_at IS NOT NULL) THEN
            UPDATE users 
            SET deleted_at = NULL,
                encrypted_password = p_encrypted_password,
                first_name = p_first_name,
                last_name = p_last_name,
                updated_at = NOW()
            WHERE id = v_user_id;
        END IF;
    END IF;

    -- Get organization_id from branch
    SELECT organization_id INTO v_organization_id 
    FROM branches 
    WHERE id = p_branch_id;

    -- Create member and get returned values
    SELECT id, created_at, updated_at 
    INTO v_member_id, v_member_created_at, v_member_updated_at
    FROM create_new_member(
        v_user_id,
        v_organization_id,
        p_branch_id,
        p_first_name,
        p_last_name,
        p_phone,
        p_date_of_birth,
        p_status,
        p_join_date,
        p_notes
    );

    -- Build result JSON
    v_result := jsonb_build_object(
        'user_id', v_user_id,
        'member_id', v_member_id,
        'created_at', v_member_created_at,
        'updated_at', v_member_updated_at
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS create_new_member_with_user(TEXT, TEXT, TEXT, TEXT, TEXT, DATE, UUID, TEXT, DATE, TEXT);
-- +goose StatementEnd
