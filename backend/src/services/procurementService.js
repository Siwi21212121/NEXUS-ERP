const pool = require("../config/db");

let procurementSchemaReady = false;

async function ensureProcurementSchema() {
  if (procurementSchemaReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS procurement_vendors (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) UNIQUE NOT NULL,
      category VARCHAR(80) NOT NULL DEFAULT 'General',
      location VARCHAR(140),
      contact_email VARCHAR(160),
      rating NUMERIC(3,2) NOT NULL DEFAULT 4.00,
      on_time_delivery_pct NUMERIC(5,2) NOT NULL DEFAULT 90,
      quality_score NUMERIC(5,2) NOT NULL DEFAULT 90,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS procurement_requests (
      id BIGSERIAL PRIMARY KEY,
      request_number VARCHAR(50) UNIQUE NOT NULL,
      requester VARCHAR(120) NOT NULL,
      department VARCHAR(120) NOT NULL,
      item_name VARCHAR(180) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      estimated_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED')) DEFAULT 'SUBMITTED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS procurement_orders (
      id BIGSERIAL PRIMARY KEY,
      po_number VARCHAR(50) UNIQUE NOT NULL,
      vendor_id BIGINT REFERENCES procurement_vendors(id) ON DELETE SET NULL,
      request_id BIGINT REFERENCES procurement_requests(id) ON DELETE SET NULL,
      item_name VARCHAR(180) NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','RECEIVED','INVOICED','CLOSED')) DEFAULT 'PENDING',
      expected_delivery DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS procurement_receipts (
      id BIGSERIAL PRIMARY KEY,
      receipt_number VARCHAR(50) UNIQUE NOT NULL,
      order_id BIGINT NOT NULL REFERENCES procurement_orders(id) ON DELETE CASCADE,
      received_quantity INTEGER NOT NULL CHECK (received_quantity > 0),
      received_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(20) NOT NULL CHECK (status IN ('PARTIAL','COMPLETE')) DEFAULT 'COMPLETE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS procurement_invoices (
      id BIGSERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      order_id BIGINT NOT NULL REFERENCES procurement_orders(id) ON DELETE CASCADE,
      invoice_amount NUMERIC(14,2) NOT NULL CHECK (invoice_amount >= 0),
      matched BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','MATCHED','EXCEPTION','PAID')) DEFAULT 'PENDING',
      invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    INSERT INTO procurement_vendors (name, category, location, contact_email, rating, on_time_delivery_pct, quality_score)
    VALUES
      ('GigaDynamics Corp', 'Electronics', 'Silicon Valley, US', 'supply@gigadynamics.example', 4.90, 96, 94),
      ('NeoLogistics Ltd', 'Logistics', 'Berlin, DE', 'ops@neologistics.example', 4.40, 89, 91),
      ('Apex Materials', 'Raw Materials', 'Pune, IN', 'sales@apexmaterials.example', 4.60, 92, 93)
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO procurement_requests (request_number, requester, department, item_name, quantity, estimated_cost, status)
    VALUES
      ('PR-2026-001', 'Sophia Turner', 'Operations', 'Quantum Chips', 500, 84200, 'APPROVED'),
      ('PR-2026-002', 'David Johnson', 'Supply Chain', 'Heatsink Assembly', 300, 12500, 'SUBMITTED'),
      ('PR-2026-003', 'Emma Wilson', 'Finance', 'Grade-A Copper', 900, 102000, 'APPROVED')
    ON CONFLICT (request_number) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO procurement_orders
      (po_number, vendor_id, request_id, item_name, quantity, unit_cost, total_cost, status, expected_delivery)
    SELECT 'PO-88219', v.id, r.id, 'Quantum Chips', 500, 168.40, 84200, 'APPROVED', CURRENT_DATE + INTERVAL '5 days'
    FROM procurement_vendors v CROSS JOIN procurement_requests r
    WHERE v.name = 'GigaDynamics Corp' AND r.request_number = 'PR-2026-001'
    ON CONFLICT (po_number) DO NOTHING;

    INSERT INTO procurement_orders
      (po_number, vendor_id, request_id, item_name, quantity, unit_cost, total_cost, status, expected_delivery)
    SELECT 'PO-88220', v.id, r.id, 'Heatsink Assembly', 300, 41.67, 12500, 'PENDING', CURRENT_DATE + INTERVAL '9 days'
    FROM procurement_vendors v CROSS JOIN procurement_requests r
    WHERE v.name = 'NeoLogistics Ltd' AND r.request_number = 'PR-2026-002'
    ON CONFLICT (po_number) DO NOTHING;

    INSERT INTO procurement_orders
      (po_number, vendor_id, request_id, item_name, quantity, unit_cost, total_cost, status, expected_delivery)
    SELECT 'PO-88195', v.id, r.id, 'Grade-A Copper', 900, 113.33, 102000, 'RECEIVED', CURRENT_DATE - INTERVAL '1 day'
    FROM procurement_vendors v CROSS JOIN procurement_requests r
    WHERE v.name = 'Apex Materials' AND r.request_number = 'PR-2026-003'
    ON CONFLICT (po_number) DO NOTHING;
  `);

  await pool.query(`
    INSERT INTO procurement_receipts (receipt_number, order_id, received_quantity, received_date, status)
    SELECT 'GR-2026-001', id, 900, CURRENT_DATE - INTERVAL '1 day', 'COMPLETE'
    FROM procurement_orders WHERE po_number = 'PO-88195'
    ON CONFLICT (receipt_number) DO NOTHING;

    INSERT INTO procurement_invoices (invoice_number, order_id, invoice_amount, matched, status, invoice_date)
    SELECT 'PINV-2026-001', id, total_cost, TRUE, 'MATCHED', CURRENT_DATE
    FROM procurement_orders WHERE po_number = 'PO-88195'
    ON CONFLICT (invoice_number) DO NOTHING;
  `);

  procurementSchemaReady = true;
}

async function getDashboardData() {
  await ensureProcurementSchema();

  const cardsQuery = pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING')::INTEGER AS pending_orders,
      COUNT(*) FILTER (WHERE status IN ('APPROVED','RECEIVED','INVOICED','CLOSED'))::INTEGER AS approved_orders,
      COALESCE(SUM(total_cost), 0) AS purchase_cost
    FROM procurement_orders
  `);
  const vendorQuery = pool.query(`
    SELECT name, rating, on_time_delivery_pct AS "deliveryPerformance", quality_score AS "qualityScore"
    FROM procurement_vendors
    ORDER BY rating DESC
  `);
  const trendQuery = pool.query(`
    SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'MON') AS month, COALESCE(SUM(total_cost),0) AS cost
    FROM procurement_orders
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `);
  const statusQuery = pool.query(`
    SELECT status, COUNT(*)::INTEGER AS value
    FROM procurement_orders
    GROUP BY status
    ORDER BY status
  `);
  const monthlyQuery = pool.query(`
    SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'MON') AS month, COUNT(*)::INTEGER AS orders
    FROM procurement_orders
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at)
  `);

  const [cardsResult, vendorResult, trendResult, statusResult, monthlyResult] =
    await Promise.all([cardsQuery, vendorQuery, trendQuery, statusQuery, monthlyQuery]);
  const cards = cardsResult.rows[0] || {};
  const vendors = vendorResult.rows.map((row) => ({
    ...row,
    rating: Number(row.rating || 0),
    deliveryPerformance: Number(row.deliveryPerformance || 0),
    qualityScore: Number(row.qualityScore || 0),
  }));
  const avgDelivery = vendors.length
    ? Math.round(vendors.reduce((sum, item) => sum + item.deliveryPerformance, 0) / vendors.length)
    : 0;

  return {
    cards: {
      pendingOrders: Number(cards.pending_orders || 0),
      approvedOrders: Number(cards.approved_orders || 0),
      vendorPerformance: vendors.length
        ? Math.round(vendors.reduce((sum, item) => sum + item.rating, 0) / vendors.length * 20)
        : 0,
      purchaseCost: Number(cards.purchase_cost || 0),
      deliveryPerformance: avgDelivery,
    },
    vendorComparison: vendors,
    purchaseTrend: trendResult.rows.map((row) => ({ month: row.month, cost: Number(row.cost || 0) })),
    statusDistribution: statusResult.rows,
    monthlyProcurement: monthlyResult.rows,
  };
}

async function listVendors() {
  await ensureProcurementSchema();
  const result = await pool.query(`
    SELECT id, name, category, location, contact_email AS "contactEmail", rating,
      on_time_delivery_pct AS "deliveryPerformance", quality_score AS "qualityScore"
    FROM procurement_vendors
    ORDER BY rating DESC
  `);
  return result.rows.map((row) => ({
    ...row,
    rating: Number(row.rating || 0),
    deliveryPerformance: Number(row.deliveryPerformance || 0),
    qualityScore: Number(row.qualityScore || 0),
  }));
}

async function createVendor(payload) {
  await ensureProcurementSchema();
  const result = await pool.query(
    `
    INSERT INTO procurement_vendors (name, category, location, contact_email, rating, on_time_delivery_pct, quality_score)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    ON CONFLICT (name)
    DO UPDATE SET category = EXCLUDED.category,
      location = EXCLUDED.location,
      contact_email = EXCLUDED.contact_email,
      rating = EXCLUDED.rating,
      on_time_delivery_pct = EXCLUDED.on_time_delivery_pct,
      quality_score = EXCLUDED.quality_score
    RETURNING id
    `,
    [payload.name, payload.category, payload.location, payload.contactEmail, payload.rating, payload.deliveryPerformance, payload.qualityScore]
  );
  return result.rows[0];
}

async function listRequests() {
  await ensureProcurementSchema();
  const result = await pool.query(`
    SELECT id, request_number AS "requestNumber", requester, department, item_name AS "itemName",
      quantity, estimated_cost AS "estimatedCost", status, created_at AS "createdAt"
    FROM procurement_requests
    ORDER BY created_at DESC
  `);
  return result.rows.map((row) => ({ ...row, estimatedCost: Number(row.estimatedCost || 0) }));
}

async function createRequest(payload) {
  await ensureProcurementSchema();
  const result = await pool.query(
    `
    INSERT INTO procurement_requests (request_number, requester, department, item_name, quantity, estimated_cost, status)
    VALUES ($1,$2,$3,$4,$5,$6,'SUBMITTED')
    ON CONFLICT (request_number)
    DO UPDATE SET requester = EXCLUDED.requester,
      department = EXCLUDED.department,
      item_name = EXCLUDED.item_name,
      quantity = EXCLUDED.quantity,
      estimated_cost = EXCLUDED.estimated_cost,
      status = EXCLUDED.status
    RETURNING id
    `,
    [payload.requestNumber, payload.requester, payload.department, payload.itemName, payload.quantity, payload.estimatedCost]
  );
  return result.rows[0];
}

async function listOrders() {
  await ensureProcurementSchema();
  const result = await pool.query(`
    SELECT o.id, o.po_number AS "poNumber", o.item_name AS "itemName", o.quantity, o.unit_cost AS "unitCost",
      o.total_cost AS "totalCost", o.status, o.expected_delivery AS "expectedDelivery",
      v.name AS "vendorName"
    FROM procurement_orders o
    LEFT JOIN procurement_vendors v ON v.id = o.vendor_id
    ORDER BY o.created_at DESC
  `);
  return result.rows.map((row) => ({ ...row, unitCost: Number(row.unitCost || 0), totalCost: Number(row.totalCost || 0) }));
}

async function createOrder(payload) {
  await ensureProcurementSchema();
  const totalCost = payload.quantity * payload.unitCost;
  const result = await pool.query(
    `
    INSERT INTO procurement_orders (po_number, vendor_id, request_id, item_name, quantity, unit_cost, total_cost, status, expected_delivery)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING',$8)
    ON CONFLICT (po_number)
    DO UPDATE SET vendor_id = EXCLUDED.vendor_id,
      request_id = EXCLUDED.request_id,
      item_name = EXCLUDED.item_name,
      quantity = EXCLUDED.quantity,
      unit_cost = EXCLUDED.unit_cost,
      total_cost = EXCLUDED.total_cost,
      expected_delivery = EXCLUDED.expected_delivery
    RETURNING id
    `,
    [payload.poNumber, payload.vendorId, payload.requestId, payload.itemName, payload.quantity, payload.unitCost, totalCost, payload.expectedDelivery]
  );
  return result.rows[0];
}

async function reviewOrder(id, status) {
  await ensureProcurementSchema();
  const result = await pool.query(
    "UPDATE procurement_orders SET status = $1 WHERE id = $2 RETURNING id, status",
    [status, id]
  );
  return result.rows[0];
}

async function receiveGoods(payload) {
  await ensureProcurementSchema();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const receipt = await client.query(
      `
      INSERT INTO procurement_receipts (receipt_number, order_id, received_quantity, received_date, status)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (receipt_number)
      DO UPDATE SET order_id = EXCLUDED.order_id,
        received_quantity = EXCLUDED.received_quantity,
        received_date = EXCLUDED.received_date,
        status = EXCLUDED.status
      RETURNING id
      `,
      [payload.receiptNumber, payload.orderId, payload.receivedQuantity, payload.receivedDate, payload.status]
    );
    await client.query("UPDATE procurement_orders SET status = 'RECEIVED' WHERE id = $1", [payload.orderId]);
    await client.query("COMMIT");
    return receipt.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function matchInvoice(payload) {
  await ensureProcurementSchema();
  const orderResult = await pool.query("SELECT total_cost FROM procurement_orders WHERE id = $1", [payload.orderId]);
  const totalCost = Number(orderResult.rows[0]?.total_cost || 0);
  const matched = Math.abs(totalCost - payload.invoiceAmount) <= 1;
  const result = await pool.query(
    `
    INSERT INTO procurement_invoices (invoice_number, order_id, invoice_amount, matched, status, invoice_date)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (invoice_number)
    DO UPDATE SET order_id = EXCLUDED.order_id,
      invoice_amount = EXCLUDED.invoice_amount,
      matched = EXCLUDED.matched,
      status = EXCLUDED.status,
      invoice_date = EXCLUDED.invoice_date
    RETURNING id, matched, status
    `,
    [payload.invoiceNumber, payload.orderId, payload.invoiceAmount, matched, matched ? "MATCHED" : "EXCEPTION", payload.invoiceDate]
  );
  return result.rows[0];
}

module.exports = {
  createOrder,
  createRequest,
  createVendor,
  ensureProcurementSchema,
  getDashboardData,
  listOrders,
  listRequests,
  listVendors,
  matchInvoice,
  receiveGoods,
  reviewOrder,
};
