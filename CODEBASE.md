# Housely — Codebase Reference

> Read this at the start of every session. Update after structural changes.

## Architecture

**Monorepo** with three workspaces:
- `backend/` — Node.js 20 + Express 5 REST API + Socket.IO 4
- `mobile/` — React Native (Expo 54, expo-router, TypeScript)
- `housely-admin/` — Next.js admin dashboard

## Backend Stack

| Concern | Library |
|---------|---------|
| Framework | Express 5 |
| ORM | Prisma 6 → Neon PostgreSQL |
| Auth | Clerk (`@clerk/express` v2) — `getAuth(req)` for REST, `clerkClient.verifyToken()` for Socket |
| Real-time | Socket.IO 4.7 |
| Files | Multer (memory) → Cloudinary |
| Validation | Zod |
| Email | Nodemailer |
| Env | `backend/src/config/env.js` |

### Module layout

```
backend/src/
  app.js            — Express app, all routes mounted
  server.js         — HTTP server + Socket.IO init, sets app.set('io', io)
  config/           — env, prisma, cloudinary, swagger
  middlewares/      — auth (protect, requireRole), upload, validate, errorHandler
  sockets/index.js  — all Socket.IO events (chat, calls, presence)
  modules/
    auth/           — Clerk sync, POST /api/auth/sync
    user/           — GET|PATCH /api/users/me, avatar, notifications, payment-history
    house/          — CRUD + search, recommendations, popular, nearby, favorites
    booking/        — create, cancel, status update (PENDING→CONFIRMED→COMPLETED)
    review/         — CRUD + media
    message/        — conversations + messages REST, GET /api/conversations
    notification/   — in-app notifications
    filter/         — GET /api/filter/search (advanced query)
    location/       — saved locations + geocoding
    admin/          — stats, user/house/booking management
    contract/       — GET /api/contracts/booking/:bookingId (read-only, auto-generated)
    kyc/            — POST /api/kyc/submit, GET /api/kyc/status
```

### Response helper

`success(res, data, message, statusCode)` — spreads `data` at root of JSON response:
```js
// Single entity (fields at root):
success(res, booking)  →  { success, message, id, userId, houseId, ... }
// List (nested):
success(res, { bookings, pagination })  →  { success, message, bookings: [], pagination: {} }
```

### Authentication flow

1. Mobile authenticates with Clerk, gets session token
2. `POST /api/auth/sync` → creates/updates User in DB
3. All REST calls: `Authorization: Bearer <clerk_token>` → `protect` middleware → `req.user`
4. Socket: token in `socket.handshake.auth.token` → `authenticateSocket` middleware → `socket.user`

### Socket rooms

- `user:${userId}` — personal room, joined on every connection
- `conversation:${conversationId}` — joined via `conversation:join` event; re-joined on every reconnect

### Key events

Send: `message:send { conversationId, content, type }` → server creates message, emits to room  
Receive: `message:received` (in-room), `message:new` (personal, for notification/list update)  
REST fallback: `POST /api/conversations/:id/messages` also emits both socket events

## Mobile Stack

| Concern | Library |
|---------|---------|
| Navigation | expo-router (file-based) |
| Auth | `@clerk/clerk-expo` — token via `useAuth().getToken` |
| HTTP | Axios (`services/api.js`) — auto-injects Clerk token |
| Socket | Socket.IO client (`services/socketService.js`) — token via `setSocketTokenProvider` |
| State | Zustand (`store/authStore.js`) |
| UI | NativeWind (Tailwind), React Native Paper |

### Navigation tree

```
(auth)/       — login, signup, forgotPassword
(onbording)/  — new user flow
(tabs)/       — user app (home, explore, favorite, myBooking, profile)
              — hidden: chat, chatConversation, propertyDetails, notifications,
                        paymentHistory, contractView, kycVerification
(owner)/      — agent app (dashboard, properties, bookings, messages, profile)
(location)/   — location picker
```

### API service pattern

```js
import api from '../../services/api';         // axios + Clerk token
import { connectSocket, getSocket } from '../../services/socketService';
import useAuthStore from '../../store/authStore';
const { user } = useAuthStore();
```

## Database Schema (Prisma)

### Core models

| Model | Key fields | Relations |
|-------|-----------|-----------|
| User | id, clerkId, username, email, role (USER\|AGENT\|ADMIN), isVerified | houses, bookings, conversations, messages, kycRecord |
| House | id, agentId, listingType (RENT\|SALE), status (AVAILABLE\|UNAVAILABLE), city, latitude, longitude | images, bookings, reviews, conversations, contracts |
| Booking | id, userId, houseId, agentId, checkIn, checkOut, totalAmount, status (PENDING\|CONFIRMED\|COMPLETED\|CANCELLED), paymentStatus | payments, review, contract |
| Conversation | id, userId (renter), agentId (owner), houseId?, unique(userId,agentId) | messages |
| Message | id, conversationId, senderId, content, type, isRead | — |
| Contract | id, bookingId (unique), renterId, ownerId, houseId, content (Json), status (ACTIVE\|TERMINATED) | booking, renter, owner, house |
| UserKYC | id, userId (unique), documentType, documentFront, documentBack?, selfie, status (PENDING\|APPROVED\|REJECTED) | user |
| Payment | id, userId, bookingId?, amount, method, transactionId, status | — |
| Notification | id, userId, type, title, message, data (Json), isRead | — |

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (Clerk) | ✅ Complete | REST + Socket |
| Property CRUD | ✅ Complete | Cloudinary images/video |
| Bookings | ✅ Complete | Conflict detection, status machine |
| Messaging (REST + Socket) | ✅ Fixed | See chat bug fixes |
| Typing indicators | ✅ Working | Socket.IO |
| Reviews | ✅ Complete | Per-booking, 1-5 stars |
| Notifications (in-app) | ✅ Working | REST polling |
| Push notifications | ⚠️ Setup only | FCM configured, not wired |
| Digital Contracts | ✅ Complete | Auto-generated on booking CONFIRMED |
| KYC | ✅ Complete | Cloudinary upload + Onfido optional |
| Payment gateway | ❌ Schema only | SSLCommerz/bKash not wired |

## Key env vars

```
DATABASE_URL, DIRECT_URL          — Neon PostgreSQL
CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
CLOUDINARY_CLOUD_NAME/KEY/SECRET
ONFIDO_API_TOKEN                  — optional; enables auto-verify (sandbox: from Onfido dashboard)
KYC_REQUIRED=true                 — set to gate booking/listing behind KYC
```

## Contract generation

Triggered automatically in `booking.service.js → updateBookingStatus` when status → `CONFIRMED`.  
Contract content is a frozen JSON snapshot (`contract.content`) — never mutated post-creation.  
Access: `GET /api/contracts/booking/:bookingId` — renter or owner only.

## KYC flow

1. User uploads documentFront + documentBack (optional) + selfie via `POST /api/kyc/submit`
2. Files stored to Cloudinary under `housely/kyc/`
3. If `ONFIDO_API_TOKEN` set: creates Onfido applicant → uploads documents → creates check
4. Status starts as `PENDING`; changes to `APPROVED`/`REJECTED` via:
   - Admin: `PATCH /api/admin/kyc/:userId`
   - Onfido webhook: `POST /api/kyc/webhook`
5. Booking creation and property listing check `KYC_REQUIRED` env var
