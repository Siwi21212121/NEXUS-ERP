-- Inventory module schema and seed data for ClarioNex ERP.

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

CREATE INDEX IF NOT EXISTS idx_inventory_products_category ON inventory_products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_product ON inventory_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_warehouse ON inventory_stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date DESC);

INSERT INTO inventory_categories (name, code)
VALUES
  ('Semiconductors', 'SEM'),
  ('Raw Materials', 'RAW'),
  ('Packaging', 'PKG'),
  ('Finished Goods', 'FG'),
  ('Maintenance', 'MRO')
ON CONFLICT (code) DO NOTHING;

INSERT INTO inventory_suppliers (name, contact_email, phone, location, rating)
VALUES
  ('GigaDynamics Corp', 'supply@gigadynamics.example', '+1-555-0100', 'Silicon Valley, US', 4.90),
  ('NeoLogistics Ltd', 'ops@neologistics.example', '+49-555-0110', 'Berlin, DE', 4.40),
  ('Apex Materials', 'sales@apexmaterials.example', '+91-555-0120', 'Pune, IN', 4.60)
ON CONFLICT (name) DO NOTHING;

INSERT INTO inventory_warehouses (name, code, location, capacity_units)
VALUES
  ('New Jersey Hub', 'NJ-HUB', 'New Jersey, US', 5000),
  ('Los Angeles Hub', 'LA-HUB', 'Los Angeles, US', 4200),
  ('Bengaluru Fulfillment', 'BLR-FC', 'Bengaluru, IN', 3600)
ON CONFLICT (code) DO NOTHING;

INSERT INTO inventory_products (sku, name, category_id, supplier_id, unit_cost, reorder_level)
SELECT 'SKU-990', 'Quantum Chips', c.id, s.id, 168.40, 700
FROM inventory_categories c CROSS JOIN inventory_suppliers s
WHERE c.code = 'SEM' AND s.name = 'GigaDynamics Corp'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory_products (sku, name, category_id, supplier_id, unit_cost, reorder_level)
SELECT 'SKU-431', 'Heatsink Assembly', c.id, s.id, 24.50, 250
FROM inventory_categories c CROSS JOIN inventory_suppliers s
WHERE c.code = 'MRO' AND s.name = 'NeoLogistics Ltd'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory_products (sku, name, category_id, supplier_id, unit_cost, reorder_level)
SELECT 'SKU-221', 'Grade-A Copper', c.id, s.id, 72.10, 400
FROM inventory_categories c CROSS JOIN inventory_suppliers s
WHERE c.code = 'RAW' AND s.name = 'Apex Materials'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory_products (sku, name, category_id, supplier_id, unit_cost, reorder_level)
SELECT 'SKU-778', 'Retail Sensor Kit', c.id, s.id, 112.00, 150
FROM inventory_categories c CROSS JOIN inventory_suppliers s
WHERE c.code = 'FG' AND s.name = 'GigaDynamics Corp'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO inventory_stock (product_id, warehouse_id, quantity, reserved_quantity)
SELECT p.id, w.id, 620, 90 FROM inventory_products p CROSS JOIN inventory_warehouses w
WHERE p.sku = 'SKU-990' AND w.code = 'NJ-HUB'
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

INSERT INTO inventory_stock (product_id, warehouse_id, quantity, reserved_quantity)
SELECT p.id, w.id, 1400, 180 FROM inventory_products p CROSS JOIN inventory_warehouses w
WHERE p.sku = 'SKU-431' AND w.code = 'LA-HUB'
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

INSERT INTO inventory_stock (product_id, warehouse_id, quantity, reserved_quantity)
SELECT p.id, w.id, 960, 120 FROM inventory_products p CROSS JOIN inventory_warehouses w
WHERE p.sku = 'SKU-221' AND w.code = 'BLR-FC'
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

INSERT INTO inventory_stock (product_id, warehouse_id, quantity, reserved_quantity)
SELECT p.id, w.id, 0, 0 FROM inventory_products p CROSS JOIN inventory_warehouses w
WHERE p.sku = 'SKU-778' AND w.code = 'NJ-HUB'
ON CONFLICT (product_id, warehouse_id) DO NOTHING;

INSERT INTO inventory_movements
  (product_id, destination_warehouse_id, movement_type, quantity, reference_number, notes, movement_date)
SELECT p.id, w.id, 'RECEIPT', 500, 'GRN-2026-001', 'Initial supplier receipt', NOW() - INTERVAL '5 days'
FROM inventory_products p CROSS JOIN inventory_warehouses w
WHERE p.sku = 'SKU-990' AND w.code = 'NJ-HUB'
ON CONFLICT DO NOTHING;

INSERT INTO inventory_movements
  (product_id, source_warehouse_id, movement_type, quantity, reference_number, notes, movement_date)
SELECT p.id, w.id, 'DISPATCH', 120, 'DSP-2026-001', 'Customer dispatch', NOW() - INTERVAL '3 days'
FROM inventory_products p CROSS JOIN inventory_warehouses w
WHERE p.sku = 'SKU-431' AND w.code = 'LA-HUB'
ON CONFLICT DO NOTHING;

INSERT INTO inventory_movements
  (product_id, source_warehouse_id, destination_warehouse_id, movement_type, quantity, reference_number, notes, movement_date)
SELECT p.id, sw.id, dw.id, 'TRANSFER', 180, 'TRF-2026-001', 'Hub balancing transfer', NOW() - INTERVAL '1 day'
FROM inventory_products p
CROSS JOIN inventory_warehouses sw
CROSS JOIN inventory_warehouses dw
WHERE p.sku = 'SKU-221' AND sw.code = 'BLR-FC' AND dw.code = 'NJ-HUB'
ON CONFLICT DO NOTHING;
