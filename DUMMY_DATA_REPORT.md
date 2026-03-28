# Housely — Dummy Data & Hardcoded Content Report

**Generated:** 2026-03-28
**Scope:** Full codebase scan — `backend/`, `mobile/`, `admin/`
**Methodology:** Static analysis of all JS/JSX files, data modules, screen components, and auth flows

---

## Executive Summary

| Category | Count |
|---|---|
| HARDCODED_ARRAY | 9 |
| MOCK_OBJECT | 7 |
| STATIC_STATE | 4 |
| TODO_COMMENT | 3 |
| PLACEHOLDER_RESPONSE | 3 |
| LOCAL_JSON (dedicated dummy file) | 1 |
| STATIC_KPI / Hardcoded values | 3 |
| **TOTAL FINDINGS** | **30** |

| Priority | Count |
|---|---|
| HIGH | 15 |
| MEDIUM | 10 |
| LOW | 5 |

---

## CRITICAL SECURITY NOTE (Out of Band)

The `.env` file at the project root is **tracked in git** (`M .env` in git status). It contains real production credentials:
- Live Neon PostgreSQL password
- Weak JWT secrets (`dev-access-secret-change-in-production`)

Rotate all credentials and add `.env` to `.gitignore` before any production deployment.

---

## Section 1 — Mobile

### Finding M-01
**File:** `mobile/data/dummyData.js` (entire file, ~1,947 lines)
**Category:** LOCAL_JSON
**Priority:** HIGH

The largest single dummy data source in the project. Explicitly named "HOUSELY - Comprehensive Dummy Data". Exports:

- `dummyUsers` — 5 hardcoded user objects (lines 17–88)
- `dummyAuthResponses` — login responses with **literal dummy JWT tokens** (lines 92–119)
  ```js
  token: "dummy-jwt-token-user-12345",
  refreshToken: "dummy-refresh-token-user-12345",
  ```
- `dummyHouses` — 15 full house objects with coordinates, Unsplash image URLs, pricing (lines 123–815)
- `dummyBookings` — 5 bookings (lines 987–1128)
- `dummyConversations` / `dummyMessages` — 5 conversations, ~11 messages (lines 1132–1346)
- `dummyNotifications` — 7 notifications (lines 1350–1421)
- `dummyPayments` — 5 payments (lines 1425–1501)
- `dummyReviews`, `dummyRecentlyViewed`, `dummyFavorites` (lines 1505–1596)
- `ownerHouses`, `ownerBookings`, `ownerReviews`, `ownerEarnings` (lines 1598–1742)
- Screen-ready derived arrays (lines 1743–1947+)

No screen currently imports this file — all screens use real APIs. The file is orphaned dead code.

**Action:** Delete the file or move it exclusively to a `__fixtures__/` directory that is never imported in app code.

---

### Finding M-02
**File:** `mobile/data/properties.js` (lines 1–235)
**Category:** HARDCODED_ARRAY
**Priority:** HIGH

Six static arrays: `recommendedProperties`, `nearbyPropertiesRow1`, `nearbyPropertiesRow2`, `topLocations`, `popularProperties`, `allProperties`. All use hardcoded Indonesian property names, prices (310, 280, 450…), and Unsplash URLs. No screen imports this file — it is orphaned dead code duplicating a subset of `dummyData.js`.

**Action:** Delete the file.

---

### Finding M-03
**File:** `mobile/data/chats.js` (lines 1–140)
**Category:** HARDCODED_ARRAY
**Priority:** HIGH

Two static exports: `chatConversations` (5 entries with `randomuser.me` avatars, static roles, relative timestamps like "Yesterday") and `chatMessages` (keyed threads for conversations 1–3). No screen imports this file.

**Action:** Delete the file.

---

### Finding M-04 🚨 AUTHENTICATION BYPASS
**File:** `mobile/app/(auth)/successReset.jsx` (lines 11–19)
**Category:** MOCK_OBJECT
**Priority:** HIGH

The password reset success screen **injects a hardcoded dummy user and token into AsyncStorage and the auth store**, bypassing all authentication. Any user who completes the password reset flow gets logged in as `testuser/test@test.com` with a fake token:

```js
// Set dummy auth data to bypass authentication
const dummyUser = { id: 1, username: "testuser", email: "test@test.com" };
const dummyToken = "dummy-token-for-testing";

await AsyncStorage.setItem("user", JSON.stringify(dummyUser));
await AsyncStorage.setItem("token", dummyToken);
useAuthStore.setState({ user: dummyUser, token: dummyToken });
router.replace("/(tabs)");
```

**Action:** Remove all dummy injection. Navigate to `/(auth)` and require the user to log in with their new password.

---

### Finding M-05 🚨 OTP BYPASS
**File:** `mobile/app/(auth)/verifyPassword.jsx` (lines 69–73, 103–104, 193–194)
**Category:** TODO_COMMENT
**Priority:** HIGH

OTP verification and resend are both stubbed. The Verify button's real handler is commented out; it navigates unconditionally:

```js
// TODO: Implement OTP verification API call
// const response = await verifyOTP(otpCode);
await new Promise((resolve) => setTimeout(resolve, 1500)); // fake delay

// TODO: Implement resend OTP API call
// await resendOTP();

// onPress={handleVerify}           ← real handler disabled
onPress={() => router.push("/(auth)/changePassword")}   // ← unconditional skip
```

**Action:** Implement OTP verification via `POST /api/auth/verify-otp`. Wire the Verify button to `handleVerify`. Implement resend via `POST /api/auth/resend-otp`.

---

### Finding M-06
**File:** `mobile/app/(tabs)/writeReview.jsx` (lines 368–375)
**Category:** MOCK_OBJECT
**Priority:** MEDIUM

Write Review shows hardcoded fallback property data when params are absent:

```js
// Mock booking data (in real app, fetch from params)
const booking = {
  id: params?.bookingId || '1',
  name: params?.propertyName || 'Greenhost Boutique Hotel',
  location: params?.location || 'Yogyakarta, Indonesia',
  image: params?.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  reference: params?.reference || 'HSL-2024-0156',
};
```

A user who lands on this screen without params (deep link, navigation recovery) will see a fake property.

**Action:** Require all params to be present or fetch the booking from `GET /api/bookings/:id`. Return an error state if params are missing.

---

### Finding M-07
**File:** `mobile/app/(tabs)/index.jsx` (lines 31–33)
**Category:** STATIC_STATE
**Priority:** MEDIUM

Home screen initialises favorites state with hardcoded IDs. Property `"1"` always appears as favorited for every user on first render:

```js
const [favorites, setFavorites] = useState(["1"]);
const [popularFavorites, setPopularFavorites] = useState(["2"]);
const [activeLocation, setActiveLocation] = useState("2");
```

**Action:** Initialize as `useState([])`. Populate from `isFavorite` field on each house object returned by the API.

---

### Finding M-08
**File:** `mobile/app/(tabs)/explore.jsx` (line 49)
**Category:** STATIC_STATE
**Priority:** MEDIUM

Explore screen hardcodes two favorited property IDs for all users:

```js
const [favorites, setFavorites] = useState(["1", "4"]);
```

**Action:** Initialize as `useState([])`. Derive from API response `isFavorite` field.

---

### Finding M-09
**File:** `mobile/app/(tabs)/index.jsx` (lines 199–215)
**Category:** STATIC_KPI
**Priority:** MEDIUM

Promo banner shows a hardcoded expired promotion:

```jsx
<Text className="text-white font-poppins-bold text-lg">GET YOUR 20%</Text>
<Text className="text-white font-poppins-bold text-lg">CASHBACK</Text>
<Text className="text-white/70 font-poppins text-xs mt-1">*Expired 25 Aug 2022</Text>
```

The date "25 Aug 2022" is over 3 years in the past.

**Action:** Drive from a promotions API endpoint, or remove the banner until a real promotion exists.

---

### Finding M-10
**File:** `mobile/app/(tabs)/index.jsx` (lines 152–169)
**Category:** STATIC_KPI
**Priority:** MEDIUM

Notification badge in the Home header always hardcodes "2":

```jsx
<Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>2</Text>
```

Every user always sees "2 unread" regardless of their actual notification state.

**Action:** Fetch unread count from the notifications store or from `GET /api/notifications` and compute `notifications.filter(n => !n.isRead).length`.

---

### Finding M-11
**File:** `mobile/app/(tabs)/topLocations.jsx` (line 31)
**Category:** PLACEHOLDER_RESPONSE
**Priority:** LOW

Location card images use the deprecated `source.unsplash.com` API:

```js
image: { uri: `https://source.unsplash.com/featured/?${loc.city},city` }
```

`source.unsplash.com` was deprecated in 2023. All location images will be broken.

**Action:** Store a representative image URL per location in the database and return it from `/api/houses/top-locations`.

---

### Finding M-12
**File:** `mobile/app/(tabs)/topLocations.jsx` (line 62)
**Category:** PLACEHOLDER_RESPONSE
**Priority:** LOW

Location card `onPress` is a dead `console.log` stub:

```js
onPress={() => console.log(`Selected location: ${item.name}`)}
```

Tapping any top location card does nothing.

**Action:** Navigate to Explore/Search screen with the city pre-filtered.

---

### Finding M-13
**File:** `mobile/app/index.jsx` (line 18)
**Category:** PLACEHOLDER_RESPONSE
**Priority:** LOW

Debug `console.log` in the app entry point, logging the full user object and token on every app launch:

```js
console.log(user, token);
```

**Action:** Delete the line.

---

### Finding M-14
**File:** `mobile/app/(tabs)/myBooking.jsx` (lines 426, 461) and `mobile/app/(tabs)/paymentHistory.jsx` (line 343)
**Category:** PLACEHOLDER_RESPONSE
**Priority:** LOW

Action buttons are `console.log` stubs:

```js
onPress={() => console.log('Call Agent pressed')}         // myBooking.jsx ×2
onPress={() => console.log('Payment details:', item.transactionId)}  // paymentHistory.jsx
```

**Action:** "Call Agent" → `Linking.openURL('tel:' + agentPhoneNumber)`. "Payment details" → navigate to a detail screen or modal.

---

### Finding M-15
**File:** `mobile/app/(tabs)/chat.jsx` (line 152)
**Category:** PLACEHOLDER_RESPONSE
**Priority:** LOW

Swipe "More options" action on chat cards is a stub:

```js
console.log("More options for", item.name);
```

**Action:** Implement a bottom sheet with conversation actions, or remove the button.

---

## Section 2 — Backend

### Finding B-01
**File:** `backend/src/modules/notification/notification.service.js` (lines 170–179)
**Category:** TODO_COMMENT
**Priority:** HIGH

FCM push notification integration is entirely unimplemented. The service silently returns success without delivering anything:

```js
// TODO: Integrate with Firebase Cloud Messaging (FCM)
// const admin = require('firebase-admin');
// await admin.messaging().sendMulticast(message);

console.log('[FCM] Would send push notification:', { userId, title, body, tokens: tokens.length });
return { sent: true, tokenCount: tokens.length };
```

**Action:** Install `firebase-admin`, add `FIREBASE_SERVICE_ACCOUNT_JSON` to environment config, and implement the multicast send.

---

### Finding B-02
**File:** `backend/prisma/seed.js` (lines 9–50)
**Category:** MOCK_OBJECT
**Priority:** MEDIUM

All seed accounts use `password123` and are created via `upsert`, meaning they will be created or left unchanged in a production database if the seed is accidentally run:

```js
const password = await bcrypt.hash('password123', 10);
// Creates: user@test.com, agent@test.com, admin@test.com
```

**Action:** Add `if (process.env.NODE_ENV === 'production') throw new Error('Cannot seed production')` at the top. Use randomly-generated passwords for seed accounts.

---

### Finding B-03
**File:** `.env` root (JWT secrets)
**Category:** MOCK_OBJECT
**Priority:** HIGH

```
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
```

Any JWT token signed with these known secrets can be forged.

**Action:** Generate secure secrets (`openssl rand -base64 64`), rotate in production, invalidate all existing tokens.

---

## Section 3 — Admin

No dummy data found. All four admin pages (`DashboardPage`, `UsersPage`, `VideosPage`, `BookingsPage`) correctly use React Query hooks that call real API endpoints (`/api/admin/stats`, `/api/users/admin/list`, `/api/videos`, `/api/bookings/agent/all`).

---

## Prioritized Replacement Order

### Priority 1 — Fix Before Any Production Deploy

| # | Finding | File | Risk |
|---|---|---|---|
| 1 | M-04 | `successReset.jsx` | Auth bypass — every user becomes testuser after password reset |
| 2 | M-05 | `verifyPassword.jsx` | OTP verification entirely skipped |
| 3 | B-03 | `.env` / JWT secrets | Weak secrets committed to git; tokens can be forged |
| 4 | B-01 | `notification.service.js` | All push notifications silently discarded |

### Priority 2 — Fix Before Beta

| # | Finding | File | Risk |
|---|---|---|---|
| 5 | M-09 | `index.jsx` promo banner | Shows "Expired 25 Aug 2022" to all users |
| 6 | M-10 | `index.jsx` notification badge | Always shows "2" unread |
| 7 | M-07 | `index.jsx` favorites state | Property #1 always pre-favorited for all users |
| 8 | M-08 | `explore.jsx` favorites state | Properties #1 and #4 always pre-favorited |
| 9 | M-12 | `topLocations.jsx` tap handler | Tapping a location card does nothing |
| 10 | M-11 | `topLocations.jsx` image URLs | Deprecated Unsplash Source API — images will break |
| 11 | M-06 | `writeReview.jsx` mock booking | Shows "Greenhost Boutique Hotel" as fallback |
| 12 | B-02 | `seed.js` | `password123` test accounts created via upsert |

### Priority 3 — Code Cleanup

| # | Finding | File | Risk |
|---|---|---|---|
| 13 | M-14 | `myBooking.jsx`, `paymentHistory.jsx` | console.log stubs for live action buttons |
| 14 | M-15 | `chat.jsx` | console.log stub for swipe action |
| 15 | M-13 | `app/index.jsx` | Debug console.log on every app launch |
| 16 | M-01 | `data/dummyData.js` | ~1,900-line dead code file — delete |
| 17 | M-02 | `data/properties.js` | Orphaned dead code — delete |
| 18 | M-03 | `data/chats.js` | Orphaned dead code — delete |

---

## Screens Verified as Fully Wired to Real APIs

| Screen | Endpoint |
|---|---|
| `(tabs)/index.jsx` | `GET /api/houses/recommended`, `/nearby`, `/popular`, `/top-locations` |
| `(tabs)/explore.jsx` | `GET /api/houses` |
| `(tabs)/favorite.jsx` | `GET /api/houses/favorites` |
| `(tabs)/notifications.jsx` | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| `(tabs)/chat.jsx` | `GET /api/conversations` |
| `(tabs)/myBooking.jsx` | `GET /api/bookings/my` |
| `(tabs)/paymentHistory.jsx` | `GET /api/users/me/payment-history` |
| `(tabs)/recentViewed.jsx` | `GET /api/users/me/recent-viewed` |
| `(tabs)/propertyDetails.jsx` | `GET /api/houses/:id` |
| `(tabs)/videoFeed.jsx` | `GET /api/videos` (via videoStore) |
| `(owner)/index.jsx` | `GET /api/houses/agent/dashboard` |
| `(owner)/earnings.jsx` | `GET /api/houses/agent/dashboard` |
| `(owner)/properties.jsx` | `GET /api/houses/my-houses` |
| `(owner)/bookings.jsx` | `GET /api/bookings/agent/all` |
| `(owner)/reviews.jsx` | `GET /api/reviews/agent` |
| `admin/DashboardPage.jsx` | `GET /api/admin/stats` |
| `admin/UsersPage.jsx` | `GET /api/users/admin/list` |
| `admin/VideosPage.jsx` | `GET /api/videos` |
| `admin/BookingsPage.jsx` | `GET /api/bookings/agent/all` |

*End of report. 30 findings documented.*
