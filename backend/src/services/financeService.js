const pool = require("../config/db");

let financeSchemaReady = false;

async function ensureFinanceSchema() {
  if (financeSchemaReady) return;

  await pool.query(`
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

    CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_budgets_department_year
      ON finance_budgets(department, fiscal_year);
  `);

  await seedFinanceData();

  financeSchemaReady = true;
}

async function seedFinanceData() {
  const [transactionCount, invoiceCount, budgetCount] = await Promise.all([
    pool.query("SELECT COUNT(*)::INTEGER AS count FROM finance_transactions"),
    pool.query("SELECT COUNT(*)::INTEGER AS count FROM finance_invoices"),
    pool.query("SELECT COUNT(*)::INTEGER AS count FROM finance_budgets"),
  ]);

  if (Number(transactionCount.rows[0]?.count || 0) === 0) {
    await pool.query(`
    INSERT INTO finance_transactions
      (transaction_number, counterparty, transaction_type, status, category, amount, transaction_date, due_date, notes)
    VALUES
      ('FIN-SEED-REV-001', 'Northstar Industries', 'REVENUE', 'PAID', 'Industrial Machinery', 184000, CURRENT_DATE - INTERVAL '70 days', NULL, 'Seeded ERP revenue'),
      ('FIN-SEED-REV-002', 'Apex Retail Group', 'REVENUE', 'PAID', 'Components', 221500, CURRENT_DATE - INTERVAL '42 days', NULL, 'Seeded ERP revenue'),
      ('FIN-SEED-REV-003', 'Orion Manufacturing', 'REVENUE', 'PAID', 'Services', 156200, CURRENT_DATE - INTERVAL '16 days', NULL, 'Seeded ERP revenue'),
      ('FIN-SEED-REV-004', 'HelioWorks Ltd', 'REVENUE', 'PENDING', 'Industrial Machinery', 97000, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '12 days', 'Seeded ERP receivable'),
      ('FIN-SEED-EXP-001', 'Apex Materials', 'EXPENSE', 'PAID', 'Raw Materials', 72000, CURRENT_DATE - INTERVAL '55 days', NULL, 'Seeded ERP expense'),
      ('FIN-SEED-EXP-002', 'NeoLogistics Ltd', 'EXPENSE', 'PAID', 'Logistics', 34500, CURRENT_DATE - INTERVAL '25 days', NULL, 'Seeded ERP expense'),
      ('FIN-SEED-EXP-003', 'CloudOps Platform', 'EXPENSE', 'PENDING', 'Infrastructure', 18800, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '5 days', 'Seeded ERP expense')
    ON CONFLICT (transaction_number) DO NOTHING;
    `);
  }

  if (Number(invoiceCount.rows[0]?.count || 0) === 0) {
    await pool.query(`
    INSERT INTO finance_invoices
      (invoice_number, customer_name, invoice_date, due_date, subtotal, tax_amount, total_amount, paid_amount, status)
    VALUES
      ('INV-SEED-001', 'Northstar Industries', CURRENT_DATE - INTERVAL '70 days', CURRENT_DATE - INTERVAL '45 days', 184000, 0, 184000, 184000, 'PAID'),
      ('INV-SEED-002', 'Apex Retail Group', CURRENT_DATE - INTERVAL '42 days', CURRENT_DATE - INTERVAL '20 days', 221500, 0, 221500, 221500, 'PAID'),
      ('INV-SEED-003', 'Orion Manufacturing', CURRENT_DATE - INTERVAL '16 days', CURRENT_DATE + INTERVAL '14 days', 156200, 0, 156200, 81000, 'PARTIAL'),
      ('INV-SEED-004', 'HelioWorks Ltd', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '12 days', 97000, 0, 97000, 0, 'SENT')
    ON CONFLICT (invoice_number) DO NOTHING;

    INSERT INTO finance_payments
      (payment_number, invoice_id, counterparty, payment_direction, payment_method, amount, payment_date, status)
    SELECT item.payment_number, i.id, item.counterparty, item.direction, 'BANK_TRANSFER', item.amount, item.payment_date, 'COMPLETED'
    FROM (VALUES
      ('PAY-SEED-IN-001', 'INV-SEED-001', 'Northstar Industries', 'INCOMING', 184000, CURRENT_DATE - INTERVAL '66 days'),
      ('PAY-SEED-IN-002', 'INV-SEED-002', 'Apex Retail Group', 'INCOMING', 221500, CURRENT_DATE - INTERVAL '39 days'),
      ('PAY-SEED-IN-003', 'INV-SEED-003', 'Orion Manufacturing', 'INCOMING', 81000, CURRENT_DATE - INTERVAL '8 days'),
      ('PAY-SEED-OUT-001', NULL, 'Apex Materials', 'OUTGOING', 72000, CURRENT_DATE - INTERVAL '54 days'),
      ('PAY-SEED-OUT-002', NULL, 'NeoLogistics Ltd', 'OUTGOING', 34500, CURRENT_DATE - INTERVAL '23 days')
    ) AS item(payment_number, invoice_number, counterparty, direction, amount, payment_date)
    LEFT JOIN finance_invoices i ON i.invoice_number = item.invoice_number
    ON CONFLICT (payment_number) DO NOTHING;
    `);
  }

  if (Number(budgetCount.rows[0]?.count || 0) === 0) {
    await pool.query(`
    INSERT INTO finance_budgets (department, fiscal_year, allocated_amount, spent_amount, status)
    VALUES
      ('Operations', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 420000, 238000, 'APPROVED'),
      ('Supply Chain', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 360000, 194000, 'APPROVED'),
      ('HR', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 280000, 126000, 'REVIEW')
    ON CONFLICT (department, fiscal_year) DO NOTHING;
    `);
  }
}

async function getFinanceDashboardData() {
  await ensureFinanceSchema();

  const summaryQuery = pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' AND transaction_date = CURRENT_DATE THEN amount ELSE 0 END), 0) AS todays_revenue,
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0) AS monthly_revenue,
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expenses,
      COALESCE(SUM(CASE WHEN transaction_type = 'RECEIVABLE' AND status IN ('PENDING', 'OVERDUE') THEN amount ELSE 0 END), 0) AS outstanding_receivables,
      COALESCE(SUM(CASE WHEN transaction_type = 'PAYABLE' AND status IN ('PENDING', 'APPROVED') THEN amount ELSE 0 END), 0) AS accounts_payable
    FROM finance_transactions
  `);

  const pendingPaymentQuery = pool.query(`
    SELECT COALESCE(SUM(amount), 0) AS pending_payments
    FROM finance_payments
    WHERE status = 'PENDING'
  `);

  const chartQuery = pool.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', transaction_date), 'MON') AS month,
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS revenue,
      COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expenses
    FROM finance_transactions
    WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', transaction_date)
    ORDER BY DATE_TRUNC('month', transaction_date)
  `);

  const expenseBreakdownQuery = pool.query(`
    SELECT category, COALESCE(SUM(amount), 0) AS value
    FROM finance_transactions
    WHERE transaction_type = 'EXPENSE'
    GROUP BY category
    ORDER BY value DESC
  `);

  const categoryQuery = pool.query(`
    SELECT category, transaction_type AS type, COALESCE(SUM(amount), 0) AS value
    FROM finance_transactions
    GROUP BY category, transaction_type
    ORDER BY value DESC
  `);

  const cashFlowQuery = pool.query(`
    WITH months AS (
      SELECT generate_series(
        DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
        DATE_TRUNC('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month_start
    ),
    payment_flow AS (
      SELECT DATE_TRUNC('month', payment_date) AS month_start,
        COALESCE(SUM(CASE WHEN payment_direction = 'INCOMING' THEN amount ELSE 0 END), 0) AS inflow,
        COALESCE(SUM(CASE WHEN payment_direction = 'OUTGOING' THEN amount ELSE 0 END), 0) AS outflow
      FROM finance_payments
      WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', payment_date)
    ),
    ledger_flow AS (
      SELECT DATE_TRUNC('month', transaction_date) AS month_start,
        COALESCE(SUM(CASE WHEN transaction_type IN ('REVENUE', 'RECEIVABLE') THEN amount ELSE 0 END), 0) AS inflow,
        COALESCE(SUM(CASE WHEN transaction_type IN ('EXPENSE', 'PAYABLE') THEN amount ELSE 0 END), 0) AS outflow
      FROM finance_transactions
      WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY DATE_TRUNC('month', transaction_date)
    )
    SELECT TO_CHAR(months.month_start, 'MON') AS month,
      COALESCE(NULLIF(payment_flow.inflow, 0), ledger_flow.inflow, 0) AS inflow,
      COALESCE(NULLIF(payment_flow.outflow, 0), ledger_flow.outflow, 0) AS outflow
    FROM months
    LEFT JOIN payment_flow ON payment_flow.month_start = months.month_start
    LEFT JOIN ledger_flow ON ledger_flow.month_start = months.month_start
    ORDER BY months.month_start
  `);

  const budgetQuery = pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'APPROVED') AS approved_budgets,
      COALESCE(SUM(allocated_amount), 0) AS allocated_amount,
      COALESCE(SUM(spent_amount), 0) AS spent_amount
    FROM finance_budgets
    WHERE fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
  `);

  const [
    summaryResult,
    pendingPaymentResult,
    chartResult,
    expenseBreakdownResult,
    categoryResult,
    cashFlowResult,
    budgetResult,
  ] = await Promise.all([
    summaryQuery,
    pendingPaymentQuery,
    chartQuery,
    expenseBreakdownQuery,
    categoryQuery,
    cashFlowQuery,
    budgetQuery,
  ]);

  const summary = summaryResult.rows[0] || {};
  const budgets = budgetResult.rows[0] || {};
  const totalRevenue = Number(summary.total_revenue || 0);
  const totalExpenses = Number(summary.total_expenses || 0);
  const allocatedAmount = Number(budgets.allocated_amount || 0);
  const spentAmount = Number(budgets.spent_amount || 0);

  return {
    cards: {
      todaysRevenue: Number(summary.todays_revenue || 0),
      monthlyRevenue: Number(summary.monthly_revenue || 0),
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingPayments: Number(pendingPaymentResult.rows[0]?.pending_payments || 0),
      outstandingReceivables: Number(summary.outstanding_receivables || 0),
      accountsPayable: Number(summary.accounts_payable || 0),
      approvedBudgets: Number(budgets.approved_budgets || 0),
      budgetUtilization:
        allocatedAmount > 0 ? Math.round((spentAmount / allocatedAmount) * 100) : 0,
    },
    revenueTrend: chartResult.rows.map((row) => ({
      month: row.month,
      revenue: Number(row.revenue || 0),
      expenses: Number(row.expenses || 0),
    })),
    expenseBreakdown: expenseBreakdownResult.rows.map((row) => ({
      category: row.category,
      value: Number(row.value || 0),
    })),
    categoryAnalysis: categoryResult.rows.map((row) => ({
      category: row.category,
      type: row.type,
      value: Number(row.value || 0),
    })),
    cashFlow: cashFlowResult.rows.map((row) => ({
      month: row.month,
      inflow: Number(row.inflow || 0),
      outflow: Number(row.outflow || 0),
      net: Number(row.inflow || 0) - Number(row.outflow || 0),
    })),
  };
}

async function listTransactions(filters) {
  await ensureFinanceSchema();

  const conditions = [];
  const values = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(
      transaction_number ILIKE $${values.length}
      OR counterparty ILIKE $${values.length}
      OR category ILIKE $${values.length}
    )`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`transaction_type = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countValues = [...values];

  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const dataQuery = pool.query(
    `
    SELECT
      id,
      transaction_number AS "transactionNumber",
      counterparty,
      transaction_type AS "transactionType",
      status,
      category,
      amount,
      transaction_date AS "transactionDate",
      due_date AS "dueDate",
      notes,
      created_at AS "createdAt"
    FROM finance_transactions
    ${whereClause}
    ORDER BY transaction_date DESC, id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `,
    values
  );

  const countQuery = pool.query(
    `SELECT COUNT(*)::INTEGER AS total FROM finance_transactions ${whereClause}`,
    countValues
  );

  const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);
  const total = countResult.rows[0]?.total || 0;

  return {
    data: dataResult.rows.map((row) => ({
      ...row,
      amount: Number(row.amount || 0),
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

async function createTransaction(payload) {
  await ensureFinanceSchema();

  const result = await pool.query(
    `
    INSERT INTO finance_transactions
      (transaction_number, counterparty, transaction_type, status, category, amount, transaction_date, due_date, notes)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (transaction_number)
    DO UPDATE SET
      counterparty = EXCLUDED.counterparty,
      transaction_type = EXCLUDED.transaction_type,
      status = EXCLUDED.status,
      category = EXCLUDED.category,
      amount = EXCLUDED.amount,
      transaction_date = EXCLUDED.transaction_date,
      due_date = EXCLUDED.due_date,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING
      id,
      transaction_number AS "transactionNumber",
      counterparty,
      transaction_type AS "transactionType",
      status,
      category,
      amount,
      transaction_date AS "transactionDate",
      due_date AS "dueDate",
      notes,
      created_at AS "createdAt"
    `,
    [
      payload.transactionNumber,
      payload.counterparty,
      payload.transactionType,
      payload.status,
      payload.category,
      payload.amount,
      payload.transactionDate,
      payload.dueDate,
      payload.notes,
    ]
  );

  return {
    ...result.rows[0],
    amount: Number(result.rows[0].amount || 0),
  };
}

async function listBudgets() {
  await ensureFinanceSchema();

  const result = await pool.query(`
    SELECT id, department, fiscal_year AS "fiscalYear", allocated_amount AS "allocatedAmount",
      spent_amount AS "spentAmount", status
    FROM finance_budgets
    ORDER BY fiscal_year DESC, department
  `);

  return result.rows.map((row) => ({
    ...row,
    allocatedAmount: Number(row.allocatedAmount || 0),
    spentAmount: Number(row.spentAmount || 0),
    utilization: Number(row.allocatedAmount || 0) > 0
      ? Math.round((Number(row.spentAmount || 0) / Number(row.allocatedAmount || 0)) * 100)
      : 0,
  }));
}

async function createBudget(payload) {
  await ensureFinanceSchema();

  const result = await pool.query(
    `
    INSERT INTO finance_budgets (department, fiscal_year, allocated_amount, spent_amount, status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (department, fiscal_year)
    DO UPDATE SET allocated_amount = EXCLUDED.allocated_amount,
      spent_amount = EXCLUDED.spent_amount,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id
    `,
    [
      payload.department,
      payload.fiscalYear,
      payload.allocatedAmount,
      payload.spentAmount,
      payload.status,
    ]
  );

  return result.rows[0];
}

async function listInvoices() {
  await ensureFinanceSchema();

  const result = await pool.query(`
    SELECT id, invoice_number AS "invoiceNumber", customer_name AS "customerName",
      invoice_date AS "invoiceDate", due_date AS "dueDate", subtotal, tax_amount AS "taxAmount",
      total_amount AS "totalAmount", paid_amount AS "paidAmount", status
    FROM finance_invoices
    ORDER BY invoice_date DESC, id DESC
  `);

  return result.rows.map((row) => ({
    ...row,
    subtotal: Number(row.subtotal || 0),
    taxAmount: Number(row.taxAmount || 0),
    totalAmount: Number(row.totalAmount || 0),
    paidAmount: Number(row.paidAmount || 0),
  }));
}

async function createInvoice(payload) {
  await ensureFinanceSchema();

  const result = await pool.query(
    `
    INSERT INTO finance_invoices
      (invoice_number, customer_name, invoice_date, due_date, subtotal, tax_amount, total_amount, paid_amount, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (invoice_number)
    DO UPDATE SET
      customer_name = EXCLUDED.customer_name,
      invoice_date = EXCLUDED.invoice_date,
      due_date = EXCLUDED.due_date,
      subtotal = EXCLUDED.subtotal,
      tax_amount = EXCLUDED.tax_amount,
      total_amount = EXCLUDED.total_amount,
      paid_amount = EXCLUDED.paid_amount,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id
    `,
    [
      payload.invoiceNumber,
      payload.customerName,
      payload.invoiceDate,
      payload.dueDate,
      payload.subtotal,
      payload.taxAmount,
      payload.totalAmount,
      payload.paidAmount,
      payload.status,
    ]
  );

  return result.rows[0];
}

async function listPayments() {
  await ensureFinanceSchema();

  const result = await pool.query(`
    SELECT p.id, p.payment_number AS "paymentNumber", p.invoice_id AS "invoiceId",
      i.invoice_number AS "invoiceNumber", p.counterparty, p.payment_direction AS "paymentDirection",
      p.payment_method AS "paymentMethod", p.amount, p.payment_date AS "paymentDate", p.status
    FROM finance_payments p
    LEFT JOIN finance_invoices i ON i.id = p.invoice_id
    ORDER BY p.payment_date DESC, p.id DESC
  `);

  return result.rows.map((row) => ({
    ...row,
    amount: Number(row.amount || 0),
  }));
}

async function createPayment(payload) {
  await ensureFinanceSchema();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `
      INSERT INTO finance_payments
        (payment_number, invoice_id, counterparty, payment_direction, payment_method, amount, payment_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (payment_number)
      DO NOTHING
      RETURNING id
      `,
      [
        payload.paymentNumber,
        payload.invoiceId,
        payload.counterparty,
        payload.paymentDirection,
        payload.paymentMethod,
        payload.amount,
        payload.paymentDate,
        payload.status,
      ]
    );

    if (!result.rows.length) {
      await client.query("COMMIT");
      return { duplicate: true, paymentNumber: payload.paymentNumber };
    }

    if (payload.invoiceId && payload.paymentDirection === "INCOMING" && payload.status === "COMPLETED") {
      await client.query(
        `
        UPDATE finance_invoices
        SET paid_amount = LEAST(total_amount, paid_amount + $1),
          status = CASE
            WHEN LEAST(total_amount, paid_amount + $1) >= total_amount THEN 'PAID'
            ELSE 'PARTIAL'
          END,
          updated_at = NOW()
        WHERE id = $2
        `,
        [payload.amount, payload.invoiceId]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getProfitAndLoss() {
  await ensureFinanceSchema();

  const result = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expenses
    FROM finance_transactions
    WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
  `);
  const row = result.rows[0] || {};
  const income = Number(row.income || 0);
  const expenses = Number(row.expenses || 0);

  return {
    income,
    expenses,
    grossProfit: income - expenses,
    netProfit: income - expenses,
  };
}

async function getCashFlowStatement() {
  await ensureFinanceSchema();

  const result = await pool.query(`
    WITH payment_flow AS (
      SELECT
        COALESCE(SUM(CASE WHEN payment_direction = 'INCOMING' THEN amount ELSE 0 END), 0) AS inflow,
        COALESCE(SUM(CASE WHEN payment_direction = 'OUTGOING' THEN amount ELSE 0 END), 0) AS outflow
      FROM finance_payments
      WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND payment_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    ),
    ledger_flow AS (
      SELECT
        COALESCE(SUM(CASE WHEN transaction_type IN ('REVENUE', 'RECEIVABLE') THEN amount ELSE 0 END), 0) AS inflow,
        COALESCE(SUM(CASE WHEN transaction_type IN ('EXPENSE', 'PAYABLE') THEN amount ELSE 0 END), 0) AS outflow
      FROM finance_transactions
      WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND transaction_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    )
    SELECT
      COALESCE(NULLIF(payment_flow.inflow, 0), ledger_flow.inflow, 0) AS inflow,
      COALESCE(NULLIF(payment_flow.outflow, 0), ledger_flow.outflow, 0) AS outflow
    FROM payment_flow, ledger_flow
  `);
  const row = result.rows[0] || {};
  const inflow = Number(row.inflow || 0);
  const outflow = Number(row.outflow || 0);

  return {
    inflow,
    outflow,
    netCashFlow: inflow - outflow,
  };
}

async function listFinanceNotifications() {
  await ensureFinanceSchema();

  const result = await pool.query(`
    SELECT id, title, message, severity, is_read AS "isRead", created_at AS "createdAt"
    FROM module_notifications
    WHERE module = 'finance'
    ORDER BY created_at DESC
    LIMIT 10
  `);

  return result.rows;
}

module.exports = {
  createBudget,
  createInvoice,
  createPayment,
  createTransaction,
  getCashFlowStatement,
  getFinanceDashboardData,
  getProfitAndLoss,
  listBudgets,
  listFinanceNotifications,
  listInvoices,
  listPayments,
  listTransactions,
};
