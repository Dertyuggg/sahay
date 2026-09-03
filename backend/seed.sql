-- ==========================================================
-- SAHAY-24 Seed Data
-- Mock Users, Balances, and Saved Contacts
-- ==========================================================

-- Clean existing mock seed data if re-running
DELETE FROM public.users WHERE id IN (
    'e1111111-1111-1111-1111-111111111111'::uuid,
    'e2222222-2222-2222-2222-222222222222'::uuid
);

-- 1. Insert Mock Users
INSERT INTO public.users (id, name, email, phone) VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    'Ramesh Kumar',
    'ramesh.kumar@example.in',
    '+91 98765 43210'
),
(
    'e2222222-2222-2222-2222-222222222222',
    'Arthur Pendelton',
    'arthur.pendelton@example.in',
    '+91 98123 45678'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Starting Balances
INSERT INTO public.mock_balances (user_id, account_number, balance, currency) VALUES
(
    'e1111111-1111-1111-1111-111111111111',
    'SB-98765432101',
    15450.00,
    'INR'
),
(
    'e2222222-2222-2222-2222-222222222222',
    'SB-12345678902',
    1250.00,
    'INR'
)
ON CONFLICT (user_id) DO UPDATE 
SET balance = EXCLUDED.balance, updated_at = now();

-- 3. Insert Saved Contacts
INSERT INTO public.saved_contacts (user_id, contact_name, phone, account_number, upi_id) VALUES
-- Contacts for Ramesh Kumar
(
    'e1111111-1111-1111-1111-111111111111',
    'Sita Devi',
    '+91 98765 11111',
    '40992381283',
    'sita@okhdfcbank'
),
(
    'e1111111-1111-1111-1111-111111111111',
    'Suresh Patel',
    '+91 98765 22222',
    '50123491823',
    'suresh@okaxis'
),
(
    'e1111111-1111-1111-1111-111111111111',
    'Kiran Sharma',
    '+91 98765 33333',
    '10293847561',
    'kiran@sbi'
),
-- Contacts for Arthur Pendelton
(
    'e2222222-2222-2222-2222-222222222222',
    'Mary Smith',
    '+91 98123 11111',
    '33445566778',
    'mary@icici'
),
(
    'e2222222-2222-2222-2222-222222222222',
    'John Doe',
    '+91 98123 22222',
    '99887766554',
    'john@okaxis'
);
