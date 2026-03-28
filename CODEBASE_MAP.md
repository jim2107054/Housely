# CODEBASE MAP -- Housely

> Generated 2026-03-28 | Branch: `feature/cloudinary-video-upgrade`

---

## 1. Directory Tree (source files only, node_modules excluded)

```
Housely/
├── .claude/settings.local.json
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── docker-compose.yml
│   ├── Housely_API_Collection.postman_collection.json
│   ├── jest.config.js
│   ├── package.json
│   ├── README.md
│   ├── server.js                          # Entry point - HTTP server + Socket.IO init
│   ├── vercel.json
│   ├── __tests__/
│   │   └── api.test.js
│   ├── prisma/
│   │   ├── schema.prisma                  # Database schema
│   │   └── seed.js
│   └── src/
│       ├── app.js                         # Express app setup, route mounting
│       ├── config/
│       │   ├── cloudinary.js              # Cloudinary upload helper
│       │   ├── env.js                     # Environment variables
│       │   ├── prisma.js                  # Prisma client singleton
│       │   ├── redis.js                   # Redis client with in-memory fallback
│       │   ├── swagger.js                 # Swagger UI setup
│       │   └── swagger-paths.js           # Swagger path definitions
│       ├── middlewares/
│       │   ├── auth.js                    # protect + requireRole
│       │   ├── cloudinary.middleware.js   # Video upload multer + Cloudinary helpers
│       │   ├── errorHandler.js            # Global error handler
│       │   ├── rateLimiter.js             # Redis-backed rate limiter
│       │   ├── upload.js                  # Generic multer (images + video, 10MB)
│       │   └── validate.js               # Zod schema validation middleware
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.js
│       │   │   ├── auth.routes.js
│       │   │   ├── auth.service.js
│       │   │   └── auth.validation.js
│       │   ├── booking/
│       │   │   ├── booking.controller.js
│       │   │   ├── booking.routes.js
│       │   │   ├── booking.service.js
│       │   │   └── booking.validation.js
│       │   ├── filter/
│       │   │   ├── filter.controller.js
│       │   │   ├── filter.routes.js
│       │   │   ├── filter.service.js
│       │   │   └── filter.validation.js
│       │   ├── house/
│       │   │   ├── house.controller.js
│       │   │   ├── house.routes.js
│       │   │   ├── house.service.js
│       │   │   └── house.validation.js
│       │   ├── location/
│       │   │   ├── location.controller.js
│       │   │   ├── location.routes.js
│       │   │   ├── location.service.js
│       │   │   └── location.validation.js
│       │   ├── message/
│       │   │   ├── message.controller.js
│       │   │   ├── message.routes.js
│       │   │   ├── message.service.js
│       │   │   └── message.validation.js
│       │   ├── notification/
│       │   │   ├── notification.controller.js
│       │   │   ├── notification.routes.js
│       │   │   ├── notification.service.js
│       │   │   └── notification.validation.js
│       │   ├── review/
│       │   │   ├── review.controller.js
│       │   │   ├── review.routes.js
│       │   │   ├── review.service.js
│       │   │   └── review.validation.js
│       │   ├── user/
│       │   │   ├── user.controller.js
│       │   │   ├── user.routes.js
│       │   │   ├── user.service.js
│       │   │   └── user.validation.js
│       │   └── video/
│       │       ├── video.controller.js
│       │       ├── video.routes.js
│       │       ├── video.service.js
│       │       └── video.validation.js
│       ├── sockets/
│       │   └── index.js                   # Socket.IO: messaging, calls, presence
│       └── utils/
│           ├── email.js
│           ├── errorCodes.js
│           ├── jwt.js
│           ├── otp.js
│           ├── response.js
│           └── sms.js
├── mobile/
│   ├── .gitignore
│   ├── app.json
│   ├── babel.config.js
│   ├── config.js                          # API_URL constant
│   ├── eslint.config.js
│   ├── global.css
│   ├── metro.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── app/
│   │   ├── _layout.jsx                   # Root layout (Stack navigator + auth guard)
│   │   ├── index.jsx                     # Splash screen
│   │   ├── (auth)/
│   │   │   ├── _layout.jsx
│   │   │   ├── index.jsx                # Login screen
│   │   │   ├── signup.jsx
│   │   │   ├── roleSelection.jsx
│   │   │   ├── ownerLogin.jsx
│   │   │   ├── forgotPassword.jsx
│   │   │   ├── verifyPassword.jsx       # ⚠️ OTP bypass (Finding M-05)
│   │   │   ├── resetPassword.jsx
│   │   │   ├── successReset.jsx         # 🚨 Auth bypass (Finding M-04)
│   │   │   └── changePassword.jsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.jsx              # Bottom tab navigator (5 visible tabs)
│   │   │   ├── index.jsx                # Home ⚠️ hardcoded promo/badge/favorites
│   │   │   ├── explore.jsx              # ⚠️ hardcoded favorites state
│   │   │   ├── favorite.jsx
│   │   │   ├── myBooking.jsx            # ⚠️ console.log stubs
│   │   │   ├── profile.jsx
│   │   │   ├── editProfile.jsx
│   │   │   ├── popular.jsx
│   │   │   ├── propertyDetails.jsx
│   │   │   ├── recommended.jsx
│   │   │   ├── nearby.jsx
│   │   │   ├── topLocations.jsx         # ⚠️ deprecated image API, dead tap handler
│   │   │   ├── chat.jsx                 # ⚠️ hardcoded online:true
│   │   │   ├── chatConversation.jsx
│   │   │   ├── paymentHistory.jsx       # ⚠️ console.log stub
│   │   │   ├── notificationSettings.jsx # ⚠️ not wired to backend
│   │   │   ├── recentViewed.jsx
│   │   │   ├── about.jsx
│   │   │   ├── notifications.jsx
│   │   │   ├── search.jsx
│   │   │   ├── writeReview.jsx          # ⚠️ API call commented out (M-06)
│   │   │   ├── settings.jsx             # ⚠️ not wired to backend
│   │   │   ├── videoFeed.jsx
│   │   │   ├── videoPlayer.jsx
│   │   │   └── upload.jsx
│   │   ├── (owner)/
│   │   │   ├── _layout.jsx
│   │   │   ├── index.jsx               # Dashboard
│   │   │   ├── properties.jsx
│   │   │   ├── bookings.jsx
│   │   │   ├── messages.jsx
│   │   │   ├── profile.jsx
│   │   │   ├── addProperty.jsx
│   │   │   ├── propertyDetails.jsx
│   │   │   ├── reviews.jsx
│   │   │   ├── earnings.jsx
│   │   │   ├── settings.jsx
│   │   │   ├── editProfile.jsx
│   │   │   └── chatConversation.jsx
│   │   ├── (onbording)/
│   │   │   ├── _layout.jsx
│   │   │   ├── index.jsx
│   │   │   ├── onBoarding1.jsx
│   │   │   └── onBoarding2.jsx
│   │   └── (location)/
│   │       ├── _layout.jsx
│   │       ├── index.jsx               # Select location
│   │       └── maps.jsx                # Map view
│   ├── components/
│   │   ├── Button.jsx                   # ⚠️ Empty placeholder (renders only <Text>Button</Text>)
│   │   ├── SafeScreen.jsx
│   │   ├── SkeletonCard.jsx
│   │   ├── UploadProgress.jsx
│   │   ├── VideoCard.jsx
│   │   └── VideoPlayerControls.jsx
│   ├── constants/
│   │   └── colors.js
│   ├── data/
│   │   ├── dummyData.js                 # ⚠️ ~1,947 lines of dead dummy data (orphaned)
│   │   ├── properties.js                # ⚠️ orphaned static arrays
│   │   └── chats.js                     # ⚠️ orphaned static chat data
│   ├── services/
│   │   ├── api.js                       # Axios instance with auth interceptor
│   │   └── videoService.js
│   ├── store/
│   │   ├── authStore.js                 # Zustand - auth
│   │   ├── locationStore.js             # Zustand - location
│   │   └── videoStore.js                # Zustand - video feed
│   └── assets/images/
└── admin/
    ├── .env.example
    ├── .gitignore
    ├── AUDIT_REPORT.md
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx                      # React Router routes
        ├── main.jsx                     # Entry point (React Query + BrowserRouter)
        ├── index.css
        ├── api/
        │   ├── axios.js                 # Axios with admin token interceptor
        │   └── queries.js               # React Query hooks
        ├── components/
        │   ├── ConfirmModal.jsx
        │   ├── DataTable.jsx
        │   ├── KPICard.jsx
        │   ├── Layout.jsx
        │   ├── Pagination.jsx
        │   ├── ProtectedRoute.jsx
        │   └── Sidebar.jsx
        ├── pages/
        │   ├── BookingsPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── LoginPage.jsx
        │   ├── UsersPage.jsx
        │   └── VideosPage.jsx
        └── store/
            └── authStore.js
```

---

## 2. All API Endpoints

### 2.1 Inline (app.js)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |
| GET | `/api/health` | No | DB + Cloudinary health check |
| GET | `/api/app/about` | No | App info |
| GET | `/api/admin/stats` | ADMIN | Dashboard KPIs |

### 2.2 Auth (`/api/auth`)

| Method | Path | Auth | Rate Limited | Description |
|--------|------|------|--------------|-------------|
| POST | `/register` | No | No | Register user |
| POST | `/login` | No | 5/60s | Login |
| POST | `/logout` | Yes | No | Logout |
| POST | `/refresh-token` | No | No | Refresh JWT |
| POST | `/forgot-password/email` | No | 3/60s | Request OTP via email |
| POST | `/forgot-password/phone` | No | 3/60s | Request OTP via SMS |
| POST | `/verify-otp` | No | 5/60s | Verify OTP code |
| POST | `/reset-password` | No | No | Set new password |

### 2.3 Location (`/api/location`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/reverse-geocode` | Yes | Reverse geocode coordinates |
| GET | `/saved` | Yes | List saved locations |
| POST | `/save` | Yes | Save a location |
| DELETE | `/saved/:id` | Yes | Delete saved location |

### 2.4 Users (`/api/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Yes | Get own profile |
| PATCH | `/me` | Yes | Update profile |
| POST | `/me/avatar` | Yes | Upload avatar (multipart) |
| GET | `/me/payment-history` | Yes | Payment history |
| GET | `/me/notifications` | Yes | Notification settings |
| PATCH | `/me/notifications` | Yes | Update notification settings |
| GET | `/me/recent-viewed` | Yes | Recently viewed houses |
| GET | `/admin/list` | ADMIN | List all users |

### 2.5 Houses (`/api/houses`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List houses |
| GET | `/top-locations` | No | Top cities |
| GET | `/popular` | No | Popular houses |
| GET | `/favorites` | Yes | User's favorites |
| GET | `/recommended` | Yes | Recommended houses |
| GET | `/nearby` | Yes | Nearby houses |
| GET | `/my-houses` | AGENT/ADMIN | Agent's own listings |
| GET | `/agent/dashboard` | AGENT/ADMIN | Agent dashboard stats |
| POST | `/` | AGENT/ADMIN | Create house |
| POST | `/upload` | AGENT/ADMIN | Upload media (up to 10 files) |
| GET | `/:id` | No | Get house by ID |
| GET | `/:id/share-link` | No | Get share link |
| POST | `/:id/view` | Yes | Track view |
| POST | `/:id/favorite` | Yes | Toggle favorite |
| PATCH | `/:id` | AGENT/ADMIN | Update house |
| DELETE | `/:id` | AGENT/ADMIN | Delete house |

### 2.6 Filter (`/api/filter`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Filter/search houses |
| GET | `/search` | No | Alias for filter |

Query params: `listingType`, `propertyType`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `minSize`, `maxSize`, `buildYear`, `status`, `hasWifi`, `hasWater`, `city`, `area`, `q`, `sortBy`, `page`, `limit`

### 2.7 Bookings (`/api/bookings`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create booking |
| GET | `/my` | Yes | User's bookings |
| GET | `/agent/all` | AGENT/ADMIN | All bookings for agent |
| PATCH | `/agent/:id/status` | AGENT/ADMIN | Update booking status |
| GET | `/:id` | Yes | Get booking by ID |
| PATCH | `/:id/cancel` | Yes | Cancel booking |

### 2.8 Reviews (`/api/reviews`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Yes | Create review |
| GET | `/my` | Yes | My reviews |
| GET | `/agent` | Yes | Reviews for agent's properties |
| GET | `/house/:houseId` | No | Reviews for a house |
| GET | `/:id` | No | Get review by ID |
| PATCH | `/:id` | Yes | Update review |
| DELETE | `/:id` | Yes | Delete review |

### 2.9 Conversations/Messages (`/api/conversations`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List conversations |
| POST | `/` | Yes | Create conversation |
| GET | `/unread-count` | Yes | Unread count |
| GET | `/:id` | Yes | Get conversation |
| DELETE | `/:id` | Yes | Delete conversation |
| GET | `/:id/messages` | Yes | Get messages |
| POST | `/:id/messages` | Yes | Send message |
| PATCH | `/:id/read` | Yes | Mark as read |

### 2.10 Notifications (`/api/notifications`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List notifications |
| GET | `/unread-count` | Yes | Unread count |
| PATCH | `/read-all` | Yes | Mark all as read |
| DELETE | `/clear-all` | Yes | Clear all |
| GET | `/:id` | Yes | Get notification |
| PATCH | `/:id/read` | Yes | Mark as read |
| DELETE | `/:id` | Yes | Delete notification |
| POST | `/device-token` | Yes | Register FCM device token |
| DELETE | `/device-token` | Yes | Remove device token |

### 2.11 Videos (`/api/videos`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List videos |
| GET | `/me/watch-history` | Yes | Watch history |
| GET | `/admin/users` | ADMIN | List all users |
| GET | `/:id` | No | Get video by ID |
| GET | `/:id/stream` | No | Stream video (302 redirect to Cloudinary) |
| POST | `/upload` | Yes | Upload video (500MB limit) |
| POST | `/:id/view` | Yes | Track view |
| PATCH | `/:id` | Yes (owner/ADMIN) | Update video |
| DELETE | `/:id` | Yes (owner/ADMIN) | Delete video |

### 2.12 Socket.IO Events

JWT required in `handshake.auth.token`.

**Client → Server:** `conversation:join/leave`, `message:send`, `message:read`, `typing:start/stop`, `call:initiate/offer/answer/ice-candidate/end/reject`, `presence:online`

**Server → Client:** `message:received`, `message:new`, `message:read_receipt`, `typing:start/stop`, `call:incoming/offer/answer/ice-candidate/ended/rejected`, `presence:update`

> ⚠️ `socket.io-client` is NOT in mobile `package.json` — real-time features are unavailable on mobile.

---

## 3. Prisma Models

### Enums

| Enum | Values |
|------|--------|
| `Role` | USER, AGENT, ADMIN |
| `AuthProvider` | LOCAL, GOOGLE, FACEBOOK |
| `HouseStatus` | AVAILABLE, UNAVAILABLE |
| `ListingType` | RENT, SALE |
| `PropertyType` | APARTMENT, PENTHOUSE, HOTEL, VILLA, STUDIO, DUPLEX, TOWNHOUSE, CONDO |
| `PaymentStatus` | PENDING, COMPLETED, FAILED, REFUNDED |
| `BookingStatus` | PENDING, CONFIRMED, COMPLETED, CANCELLED |
| `NotificationType` | BOOKING_CONFIRMED, BOOKING_CANCELLED, PAYMENT_SUCCESS, NEW_MESSAGE, REVIEW_POSTED, GENERAL |
| `VideoStatus` | PROCESSING, PUBLISHED, ARCHIVED |

### Models

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **User** | id, username, email, password?, phoneNumber?, name?, avatar?, role (Role), authProvider, isVerified | savedLocations, houses, favorites, bookings, reviews, conversations, messages, notifications, deviceTokens, uploadedVideos, videoHistory |
| **SavedLocation** | id, userId, label?, address, city?, latitude, longitude | User |
| **House** | id, name, description?, status, rentPerMonth?, salePrice?, listingType, propertyType, address, city, bedrooms, bathrooms, sizeInSqft?, hasWifi, hasWater, agentId | agent, images[], video, publicFacilities, views, favorites, bookings, reviews, conversations, videos[] |
| **HouseImage** | id, houseId, url, order | House (cascade) |
| **HouseVideo** | id, houseId (unique), url | House (cascade) |
| **PublicFacility** | id, houseId (unique), wifi, water, electricity, parking, mosqueDistance?, hospitalDistance?, shoppingMallDistance?, marketDistance? | House |
| **HouseView** | id, userId, houseId, viewedAt | User, House |
| **Favorite** | id, userId, houseId | @@unique([userId, houseId]) |
| **NotificationSettings** | id, userId (unique), pushEnabled, emailEnabled, smsEnabled, bookingUpdates, promotions | User |
| **Payment** | id, userId, bookingId?, amount, currency, method?, transactionId?, status | User, Booking |
| **Booking** | id, userId, houseId, agentId, checkIn, checkOut, totalAmount, status (BookingStatus), paymentStatus | user, house, agent, payments[], review |
| **Review** | id, userId, houseId, bookingId (unique), rating, comment? | user, house, booking, media[] |
| **ReviewMedia** | id, reviewId, url, type ("image"/"video") | Review |
| **Conversation** | id, userId, agentId, houseId? | @@unique([userId, agentId]), user, agent, house, messages[] |
| **Message** | id, conversationId, senderId, content, type ("text"/"image"/"audio"/"video"), isRead | Conversation, User |
| **Notification** | id, userId, type (NotificationType), title, message, data?, isRead | User |
| **DeviceToken** | id, userId, token (unique), platform | User |
| **Video** | id, title, description?, uploaderId, houseId?, cloudinaryId (unique), url, thumbnailUrl?, duration?, width?, height?, sizeInBytes?, status (VideoStatus), viewCount | uploader, house, views[], tags[] |
| **VideoView** | userId, videoId, watchedAt, progress | @@unique([userId, videoId]) |
| **Tag** | id, name (unique) | videos[] (via VideoTag) |
| **VideoTag** | videoId, tagId (composite PK) | Video, Tag |

> ⚠️ House model has NO `rating` field. All screens use `h.rating || 4.5` fallback — always shows 4.5.

---

## 4. Mobile Navigation Structure

```
Root Stack (_layout.jsx)
├── index                     -- Splash (redirects based on auth state)
├── (auth)/  [Stack]
│   ├── index                 -- Login
│   ├── signup
│   ├── roleSelection         -- USER or AGENT choice
│   ├── ownerLogin            -- AGENT login
│   ├── forgotPassword
│   ├── verifyPassword        -- ⚠️ OTP skipped
│   ├── resetPassword
│   ├── successReset          -- 🚨 Injects dummy auth
│   └── changePassword
├── (tabs)/  [Bottom Tabs — 5 visible]
│   ├── index (Home)
│   ├── explore
│   ├── favorite
│   ├── myBooking
│   ├── profile
│   └── [18 hidden screens]
├── (owner)/ [Bottom Tabs — 5 visible, AGENT role]
│   ├── index (Dashboard)
│   ├── properties
│   ├── bookings
│   ├── messages
│   ├── profile
│   └── [7 hidden screens]
├── (onbording)/ [Stack]
│   ├── index
│   ├── onBoarding1
│   └── onBoarding2
└── (location)/ [Stack]
    ├── index
    └── maps
```

---

## 5. Screen → API Endpoint Map

| Screen | Endpoints Used | Notes |
|--------|---------------|-------|
| Login | `POST /api/auth/login` | |
| Signup | `POST /api/auth/register` | |
| Forgot Password | `POST /api/auth/forgot-password/email` or `/phone` | |
| Verify OTP | `POST /api/auth/verify-otp` | ⚠️ BYPASSED in code |
| Home | `GET /api/houses/recommended`, `/nearby`, `/popular`, `/top-locations` | ⚠️ hardcoded favorites/badge |
| Explore | `GET /api/filter` | ⚠️ hardcoded favorites |
| Favorite | `GET /api/houses/favorites` | |
| My Booking | `GET /api/bookings/my` | |
| Property Details | `GET /api/houses/:id` | |
| Write Review | `POST /api/reviews` | ⚠️ COMMENTED OUT |
| Chat | `GET /api/conversations` | ⚠️ online:true hardcoded |
| Chat Conversation | `GET/POST /api/conversations/:id/messages` | |
| Notifications | `GET /api/notifications`, `PATCH .../read` | |
| Notification Settings | `PATCH /api/users/me/notifications` | ⚠️ NOT CALLED |
| Settings | — | ⚠️ local state only |
| Video Feed | `GET /api/videos` | via videoStore |
| Video Upload | `POST /api/videos/upload` | |
| Owner Dashboard | `GET /api/houses/agent/dashboard` | |
| Owner Properties | `GET /api/houses/my-houses` | |
| Owner Bookings | `GET/PATCH /api/bookings/agent/all` | |
| Admin Dashboard | `GET /api/admin/stats` | React Query |
| Admin Videos | `GET /api/videos`, `DELETE /api/videos/:id` | React Query |
| Admin Users | `GET /api/users/admin/list` | React Query |
| Admin Bookings | `GET /api/bookings/agent/all` | React Query |

---

## 6. Data Fetching Patterns

| Layer | Pattern |
|-------|---------|
| **Backend** | Express 5 + Prisma + Zod validation + modular routes/controllers/services |
| **Mobile** | Axios (`services/api.js`) + Zustand + direct `useEffect` + `api.get()` per screen — **NO React Query** |
| **Admin** | Axios + Zustand (auth) + TanStack React Query v5 |

---

## 7. State Management

| App | Library | Stores |
|-----|---------|--------|
| Mobile | Zustand 5.x | `authStore` (user, token, login/logout), `locationStore`, `videoStore` |
| Admin | Zustand 5.x | `authStore` (ADMIN role gate) |

---

## 8. Infrastructure

| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL (Neon in production, Docker locally) |
| Cache | Redis (with in-memory fallback) |
| File Storage | Cloudinary (images + videos) |
| Email | Nodemailer |
| SMS | Twilio |
| Push | Firebase FCM — ⚠️ NOT IMPLEMENTED (stubs only) |
| Real-time | Socket.IO — ⚠️ client NOT installed in mobile |
| Deployment | Vercel (backend), Expo (mobile) |

---

## 9. Key Technical Debt Summary

| # | Issue | Impact |
|---|-------|--------|
| 1 | `socket.io-client` missing from mobile | Real-time messaging/presence/calls unavailable |
| 2 | House has no `rating` field | Every property always shows 4.5 stars |
| 3 | `writeReview.jsx` API call commented out | Reviews cannot be submitted |
| 4 | `notificationSettings.jsx` / `settings.jsx` not wired to API | Settings don't persist |
| 5 | No React Query on mobile | No caching, deduplication, or background refetch |
| 6 | Favorites initialized with hardcoded IDs | Wrong UI state for all users |
| 7 | FCM integration is a stub | Zero push notifications delivered |
| 8 | Admin `PATCH /api/users/:id` endpoint missing | Role update in admin panel broken |
| 9 | Deprecated `source.unsplash.com` | Location images broken |
| 10 | `successReset.jsx` injects dummy auth | Authentication bypass in prod |
