-- Finance module schema and seed data for ClarioNex ERP.
-- Run against the existing PostgreSQL database used by the Express backend.

CREATE TABLE IF NOT EXISTS finance_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_number VARCHAR(40) UNIQUE NOT NULL,
  counterparty VARCHAR(160) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (
    transaction_type IN ('REVENUE', 'EXPENSE', 'RECEIVABLE', 'PAYABLE')
  ),
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('PAID', 'PENDING', 'OVERDUE', 'APPROVED', 'DRAFT')
  ),
  category VARCHAR(80) NOT NULL DEFAULT 'General',
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_budgets (
  id BIGSERIAL PRIMARY KEY,
  department VARCHAR(120) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  allocated_amount NUMERIC(14, 2) NOT NULL CHECK (allocated_amount >= 0),
  spent_amount NUMERIC(14, 2) NOT NULL CHECK (spent_amount >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('APPROVED', 'REVIEW', 'LOCKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(40) UNIQUE NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  tax_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
  paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_payments (
  id BIGSERIAL PRIMARY KEY,
  payment_number VARCHAR(40) UNIQUE NOT NULL,
  invoice_id BIGINT REFERENCES finance_invoices(id) ON DELETE SET NULL,
  counterparty VARCHAR(160) NOT NULL,
  payment_direction VARCHAR(20) NOT NULL CHECK (payment_direction IN ('INCOMING', 'OUTGOING')),
  payment_method VARCHAR(40) NOT NULL DEFAULT 'BANK_TRANSFER',
  amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS module_notifications (
  id BIGSERIAL PRIMARY KEY,
  module VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL', 'SUCCESS')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_type
  ON finance_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_status
  ON finance_transactions(status);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_date
  ON finance_transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_search
  ON finance_transactions(counterparty, transaction_number, category);

CREATE INDEX IF NOT EXISTS idx_module_notifications_module
  ON module_notifications(module, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_status
  ON finance_invoices(status);

CREATE INDEX IF NOT EXISTS idx_finance_payments_direction
  ON finance_payments(payment_direction);

CREATE INDEX IF NOT EXISTS idx_finance_payments_date
  ON finance_payments(payment_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_budgets_department_year
  ON finance_budgets(department, fiscal_year);

CREATE UNIQUE INDEX IF NOT EXISTS idx_module_notifications_module_title
  ON module_notifications(module, title);

INSERT INTO finance_transactions
  (transaction_number, counterparty, transaction_type, status, category, amount, transaction_date, due_date, notes)
VALUES
  ('INV-2026-1001', 'Starlight Logistics Corp.', 'RECEIVABLE', 'PAID', 'Logistics', 142500.00, '2026-01-12', '2026-01-28', 'Enterprise logistics billing'),
  ('INV-2026-1002', 'Global Cloud Infra', 'RECEIVABLE', 'PENDING', 'Cloud Services', 310500.00, '2026-02-08', '2026-02-28', 'Cloud modernization milestone'),
  ('INV-2026-1003', 'Nebula Dynamics', 'RECEIVABLE', 'OVERDUE', 'R&D Services', 224000.00, '2026-03-10', '2026-03-25', 'Research billing overdue'),
  ('REV-2026-2001', 'Orion Retail Group', 'REVENUE', 'PAID', 'Subscriptions', 682000.00, '2026-01-18', NULL, 'Annual ERP subscription'),
  ('REV-2026-2002', 'Aster Manufacturing', 'REVENUE', 'PAID', 'Licensing', 545000.00, '2026-02-16', NULL, 'License expansion'),
  ('REV-2026-2003', 'Helio Foods', 'REVENUE', 'PAID', 'Services', 735000.00, '2026-03-19', NULL, 'Implementation services'),
  ('REV-2026-2004', 'MetroGrid Energy', 'REVENUE', 'PAID', 'Subscriptions', 815000.00, '2026-04-22', NULL, 'Enterprise renewal'),
  ('REV-2026-2005', 'Vector Health Systems', 'REVENUE', 'PAID', 'Services', 925000.00, '2026-05-14', NULL, 'Transformation program'),
  ('REV-2026-2006', 'Northstar Airports', 'REVENUE', 'PAID', 'Licensing', 870000.00, '2026-06-08', NULL, 'Regional license rollout'),
  ('BILL-2026-3001', 'Datacenter One', 'PAYABLE', 'PENDING', 'Infrastructure', 260000.00, '2026-04-11', '2026-06-30', 'Hosting invoice'),
  ('BILL-2026-3002', 'TalentBridge Partners', 'PAYABLE', 'APPROVED', 'Consulting', 118000.00, '2026-05-02', '2026-06-24', 'Consulting retainer'),
  ('EXP-2026-4001', 'APAC Freight Optimization', 'EXPENSE', 'PAID', 'Operations', 205000.00, '2026-01-29', NULL, 'Freight optimization spend'),
  ('EXP-2026-4002', 'Security Audit Program', 'EXPENSE', 'PAID', 'Compliance', 98000.00, '2026-02-27', NULL, 'Quarterly audit'),
  ('EXP-2026-4003', 'AI Forecasting Compute', 'EXPENSE', 'APPROVED', 'AI Operations', 176000.00, '2026-03-29', NULL, 'Compute allocation'),
  ('EXP-2026-4004', 'Partner Enablement', 'EXPENSE', 'PAID', 'Sales', 133000.00, '2026-04-27', NULL, 'Partner program'),
  ('EXP-2026-4005', 'Workforce Systems', 'EXPENSE', 'PAID', 'HR', 89000.00, '2026-05-26', NULL, 'HR systems spend')
ON CONFLICT (transaction_number) DO NOTHING;

INSERT INTO finance_budgets
  (department, fiscal_year, allocated_amount, spent_amount, status)
VALUES
  ('Finance', 2026, 1200000.00, 720000.00, 'APPROVED'),
  ('Human Resources', 2026, 950000.00, 610000.00, 'APPROVED'),
  ('Supply Chain', 2026, 1800000.00, 1320000.00, 'REVIEW'),
  ('AI Forecasting', 2026, 1400000.00, 980000.00, 'APPROVED'),
  ('Security & Compliance', 2026, 800000.00, 550000.00, 'LOCKED')
ON CONFLICT (department, fiscal_year) DO NOTHING;

INSERT INTO finance_invoices
  (invoice_number, customer_name, invoice_date, due_date, subtotal, tax_amount, total_amount, paid_amount, status)
VALUES
  ('FIN-INV-2026-001', 'Starlight Logistics Corp.', '2026-06-01', '2026-06-20', 120000.00, 22500.00, 142500.00, 142500.00, 'PAID'),
  ('FIN-INV-2026-002', 'Global Cloud Infra', '2026-06-04', '2026-06-30', 265000.00, 45500.00, 310500.00, 0.00, 'SENT'),
  ('FIN-INV-2026-003', 'Nebula Dynamics', '2026-05-25', '2026-06-10', 190000.00, 34000.00, 224000.00, 50000.00, 'OVERDUE'),
  ('FIN-INV-2026-004', 'Northstar Airports', '2026-06-08', '2026-06-28', 750000.00, 120000.00, 870000.00, 870000.00, 'PAID')
ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO finance_payments
  (payment_number, invoice_id, counterparty, payment_direction, payment_method, amount, payment_date, status)
SELECT 'PAY-IN-2026-001', id, customer_name, 'INCOMING', 'BANK_TRANSFER', paid_amount, '2026-06-12', 'COMPLETED'
FROM finance_invoices WHERE invoice_number = 'FIN-INV-2026-001'
ON CONFLICT (payment_number) DO NOTHING;

INSERT INTO finance_payments
  (payment_number, invoice_id, counterparty, payment_direction, payment_method, amount, payment_date, status)
SELECT 'PAY-IN-2026-002', id, customer_name, 'INCOMING', 'BANK_TRANSFER', 870000.00, '2026-06-14', 'COMPLETED'
FROM finance_invoices WHERE invoice_number = 'FIN-INV-2026-004'
ON CONFLICT (payment_number) DO NOTHING;

INSERT INTO finance_payments
  (payment_number, invoice_id, counterparty, payment_direction, payment_method, amount, payment_date, status)
SELECT 'PAY-IN-2026-003', id, customer_name, 'INCOMING', 'CARD', 50000.00, '2026-06-18', 'COMPLETED'
FROM finance_invoices WHERE invoice_number = 'FIN-INV-2026-003'
ON CONFLICT (payment_number) DO NOTHING;

INSERT INTO finance_payments
  (payment_number, invoice_id, counterparty, payment_direction, payment_method, amount, payment_date, status)
VALUES
  ('PAY-OUT-2026-001', NULL, 'Datacenter One', 'OUTGOING', 'BANK_TRANSFER', 260000.00, '2026-06-16', 'PENDING'),
  ('PAY-OUT-2026-002', NULL, 'TalentBridge Partners', 'OUTGOING', 'BANK_TRANSFER', 118000.00, '2026-06-20', 'COMPLETED')
ON CONFLICT (payment_number) DO NOTHING;

INSERT INTO module_notifications
  (module, title, message, severity)
VALUES
  ('finance', 'Overdue receivable detected', 'Nebula Dynamics invoice INV-2026-1003 is past due and requires collection follow-up.', 'CRITICAL'),
  ('finance', 'Budget review required', 'Supply Chain budget utilization crossed 70% and needs finance manager review.', 'WARNING'),
  ('finance', 'Revenue target trending high', 'Subscription and services revenue are tracking above the current quarter baseline.', 'SUCCESS')
ON CONFLICT (module, title) DO NOTHING;
