-- +goose Up
-- +goose StatementBegin
CREATE OR REPLACE FUNCTION get_member_attendance(
  start_date DATE,
  end_date DATE,
  p_member_id UUID
)
RETURNS TABLE(
  date DATE,
  is_attendance BOOLEAN,
  duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(
      start_date,
      end_date,
      INTERVAL '1 day'
    )::date AS check_date
  ),
  check_ins_data AS (
    SELECT
      dr.check_date,
      ci.*
    FROM date_range dr
    LEFT JOIN public.check_ins ci
      ON ci.member_id = p_member_id
      AND ci.check_in_time::date = dr.check_date
      AND ci.check_out_time IS NOT NULL
    ORDER BY dr.check_date
  )
  SELECT
    check_date,
    CASE WHEN check_in_time IS NOT NULL THEN true ELSE false END,
    COALESCE(EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 60, 0)
  FROM check_ins_data;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP FUNCTION IF EXISTS get_member_attendance;
-- +goose StatementEnd
