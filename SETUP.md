# Housely — Developer Setup Guide

Get up and running in under 5 minutes.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.x | https://nodejs.org |
| npm | 10.x+ | Included with Node |
| Git | any | https://git-scm.com |
| Expo Go | latest | App Store / Play Store |
| Docker | any (optional) | For local PostgreSQL only |

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd Housely

# Install backend dependencies
npm --prefix backend install

# Install mobile dependencies
npm --prefix mobile install

# Install admin panel dependencies (optional)
npm --prefix admin install
```

---

## 2. Set Up Environment Variables

```bash
# Copy the template
cp .env.example backend/.env
```

Now open `backend/.env` and fill in the real values. Your teammate can send you the actual file via WhatsApp/Telegram — **do not put it in Git**.

### Where to get each credential

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Neon → neon.tech → your project → Connection Details → Prisma string |
| `DIRECT_URL` | Same as above — use the "Direct connection" string |
| `CLOUDINARY_CLOUD_NAME` | cloudinary.com → Dashboard |
| `CLOUDINARY_API_KEY` | cloudinary.com → Dashboard |
| `CLOUDINARY_API_SECRET` | cloudinary.com → Dashboard → Show secret |
| `JWT_ACCESS_SECRET` | Generate: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate: `openssl rand -hex 32` |

---

## 3. Database Setup

### Option A: Neon (shared cloud — recommended for team)

If your `DATABASE_URL` points to Neon, no local setup needed. Just run:

```bash
cd backend
npx prisma generate
npx prisma db push
```

**Neon IP whitelist:** If you get a "can't reach database server" error:
1. Go to neon.tech → your project → Settings → IP Allow
2. Add `0.0.0.0/0` to allow all IPs (dev only)

### Option B: Local Docker PostgreSQL

```bash
# Start local DB
docker-compose up -d

# Then run migrations
cd backend
npx prisma generate
npx prisma db push
```

---

## 4. Verify DB Connection

```bash
npm --prefix backend run db:check
```

You should see: `✅ DB Connected!`

If you see an error, check the troubleshooting section below.

---

## 5. Run the App

### Backend API
```bash
npm --prefix backend run dev
# Runs on http://localhost:3000
# Swagger docs: http://localhost:3000/api-docs
# Health check: http://localhost:3000/api/health
```

### Mobile App
```bash
npm --prefix mobile start
# Scan the QR code with Expo Go on your phone
```

### Admin Panel (optional)
```bash
npm --prefix admin run dev
# Opens at http://localhost:5173
# Log in with an ADMIN role account
```

---

## 6. Cloudinary Setup (for video uploads)

1. Go to cloudinary.com → Log in
2. Dashboard shows your `Cloud Name`, `API Key`, and `API Secret`
3. Settings → Security → ensure video uploads are **not** restricted
4. No IP restrictions needed — Cloudinary works from any IP

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Can't reach database server` | IP not whitelisted in Neon | neon.tech → Settings → IP Allow → add `0.0.0.0/0` |
| `SSL connection required` | Missing SSL param | Add `?sslmode=require` to both DB URLs in `.env` |
| `Connection timeout` | Pooler issue | Use `DIRECT_URL` instead — add `?connect_timeout=30` |
| `Cloudinary upload failed` | Wrong credentials | Double-check `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` |
| `prisma: command not found` | Prisma not installed | Run `npm --prefix backend install` |
| `expo: command not found` | Expo CLI not installed | Run `npm install -g expo-cli` |
| `Invalid JWT secret` | Short secret | Use `openssl rand -hex 32` to generate a proper secret |
| `Module not found` | Missing packages | Run `npm --prefix backend install` or `npm --prefix mobile install` |

---

## Project Structure

```
Housely/
├── backend/          # Express.js API (Node 20 + Prisma + PostgreSQL)
├── mobile/           # React Native app (Expo 54 + Expo Router)
├── admin/            # Admin panel SPA (React + Vite + Tailwind)
├── .env.example      # Environment template (safe to commit)
├── SETUP.md          # This file
└── README.md         # Full project documentation
```

---

## Common Commands

```bash
# Check DB connection
npm --prefix backend run db:check

# Push schema changes to DB
npm --prefix backend run db:push

# Open Prisma Studio (visual DB browser)
npm --prefix backend run db:studio

# Run backend tests
npm --prefix backend test

# Seed the database
npm --prefix backend run db:seed
```
