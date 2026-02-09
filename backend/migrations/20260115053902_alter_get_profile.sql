-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION get_user_profile(
    p_user_id UUID,
    p_role VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_strip_nulls(to_jsonb(profile)) INTO result
    FROM (
        SELECT 
            u.id,
            u.email,
            CASE WHEN p_role = 'super_admin' THEN u.encrypted_password ELSE NULL END AS encrypted_password,
            u.first_name,
            u.last_name,
            u.role,
            u.is_active,
            COALESCE(b.id, m.home_branch_id) AS branch_id,
            COALESCE(o.id, b.organization_id) AS organization_id,
            m.id AS member_id,
            s.id AS subscription_id,
            s.start_date::timestamptz AS start_date,
            s.end_date::timestamptz AS end_date,
            s.status
        FROM users u
        LEFT JOIN user_branches ub ON u.id = ub.user_id AND p_role = 'staff'
        LEFT JOIN branches b ON ub.branch_id = b.id AND p_role = 'staff'
        LEFT JOIN organization o ON o.user_id = u.id AND p_role IN ('admin', 'owner')
        LEFT JOIN members m ON u.id = m.user_id AND p_role = 'member'
        LEFT JOIN subscriptions s ON m.id = s.member_id AND p_role = 'member'
        WHERE u.is_active IS TRUE AND u.id = p_user_id
    ) profile;
    
    RETURN result;
END;
$$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS get_user_profile;
-- +goose StatementEnd
