# Database Schema Documentation — PG Rent Manager

Database Engine: PostgreSQL 18
Database Name: `pgrent`
ORM: Prisma 5.21

## Models Overview

### 1. `Property`
Stores PG property profile, contact info, and branding.
- `id`: UUID (Primary Key)
- `name`: String
- `address`: String
- `phone`: String
- `email`: String

### 2. `Tenant`
Stores tenant profile and bed allocation.
- `id`: UUID (Primary Key)
- `fullName`: String
- `phone`: String
- `roomNumber`: String
- `monthlyRent`: Decimal (10,2)
- `depositAmount`: Decimal (10,2)
- `status`: Enum (`ACTIVE`, `NOTICE_PERIOD`, `CHECKED_OUT`, `ARCHIVED`)

### 3. `Rent`
Monthly rent records.
- `id`: UUID (Primary Key)
- `tenantId`: Foreign Key -> `Tenant.id`
- `rentMonth`: String ("YYYY-MM")
- `amount`: Decimal (10,2)
- `paidAmount`: Decimal (10,2)
- `remainingAmount`: Decimal (10,2)
- `status`: Enum (`UPCOMING`, `PENDING`, `PARTIAL`, `PAID`, `OVERDUE`, `WAIVED`)
- **Unique Constraint**: `[tenantId, rentMonth]`

### 4. `Payment`
Payment transactions.
- `id`: UUID (Primary Key)
- `tenantId`: Foreign Key -> `Tenant.id`
- `rentId`: Foreign Key -> `Rent.id`
- `amount`: Decimal (10,2)
- `paymentMethod`: Enum (`UPI`, `CASH`, `BANK_TRANSFER`, `CARD`, `OTHER`)
- `paymentDate`: DateTime

### 5. `Receipt`
Generated payment receipts.
- `id`: UUID (Primary Key)
- `receiptNumber`: String (Unique, format `PG-YYYY-000001`)
- `paymentId`: Foreign Key -> `Payment.id` (Unique)

### 6. `WhatsAppMessage` & `MessageTemplate`
WhatsApp reminder logs and editable message templates.

### 7. `ApplicationSetting` & `AuditLog`
Application key-value configuration and administrative action logs.
