# ClarioNex ERP AI Executive Copilot API

All endpoints require `Authorization: Bearer <token>`.

## POST /api/ai/ask

Classifies the question, checks role permissions, executes predefined parameterized SQL, runs analytics, and returns a formatted executive answer.

```json
{
  "question": "How much revenue this month?"
}
```

## GET /api/ai/business-health

Returns business health score, KPI snapshot, and chart-ready data generated from PostgreSQL-backed ERP modules.

## GET /api/ai/history?limit=20

Returns recent Copilot interactions for the current user's role.

## GET /api/ai/suggested-prompts

Returns approved quick prompts.

## POST /api/ai/report

Returns a structured executive report with sections for revenue, expenses, profit, inventory, employees, procurement, risks, recommendations, and chart data.

## GET /api/ai/report.pdf

Returns a downloadable PDF executive report.

## Safety

- No raw SQL is generated from user prompts.
- Intent detection is deterministic.
- Every query is selected from a predefined SQL catalog.
- SQL values are parameterized.
- Role access is checked before query execution.
- Repeated requests are cached briefly to reduce database load.
