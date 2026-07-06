const pool = require("../config/db");

let inventorySchemaReady = false;

async function ensureInventorySchema() {
  if (inventorySchemaReady) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_categories (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL,
      code VARCHAR(30) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_suppliers (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(160) UNIQUE NOT NULL,
      contact_email VARCHAR(160),
      phone VARCHAR(40),
      location VARCHAR(140),
      rating NUMERIC(3, 2) NOT NULL DEFAULT 4.00 CHECK (rating >= 0 AND rating <= 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_warehouses (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(140) UNIQUE NOT NULL,
      code VARCHAR(30) UNIQUE NOT NULL,
      location VARCHAR(160) NOT NULL,
      capacity_units INTEGER NOT NULL CHECK (capacity_units > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_products (
      id BIGSERIAL PRIMARY KEY,
      sku VARCHAR(60) UNIQUE NOT NULL,
      name VARCHAR(180) NOT NULL,
      category_id BIGINT REFERENCES inventory_categories(id) ON DELETE SET NULL,
      supplier_id BIGINT REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
      unit_cost NUMERIC(14, 2) NOT NULL CHECK (unit_cost >= 0),
      reorder_level INTEGER NOT NULL DEFAULT 10 CHECK (reorder_level >= 0),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_stock (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
      warehouse_id BIGINT NOT NULL REFERENCES inventory_warehouses(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(product_id, warehouse_id)
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
      source_warehouse_id BIGINT REFERENCES inventory_warehouses(id) ON DELETE SET NULL,
      destination_warehouse_id BIGINT REFERENCES inventory_warehouses(id) ON DELETE SET NULL,
      movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('RECEIPT', 'DISPATCH', 'TRANSFER', 'ADJUSTMENT')),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      reference_number VARCHAR(60) NOT NULL,
      notes TEXT,
      movement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    UPDATE inventory_movements m
    SET reference_number = CONCAT(m.reference_number, '-', m.id)
    FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY reference_number ORDER BY id) AS rn
      FROM inventory_movements
    ) ranked
    WHERE ranked.id = m.id AND ranked.rn > 1;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_movements_reference_number
      ON inventory_movements(reference_number);
  `);

  await pool.query(`
    INSERT INTO inventory_categories (name, code)
    VALUES ('Semiconductors', 'SEM'), ('Raw Materials', 'RAW'), ('Finished Goods', 'FG')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO inventory_suppliers (name, contact_email, phone, location, rating)
    VALUES ('GigaDynamics Corp', 'supply@gigadynamics.example', '+1-555-0100', 'Silicon Valley, US', 4.90),
      ('Apex Materials', 'sales@apexmaterials.example', '+91-555-0120', 'Pune, IN', 4.60)
    ON CONFLICT (name) DO NOTHING;

    INSERT INTO inventory_warehouses (name, code, location, capacity_units)
    VALUES ('New Jersey Hub', 'NJ-HUB', 'New Jersey, US', 5000),
      ('Bengaluru Fulfillment', 'BLR-FC', 'Bengaluru, IN', 3600)
    ON CONFLICT (code) DO NOTHING;
  `);

  await seedInventoryData();

  inventorySchemaReady = true;
}

async function seedInventoryData() {
  const [productCount, stockCount, movementCount] = await Promise.all([
    pool.query("SELECT COUNT(*)::INTEGER AS count FROM inventory_products"),
    pool.query("SELECT COUNT(*)::INTEGER AS count FROM inventory_stock"),
    pool.query("SELECT COUNT(*)::INTEGER AS count FROM inventory_movements"),
  ]);

  if (Number(productCount.rows[0]?.count || 0) === 0) {
    await pool.query(`
    INSERT INTO inventory_products (sku, name, category_id, supplier_id, unit_cost, reorder_level)
    SELECT item.sku, item.name, c.id, s.id, item.unit_cost, item.reorder_level
    FROM (VALUES
      ('SKU-QCHIP-100', 'Quantum Control Chip', 'SEM', 'GigaDynamics Corp', 168.40, 80),
      ('SKU-COPPER-220', 'Grade-A Copper Spool', 'RAW', 'Apex Materials', 113.33, 120),
      ('SKU-HEAT-410', 'Heatsink Assembly', 'FG', 'GigaDynamics Corp', 41.67, 60),
      ('SKU-SENSOR-310', 'Industrial Sensor Pack', 'SEM', 'GigaDynamics Corp', 92.00, 50)
    ) AS item(sku, name, category_code, supplier_name, unit_cost, reorder_level)
    JOIN inventory_categories c ON c.code = item.category_code
    JOIN inventory_suppliers s ON s.name = item.supplier_name
    ON CONFLICT (sku) DO NOTHING;

    `);
  }

  if (Number(stockCount.rows[0]?.count || 0) === 0) {
    await pool.query(`
    INSERT INTO inventory_stock (product_id, warehouse_id, quantity, reserved_quantity)
    SELECT p.id, w.id,
      CASE
        WHEN p.sku = 'SKU-QCHIP-100' AND w.code = 'NJ-HUB' THEN 420
        WHEN p.sku = 'SKU-QCHIP-100' THEN 180
        WHEN p.sku = 'SKU-COPPER-220' AND w.code = 'NJ-HUB' THEN 90
        WHEN p.sku = 'SKU-COPPER-220' THEN 140
        WHEN p.sku = 'SKU-HEAT-410' THEN 260
        WHEN p.sku = 'SKU-SENSOR-310' THEN 35
        ELSE 75
      END,
      0
    FROM inventory_products p
    CROSS JOIN inventory_warehouses w
    ON CONFLICT (product_id, warehouse_id) DO NOTHING;
    `);
  }

  if (Number(movementCount.rows[0]?.count || 0) === 0) {
    await pool.query(`
    INSERT INTO inventory_movements
      (product_id, source_warehouse_id, destination_warehouse_id, movement_type, quantity, reference_number, movement_date, notes)
    SELECT p.id, NULL, w.id, 'RECEIPT', movement.quantity, movement.reference_number,
      CURRENT_DATE - movement.days_ago * INTERVAL '1 day', 'Initial ERP stock receipt'
    FROM (VALUES
      ('SKU-QCHIP-100', 'NJ-HUB', 140, 'INV-SEED-R-001', 13),
      ('SKU-COPPER-220', 'BLR-FC', 90, 'INV-SEED-R-002', 9),
      ('SKU-HEAT-410', 'NJ-HUB', 120, 'INV-SEED-R-003', 6),
      ('SKU-SENSOR-310', 'BLR-FC', 55, 'INV-SEED-R-004', 3)
    ) AS movement(sku, warehouse_code, quantity, reference_number, days_ago)
    JOIN inventory_products p ON p.sku = movement.sku
    JOIN inventory_warehouses w ON w.code = movement.warehouse_code
    ON CONFLICT (reference_number) DO NOTHING;

    INSERT INTO inventory_movements
      (product_id, source_warehouse_id, destination_warehouse_id, movement_type, quantity, reference_number, movement_date, notes)
    SELECT p.id, w.id, NULL, 'DISPATCH', movement.quantity, movement.reference_number,
      CURRENT_DATE - movement.days_ago * INTERVAL '1 day', 'Customer dispatch'
    FROM (VALUES
      ('SKU-QCHIP-100', 'NJ-HUB', 45, 'INV-SEED-D-001', 8),
      ('SKU-HEAT-410', 'BLR-FC', 30, 'INV-SEED-D-002', 5),
      ('SKU-SENSOR-310', 'BLR-FC', 20, 'INV-SEED-D-003', 2)
    ) AS movement(sku, warehouse_code, quantity, reference_number, days_ago)
    JOIN inventory_products p ON p.sku = movement.sku
    JOIN inventory_warehouses w ON w.code = movement.warehouse_code
    ON CONFLICT (reference_number) DO NOTHING;
    `);
  }
}

async function getInventoryDashboardData() {
  await ensureInventorySchema();

  const cardsQuery = pool.query(`
    SELECT
      COUNT(DISTINCT p.id)::INTEGER AS total_products,
      COALESCE(SUM(s.quantity * p.unit_cost), 0) AS inventory_value,
      COUNT(DISTINCT p.id) FILTER (WHERE COALESCE(stock_totals.total_quantity, 0) <= p.reorder_level AND COALESCE(stock_totals.total_quantity, 0) > 0)::INTEGER AS low_stock,
      COUNT(DISTINCT p.id) FILTER (WHERE COALESCE(stock_totals.total_quantity, 0) = 0)::INTEGER AS out_of_stock
    FROM inventory_products p
    LEFT JOIN inventory_stock s ON s.product_id = p.id
    LEFT JOIN (
      SELECT product_id, SUM(quantity) AS total_quantity
      FROM inventory_stock
      GROUP BY product_id
    ) stock_totals ON stock_totals.product_id = p.id
    WHERE p.is_active = TRUE
  `);

  const warehouseQuery = pool.query(`
    SELECT
      w.id,
      w.name,
      w.location,
      w.capacity_units AS "capacityUnits",
      COALESCE(SUM(s.quantity), 0)::INTEGER AS used,
      CASE
        WHEN w.capacity_units > 0 THEN ROUND((COALESCE(SUM(s.quantity), 0)::NUMERIC / w.capacity_units) * 100)
        ELSE 0
      END AS utilization
    FROM inventory_warehouses w
    LEFT JOIN inventory_stock s ON s.warehouse_id = w.id
    GROUP BY w.id
    ORDER BY utilization DESC
  `);

  const categoryQuery = pool.query(`
    SELECT c.name, COALESCE(SUM(s.quantity), 0)::INTEGER AS value
    FROM inventory_categories c
    LEFT JOIN inventory_products p ON p.category_id = c.id
    LEFT JOIN inventory_stock s ON s.product_id = p.id
    GROUP BY c.id, c.name
    ORDER BY c.name
  `);

  const trendQuery = pool.query(`
    WITH days AS (
      SELECT generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day')::date AS day
    )
    SELECT
      TO_CHAR(days.day, 'DD Mon') AS day,
      COALESCE(SUM(CASE WHEN m.movement_type = 'RECEIPT' THEN m.quantity ELSE 0 END), 0)::INTEGER AS receipts,
      COALESCE(SUM(CASE WHEN m.movement_type = 'DISPATCH' THEN m.quantity ELSE 0 END), 0)::INTEGER AS dispatches,
      COALESCE(SUM(CASE WHEN m.movement_type = 'TRANSFER' THEN m.quantity ELSE 0 END), 0)::INTEGER AS transfers
    FROM days
    LEFT JOIN inventory_movements m ON DATE_TRUNC('day', m.movement_date)::date = days.day
    GROUP BY days.day
    ORDER BY days.day
  `);

  const movementQuery = pool.query(`
    SELECT movement_type AS "movementType", COALESCE(SUM(quantity), 0)::INTEGER AS value
    FROM inventory_movements
    GROUP BY movement_type
    ORDER BY movement_type
  `);

  const [cardsResult, warehouseResult, categoryResult, trendResult, movementResult] =
    await Promise.all([cardsQuery, warehouseQuery, categoryQuery, trendQuery, movementQuery]);

  const cards = cardsResult.rows[0] || {};
  const warehouses = warehouseResult.rows.map((row) => ({
    ...row,
    capacityUnits: Number(row.capacityUnits || 0),
    used: Number(row.used || 0),
    utilization: Number(row.utilization || 0),
  }));
  const avgUtilization = warehouses.length
    ? Math.round(warehouses.reduce((sum, item) => sum + item.utilization, 0) / warehouses.length)
    : 0;

  return {
    cards: {
      totalProducts: Number(cards.total_products || 0),
      inventoryValue: Number(cards.inventory_value || 0),
      lowStock: Number(cards.low_stock || 0),
      outOfStock: Number(cards.out_of_stock || 0),
      warehouseUtilization: avgUtilization,
    },
    warehouses,
    categoryDistribution: categoryResult.rows.map((row) => ({
      name: row.name,
      value: Number(row.value || 0),
    })),
    inventoryTrend: trendResult.rows,
    stockMovement: movementResult.rows,
  };
}

async function listCategories() {
  await ensureInventorySchema();

  const result = await pool.query("SELECT id, name, code FROM inventory_categories ORDER BY name");
  return result.rows;
}

async function listSuppliers() {
  await ensureInventorySchema();

  const result = await pool.query(`
    SELECT id, name, contact_email AS "contactEmail", phone, location, rating
    FROM inventory_suppliers
    ORDER BY rating DESC, name
  `);
  return result.rows.map((row) => ({ ...row, rating: Number(row.rating || 0) }));
}

async function listWarehouses() {
  await ensureInventorySchema();

  const result = await pool.query(`
    SELECT id, name, code, location, capacity_units AS "capacityUnits"
    FROM inventory_warehouses
    ORDER BY name
  `);
  return result.rows;
}

async function listProducts(filters) {
  await ensureInventorySchema();

  const values = [];
  const conditions = ["p.is_active = TRUE"];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(p.sku ILIKE $${values.length} OR p.name ILIKE $${values.length})`);
  }

  if (filters.categoryId) {
    values.push(filters.categoryId);
    conditions.push(`p.category_id = $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countValues = [...values];
  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const dataQuery = pool.query(
    `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.unit_cost AS "unitCost",
      p.reorder_level AS "reorderLevel",
      c.name AS "categoryName",
      s.name AS "supplierName",
      COALESCE(SUM(st.quantity), 0)::INTEGER AS "totalStock",
      COALESCE(SUM(st.reserved_quantity), 0)::INTEGER AS "reservedStock"
    FROM inventory_products p
    LEFT JOIN inventory_categories c ON c.id = p.category_id
    LEFT JOIN inventory_suppliers s ON s.id = p.supplier_id
    LEFT JOIN inventory_stock st ON st.product_id = p.id
    ${whereClause}
    GROUP BY p.id, c.name, s.name
    ORDER BY p.created_at DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `,
    values
  );

  const countQuery = pool.query(
    `SELECT COUNT(*)::INTEGER AS total FROM inventory_products p ${whereClause}`,
    countValues
  );

  const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);
  const total = countResult.rows[0]?.total || 0;

  return {
    data: dataResult.rows.map((row) => ({
      ...row,
      unitCost: Number(row.unitCost || 0),
      totalStock: Number(row.totalStock || 0),
      reservedStock: Number(row.reservedStock || 0),
      stockStatus:
        Number(row.totalStock || 0) === 0
          ? "OUT_OF_STOCK"
          : Number(row.totalStock || 0) <= Number(row.reorderLevel || 0)
            ? "LOW_STOCK"
            : "HEALTHY",
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

async function createProduct(payload) {
  await ensureInventorySchema();

  const result = await pool.query(
    `
    INSERT INTO inventory_products
      (sku, name, category_id, supplier_id, unit_cost, reorder_level)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (sku)
    DO UPDATE SET
      name = EXCLUDED.name,
      category_id = EXCLUDED.category_id,
      supplier_id = EXCLUDED.supplier_id,
      unit_cost = EXCLUDED.unit_cost,
      reorder_level = EXCLUDED.reorder_level,
      is_active = TRUE,
      updated_at = NOW()
    RETURNING id
    `,
    [
      payload.sku,
      payload.name,
      payload.categoryId,
      payload.supplierId,
      payload.unitCost,
      payload.reorderLevel,
    ]
  );
  return result.rows[0];
}

async function getLowStockAlerts() {
  await ensureInventorySchema();

  const result = await pool.query(`
    SELECT p.id, p.sku, p.name, p.reorder_level AS "reorderLevel",
      COALESCE(SUM(s.quantity), 0)::INTEGER AS "totalStock"
    FROM inventory_products p
    LEFT JOIN inventory_stock s ON s.product_id = p.id
    WHERE p.is_active = TRUE
    GROUP BY p.id
    HAVING COALESCE(SUM(s.quantity), 0) <= p.reorder_level
    ORDER BY "totalStock" ASC
  `);
  return result.rows;
}

async function createMovement(payload) {
  await ensureInventorySchema();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO inventory_movements
        (product_id, source_warehouse_id, destination_warehouse_id, movement_type, quantity, reference_number, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (reference_number) DO NOTHING
      RETURNING id
      `,
      [
        payload.productId,
        payload.sourceWarehouseId,
        payload.destinationWarehouseId,
        payload.movementType,
        payload.quantity,
        payload.referenceNumber,
        payload.notes,
      ]
    );

    if (!result.rows.length) {
      await client.query("COMMIT");
      return { duplicate: true, referenceNumber: payload.referenceNumber };
    }

    if (payload.movementType === "RECEIPT") {
      await upsertStock(client, payload.productId, payload.destinationWarehouseId, payload.quantity);
    }

    if (payload.movementType === "DISPATCH") {
      await decrementStock(client, payload.productId, payload.sourceWarehouseId, payload.quantity);
    }

    if (payload.movementType === "TRANSFER") {
      await decrementStock(client, payload.productId, payload.sourceWarehouseId, payload.quantity);
      await upsertStock(client, payload.productId, payload.destinationWarehouseId, payload.quantity);
    }

    if (payload.movementType === "ADJUSTMENT") {
      await upsertStock(client, payload.productId, payload.destinationWarehouseId || payload.sourceWarehouseId, payload.quantity);
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

async function upsertStock(client, productId, warehouseId, quantity) {
  await client.query(
    `
    INSERT INTO inventory_stock (product_id, warehouse_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (product_id, warehouse_id)
    DO UPDATE SET quantity = inventory_stock.quantity + EXCLUDED.quantity, updated_at = NOW()
    `,
    [productId, warehouseId, quantity]
  );
}

async function decrementStock(client, productId, warehouseId, quantity) {
  const result = await client.query(
    `
    UPDATE inventory_stock
    SET quantity = quantity - $1, updated_at = NOW()
    WHERE product_id = $2 AND warehouse_id = $3 AND quantity >= $1
    RETURNING id
    `,
    [quantity, productId, warehouseId]
  );

  if (!result.rows.length) {
    const error = new Error("Insufficient stock for movement");
    error.statusCode = 400;
    throw error;
  }
}

async function listMovements() {
  await ensureInventorySchema();

  const result = await pool.query(`
    SELECT
      m.id,
      m.movement_type AS "movementType",
      m.quantity,
      m.reference_number AS "referenceNumber",
      m.notes,
      m.movement_date AS "movementDate",
      p.sku,
      p.name AS "productName",
      sw.name AS "sourceWarehouse",
      dw.name AS "destinationWarehouse"
    FROM inventory_movements m
    JOIN inventory_products p ON p.id = m.product_id
    LEFT JOIN inventory_warehouses sw ON sw.id = m.source_warehouse_id
    LEFT JOIN inventory_warehouses dw ON dw.id = m.destination_warehouse_id
    ORDER BY m.movement_date DESC
    LIMIT 30
  `);
  return result.rows;
}

module.exports = {
  createMovement,
  createProduct,
  getInventoryDashboardData,
  getLowStockAlerts,
  listCategories,
  listMovements,
  listProducts,
  listSuppliers,
  listWarehouses,
};
