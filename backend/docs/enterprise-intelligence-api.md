# Enterprise Intelligence API

All endpoints require `Authorization: Bearer <token>`.

## GET /api/intelligence/:module

Supported modules:

- `executive`
- `analytics`
- `finance`
- `hr`
- `inventory`
- `procurement`
- `crm`

Returns dashboard summary, observations, KPI explanations, forecasts, risks, opportunities, recommendations, alerts, business health, report metadata, and learning signals.

## POST /api/intelligence/:module/simulate

Runs a read-only what-if simulation against current PostgreSQL-backed module context.

```json
{
  "scenario": "What happens if expenses increase by 15%?"
}
```

The simulation never mutates production tables.

## Architecture

The service runs:

Context Engine -> Observation Engine -> KPI Analyzer -> Prediction Engine -> Risk Intelligence Engine -> Opportunity Engine -> Business Health Engine -> Explainability Engine -> Alert Engine -> Recommendation Engine -> Report Generator -> Learning Engine.

All outputs are derived from existing ERP services and PostgreSQL data.
