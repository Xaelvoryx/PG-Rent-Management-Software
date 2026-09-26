# Architecture & System Design — PG Rent Manager

## 🏛️ High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Desktop Application Shell                      │
│                    (Tauri / Electron)                       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│  Next.js 15 Frontend         ││  NestJS 10 REST API         │
│  App Router (Port 3000)      ││  Backend Server (Port 4000) │
│  - React 19 UI System        ││  - Financial Rent Engine    │
│  - Tailwind CSS              ││  - WhatsApp Mock & Prod API │
│  - Interactive Modals        ││  - PDF Receipt Generator    │
│  - CSV Export Engine         ││  - JSON Backup & Restore    │
└──────────────────────────────┘└──────────────┬──────────────┘
                                               │
                                               ▼
                               ┌──────────────────────────────┐
                               │  PostgreSQL 18 Database      │
                               │  Database Name: `pgrent`     │
                               │  - Prisma ORM 5.21           │
                               │  - NUMERIC Decimal Precision │
                               └──────────────────────────────┘
```

## 🔐 Core Engineering Principles

1. **Financial Integrity**: Money is represented strictly as PostgreSQL `DECIMAL(10,2)` / Prisma `Decimal` types. Floating-point arithmetic is prohibited.
2. **Deterministic Status Calculation**: Rent status (`PAID`, `PARTIAL`, `OVERDUE`, `PENDING`, `UPCOMING`, `WAIVED`) is dynamically derived from rent amount, total payments, due date, and current date.
3. **Idempotency**: Monthly rent generation uses unique compound constraints `[tenantId, rentMonth]` to prevent duplicate records.
4. **Soft Deletion & Audit Trail**: Tenants are archived rather than permanently deleted, ensuring historical financial records remain intact.
