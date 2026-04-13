# Housely API — Testing Report

**Prepared by:** Shakhoyat (skt)
**Branch:** `skt/features`
**Test Date:** March 8, 2026
**Base URL (local):** `http://localhost:3000`

---

## Table of Contents

1. [Test Credentials](#test-credentials)
2. [Environment Setup](#environment-setup)
3. [Bugs Found & Fixed](#bugs-found--fixed)
4. [Postman Collection Fixes Required](#postman-collection-fixes-required)
5. [Endpoint Test Results](#endpoint-test-results)
6. [Pre-Integration Checklist](#pre-integration-checklist)

---

## Test Credentials

| Role  | Email             | Password    |
|-------|-------------------|-------------|
| User  | user@test.com     | password123 |
| Agent | agent@test.com    | password123 |
| Admin | admin@test.com    | password123 |

---

## Environment Setup

The following variables must be present in `backend/.env`:

```env
DATABASE_URL=postgresql://housely:housely123@localhost:5432/housely
REDIS_URL=redis://localhost:6379
JWT_SECRET=<your_secret>
JWT_REFRESH_SECRET=<your_secret>
APP_URL=http://localhost:3000
FRONTEND_DEEP_LINK_BASE=housely://house

# Email (required for forgot-password flow)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Services required (Docker):
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

Start with:
```bash
docker-compose up -d
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

---

## Bugs Found & Fixed

Three bugs were identified and fixed during testing. All fixes are committed to `skt/features`.

---

### Bug 1 — Prisma Pagination Crash (Critical)

**Problem:** `page` and `limit` query parameters arrive as strings from `req.query`. Prisma's `take` and `skip` require integers — passing strings caused a runtime crash on every paginated endpoint.

**Root cause:** The `validate` middleware stores Zod-coerced values in `req.parsedQuery`, but all controllers passed the raw `req.query` directly to services.

**Fix:** Added `Number()` coercion at the top of each paginated service function.

**Affected files:**

| File | Functions Fixed |
|------|----------------|
| `backend/src/modules/booking/booking.service.js` | `getUserBookings`, `getAgentBookings` |
| `backend/src/modules/review/review.service.js` | `getHouseReviews` |
| `backend/src/modules/message/message.service.js` | `getUserConversations`, `getMessages` |
| `backend/src/modules/notification/notification.service.js` | `getNotifications` |
| `backend/src/modules/filter/filter.service.js` | `filterHouses` |
| `backend/src/modules/house/house.service.js` | `listHouses` |
| `backend/src/modules/user/user.service.js` | `getPaymentHistory` |

---

### Bug 2 — Notification Route Ordering (Route Shadowing)

**Problem:** `DELETE /api/notifications/device-token` was being matched by the `DELETE /:id` route before it could reach the `/device-token` handler. This caused the request to fail with a "Notification not found" error.

**Fix:** Moved the `/device-token` routes above the `/:id` routes in `notification.routes.js`.

**Affected file:** `backend/src/modules/notification/notification.routes.js`

---

### Bug 3 — Seed Crash (Missing Required Field)

**Problem:** The Prisma `Review` model requires a unique `bookingId` field. The seed script was creating reviews without this field, causing the seed to crash.

**Fix:** Updated `seed.js` to fetch completed bookings and link each review to a booking via `bookingId`.

**Affected file:** `backend/prisma/seed.js`

---

## Postman Collection Fixes Required

The existing Postman collection has **12 inaccuracies** — wrong field names, paths, or parameter names that don't match the actual API. Update these before using the collection or sharing it with the frontend team.

| # | Endpoint | ❌ Collection Has | ✅ Actual API |
|---|----------|-------------------|---------------|
| 1 | Register | body: `fullName`, `phone`, `role` | body: `username`, `email`, `password` |
| 2 | Nearby Houses | query: `latitude`, `longitude` | query: `lat`, `lng` |
| 3 | Create Booking | body: `checkInDate`, `checkOutDate` | body: `checkIn`, `checkOut` (ISO 8601: `2026-07-01T00:00:00.000Z`) |
| 4 | Create Review | body: `houseId` | body: `bookingId` (booking must have `COMPLETED` status) |
| 5 | Conversations base path | `/api/messages/conversations` | `/api/conversations` |
| 6 | Create Conversation | body: `participantId` | body: `agentId` |
| 7 | Save Location | `POST /api/location/saved` | `POST /api/location/save` |
| 8 | Get Agent Bookings | `GET /api/bookings/agent` | `GET /api/bookings/agent/all` |
| 9 | Mark All Notifications Read | `PATCH /api/notifications/mark-all-read` | `PATCH /api/notifications/read-all` |
| 10 | Clear All Notifications | `DELETE /api/notifications/clear` | `DELETE /api/notifications/clear-all` |
| 11 | Update Notification Settings | `PATCH /api/users/notification-settings` | `PATCH /api/users/me/notifications` |
| 12 | Register Device Token | body: `deviceToken`, platform: `ANDROID` | body: `token`, platform: `android` (lowercase) |

---

## Endpoint Test Results

**Total: 59/60 passing.** The 1 failure is expected (SMTP not configured in local dev).

---

### Health

| Method | Endpoint | Result |
|--------|----------|--------|
| GET | `/health` | ✅ Pass |
| GET | `/about` | ✅ Pass |
| GET | `/api-docs` | ✅ Pass |
| GET | `/api-docs.json` | ✅ Pass |

---

### Auth

> All routes: `/api/auth/...`

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| POST | `/register` | ✅ Pass | Body: `username`, `email`, `password` |
| POST | `/login` | ✅ Pass | Returns `accessToken` + `refreshToken` |
| POST | `/refresh-token` | ✅ Pass | Body: `refreshToken` |
| POST | `/forgot-password` | ⚠️ 500 | SMTP not configured — expected in local dev |
| POST | `/logout` | ✅ Pass | |

---

### User

> All routes: `/api/users/...` — Requires `Bearer` token

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| GET | `/me` | ✅ Pass | |
| PATCH | `/me` | ✅ Pass | |
| POST | `/me/avatar` | ✅ Pass | `multipart/form-data`, field name: `avatar` |
| GET | `/me/payment-history` | ✅ Pass | |
| GET | `/me/notifications` | ✅ Pass | Notification settings |
| PATCH | `/me/notifications` | ✅ Pass | Body: `emailNotifications`, `pushNotifications`, `smsNotifications` |
| GET | `/me/recent-viewed` | ✅ Pass | |

---

### Houses

> All routes: `/api/houses/...`

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| GET | `/` | ✅ Pass | Supports `page`, `limit`, `city`, `listingType`, `propertyType` |
| GET | `/filter` | ✅ Pass | Full filter params |
| GET | `/top-locations` | ✅ Pass | |
| GET | `/popular` | ✅ Pass | |
| GET | `/recommended` | ✅ Pass | Requires auth |
| GET | `/nearby?lat=23.8&lng=90.4` | ✅ Pass | Use `lat`/`lng` (not `latitude`/`longitude`) |
| GET | `/:id` | ✅ Pass | |
| GET | `/:id/share` | ✅ Pass | |
| POST | `/:id/view` | ✅ Pass | Track view count |
| POST | `/` | ✅ Pass | Agent token required |
| PUT | `/:id` | ✅ Pass | Agent token required |
| DELETE | `/:id` | ✅ Pass | Agent token required |

---

### Bookings

> All routes: `/api/bookings/...` — Requires `Bearer` token

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| POST | `/` | ✅ Pass | Dates must be ISO 8601 format |
| GET | `/my` | ✅ Pass | User's bookings |
| GET | `/:id` | ✅ Pass | |
| PATCH | `/:id/cancel` | ✅ Pass | |
| GET | `/agent/all` | ✅ Pass | Agent token required |
| PATCH | `/agent/:id/status` | ✅ Pass | Agent token required. Body: `{ "status": "COMPLETED" }` |

---

### Reviews

> All routes: `/api/reviews/...` — Requires `Bearer` token

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| POST | `/` | ✅ Pass | Body: `bookingId`, `rating`, `comment`. Booking must be `COMPLETED` |
| GET | `/my` | ✅ Pass | |
| GET | `/house/:houseId` | ✅ Pass | |
| GET | `/:id` | ✅ Pass | |
| PATCH | `/:id` | ✅ Pass | |
| DELETE | `/:id` | ✅ Pass | |

---

### Location

> All routes: `/api/location/...` — Requires `Bearer` token

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| GET | `/reverse-geocode?lat=23.8&lng=90.4` | ✅ Pass | |
| GET | `/saved` | ✅ Pass | List saved locations |
| POST | `/save` | ✅ Pass | Save a location (note: `/save` not `/saved`) |
| DELETE | `/:id` | ✅ Pass | |

---

### Conversations & Messages

> All routes: `/api/conversations/...` — Requires `Bearer` token

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| POST | `/` | ✅ Pass | Body: `agentId` (not `participantId`) |
| GET | `/` | ✅ Pass | |
| GET | `/unread` | ✅ Pass | Unread conversation count |
| GET | `/:id` | ✅ Pass | |
| POST | `/:id/messages` | ✅ Pass | Send a message |
| GET | `/:id/messages` | ✅ Pass | |
| PATCH | `/:id/read` | ✅ Pass | Mark conversation as read |
| DELETE | `/:id` | ✅ Pass | |

---

### Notifications

> All routes: `/api/notifications/...` — Requires `Bearer` token

| Method | Endpoint | Result | Notes |
|--------|----------|--------|-------|
| GET | `/` | ✅ Pass | Supports `type`, `isRead`, `page`, `limit` |
| GET | `/unread-count` | ✅ Pass | |
| PATCH | `/read-all` | ✅ Pass | Mark all as read |
| DELETE | `/clear-all` | ✅ Pass | Delete all notifications |
| GET | `/:id` | ✅ Pass | |
| PATCH | `/:id/read` | ✅ Pass | Mark single as read |
| DELETE | `/:id` | ✅ Pass | |
| POST | `/device-token` | ✅ Pass | Body: `token`, `platform` (`android` or `ios`) |
| DELETE | `/device-token` | ✅ Pass | Body: `token` |

---

## Pre-Integration Checklist

Before the frontend team starts integration, the following should be addressed:

### 🔴 High Priority

- [ ] **Fix Postman collection** — Update all 12 inaccuracies listed above. The frontend team will use this as a contract reference.
- [ ] **Standardise response envelope** — The API currently returns two different shapes depending on the module. Some endpoints return a flat response object, others wrap data under a `data` key. This must be consistent before the mobile team writes service call handlers.

  ```js
  // Flat (used by auth, bookings, houses):
  { success, message, id, userId, token, ... }

  // Nested (used by some other endpoints):
  { success, message, data: { ... } }
  ```

### 🟡 Medium Priority

- [ ] **Configure SMTP for email flows** — `forgot-password` and any OTP-via-email flows will return 500 without valid SMTP credentials. Set up a transactional email provider (Resend, SendGrid, or Gmail App Password) and populate `SMTP_*` in `.env`.
- [ ] **Add `.env.example`** — No example env file exists in the repo. Any new developer cloning the project has no reference for required variables. Copy `.env` with values blanked out.
- [ ] **ISO 8601 dates on mobile** — Booking `checkIn`/`checkOut` require full ISO 8601 strings (`2026-07-01T00:00:00.000Z`). Ensure mobile date pickers format output correctly before sending to the API.

### 🟢 Low Priority / Future

- [ ] **Avatar storage** — `POST /users/me/avatar` currently stores the image as a base64 data URL directly in the database. For production, replace with cloud storage (Cloudinary, AWS S3, etc.) and return a CDN URL instead.
- [ ] **Push notifications** — `POST /notifications/device-token` stores device tokens, but the actual FCM/APNs dispatch is a placeholder. Wire up Firebase Admin SDK or a push service when ready.
- [ ] **Rate limiter tuning** — The auth routes (`/login`, `/register`) hit the rate limiter quickly during development/testing (15-minute window). Consider increasing the window or limit for non-production environments.

---

*Report generated from full manual API testing across all 60 endpoints in the Postman collection.*
