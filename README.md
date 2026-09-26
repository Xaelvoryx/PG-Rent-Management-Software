# PG Rent Manager — Production Desktop Application

A simple, reliable, extremely easy-to-use Paying Guest (PG) rental management desktop application for PG owners and managers.

![PG Rent Manager](https://img.shields.io/badge/PG%20Rent%20Manager-v1.0.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.4-red)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Prisma](https://img.shields.io/badge/Prisma-5.21-emerald)

---

## 🌟 Key Modules & Features

- **Dashboard**: Instant visibility into expected, collected, pending, and overdue rent totals + collection progress indicator.
- **Tenant Management**: Full tenant records (room/bed, emergency contacts, joining/checkout dates, monthly rent, deposit) with soft-deletion archival.
- **Rent Engine**: Automatic monthly rent record generation, deterministic status calculator (`PAID`, `PARTIAL`, `OVERDUE`, `PENDING`, `UPCOMING`, `WAIVED`).
- **Payment & Receipts**: Full & partial payment tracking, unique sequential receipt generation (`PG-2026-000001`), in-app receipt viewer, printable view & downloadable PDF receipts.
- **Rent Calendar**: Visual month view with daily payment activity & rent due tracking, date-range activity query tools.
- **WhatsApp Automation**: Editable message templates with variable substitution (`{{tenantName}}`, `{{amount}}`, `{{dueDate}}`), mock simulation & production Meta API architecture, duplicate reminder safeguards.
- **Reports & Data Export**: Monthly Rent Report, Daily Collection Report, Tenant Payment History, custom date range reports, 1-click CSV download & print support.
- **Settings & Backup**: PG property configuration, 1-click full database JSON backup export & restore engine with modal verification.

---

## 🚀 Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, Lucide Icons, Axios.
- **Backend**: NestJS 10, TypeScript, Validation Pipes, PDFKit.
- **Database**: PostgreSQL 18 (`pgrent`), Prisma ORM 5 with NUMERIC decimal financial precision.
- **Desktop Packaging**: Tauri / Electron desktop shell wrapper for Windows (`PG-Rent-Manager-Setup.exe`).

---

## 💻 Local Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (v22.14.0 recommended)
- **PostgreSQL**: v14+ (v18 running on `localhost:5432`)

### 1. Database Setup
```bash
# Database name: pgrent
# Default connection string in .env:
# postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/pgrent?schema=public
```

### 2. Install & Seed
```bash
# In backend folder
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 3. Run Development Servers
```bash
# Run backend (Port 4000)
npm run start:dev --workspace=backend

# Run frontend (Port 3000)
npm run dev --workspace=frontend
```

Open your browser at `http://localhost:3000` or launch the desktop application shell.

---

## 🧪 Testing

```bash
# Run Backend Unit Tests
npm run test --workspace=backend

# Run E2E Test Suite
npx playwright test
```
