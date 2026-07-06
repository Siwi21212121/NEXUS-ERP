# Finance Module API

Base path: `/api/finance`

Authentication: `Authorization: Bearer <JWT>`

Allowed roles: `OWNER`, `FINANCE_MANAGER`

## Database Migration

Run:

```sql
\i backend/src/migrations/001_finance_module.sql
```

The migration creates:

- `finance_transactions`
- `finance_budgets`
- `module_notifications`

It also inserts dummy seed data for dashboard cards, charts, transaction tables, and notifications.
It also creates and seeds invoices and payments.

## GET /dashboard

Returns database-backed dashboard data.

Response:

```json
{
  "success": true,
  "dashboard": "Finance Dashboard",
  "accessBy": "FINANCE_MANAGER",
  "data": {
    "cards": {
      "todaysRevenue": 0,
      "monthlyRevenue": 870000,
      "totalRevenue": 4572000,
      "totalExpenses": 701000,
      "netProfit": 3871000,
      "pendingPayments": 260000,
      "outstandingReceivables": 534500,
      "accountsPayable": 378000,
      "approvedBudgets": 3,
      "budgetUtilization": 67
    },
    "revenueTrend": [
      { "month": "JAN", "revenue": 682000, "expenses": 205000 }
    ],
    "expenseBreakdown": [],
    "cashFlow": [],
    "categoryAnalysis": []
  }
}
```

## GET /transactions

Returns paginated transaction records.

Query parameters:

- `page`: number, default `1`
- `limit`: number, default `10`, max `50`
- `search`: transaction number, counterparty, or category
- `status`: `PAID`, `PENDING`, `OVERDUE`, `APPROVED`, `DRAFT`
- `type`: `REVENUE`, `EXPENSE`, `RECEIVABLE`, `PAYABLE`

## POST /transactions

Creates a finance transaction.

Request body:

```json
{
  "transactionNumber": "INV-2026-1100",
  "counterparty": "Acme Enterprise",
  "transactionType": "RECEIVABLE",
  "status": "PENDING",
  "category": "Services",
  "amount": 125000,
  "transactionDate": "2026-06-27",
  "dueDate": "2026-07-15",
  "notes": "Implementation milestone"
}
```

## GET /notifications

Returns recent finance notifications.

## Budgets

- `GET /budgets`
- `POST /budgets`

## Invoices

- `GET /invoices`
- `POST /invoices`

## Payments

- `GET /payments`
- `POST /payments`

## Statements

- `GET /profit-loss`
- `GET /cash-flow`

## GET /docs

Returns machine-readable documentation for this API.
