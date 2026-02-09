-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION create_new_member(
    p_user_id UUID,
    p_organization_id UUID,
    p_home_branch_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT,
    p_date_of_birth DATE,
    p_status TEXT,
    p_join_date DATE,
    p_notes TEXT
)
RETURNS TABLE (id UUID, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO members (
        user_id, 
        organization_id, 
        home_branch_id, 
        first_name, 
        last_name, 
        phone, 
        date_of_birth, 
        status, 
        join_date, 
        notes
    )
    VALUES (
        p_user_id, 
        p_organization_id, 
        p_home_branch_id, 
        p_first_name, 
        p_last_name, 
        p_phone, 
        p_date_of_birth, 
        COALESCE(p_status, 'lead')::member_status_enum, 
        COALESCE(p_join_date, CURRENT_DATE), 
        p_notes
    )
    RETURNING members.id, members.created_at, members.updated_at;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS create_new_member(UUID, UUID, UUID, TEXT, TEXT, TEXT, DATE, TEXT, DATE, TEXT);
-- +goose StatementEnd
