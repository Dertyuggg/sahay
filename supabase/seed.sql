-- Seed Data for SAHAY-24

-- 1. Insert a mock user (Arthur Pendelton)
INSERT INTO public.users (id, name) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Arthur Pendelton');

-- 2. Insert starting balance
INSERT INTO public.mock_balances (user_id, balance) 
VALUES ('11111111-1111-1111-1111-111111111111', 1250.00);

-- 3. Insert saved contacts
INSERT INTO public.saved_contacts (user_id, contact_name, account_details) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Ramesh', 'Bank A - 1234'),
    ('11111111-1111-1111-1111-111111111111', 'Suresh', 'Bank B - 5678');
