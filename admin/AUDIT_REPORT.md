# Admin Panel Audit Report
**Date:** 2026-03-23
**Project:** Housely
**Status:** Greenfield — no prior admin panel existed

---

## Summary

No admin panel existed in the repository prior to this feature branch. This document serves as the **planning audit** — it maps the existing backend API capabilities to proposed admin features, identifies gaps, and defines the security model.

---

## Proposed Admin Features

### 1. Dashboard
KPI cards sourced from `GET /api/admin/stats`:
- Total registered users
- Total property listings
- Total video uploads
- Total bookings this month

### 2. Video Management
Source: `GET /api/videos` (with admin visibility into all statuses)

| Column | Source |
|--------|--------|
| Thumbnail | `Video.thumbnailUrl` |
| Title | `Video.title` |
| Uploader | `Video.uploader.username` |
| Duration | `Video.duration` |
| Views | `Video.viewCount` |
| Status | `Video.status` badge (PROCESSING/PUBLISHED/ARCHIVED) |
| Date | `Video.createdAt` |
| Actions | Delete, change visibility |

Status badge colors:
- `PROCESSING` → yellow `#f59e0b`
- `PUBLISHED` → green `#10b981`
- `ARCHIVED` → gray `#6b7280`

### 3. User Management
Source: `GET /api/admin/users` *(new endpoint — see API gaps below)*

| Column | Source |
|--------|--------|
| Avatar | `User.avatar` |
| Username | `User.username` |
| Email | `User.email` |
| Role | `User.role` (USER/AGENT/ADMIN) |
| Verified | `User.isVerified` |
| Joined | `User.createdAt` |
| Actions | Change role |

### 4. Booking Management
Source: `GET /api/bookings/agent/all` (accessible with ADMIN role)

| Column | Source |
|--------|--------|
| ID | `Booking.id` (truncated) |
| User | `Booking.user.username` |
| Property | `Booking.house.name` |
| Check-in | `Booking.checkIn` |
| Check-out | `Booking.checkOut` |
| Amount | `Booking.totalAmount` |
| Status | `Booking.status` badge |
| Actions | Update status |

---

## Backend API Gaps

The following endpoints do not exist and must be added:

| Endpoint | Module | Description |
|----------|--------|-------------|
| `GET /api/admin/users` | `user.routes.js` | Paginated user list with optional role filter. Requires `ADMIN` role. |
| `GET /api/admin/stats` | `app.js` (inline) | KPI aggregation: counts of users, houses, videos, bookings this month. Requires `ADMIN` role. |

Both gaps are addressed in **Step 4** of the implementation plan.

---

## Security Model

All admin panel API calls must:
1. Include `Authorization: Bearer <token>` header
2. The JWT payload must contain `role: "ADMIN"`
3. Backend `requireRole('ADMIN')` middleware enforces this on all admin endpoints
4. Admin SPA stores token in `localStorage` — acceptable for internal tool (not public-facing)
5. Token expiry: 15 minutes (JWT_ACCESS_EXPIRES_IN) — admin must re-login after expiry

### Admin login flow
1. Admin logs in via `POST /api/auth/login` with email + password
2. Backend returns `{ accessToken, refreshToken, user }`
3. Admin SPA checks `user.role === 'ADMIN'` before storing token
4. Non-admin users who successfully authenticate are rejected at the SPA level with an "Access denied" message

---

## Outdated/Missing UI Patterns (to implement)

Since this is a greenfield build, we define best practices upfront:

| Pattern | Implementation |
|---------|---------------|
| Data tables | Generic `DataTable` component — sortable, paginated |
| Loading states | Skeleton screens (not spinners) |
| Destructive actions | `ConfirmModal` with "Type to confirm" pattern |
| Error feedback | Toast notifications (not browser `alert()`) |
| Empty states | Illustrated empty state with action CTA |
| Responsive layout | Collapsible sidebar below 768px breakpoint |

---

## Tech Stack Decision

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18 + Vite 5 | Fastest dev iteration, no SSR needed for internal tool |
| Styling | TailwindCSS 3 | Familiar from mobile (NativeWind), fast utility styling |
| Routing | React Router v6 | Standard SPA routing |
| Data fetching | TanStack React Query v5 | Caching, background refetch, loading/error states |
| State | Zustand | Same as mobile — consistent team knowledge |
| Icons | Lucide React | Lightweight, consistent set |
| Charts | Recharts (future sprint) | When analytics are added |

---

## Design Tokens

```css
--sidebar-bg:    #1a1a2e;
--accent:        #4361ee;
--accent-hover:  #3451d1;
--surface-light: #ffffff;
--surface-dark:  #0f0f23;
--success:       #10b981;
--warning:       #f59e0b;
--danger:        #ef4444;
--text-primary:  #111827;
--text-muted:    #6b7280;
--border:        #e5e7eb;
```

---

## Files Produced by This Audit

This audit directly informs the following files created in Step 6:
- `admin/src/pages/DashboardPage.jsx`
- `admin/src/pages/VideosPage.jsx`
- `admin/src/pages/UsersPage.jsx`
- `admin/src/pages/BookingsPage.jsx`
- `admin/src/components/DataTable.jsx`
- `admin/src/components/ConfirmModal.jsx`
