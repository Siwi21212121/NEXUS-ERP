# Inventory Module API

Base path: `/api/inventory`

Authentication: `Authorization: Bearer <JWT>`

Allowed roles: `OWNER`, `PROJECT_MANAGER`

## Migration

Run:

```sql
\i backend/src/migrations/003_inventory_module.sql
```

Creates normalized inventory tables:

- `inventory_categories`
- `inventory_suppliers`
- `inventory_warehouses`
- `inventory_products`
- `inventory_stock`
- `inventory_movements`

## Dashboard

- `GET /dashboard`

Returns total products, inventory value, low stock, out of stock, warehouse utilization, inventory trend, category distribution, stock movement, and warehouse utilization.

## Products

- `GET /products?page=1&limit=10&search=&categoryId=`
- `POST /products`

## Master Data

- `GET /categories`
- `GET /warehouses`
- `GET /suppliers`

## Alerts

- `GET /alerts/low-stock`

## Stock Movement

- `GET /movements`
- `POST /movements`

Movement body:

```json
{
  "productId": 1,
  "sourceWarehouseId": 1,
  "destinationWarehouseId": 2,
  "movementType": "TRANSFER",
  "quantity": 50,
  "referenceNumber": "TRF-2026-010",
  "notes": "Hub balancing transfer"
}
```

Movement types:

- `RECEIPT`
- `DISPATCH`
- `TRANSFER`
- `ADJUSTMENT`

## Docs

- `GET /docs`
