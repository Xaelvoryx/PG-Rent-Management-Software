# Testing & Quality Assurance — PG Rent Manager

## 1. Backend Unit Tests
Unit tests cover status calculations, partial payments, financial precision, and rent generation logic.

```bash
cd backend
npm run test
```

Result: **5/5 Passed**

## 2. E2E Playwright User Journey Test
The Playwright E2E test suite validates the 30-step user journey from launching the application, adding a tenant, generating rent, recording partial & full payments, viewing printable receipts, navigating the calendar, testing WhatsApp reminders, generating reports, and performing database backups.

```bash
npx playwright test
```
