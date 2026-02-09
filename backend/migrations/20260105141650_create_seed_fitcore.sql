-- +goose Up
-- +goose StatementBegin

-- ===================
-- 1. ORGANIZATION
-- ===================
INSERT INTO organization (name, slug)
VALUES ('FitCore Gym', 'fitcore')
ON CONFLICT (slug) DO NOTHING;

-- ===================
-- 2. MODULES
-- ===================
INSERT INTO modules (key, name) VALUES
    ('membership', 'Membership'),
    ('billing', 'Billing'),
    ('checkin', 'Check-in')
ON CONFLICT (key) DO NOTHING;

-- ===================
-- 3. ORGANIZATION MODULES
-- ===================
INSERT INTO organization_modules (organization_id, module_id, is_enabled)
SELECT
    (SELECT id FROM organization WHERE slug = 'fitcore'),
    m.id,
    TRUE
FROM modules m
ON CONFLICT (organization_id, module_id) DO NOTHING;

-- ===================
-- 4. USERS
-- ===================
INSERT INTO users (email, encrypted_password, first_name, last_name, role) VALUES
    ('super_admin@fitcore.com', '$2a$10$95UXPPCB97IDhZm79QN09u8UhOwhSUKWa.60Jt4ek2UsHdBUGVRZG', 'FitCore', 'Super Admin', 'super_admin'),
    ('admin@fitcore.com', '$2a$10$95UXPPCB97IDhZm79QN09u8UhOwhSUKWa.60Jt4ek2UsHdBUGVRZG', 'FitCore', 'Admin', 'admin'),
    ('staff1@fitcore.com', '$2a$10$95UXPPCB97IDhZm79QN09u8UhOwhSUKWa.60Jt4ek2UsHdBUGVRZG', 'Central', 'Staff', 'staff'),
    ('staff2@fitcore.com', '$2a$10$95UXPPCB97IDhZm79QN09u8UhOwhSUKWa.60Jt4ek2UsHdBUGVRZG', 'North', 'Staff', 'staff'),
    ('member1@mail.com', '$2a$10$95UXPPCB97IDhZm79QN09u8UhOwhSUKWa.60Jt4ek2UsHdBUGVRZG', 'John', 'Doe', 'member')
ON CONFLICT (email) DO NOTHING;

-- ===================
-- 5. BRANCHES
-- ===================
INSERT INTO branches (organization_id, name, code, address, timezone)
SELECT (SELECT id FROM organization WHERE slug = 'fitcore'), 'FitCore Central', 'CTR', 'Jl. Sudirman No. 1', 'Asia/Jakarta'
UNION ALL
SELECT (SELECT id FROM organization WHERE slug = 'fitcore'), 'FitCore North', 'NTH', 'Jl. Thamrin No. 10', 'Asia/Jakarta'
ON CONFLICT (organization_id, name) DO NOTHING;

-- ===================
-- 6. USER BRANCHES
-- ===================
INSERT INTO user_branches (user_id, branch_id) VALUES
    ((SELECT id FROM users WHERE email = 'staff1@fitcore.com'), (SELECT id FROM branches WHERE code = 'CTR')),
    ((SELECT id FROM users WHERE email = 'staff2@fitcore.com'), (SELECT id FROM branches WHERE code = 'NTH'))
ON CONFLICT (user_id, branch_id) DO NOTHING;

-- ===================
-- 7. MEMBERSHIP PLANS
-- ===================
INSERT INTO membership_plans (organization_id, name, price, duration_days) VALUES
    ((SELECT id FROM organization WHERE slug = 'fitcore'), 'Monthly Plan', 300000, 30),
    ((SELECT id FROM organization WHERE slug = 'fitcore'), 'Yearly Plan', 3000000, 365)
ON CONFLICT (organization_id, name) DO NOTHING;

-- ===================
-- 8. MEMBERS
-- ===================
INSERT INTO members (user_id, organization_id, home_branch_id, first_name, last_name, phone, status) VALUES
    (
        (SELECT id FROM users WHERE email = 'member1@mail.com'),
        (SELECT id FROM organization WHERE slug = 'fitcore'),
        (SELECT id FROM branches WHERE code = 'CTR'),
        'John', 'Doe', '08123456789', 'active'
    )
ON CONFLICT (user_id) DO NOTHING;

-- ===================
-- 9. SUBSCRIPTIONS
-- ===================
INSERT INTO subscriptions (member_id, plan_id, branch_id, start_date, end_date, status, auto_renew)
SELECT
    m.id,
    p.id,
    m.home_branch_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'active',
    TRUE
FROM members m
JOIN membership_plans p ON p.name = 'Monthly Plan'
WHERE m.phone = '08123456789';

-- ===================
-- 10. INVOICES
-- ===================
INSERT INTO invoices (invoice_number, member_id, branch_id, subscription_id, amount, status, due_date, paid_at)
SELECT
    'INV-2025-0001',
    s.member_id,
    s.branch_id,
    s.id,
    300000,
    'paid',
    CURRENT_DATE,
    NOW()
FROM subscriptions s
JOIN members m ON s.member_id = m.id
WHERE m.phone = '08123456789'
LIMIT 1;

-- ===================
-- 11. CHECK-INS
-- ===================
INSERT INTO check_ins (branch_id, member_id, subscription_id, method)
SELECT
    m.home_branch_id,
    m.id,
    s.id,
    'qr'
FROM members m
JOIN subscriptions s ON s.member_id = m.id
WHERE m.phone = '08123456789'
LIMIT 1;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- Delete in reverse order of dependencies
DELETE FROM check_ins WHERE member_id = (SELECT id FROM users WHERE email = 'member1@mail.com');
DELETE FROM invoices WHERE member_id = (SELECT id FROM users WHERE email = 'member1@mail.com');
DELETE FROM subscriptions WHERE member_id = (SELECT id FROM users WHERE email = 'member1@mail.com');
DELETE FROM members WHERE user_id = (SELECT id FROM users WHERE email = 'member1@mail.com');
DELETE FROM membership_plans WHERE organization_id = (SELECT id FROM organization WHERE slug = 'fitcore');
DELETE FROM user_branches WHERE user_id IN (SELECT id FROM users WHERE email IN ('staff1@fitcore.com', 'staff2@fitcore.com'));
DELETE FROM branches WHERE organization_id = (SELECT id FROM organization WHERE slug = 'fitcore');
DELETE FROM users WHERE email IN ('admin@fitcore.com', 'staff1@fitcore.com', 'staff2@fitcore.com', 'member1@mail.com', 'super_admin@fitcore.com');
DELETE FROM organization_modules WHERE organization_id = (SELECT id FROM organization WHERE slug = 'fitcore');
DELETE FROM modules WHERE key IN ('membership', 'billing', 'checkin');
DELETE FROM organization WHERE slug = 'fitcore';
-- +goose StatementEnd
