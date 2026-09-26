# Troubleshooting Guide — PG Rent Manager

## Common Issues & Solutions

### 1. PostgreSQL Connection Error (`FATAL: password authentication failed`)
- Check `.env` and `backend/.env` files.
- Verify PostgreSQL service `postgresql-x64-18` is running on port 5432.
- Test connection with psql:
```bash
psql -U postgres -h 127.0.0.1 -d pgrent
```

### 2. Prisma Client Out of Sync
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. API Port 4000 Already in Use
- Change `PORT=4000` in `.env` to another port (e.g. `PORT=4001`) and update `NEXT_PUBLIC_API_URL` in `frontend/next.config.js`.

### 4. WhatsApp Duplicate Reminder Blocked
- The application automatically safeguards against sending identical WhatsApp reminders within 12 hours. Wait 12 hours or test with another message template.
