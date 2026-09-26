# REST API Documentation — PG Rent Manager

Base URL: `http://localhost:4000/api`

## Endpoints Summary

### Health
- `GET /health` — Check API & PostgreSQL DB connectivity

### Dashboard
- `GET /dashboard/summary?rentMonth=2026-09` — Fetch cards stats, progress %, today's payments & overdue list

### Tenants
- `GET /tenants` — List tenants (supports `search`, `status`, `roomNumber`)
- `GET /tenants/:id` — Fetch single tenant
- `GET /tenants/:id/history` — Fetch tenant rent & payment ledger history
- `POST /tenants` — Add new tenant
- `PATCH /tenants/:id` — Update tenant profile
- `DELETE /tenants/:id` — Soft-delete / archive tenant

### Rents
- `GET /rents` — List rent records
- `POST /rents/generate` — Auto-generate monthly rent for active tenants
- `PATCH /rents/:id` — Update rent record
- `POST /rents/:id/waive` — Waive rent with reason

### Payments
- `GET /payments` — List payment transactions
- `POST /payments` — Record payment & auto-generate receipt
- `GET /payments/:id` — Fetch single payment record

### Receipts
- `GET /receipts` — List receipts
- `GET /receipts/:id/pdf` — Stream PDF receipt

### Calendar
- `GET /calendar/month?year=2026&month=9` — Monthly daily activity grid
- `GET /calendar/range?startDate=2026-09-01&endDate=2026-09-15` — Date range summary

### WhatsApp
- `GET /whatsapp/templates` — List message templates
- `PATCH /whatsapp/templates/:type` — Update template content
- `POST /whatsapp/send` — Send / simulate WhatsApp reminder
- `GET /whatsapp/messages` — List communication history

### Reports
- `GET /reports/monthly` — Monthly rent report
- `GET /reports/monthly/csv` — Export monthly report CSV
- `GET /reports/daily` — Daily collection report
- `GET /reports/daily/csv` — Export daily collection CSV

### Settings
- `GET /settings/property` — Fetch PG profile
- `PATCH /settings/property` — Update PG profile
- `GET /settings/backup` — Download JSON database backup
- `POST /settings/restore` — Restore database from JSON
