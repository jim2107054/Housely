# Housely

> A full-stack house rental platform comprising a React Native mobile app, a Node.js REST API, and a Next.js admin dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [System Design Diagram](#5-system-design-diagram)
6. [Entity-Relationship Diagram](#6-entity-relationship-diagram)
7. [Application Flow Diagram](#7-application-flow-diagram)
8. [UML Component Diagram](#8-uml-component-diagram)
9. [Activity Diagram](#9-activity-diagram)
10. [Class Diagram](#10-class-diagram)
11. [Sequence Diagrams](#11-sequence-diagrams)
12. [Data Flow Diagram (DFD)](#12-data-flow-diagram-dfd)
13. [API Reference](#13-api-reference)
14. [Database Schema](#14-database-schema)
15. [Authentication & Authorization](#15-authentication--authorization)
16. [Key Features & Modules](#16-key-features--modules)
17. [State Management](#17-state-management)
18. [Environment Variables](#18-environment-variables)
19. [Installation & Setup](#19-installation--setup)
20. [Deployment](#20-deployment)
21. [Testing Strategy](#21-testing-strategy)
22. [Error Handling & Logging](#22-error-handling--logging)
23. [Security Considerations](#23-security-considerations)
24. [Performance & Scalability Notes](#24-performance--scalability-notes)
25. [Known Issues / TODOs](#25-known-issues--todos)
26. [Contributing Guide](#26-contributing-guide)
27. [License](#27-license)

---

## 1. Project Overview

**Housely** is a house rental and sale platform targeting the Bangladeshi property market. It connects property seekers (users) with property owners/agents, enabling listing discovery, booking management, in-app messaging, and review submission — all from a mobile-first experience.

### Problem Solved

Finding and booking residential properties in Bangladesh is fragmented across informal channels. Housely centralises listings, enables direct user–agent communication, and provides agents with a self-service dashboard to manage properties and bookings.

### Intended Users

| Actor | Description |
|-------|-------------|
| **USER** | General public browsing and booking properties |
| **AGENT** | Property owners/agents who list and manage properties |
| **ADMIN** | Platform administrators managing the entire system via the web dashboard |

### Key Value Proposition

- Mobile-first search with location-based and filter-based property discovery
- Real-time in-app messaging between users and agents via Socket.IO
- Verified listing management with image/video uploads to Cloudinary
- Unified admin dashboard for platform oversight, analytics, and moderation

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native 0.81, Expo ~54, Expo Router ~6 (file-based routing) |
| **Mobile UI** | NativeWind 4 (TailwindCSS), React Native Paper, Lucide React Native |
| **Mobile State** | Zustand 5, AsyncStorage (token persistence) |
| **Admin Frontend** | Next.js 14 (App Router), TypeScript |
| **Admin UI** | Shadcn/ui, Tailwind CSS, Recharts |
| **Admin State** | Zustand (UI), TanStack React Query 5 (server state) |
| **Admin Auth** | NextAuth v5 (Credentials provider, JWT strategy) |
| **Backend Language** | Node.js 20 (ESM) |
| **Backend Framework** | Express 5 |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 6 |
| **Caching / Sessions** | Redis 7 (with in-memory fallback via `MemoryStore`) |
| **Authentication** | JWT (access token 15 min + refresh token 7 days, stored in Redis) |
| **Real-time** | Socket.IO 4 (WebSocket, JWT-authenticated) |
| **Media Storage** | Cloudinary (images & videos) |
| **Email** | Nodemailer (Gmail transport) |
| **SMS / OTP** | Twilio |
| **Push Notifications** | Firebase Cloud Messaging (FCM) — partially integrated |
| **API Validation** | Zod 3 |
| **API Docs** | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| **Deployment — Backend** | Vercel (serverless, `@vercel/node`) |
| **Deployment — Local Dev** | Docker Compose (PostgreSQL 16 + Redis 7) |
| **Testing** | Jest 29 + Supertest |

---

## 3. Project Structure

```
Housely/
├── .env.example                  # Root environment variable template
├── .gitignore                    # Root gitignore
├── package.json                  # Workspace scripts
├── Housely_API_Collection.postman_collection.json  # Full API Postman collection
├── housely_mermaid_diagrams.md   # Architecture & design diagrams
├── README.md                     # This file
│
├── backend/                  # Express REST API + Socket.IO server
│   ├── server.js             # HTTP server entry point; bootstraps Socket.IO
│   ├── vercel.json           # Vercel serverless deployment config
│   ├── docker-compose.yml    # Local dev: PostgreSQL + Redis containers
│   ├── jest.config.js        # Jest test configuration
│   ├── .env.example          # Backend environment variable template
│   ├── prisma/
│   │   ├── schema.prisma     # Complete data model (16 models, 5 enums)
│   │   ├── seed.js           # Database seed script (test data)
│   │   └── sync-clerk.js     # Clerk user sync utility
│   ├── __tests__/
│   │   └── api.test.js       # Integration tests (Supertest)
│   └── src/
│       ├── app.js            # Express app: middleware, route mounting
│       ├── config/
│       │   ├── env.js        # Centralised environment variable loader
│       │   ├── prisma.js     # Prisma client singleton
│       │   ├── redis.js      # Redis client (with MemoryStore fallback)
│       │   ├── cloudinary.js # Cloudinary SDK configuration
│       │   ├── swagger.js    # Swagger setup
│       │   └── swagger-paths.js  # Swagger path definitions
│       ├── middlewares/
│       │   ├── auth.js       # JWT protect + requireRole guards
│       │   ├── errorHandler.js # Global Express error handler
│       │   ├── rateLimiter.js  # Redis-backed rate limiting factory
│       │   ├── upload.js     # Multer (memory storage, 10 MB limit)
│       │   └── validate.js   # Zod schema validation middleware
│       ├── modules/          # Feature modules (MVC: routes/controller/service/validation)
│       │   ├── auth/         # Registration, login, logout, OTP password reset
│       │   ├── user/         # Profile management, notification settings
│       │   ├── house/        # Listing CRUD, favorites, views, recommendations
│       │   ├── filter/       # Advanced property search with pagination
│       │   ├── booking/      # Booking lifecycle management
│       │   ├── payment/      # SSLCommerz payment gateway integration
│       │   ├── review/       # Post-booking reviews with media
│       │   ├── message/      # Conversations + messages (REST layer)
│       │   ├── notification/ # In-app notifications + device token management
│       │   ├── location/     # Reverse geocoding + saved locations
│       │   └── admin/        # Platform analytics, user/content moderation
│       ├── sockets/
│       │   └── index.js      # Socket.IO server: auth middleware + real-time events
│       └── utils/
│           ├── jwt.js        # Token generation, verification, Redis storage
│           ├── otp.js        # OTP generation & Redis-backed verification
│           ├── email.js      # Nodemailer email sending (Gmail)
│           ├── sms.js        # Twilio SMS sending (BD phone formatting)
│           ├── response.js   # Standardised success/error response helpers
│           └── errorCodes.js # Application-level error code constants
│
├── mobile/                   # React Native (Expo) mobile application
│   ├── app.json              # Expo app configuration
│   ├── config.js             # API base URL resolution (env / platform fallback)
│   ├── app/                  # Expo Router file-based screens
│   │   ├── index.jsx         # Splash / auth router (redirects on startup)
│   │   ├── _layout.jsx       # Root layout
│   │   ├── (auth)/           # Authentication screens (login, register, OTP, reset)
│   │   ├── (onbording)/      # Onboarding screens for new users
│   │   ├── (kyc)/            # KYC / identity verification screens
│   │   ├── (location)/       # Location permission & selection screens
│   │   ├── (tabs)/           # Main user tab navigator (home, explore, bookings, etc.)
│   │   └── (owner)/          # Agent/owner tab navigator (properties, bookings, earnings)
│   ├── services/
│   │   ├── api.js            # Axios instance (token injection, 401 refresh flow)
│   │   └── socketService.js  # Socket.IO client (connect/disconnect helpers)
│   ├── store/
│   │   ├── authStore.js      # Zustand store: user session, login, logout, checkAuth
│   │   └── locationStore.js  # Zustand store: user location state
│   ├── components/           # Shared UI primitives (Button, SafeScreen)
│   ├── constants/            # Color palette and design tokens
│   ├── hooks/                # Custom React hooks
│   ├── assets/               # Fonts and images
│   └── data/                 # Static dummy/seed data for development
│
└── housely-admin/            # Next.js 14 admin dashboard
    ├── next.config.mjs       # Next.js config (Cloudinary + Google image domains)
    └── src/
        ├── app/
        │   ├── layout.tsx    # Root layout with Providers wrapper
        │   ├── providers.tsx # SessionProvider + QueryClientProvider
        │   ├── (auth)/       # Login page (NextAuth sign-in)
        │   └── (dashboard)/  # Protected dashboard pages
        │       ├── dashboard/    # Overview: stats, revenue chart, top agents/properties
        │       ├── users/        # User listing, role change, verification toggle
        │       ├── properties/   # House listing and status management
        │       ├── bookings/     # Booking overview and status updates
        │       ├── payments/     # Payment records
        │       ├── reviews/      # Review moderation
        │       ├── revenue/      # Revenue analytics
        │       └── notifications/ # Broadcast notifications
        ├── components/
        │   ├── dashboard/    # Stat cards, charts (Revenue, BookingStatus)
        │   ├── layout/       # Sidebar, topbar, shell
        │   ├── shared/       # PageHeader, data tables
        │   └── ui/           # Shadcn/ui primitives
        ├── hooks/            # TanStack Query hooks (useAdminStats, useBookings, etc.)
        ├── lib/
        │   ├── api.ts        # Axios instance (NextAuth session token injection)
        │   ├── auth.ts       # NextAuth config (Credentials → ADMIN-only gate)
        │   ├── query-client.ts # TanStack QueryClient singleton
        │   └── utils.ts      # Utility helpers (formatCurrency, formatRelative)
        ├── store/
        │   └── uiStore.ts    # Zustand UI store (sidebar open/close)
        └── types/            # TypeScript type definitions
```

---

## 4. Architecture Overview

### Pattern

The system follows a **layered monolith** architecture (per sub-project), with a clear **MVC-like structure** in the backend:

```
Routes → Middleware Pipeline → Controller → Service → Prisma ORM → PostgreSQL
```

The backend is deployed as a **serverless function** on Vercel, making the application effectively stateless at the HTTP level, with Redis handling shared state (sessions, OTPs, rate limiting).

### Communication Layers

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile ↔ API | HTTPS REST (Axios) | JWT in `Authorization: Bearer` header |
| Mobile ↔ API | WebSocket (Socket.IO) | JWT passed in `socket.handshake.auth.token` |
| Admin ↔ API | HTTPS REST (Axios) | JWT from NextAuth session |
| API ↔ Database | TCP (Prisma) | Neon serverless PostgreSQL |
| API ↔ Cache | TCP / In-memory | Redis or MemoryStore fallback |
| API ↔ Cloudinary | HTTPS | Streaming upload via `upload_stream` |
| API ↔ Twilio | HTTPS | SMS OTP delivery |
| API ↔ Gmail | SMTPS | OTP & notification emails |

### Design Patterns

- **Repository-like pattern**: each module has a `*.service.js` that owns all database access; controllers orchestrate and respond only.
- **Factory pattern**: `rateLimiter(maxRequests, windowSeconds)` returns a configured middleware instance.
- **Middleware chain**: auth guard → role guard → validation → controller.
- **Singleton**: Prisma client, Redis client, Cloudinary SDK are each instantiated once and shared via ES module caching.
- **Fallback / Null Object**: `MemoryStore` mirrors the Redis API so the app runs without a Redis instance during development.
- **Observer (Socket.IO rooms)**: users and agents join personal rooms (`user:<id>`) and conversation rooms (`conversation:<id>`) to receive targeted real-time events.

---

## 5. System Design Diagram

```mermaid
graph TD
    subgraph Clients
        MA[Mobile App\nReact Native / Expo]
        AD[Admin Dashboard\nNext.js 14]
    end

    subgraph Backend["Backend (Vercel Serverless)"]
        GW[Express 5 App\napp.js]
        MW[Middleware\nauth · validate · rateLimiter · upload]
        MOD[Feature Modules\nauth · user · house · booking\nreview · message · notification\nfilter · location · admin]
        SOCK[Socket.IO Server\nReal-time Messaging]
    end

    subgraph Data
        PG[(PostgreSQL\nNeon Serverless)]
        RD[(Redis\nor MemoryStore)]
    end

    subgraph External
        CLD[Cloudinary\nImage & Video CDN]
        TWL[Twilio\nSMS OTP]
        MAIL[Gmail / Nodemailer\nEmail OTP]
        FCM[Firebase FCM\nPush Notifications]
    end

    MA -->|HTTPS REST| GW
    MA -->|WebSocket| SOCK
    AD -->|HTTPS REST| GW
    GW --> MW --> MOD
    MOD --> PG
    MOD --> RD
    MOD --> CLD
    MOD --> TWL
    MOD --> MAIL
    MOD --> FCM
    SOCK -->|JWT auth| RD
    SOCK --> PG
    SOCK -->|emit events| MA
```

---

## 6. Entity-Relationship Diagram

```mermaid
erDiagram
    User {
        String id PK
        String username UK
        String email UK
        String password
        String phoneNumber UK
        String name
        String bio
        DateTime dateOfBirth
        String avatar
        Role role
        AuthProvider authProvider
        String googleId UK
        String facebookId UK
        Boolean isVerified
        DateTime createdAt
        DateTime updatedAt
    }

    SavedLocation {
        String id PK
        String userId FK
        String label
        String address
        String city
        String area
        String street
        Float latitude
        Float longitude
        DateTime createdAt
    }

    House {
        String id PK
        String name
        String description
        HouseStatus status
        Float rentPerMonth
        Float salePrice
        ListingType listingType
        PropertyType propertyType
        String address
        String city
        String area
        Float latitude
        Float longitude
        Int bedrooms
        Int bathrooms
        Float sizeInSqft
        Int buildYear
        Boolean hasWifi
        Boolean hasWater
        String agentId FK
        DateTime createdAt
        DateTime updatedAt
    }

    HouseImage {
        String id PK
        String houseId FK
        String url
        Int order
    }

    HouseVideo {
        String id PK
        String houseId FK
        String url
    }

    PublicFacility {
        String id PK
        String houseId FK
        Boolean wifi
        Boolean water
        Boolean electricity
        Boolean parking
        Float mosqueDistance
        Float hospitalDistance
        Float shoppingMallDistance
        Float marketDistance
    }

    HouseView {
        String id PK
        String userId FK
        String houseId FK
        DateTime viewedAt
    }

    Favorite {
        String id PK
        String userId FK
        String houseId FK
        DateTime createdAt
    }

    NotificationSettings {
        String id PK
        String userId FK
        Boolean pushEnabled
        Boolean emailEnabled
        Boolean smsEnabled
        Boolean bookingUpdates
        Boolean promotions
    }

    Payment {
        String id PK
        String userId FK
        String bookingId FK
        Float amount
        String currency
        String method
        String transactionId UK
        String gatewayResponse
        PaymentStatus status
        String description
        DateTime createdAt
    }

    Booking {
        String id PK
        String userId FK
        String houseId FK
        String agentId FK
        DateTime checkIn
        DateTime checkOut
        Float totalAmount
        BookingStatus status
        PaymentStatus paymentStatus
        String notes
        DateTime createdAt
        DateTime updatedAt
    }

    Review {
        String id PK
        String userId FK
        String houseId FK
        String bookingId FK
        Int rating
        String comment
        DateTime createdAt
        DateTime updatedAt
    }

    ReviewMedia {
        String id PK
        String reviewId FK
        String url
        String type
    }

    Conversation {
        String id PK
        String userId FK
        String agentId FK
        String houseId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Message {
        String id PK
        String conversationId FK
        String senderId FK
        String content
        String type
        Boolean isRead
        DateTime createdAt
    }

    Notification {
        String id PK
        String userId FK
        NotificationType type
        String title
        String message
        Json data
        Boolean isRead
        DateTime createdAt
    }

    DeviceToken {
        String id PK
        String userId FK
        String token UK
        String platform
        DateTime createdAt
    }

    User ||--o{ SavedLocation : "saves"
    User ||--o{ House : "lists as agent"
    User ||--o{ HouseView : "views"
    User ||--o{ Favorite : "favorites"
    User ||--|| NotificationSettings : "has"
    User ||--o{ Payment : "makes"
    User ||--o{ Booking : "books as user"
    User ||--o{ Booking : "receives as agent"
    User ||--o{ Review : "writes"
    User ||--o{ Conversation : "participates as user"
    User ||--o{ Conversation : "participates as agent"
    User ||--o{ Message : "sends"
    User ||--o{ Notification : "receives"
    User ||--o{ DeviceToken : "registers"

    House ||--o{ HouseImage : "has"
    House ||--o| HouseVideo : "has"
    House ||--o| PublicFacility : "has"
    House ||--o{ HouseView : "receives"
    House ||--o{ Favorite : "favorited by"
    House ||--o{ Booking : "booked in"
    House ||--o{ Review : "reviewed in"
    House ||--o{ Conversation : "discussed in"

    Booking ||--o{ Payment : "paid via"
    Booking ||--o| Review : "reviewed after"

    Review ||--o{ ReviewMedia : "has"

    Conversation ||--o{ Message : "contains"
```

---

## 7. Application Flow Diagram

```mermaid
flowchart TD
    A([User Opens App]) --> B{Auth Check\nauthStore.checkAuth}
    B -->|Token valid| C{User Role?}
    B -->|No token| D[Onboarding Screens]
    D --> E[Role Selection]
    E --> F[Sign Up / Log In]
    F -->|Success| C
    F -->|Failure| G[Show Error\nretry]
    G --> F

    C -->|USER| H[(User Tab Navigator)]
    C -->|AGENT| I[(Owner Tab Navigator)]

    H --> J[Home / Explore\nBrowse Listings]
    J --> K[Apply Filters\nGET /api/filter]
    K --> L[Property Details\nGET /api/houses/:id]
    L --> M{Action?}

    M -->|Book| N[Create Booking\nPOST /api/bookings]
    N --> O{Booking Result}
    O -->|PENDING| P[Await Agent Confirmation]
    O -->|Error| Q[Show Error Toast]

    M -->|Message Agent| R[Open / Create Conversation\nPOST /api/conversations]
    R --> S[Real-time Chat\nSocket.IO message:send]
    S --> T[Agent Receives\nSocket.IO message:new]

    M -->|Favorite| U[Toggle Favorite\nPOST /api/houses/:id/favorite]

    P --> V{Agent Action\nin Owner Tab}
    I --> V
    V -->|Confirm| W[PATCH /api/bookings/agent/:id/status CONFIRMED]
    V -->|Cancel| X[PATCH /api/bookings/agent/:id/status CANCELLED]

    W --> Y[User Notified\nin-app + push]
    X --> Y

    N --> Z{Booking Completed?}
    Z -->|Yes| AA[Write Review\nPOST /api/reviews]
    AA --> AB[Review Saved\nvisible on listing]

    subgraph Admin Flow
        AC([Admin Opens Dashboard]) --> AD[NextAuth Login\nADMIN role only]
        AD --> AE[Dashboard Overview\nGET /api/admin/stats]
        AE --> AF{Moderate Content}
        AF -->|Manage Users| AG[PATCH role / verify / DELETE]
        AF -->|Manage Listings| AH[PATCH status / DELETE]
        AF -->|Manage Bookings| AI[PATCH booking status]
        AF -->|Send Broadcast| AJ[POST /api/admin/notifications/send]
    end
```

---

---

## 8. UML Component Diagram

```mermaid
graph LR
    subgraph MobileApp["Mobile App (React Native / Expo)"]
        MA_Auth[Auth Module]
        MA_Browse[Browse & Filter]
        MA_Booking[Booking Module]
        MA_Chat[Chat Module]
        MA_Profile[Profile Module]
        MA_Socket[SocketService]
        MA_API[API Service\nAxios + Interceptors]
        MA_Store[Zustand Store\nauthStore · locationStore]
    end

    subgraph AdminDash["Admin Dashboard (Next.js 14)"]
        AD_Auth[NextAuth\nCredentials Provider]
        AD_Pages[Dashboard Pages\nusers · properties · bookings · reviews]
        AD_Hooks[TanStack Query Hooks]
        AD_API[API Client\nAxios + session token]
    end

    subgraph BackendServer["Backend (Express 5 / Vercel)"]
        BE_Router[Express Router]
        BE_MW[Middleware\nauth · validate · rateLimiter · upload]
        BE_Auth[Auth Module]
        BE_User[User Module]
        BE_House[House Module]
        BE_Booking[Booking Module]
        BE_Review[Review Module]
        BE_Message[Message Module]
        BE_Notification[Notification Module]
        BE_Filter[Filter Module]
        BE_Location[Location Module]
        BE_Admin[Admin Module]
        BE_Socket[Socket.IO Server]
    end

    subgraph DataLayer["Data Layer"]
        DB[(PostgreSQL\nNeon)]
        CACHE[(Redis / MemoryStore)]
    end

    subgraph ExternalServices["External Services"]
        CDN[Cloudinary]
        SMS[Twilio]
        EMAIL[Gmail SMTP]
        FCM[Firebase FCM]
    end

    MA_API -->|REST| BE_Router
    MA_Socket -->|WebSocket| BE_Socket
    AD_API -->|REST| BE_Router

    BE_Router --> BE_MW
    BE_MW --> BE_Auth & BE_User & BE_House & BE_Booking & BE_Review & BE_Message & BE_Notification & BE_Filter & BE_Location & BE_Admin

    BE_Auth & BE_User & BE_House & BE_Booking & BE_Review & BE_Message & BE_Notification & BE_Filter & BE_Location & BE_Admin --> DB
    BE_Auth & BE_Notification --> CACHE
    BE_Socket --> DB & CACHE

    BE_House --> CDN
    BE_Auth --> SMS & EMAIL
    BE_Notification --> FCM

    MA_Store --> MA_Auth & MA_Browse & MA_Booking & MA_Chat & MA_Profile
    AD_Auth --> AD_Pages
    AD_Hooks --> AD_API
```

---

## 9. Activity Diagram

### User Booking Flow

```mermaid
stateDiagram-v2
    [*] --> BrowseListings : User opens app

    BrowseListings --> ViewProperty : Tap on listing
    ViewProperty --> CheckAvailability : Tap Book Now
    CheckAvailability --> LoginPrompt : User not authenticated
    LoginPrompt --> ViewProperty : Login success

    CheckAvailability --> FillBookingForm : User authenticated
    FillBookingForm --> ValidateInput : Submit form
    ValidateInput --> FillBookingForm : Validation fails
    ValidateInput --> CreateBookingRecord : Validation passes

    CreateBookingRecord --> BookingPending : POST /api/bookings status PENDING
    BookingPending --> NotifyAgent : Push notification sent to agent

    NotifyAgent --> AgentReviews : Agent opens Owner tab
    AgentReviews --> AgentConfirms : Tap Confirm
    AgentReviews --> AgentCancels : Tap Cancel

    AgentConfirms --> BookingConfirmed : status becomes CONFIRMED
    AgentCancels --> BookingCancelled : status becomes CANCELLED

    BookingConfirmed --> NotifyUser : Push and in-app notification
    BookingCancelled --> NotifyUser

    NotifyUser --> BookingCompleted : Stay end date reached
    BookingCompleted --> CanLeaveReview : POST /api/reviews
    CanLeaveReview --> ReviewPublished : Review saved
    ReviewPublished --> [*]
    BookingCancelled --> [*]
```

### OTP Password Reset Flow

```mermaid
stateDiagram-v2
    [*] --> RequestOTP : User requests password reset

    RequestOTP --> ChooseChannel : POST /api/auth/forgot-password
    ChooseChannel --> SendEmailOTP : channel is email
    ChooseChannel --> SendSMSOTP : channel is phone

    SendEmailOTP --> OTPStored : OTP saved in Redis TTL 10 min
    SendSMSOTP --> OTPStored

    OTPStored --> UserEntersOTP : OTP delivered
    UserEntersOTP --> VerifyOTP : POST /api/auth/verify-otp
    VerifyOTP --> OTPInvalid : OTP wrong or expired
    OTPInvalid --> UserEntersOTP : Retry

    VerifyOTP --> ResetTokenIssued : OTP valid
    ResetTokenIssued --> SetNewPassword : POST /api/auth/reset-password
    SetNewPassword --> PasswordUpdated : bcrypt hash saved
    PasswordUpdated --> [*]
```

---

## 10. Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String username
        +String email
        +String password
        +String phoneNumber
        +String name
        +Role role
        +Boolean isVerified
        +DateTime createdAt
        +register(dto) Promise
        +login(dto) Promise
        +updateProfile(id, dto) Promise
        +changeRole(id, role) Promise
    }

    class House {
        +String id
        +String name
        +String description
        +HouseStatus status
        +Float rentPerMonth
        +Float salePrice
        +ListingType listingType
        +PropertyType propertyType
        +String agentId
        +DateTime createdAt
        +create(agentId, dto) Promise
        +update(id, dto) Promise
        +delete(id) Promise
        +toggleFavorite(userId, houseId) Promise
        +recordView(userId, houseId) Promise
    }

    class Booking {
        +String id
        +String userId
        +String houseId
        +String agentId
        +DateTime checkIn
        +DateTime checkOut
        +Float totalAmount
        +BookingStatus status
        +PaymentStatus paymentStatus
        +create(userId, dto) Promise
        +updateStatus(id, status) Promise
        +getUserBookings(userId) Promise
        +getAgentBookings(agentId) Promise
    }

    class Review {
        +String id
        +String userId
        +String houseId
        +String bookingId
        +Int rating
        +String comment
        +create(userId, dto) Promise
        +update(id, dto) Promise
        +delete(id) Promise
        +getByHouse(houseId) Promise
    }

    class Conversation {
        +String id
        +String userId
        +String agentId
        +String houseId
        +DateTime createdAt
        +create(userId, agentId, houseId) Promise
        +getByUser(userId) Promise
        +getByAgent(agentId) Promise
    }

    class Message {
        +String id
        +String conversationId
        +String senderId
        +String content
        +String type
        +Boolean isRead
        +send(senderId, conversationId, content) Promise
        +markRead(conversationId, userId) Promise
        +getByConversation(conversationId) Promise
    }

    class Notification {
        +String id
        +String userId
        +NotificationType type
        +String title
        +String message
        +Boolean isRead
        +create(userId, dto) Promise
        +markRead(id) Promise
        +getByUser(userId) Promise
    }

    class Payment {
        +String id
        +String userId
        +String bookingId
        +Float amount
        +PaymentStatus status
        +String transactionId
        +create(userId, bookingId, dto) Promise
        +updateStatus(id, status) Promise
    }

    class AuthService {
        +register(dto) Promise
        +login(dto) Promise
        +logout(userId) Promise
        +refreshToken(token) Promise
        +forgotPassword(dto) Promise
        +verifyOtp(dto) Promise
        +resetPassword(dto) Promise
    }

    class JWTUtil {
        +generateAccessToken(payload) String
        +generateRefreshToken(payload) String
        +verifyToken(token, secret) Object
        +storeRefreshToken(userId, token) Promise
        +revokeRefreshToken(userId) Promise
    }

    class OTPUtil {
        +generateOTP() String
        +storeOTP(key, otp, ttl) Promise
        +verifyOTP(key, otp) Promise
    }

    User "1" --> "0..*" House : lists
    User "1" --> "0..*" Booking : creates
    User "1" --> "0..*" Review : writes
    User "1" --> "0..*" Conversation : participates
    User "1" --> "0..*" Message : sends
    User "1" --> "0..*" Notification : receives
    User "1" --> "0..*" Payment : makes

    House "1" --> "0..*" Booking : subject of
    House "1" --> "0..*" Review : receives
    House "1" --> "0..*" Conversation : discussed in

    Booking "1" --> "0..*" Payment : paid via
    Booking "1" --> "0..1" Review : reviewed after
    Conversation "1" --> "0..*" Message : contains

    AuthService --> JWTUtil : uses
    AuthService --> OTPUtil : uses
```

---

## 11. Sequence Diagrams

### Authentication Sequence

```mermaid
sequenceDiagram
    actor U as User
    participant MA as Mobile App
    participant API as Backend API
    participant DB as PostgreSQL
    participant RD as Redis

    U->>MA: Enter credentials and tap Login
    MA->>API: POST /api/auth/login
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record
    API->>API: bcrypt.compare(password, hash)
    alt Invalid credentials
        API-->>MA: 401 Invalid credentials
        MA-->>U: Show error toast
    else Valid credentials
        API->>API: generateAccessToken(payload)
        API->>API: generateRefreshToken(payload)
        API->>RD: SET refresh:userId token EX 604800
        API-->>MA: 200 accessToken + refreshToken + user
        MA->>MA: Store tokens in AsyncStorage
        MA->>MA: authStore.setUser(user)
        MA-->>U: Redirect to Home tab
    end
```

### Token Refresh Sequence

```mermaid
sequenceDiagram
    actor U as User
    participant MA as Mobile App
    participant API as Backend API
    participant RD as Redis

    MA->>API: Authenticated request
    API-->>MA: 401 Token expired
    MA->>MA: Axios interceptor catches 401
    MA->>API: POST /api/auth/refresh-token
    API->>API: verifyToken(refreshToken, REFRESH_SECRET)
    API->>RD: GET refresh:userId
    RD-->>API: Stored refresh token
    alt Tokens match
        API->>API: generateAccessToken(payload)
        API->>RD: SET refresh:userId newToken EX 604800
        API-->>MA: 200 new accessToken + refreshToken
        MA->>MA: Update tokens in AsyncStorage
        MA->>API: Retry original request
        API-->>MA: 200 Original response
        MA-->>U: Seamless experience
    else Mismatch or expired
        API-->>MA: 401 Refresh token invalid
        MA->>MA: authStore.logout()
        MA-->>U: Redirect to Login screen
    end
```

### Real-time Messaging Sequence

```mermaid
sequenceDiagram
    actor U as User
    actor A as Agent
    participant MAU as Mobile App User
    participant MAA as Mobile App Agent
    participant SOCK as Socket.IO Server
    participant API as REST API
    participant DB as PostgreSQL

    U->>MAU: Tap Message Agent on property
    MAU->>API: POST /api/conversations
    API->>DB: findOrCreate Conversation
    DB-->>API: Conversation record
    API-->>MAU: conversationId
    MAU->>SOCK: emit conversation:join
    MAA->>SOCK: emit conversation:join

    U->>MAU: Type message and send
    MAU->>SOCK: emit message:send
    SOCK->>DB: INSERT Message
    SOCK-->>MAA: event message:new
    A-->>MAA: See new message in real time

    A->>MAA: Type reply and send
    MAA->>SOCK: emit message:send
    SOCK->>DB: INSERT Message
    SOCK-->>MAU: event message:new
    U-->>MAU: See reply in real time
```

---

## 12. Data Flow Diagram (DFD)

### Level 0 — Context Diagram

```mermaid
graph LR
    USER([User and Agent\nMobile App])
    ADMIN([Administrator\nWeb Dashboard])
    EXT([External Services\nCloudinary Twilio Gmail FCM])

    SYSTEM[["Housely Platform"]]

    USER -->|Search Book Message Review| SYSTEM
    SYSTEM -->|Listings Bookings Notifications Chat| USER
    ADMIN -->|Moderate Manage Analytics| SYSTEM
    SYSTEM -->|Reports Stats| ADMIN
    SYSTEM -->|Media OTP Push| EXT
    EXT -->|CDN URLs Delivery Confirmations| SYSTEM
```

### Level 1 — Main Processes

```mermaid
graph TD
    subgraph Actors
        UA([User and Agent])
        AD([Admin])
    end

    subgraph Processes
        P1[1.0 Authentication\nand Session Mgmt]
        P2[2.0 Property\nManagement]
        P3[3.0 Booking\nManagement]
        P4[4.0 Messaging and\nNotifications]
        P5[5.0 Review\nManagement]
        P6[6.0 Admin and\nAnalytics]
    end

    subgraph DataStores
        DS1[(D1 Users)]
        DS2[(D2 Houses)]
        DS3[(D3 Bookings)]
        DS4[(D4 Messages and Conversations)]
        DS5[(D5 Reviews)]
        DS6[(D6 Notifications)]
        DS7[(D7 Redis Sessions and OTP)]
    end

    UA -->|Credentials OTP| P1
    P1 -->|JWT Tokens| UA
    P1 --- DS1
    P1 --- DS7

    UA -->|Create Edit Listing Upload Media| P2
    P2 -->|Listing Details Images| UA
    P2 --- DS2

    UA -->|Booking Request Status Update| P3
    P3 -->|Booking Confirmation Notification| UA
    P3 --- DS3
    P3 --- DS2

    UA -->|Send Message Read Messages| P4
    P4 -->|Real-time Messages Push Notifications| UA
    P4 --- DS4
    P4 --- DS6

    UA -->|Submit Review Upload Media| P5
    P5 -->|Review Confirmation| UA
    P5 --- DS5
    P5 --- DS3

    AD -->|Manage Users Moderate Content| P6
    P6 -->|Analytics Reports Platform Stats| AD
    P6 --- DS1
    P6 --- DS2
    P6 --- DS3
    P6 --- DS5
```

### Level 2 — Property Search Drill-down

```mermaid
graph TD
    UA([User])

    P2_1[2.1 Receive Search\nParameters]
    P2_2[2.2 Apply Filters\ncity area price type beds baths]
    P2_3[2.3 Query Database\nwith Pagination]
    P2_4[2.4 Record Property View]
    P2_5[2.5 Return Paginated\nResults]

    DS_HOUSE[(D2 Houses)]
    DS_VIEW[(D2a HouseViews)]

    UA -->|Search query and filters| P2_1
    P2_1 --> P2_2
    P2_2 --> P2_3
    P2_3 --- DS_HOUSE
    P2_3 --> P2_4
    P2_4 --- DS_VIEW
    P2_4 --> P2_5
    P2_5 -->|Listing results| UA
```

---

## 13. API Reference

All responses follow the standard envelope:

```json
{ "success": true,  "message": "...", "...data": "..." }
{ "success": false, "message": "...", "errors": [...] }
```

Base URL: `https://<your-domain>` (or `http://localhost:3000` locally).
Swagger UI: `GET /api/docs`
Swagger JSON: `GET /api/docs.json`

---

### Health & App Info

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health` | Server health check | No |
| GET | `/api/app/about` | App name, version, support info | No |

---

### Auth — `/api/auth`

| Method | Path | Description | Body | Auth |
|--------|------|-------------|------|------|
| POST | `/api/auth/register` | Register a new user | `{ username, email, password }` | No |
| POST | `/api/auth/login` | Login (rate-limited 5/min) | `{ email, password }` | No |
| POST | `/api/auth/logout` | Invalidate refresh token in Redis | — | Yes |
| POST | `/api/auth/refresh-token` | Issue new access token | `{ refreshToken }` | No |
| POST | `/api/auth/forgot-password/email` | Send OTP to email (3/min) | `{ email }` | No |
| POST | `/api/auth/forgot-password/phone` | Send OTP via SMS (3/min) | `{ phoneNumber }` | No |
| POST | `/api/auth/verify-otp` | Verify OTP code (5/min) | `{ identifier, otp }` | No |
| POST | `/api/auth/reset-password` | Set new password after OTP verify | `{ identifier, newPassword }` | No |

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": "...", "username": "...", "email": "...", "role": "USER" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Users — `/api/users`

All routes require `Authorization: Bearer <token>`.

| Method | Path | Description | Body / Params |
|--------|------|-------------|---------------|
| GET | `/api/users/me` | Get own profile | — |
| PATCH | `/api/users/me` | Update profile | `{ name, bio, phoneNumber, dateOfBirth }` |
| POST | `/api/users/me/avatar` | Upload avatar image | `multipart/form-data` field `avatar` |
| GET | `/api/users/me/payment-history` | List own payments | — |
| GET | `/api/users/me/notifications` | Get notification preferences | — |
| PATCH | `/api/users/me/notifications` | Update notification preferences | `{ pushEnabled, emailEnabled, smsEnabled, ... }` |
| GET | `/api/users/me/recent-viewed` | Get recently viewed houses | — |

---

### Houses — `/api/houses`

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| GET | `/api/houses` | List all houses (paginated) | No | — |
| GET | `/api/houses/top-locations` | Cities with most listings | No | — |
| GET | `/api/houses/popular` | Most-viewed houses | No | — |
| GET | `/api/houses/favorites` | Current user's favourites | Yes | — |
| GET | `/api/houses/recommended` | Personalised recommendations | Yes | — |
| GET | `/api/houses/nearby` | Houses near user's coordinates | Yes | — |
| GET | `/api/houses/my-houses` | Agent's own listings | Yes | AGENT / ADMIN |
| GET | `/api/houses/agent/dashboard` | Agent stats + recent bookings | Yes | AGENT / ADMIN |
| POST | `/api/houses` | Create a new listing | Yes | AGENT / ADMIN |
| POST | `/api/houses/upload` | Upload images/videos (max 10 files, 10 MB each) | Yes | AGENT / ADMIN |
| GET | `/api/houses/:id` | Get house detail | No | — |
| GET | `/api/houses/:id/share-link` | Generate deep-link URL | No | — |
| POST | `/api/houses/:id/view` | Track a house view | Yes | — |
| POST | `/api/houses/:id/favorite` | Toggle favorite | Yes | — |
| PATCH | `/api/houses/:id` | Update listing | Yes | AGENT / ADMIN |
| DELETE | `/api/houses/:id` | Delete listing | Yes | AGENT / ADMIN |

**Create house body:**
```json
{
  "name": "Modern 3BR Apartment",
  "listingType": "RENT",
  "propertyType": "APARTMENT",
  "rentPerMonth": 25000,
  "address": "Road 5, Dhanmondi",
  "city": "Dhaka",
  "bedrooms": 3,
  "bathrooms": 2
}
```

---

### Filter / Search — `/api/filter`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/filter` | Advanced search with filters & pagination | No |
| GET | `/api/filter/search` | Same handler (alias) | No |

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text keyword search |
| `listingType` | `RENT` or `SALE` | Listing type filter |
| `propertyType` | comma-separated | E.g. `APARTMENT,STUDIO` |
| `city` | string | City name |
| `area` | string | Neighbourhood |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `bedrooms` | number | Exact bedroom count |
| `bathrooms` | number | Exact bathroom count |
| `minSize` | number | Minimum size (sqft) |
| `maxSize` | number | Maximum size (sqft) |
| `buildYear` | number | Build year |
| `hasWifi` | boolean | WiFi available |
| `hasWater` | boolean | Water available |
| `status` | `AVAILABLE` or `UNAVAILABLE` | Availability |
| `sortBy` | `newest`, `price_asc`, `price_desc` | Sort order |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 100) |

---

### Bookings — `/api/bookings`

All routes require authentication.

| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|
| POST | `/api/bookings` | Create a booking | Yes | — |
| GET | `/api/bookings/my` | List own bookings | Yes | — |
| GET | `/api/bookings/agent/all` | All bookings for agent's properties | Yes | AGENT / ADMIN |
| PATCH | `/api/bookings/agent/:id/status` | Update booking status | Yes | AGENT / ADMIN |
| GET | `/api/bookings/:id` | Get single booking | Yes | — |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking | Yes | — |

**Create booking body:**
```json
{
  "houseId": "clx...",
  "checkIn": "2026-05-01T00:00:00Z",
  "checkOut": "2026-06-01T00:00:00Z",
  "notes": "Prefer ground floor"
}
```

---

### Reviews — `/api/reviews`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/reviews` | Create review (requires completed booking) | Yes |
| GET | `/api/reviews/my` | Own reviews | Yes |
| GET | `/api/reviews/agent` | Reviews for agent's properties | Yes |
| GET | `/api/reviews/house/:houseId` | All reviews for a house | No |
| GET | `/api/reviews/:id` | Single review | No |
| PATCH | `/api/reviews/:id` | Update own review | Yes |
| DELETE | `/api/reviews/:id` | Delete own review | Yes |

---

### Conversations & Messages — `/api/conversations`

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | List all conversations |
| POST | `/api/conversations` | Start a conversation (optionally linked to a house) |
| GET | `/api/conversations/unread-count` | Total unread message count |
| GET | `/api/conversations/:id` | Get conversation detail |
| DELETE | `/api/conversations/:id` | Delete conversation |
| GET | `/api/conversations/:id/messages` | Paginated message list |
| POST | `/api/conversations/:id/messages` | Send a message (REST) |
| PATCH | `/api/conversations/:id/read` | Mark all messages in conversation as read |

**Socket.IO events (client → server):**

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `conversationId` | Join conversation room |
| `conversation:leave` | `conversationId` | Leave conversation room |
| `message:send` | `{ conversationId, content, type }` | Send real-time message |

**Socket.IO events (server → client):**

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | Message object | New message in conversation |
| `error` | `{ message }` | Error notification |

---

### Notifications — `/api/notifications`

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List notifications (filterable, paginated) |
| GET | `/api/notifications/unread-count` | Count of unread notifications |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/clear-all` | Delete all notifications |
| POST | `/api/notifications/device-token` | Register FCM device token |
| DELETE | `/api/notifications/device-token` | Remove FCM device token |
| GET | `/api/notifications/:id` | Single notification |
| PATCH | `/api/notifications/:id/read` | Mark single notification as read |
| DELETE | `/api/notifications/:id` | Delete single notification |

---

### Location — `/api/location`

All routes require authentication.

| Method | Path | Description | Body |
|--------|------|-------------|------|
| POST | `/api/location/reverse-geocode` | Convert lat/lon to address | `{ latitude, longitude }` |
| GET | `/api/location/saved` | List saved locations | — |
| POST | `/api/location/save` | Save a location | `{ address, latitude, longitude, label?, city?, area? }` |
| DELETE | `/api/location/saved/:id` | Delete saved location | — |

---

### Admin — `/api/admin`

All routes require authentication **and** `role === ADMIN`.

#### Statistics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Platform-wide KPIs (users, bookings, revenue) |
| GET | `/api/admin/health` | System health (DB, Redis connectivity) |
| GET | `/api/admin/revenue` | Revenue over time (`?period=daily\|monthly\|yearly`) |
| GET | `/api/admin/top-agents` | Top performing agents (`?limit=5`) |
| GET | `/api/admin/top-properties` | Top properties by views/bookings (`?limit=5`) |

#### User Management

| Method | Path | Description | Body |
|--------|------|-------------|------|
| GET | `/api/admin/users` | List all users (paginated, filterable) | — |
| GET | `/api/admin/users/:id` | User detail with relations | — |
| PATCH | `/api/admin/users/:id/role` | Change user role | `{ role: "USER"\|"AGENT"\|"ADMIN" }` |
| PATCH | `/api/admin/users/:id/verify` | Toggle `isVerified` | — |
| DELETE | `/api/admin/users/:id` | Permanently delete user | — |

#### House Management

| Method | Path | Description | Body |
|--------|------|-------------|------|
| GET | `/api/admin/houses` | List all houses | — |
| PATCH | `/api/admin/houses/:id/status` | Change house status | `{ status: "AVAILABLE"\|"UNAVAILABLE" }` |
| DELETE | `/api/admin/houses/:id` | Permanently delete house | — |

#### Booking, Payment & Review Management

| Method | Path | Description | Body |
|--------|------|-------------|------|
| GET | `/api/admin/bookings` | List all bookings | — |
| PATCH | `/api/admin/bookings/:id/status` | Update booking status | `{ status }` |
| GET | `/api/admin/payments` | List all payments | — |
| GET | `/api/admin/reviews` | List all reviews | — |
| DELETE | `/api/admin/reviews/:id` | Remove a review | — |

#### Notifications

| Method | Path | Description | Body |
|--------|------|-------------|------|
| POST | `/api/admin/notifications/send` | Broadcast notification to users | `{ title, message, userIds? }` |

---

## 14. Database Schema

### Enums

| Enum | Values |
|------|--------|
| `Role` | `USER`, `AGENT`, `ADMIN` |
| `AuthProvider` | `LOCAL`, `GOOGLE`, `FACEBOOK` |
| `HouseStatus` | `AVAILABLE`, `UNAVAILABLE` |
| `ListingType` | `RENT`, `SALE` |
| `PropertyType` | `APARTMENT`, `PENTHOUSE`, `HOTEL`, `VILLA`, `STUDIO`, `DUPLEX`, `TOWNHOUSE`, `CONDO` |
| `PaymentStatus` | `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED` |
| `BookingStatus` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `NotificationType` | `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `PAYMENT_SUCCESS`, `NEW_MESSAGE`, `REVIEW_POSTED`, `GENERAL` |

---

### Model: `User`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | String | PK, `cuid()` |
| `username` | String | UNIQUE |
| `email` | String | UNIQUE |
| `password` | String? | Bcrypt-hashed (10 rounds) |
| `phoneNumber` | String? | UNIQUE |
| `name` | String? | — |
| `bio` | String? | — |
| `dateOfBirth` | DateTime? | — |
| `avatar` | String? | Cloudinary URL |
| `role` | `Role` | Default `USER` |
| `authProvider` | `AuthProvider` | Default `LOCAL` |
| `googleId` | String? | UNIQUE |
| `facebookId` | String? | UNIQUE |
| `isVerified` | Boolean | Default `false` |
| `createdAt` | DateTime | `now()` |
| `updatedAt` | DateTime | `@updatedAt` |

---

### Model: `House`

| Field | Type | Constraints / Index |
|-------|------|---------------------|
| `id` | String | PK, `cuid()` |
| `name` | String | — |
| `description` | String? | — |
| `status` | `HouseStatus` | Default `AVAILABLE`, indexed |
| `rentPerMonth` | Float? | — |
| `salePrice` | Float? | — |
| `listingType` | `ListingType` | Indexed |
| `propertyType` | `PropertyType` | Indexed |
| `address` | String | — |
| `city` | String | Indexed |
| `area` | String? | — |
| `latitude` | Float? | — |
| `longitude` | Float? | — |
| `bedrooms` | Int | Default `1` |
| `bathrooms` | Int | Default `1` |
| `sizeInSqft` | Float? | — |
| `buildYear` | Int? | — |
| `hasWifi` | Boolean | Default `false` |
| `hasWater` | Boolean | Default `true` |
| `agentId` | String | FK → User, indexed |
| `createdAt` | DateTime | `now()` |
| `updatedAt` | DateTime | `@updatedAt` |

---

### Model: `Booking`

| Field | Type | Constraints / Index |
|-------|------|---------------------|
| `id` | String | PK, `cuid()` |
| `userId` | String | FK → User, indexed |
| `houseId` | String | FK → House, indexed |
| `agentId` | String | FK → User (agent), indexed |
| `checkIn` | DateTime | — |
| `checkOut` | DateTime | — |
| `totalAmount` | Float | — |
| `status` | `BookingStatus` | Default `PENDING`, indexed |
| `paymentStatus` | `PaymentStatus` | Default `PENDING` |
| `notes` | String? | — |
| `createdAt` | DateTime | `now()` |
| `updatedAt` | DateTime | `@updatedAt` |

---

### Model: `Payment`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | String | PK, `cuid()` |
| `userId` | String | FK → User, indexed |
| `bookingId` | String? | FK → Booking, indexed |
| `amount` | Float | — |
| `currency` | String | Default `BDT` |
| `method` | String? | — |
| `transactionId` | String? | UNIQUE |
| `gatewayResponse` | String? | Raw JSON string |
| `status` | `PaymentStatus` | Default `PENDING` |
| `description` | String? | — |
| `createdAt` | DateTime | `now()` |

---

### Model: `Review`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | String | PK |
| `userId` | String | FK → User, indexed |
| `houseId` | String | FK → House, indexed |
| `bookingId` | String | FK → Booking, UNIQUE (one review per booking) |
| `rating` | Int | 1–5 |
| `comment` | String? | — |
| `createdAt` | DateTime | `now()` |
| `updatedAt` | DateTime | `@updatedAt` |

---

### Model: `Conversation`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | String | PK |
| `userId` | String | FK → User, indexed |
| `agentId` | String | FK → User, indexed |
| `houseId` | String? | FK → House (optional context) |
| `createdAt` | DateTime | `now()` |
| `updatedAt` | DateTime | `@updatedAt` |
| — | — | `@@unique([userId, agentId])` — one conversation per user–agent pair |

---

### Model: `Notification`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | String | PK |
| `userId` | String | FK → User, indexed |
| `type` | `NotificationType` | — |
| `title` | String | — |
| `message` | String | — |
| `data` | Json? | Arbitrary metadata |
| `isRead` | Boolean | Default `false`, indexed |
| `createdAt` | DateTime | `now()` |

---

### Other Models (summary)

| Model | Purpose |
|-------|---------|
| `SavedLocation` | User's saved addresses with coordinates |
| `HouseImage` | Ordered image gallery for a house |
| `HouseVideo` | Single promotional video per house |
| `PublicFacility` | Nearby amenity distances (mosque, hospital, mall, market) |
| `HouseView` | View tracking per user per house |
| `Favorite` | User–House many-to-many with unique constraint |
| `NotificationSettings` | Per-user notification channel preferences |
| `ReviewMedia` | Photos/videos attached to a review |
| `Message` | Individual message within a conversation |
| `DeviceToken` | FCM push notification tokens per device |

---

## 15. Authentication & Authorization

### Strategy

| Component | Detail |
|-----------|--------|
| Algorithm | JWT (HS256) |
| Access token TTL | 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`) |
| Refresh token TTL | 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`) |
| Token storage — mobile | `AsyncStorage` (access + refresh) |
| Token storage — admin | NextAuth JWT session cookie |
| Refresh token server storage | Redis key `refresh:<userId>` (TTL 7 days) |
| Token blacklisting | `redis.del('refresh:<userId>')` on logout |

### Token Flow

```
1. POST /api/auth/login
   <- { accessToken, refreshToken }

2. Every request: Authorization: Bearer <accessToken>

3. On 401: POST /api/auth/refresh-token { refreshToken }
   <- { accessToken, refreshToken }

4. POST /api/auth/logout (protected)
   -> Redis.del('refresh:<userId>')
```

### OTP Flow (Password Reset)

```
1. POST /api/auth/forgot-password/email|phone
   -> 6-digit OTP generated, stored in Redis (key: otp:<identifier>, TTL 10 min)
   -> Sent via Nodemailer or Twilio

2. POST /api/auth/verify-otp { identifier, otp }
   -> Redis lookup + delete on match

3. POST /api/auth/reset-password { identifier, newPassword }
   -> bcrypt hash + DB update
```

### RBAC — Roles & Permissions

| Permission | USER | AGENT | ADMIN |
|-----------|------|-------|-------|
| Browse listings | Yes | Yes | Yes |
| Book a property | Yes | Yes | Yes |
| Create / manage own listings | No | Yes | Yes |
| Upload media | No | Yes | Yes |
| Manage agent bookings | No | Yes | Yes |
| Access admin dashboard | No | No | Yes |
| Change user roles | No | No | Yes |
| Delete any content | No | No | Yes |
| Send broadcast notifications | No | No | Yes |

### Protected vs Public Routes

- **Public**: `GET /health`, `GET /api/app/about`, `GET /api/houses`, `GET /api/houses/:id`, `GET /api/houses/top-locations`, `GET /api/houses/popular`, `GET /api/filter`, `GET /api/reviews/house/:houseId`, `GET /api/reviews/:id`
- **Authenticated (any role)**: All user profile routes, bookings, favorites, messaging, notifications, location
- **Agent / Admin only**: Create/update/delete houses, manage agent bookings, upload media
- **Admin only**: All `/api/admin/*` routes

---

## 16. Key Features & Modules

### Auth Module (`src/modules/auth/`)

Handles full authentication lifecycle: registration with OTP email verification, JWT login/logout, token refresh, and two-channel (email/SMS) password reset via time-limited OTPs stored in Redis.

### House Module (`src/modules/house/`)

Core listing engine. Supports full CRUD for properties, multi-file image/video upload to Cloudinary, view tracking, favourites toggle, personalised recommendations, nearby search, deep-link sharing, and an agent analytics dashboard.

### Filter Module (`src/modules/filter/`)

Advanced search with up to 14 simultaneous filter dimensions (type, price range, size, amenities, location, keyword), configurable sorting, and paginated results capped at 100 items per page.

### Booking Module (`src/modules/booking/`)

Manages the full booking lifecycle: `PENDING → CONFIRMED / CANCELLED → COMPLETED`. Users create bookings; agents update status. Cascades through related payment records.

### Review Module (`src/modules/review/`)

Post-booking review system enforcing one review per completed booking (`bookingId` UNIQUE constraint). Supports photo/video attachments via `ReviewMedia`.

### Message Module (`src/modules/message/`)

REST layer for conversation and message persistence. Real-time delivery is handled by Socket.IO; the REST endpoints serve history retrieval and read-receipts.

### Socket.IO Server (`src/sockets/index.js`)

JWT-authenticated WebSocket server. Maintains an `activeConnections` map of `userId → socketId`. Users join personal rooms (`user:<id>`) on connection. Conversation rooms (`conversation:<id>`) allow scoped message broadcast. Persists messages to the database via Prisma transactions within the socket handler.

### Notification Module (`src/modules/notification/`)

In-app notification store with CRUD, read-tracking, and paginated retrieval. Device token registration for Firebase FCM push notifications (push dispatch partially implemented — see Known Issues).

### Location Module (`src/modules/location/`)

Reverse geocoding and user-scoped saved location management (home, work, custom labels).

### Admin Module (`src/modules/admin/`)

Full platform administration: aggregate KPI statistics, revenue analytics grouped by period, top agent/property leaderboards, user role management, content moderation (houses, bookings, reviews), and broadcast notifications.

### Admin Dashboard (`housely-admin/`)

Next.js 14 web app accessible only to ADMIN users (enforced at NextAuth `authorize` callback). Features a live stats dashboard with Recharts visualisations, data tables for all resource types, and React Query for cache-aware server state.

### Mobile App (`mobile/`)

Expo React Native app with file-based routing. Separate navigator stacks for users (`(tabs)`) and agents (`(owner)`). Zustand handles auth and location state; AsyncStorage persists tokens across app restarts. Socket.IO client reconnects automatically on session restore.

---

## 17. State Management

### Mobile (React Native)

| Store | Technology | Contents |
|-------|-----------|----------|
| `authStore` | Zustand | `user`, `token`, `isLoading`, `error`; actions: `register`, `login`, `logout`, `checkAuth`, `updateUser` |
| `locationStore` | Zustand | User's current geolocation |
| Local screen state | React `useState` | Form inputs, modal visibility, scroll position |
| Server state | Axios + ad-hoc | No dedicated server-state library; each screen fetches independently |

Tokens are persisted to `AsyncStorage` on login and read back on `checkAuth()` (called at app startup from the splash screen).

### Admin Dashboard (Next.js)

| Store | Technology | Contents |
|-------|-----------|----------|
| Server state | TanStack React Query 5 | All `/api/admin/*` data; keys: `admin-stats`, `system-health`, `admin-revenue`, `top-agents`, `top-properties`, `admin-users`, `admin-bookings`, `admin-payments`, `admin-reviews` |
| Auth session | NextAuth (JWT cookie) | `accessToken`, `role`, `id` |
| UI state | Zustand (`uiStore`) | Sidebar open/closed |
| Form state | React Hook Form + Zod | Forms across user/property/booking management pages |

---

## 18. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Runtime environment | `development` |
| `PORT` | No | HTTP server port | `3000` |
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string (pooled) | `postgresql://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | **Yes** | Neon direct (non-pooled) URL for migrations | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing access tokens | `a-long-random-string` |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing refresh tokens | `another-long-random-string` |
| `JWT_ACCESS_EXPIRES_IN` | No | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token TTL | `7d` |
| `REDIS_URL` | No | Redis connection string (falls back to MemoryStore) | `redis://localhost:6379` |
| `EMAIL_USER` | No | Gmail address for Nodemailer | `noreply@example.com` |
| `EMAIL_PASS` | No | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `SENDGRID_API_KEY` | No | SendGrid alternative (not wired yet) | `SG.xxx` |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID | `ACxxx` |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token | `xxx` |
| `TWILIO_PHONE_NUMBER` | No | Twilio sender phone number | `+1234567890` |
| `CLOUDINARY_CLOUD_NAME` | **Yes*** | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | **Yes*** | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | **Yes*** | Cloudinary API secret | `xxx` |
| `FIREBASE_PROJECT_ID` | No | Firebase project ID (FCM) | `housely-app` |
| `FIREBASE_PRIVATE_KEY` | No | Firebase service account private key | `-----BEGIN RSA...` |
| `FIREBASE_CLIENT_EMAIL` | No | Firebase service account email | `firebase-adminsdk@project.iam.gserviceaccount.com` |
| `APP_URL` | No | Backend public URL | `https://housely.vercel.app` |
| `FRONTEND_DEEP_LINK_BASE` | No | Deep-link scheme base | `housely://house` |

> \* Required only for media upload functionality.

---

### Admin Dashboard (`housely-admin/.env.local`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL | `https://housely.vercel.app` |
| `NEXTAUTH_URL` | **Yes** | Admin app public URL | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | **Yes** | Random secret for NextAuth | `openssl rand -base64 32` |

---

### Mobile (`mobile/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | No | API base URL (falls back to platform default) | `http://192.168.1.5:3000` |

---

## 19. Installation & Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x |
| npm | 10.x |
| Docker & Docker Compose | 24+ (optional, for local DB) |
| Expo CLI | Latest (`npm i -g expo-cli`) |

---

### 1. Clone the repository

```bash
git clone https://github.com/jim2107054/Housely.git
cd Housely
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` from the table in [§13](#13-environment-variables) — at minimum set `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`.

**Start local PostgreSQL + Redis with Docker:**

```bash
docker-compose up -d
```

Set `DATABASE_URL=postgresql://housely:housely123@localhost:5432/housely` and `DIRECT_URL` to the same value for local development.

**Run migrations and seed:**

```bash
npm run db:migrate    # Apply Prisma migrations
npm run db:seed       # Seed the database with initial data
```

**Start development server:**

```bash
npm run dev           # Starts with nodemon on port 3000
```

API is available at `http://localhost:3000`.
Swagger UI: `http://localhost:3000/api/docs`

---

### 3. Admin Dashboard Setup

```bash
cd housely-admin
npm install
```

Create `housely-admin/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
```

```bash
npm run dev -- -p 3001
```

Dashboard available at `http://localhost:3001`. Sign in with an account that has `role = ADMIN`.

---

### 4. Mobile App Setup

```bash
cd mobile
npm install
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000   # Android emulator
# EXPO_PUBLIC_API_URL=http://localhost:3000  # iOS simulator
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3000  # Physical device
```

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

---

### 5. Run Backend Tests

```bash
cd backend
npm test
```

---

## 20. Deployment

### Backend — Vercel

The backend is configured for Vercel serverless deployment via `vercel.json`:

```json
{
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

All environment variables in [§13](#13-environment-variables) must be set in the Vercel project dashboard under **Settings → Environment Variables**.

**Deploy:**
```bash
cd backend
vercel --prod
```

> **Note:** Vercel serverless functions are stateless. Socket.IO real-time features require a persistent server (e.g., Railway, Render, or a VPS). For a true serverless deployment, migrate Socket.IO to a dedicated service or use a managed WebSocket provider.

---

### Admin Dashboard — Vercel / Netlify

```bash
cd housely-admin
vercel --prod
# or: next build && next start
```

Set `NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` in the hosting provider's environment settings.

---

### Mobile — Expo EAS

```bash
cd mobile
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

Set `EXPO_PUBLIC_API_URL` as an EAS secret or in `eas.json` under the relevant build profile.

---

### Docker (Local / Self-hosted)

```bash
cd backend
docker-compose up -d    # PostgreSQL on :5432, Redis on :6379
npm run dev
```

---

### Environment Tiers

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `DATABASE_URL` | Local Docker Postgres | Neon serverless |
| `REDIS_URL` | Local Docker Redis | Upstash / Redis Cloud |
| `APP_URL` | `http://localhost:3000` | `https://api.housely.app` |
| JWT secrets | Any string | Long random secrets (32+ chars) |

---

## 21. Testing Strategy

### Backend

| Type | Framework | Location |
|------|-----------|----------|
| Integration / API | Jest 29 + Supertest | `backend/__tests__/api.test.js` |

Tests spin up the Express app in memory (no external dependencies required for basic endpoint tests). Coverage is collected from `src/**/*.js` excluding `src/config/*.js`.

**Run tests:**
```bash
cd backend
npm test               # Run all tests + coverage report
```

**Run specific test:**
```bash
npx jest --testNamePattern="Auth API"
```

**Coverage output:** `backend/coverage/lcov-report/`

**Coverage configuration:**
```js
collectCoverageFrom: ['src/**/*.js', '!src/config/*.js']
```

> Mobile and admin dashboard have no automated tests at this time — manual review recommended.

---

## 22. Error Handling & Logging

### Global Error Handler (`src/middlewares/errorHandler.js`)

All unhandled errors bubble up to the Express global error handler. Errors are mapped to standard HTTP codes:

| Error Condition | Status Code | Response Message |
|----------------|-------------|-----------------|
| Prisma unique constraint (`P2002`) | 409 | `"A record with this <field> already exists"` |
| Prisma record not found (`P2025`) | 404 | `"Record not found"` |
| Zod validation error | 400 | `"Validation failed"` + `errors` array |
| JWT invalid (`JsonWebTokenError`) | 401 | `"Invalid token"` |
| JWT expired (`TokenExpiredError`) | 401 | `"Token expired"` |
| Multer file size exceeded | 400 | `"File too large (max 10MB)"` |
| All others | 500 (or `err.statusCode`) | `err.message` or `"Internal Server Error"` |

### Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email" }
  ]
}
```

### Logging

- `console.error('Error:', err.message)` in the global error handler
- `console.log` in Socket.IO for connection/disconnection events
- `console.warn` stubs for email/SMS when credentials are not configured
- No structured logging library (e.g., Winston/Pino) is currently integrated

> A structured logging solution is recommended for production observability.

---

## 23. Security Considerations

### Input Validation

All incoming request bodies, query parameters, and route parameters are validated against Zod schemas before reaching controllers. Invalid inputs are rejected with a 400 response and a detailed `errors` array.

### Rate Limiting

Redis-backed rate limiting is applied to sensitive auth endpoints:

| Endpoint | Limit |
|----------|-------|
| `POST /api/auth/login` | 5 requests / 60 seconds per IP |
| `POST /api/auth/forgot-password/email` | 3 requests / 60 seconds per IP |
| `POST /api/auth/forgot-password/phone` | 3 requests / 60 seconds per IP |
| `POST /api/auth/verify-otp` | 5 requests / 60 seconds per IP |

If Redis is unavailable, rate limiting silently passes (fail-open). This is noted as a known limitation.

### Password Hashing

Passwords are hashed with **bcrypt** at 10 salt rounds before storage. Plain-text passwords are never stored or logged.

### CORS

Currently configured as `cors()` with no origin restriction (`Access-Control-Allow-Origin: *`).

> **Recommended:** Restrict CORS to known origins in production.

### JWT Security

- Short-lived access tokens (15 min) limit exposure window
- Refresh tokens are stored server-side in Redis and deleted on logout (stateful invalidation)
- Socket.IO connections also validate JWT on handshake

### File Upload Security

- Multer restricts accepted MIME types to: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`
- Files are stored in memory and streamed directly to Cloudinary — no disk storage
- File size is capped at **10 MB** per file

### Admin Access

Admin dashboard enforces role check at the NextAuth `authorize` callback — non-ADMIN users cannot obtain a session. Additionally, all `/api/admin/*` routes apply the `requireRole('ADMIN')` middleware server-side.

### Sensitive Data

- JWT secrets and third-party API keys are loaded from environment variables via `config/env.js`
- No credentials are hardcoded in source files (dev fallback strings exist for JWT secrets — these must be overridden in production)

### Known Security Limitations

- CORS is open (`*`) — needs origin restriction in production
- Rate limiter is fail-open when Redis is unavailable
- No HTTPS enforcement at the application layer (delegated to Vercel/reverse proxy)
- `console.log` statements in `mobile/services/api.js` log full request URLs — remove in production builds
- SendGrid integration is referenced in `env.js` but not yet wired up

---

## 24. Performance & Scalability Notes

### Caching

- **Redis** caches refresh tokens (7 days), OTP codes (10 min), and rate-limit counters
- An **in-memory `MemoryStore`** is used as a fallback — this does not scale horizontally and is not suitable for multi-instance production deployments

### Pagination

All list endpoints are paginated. Default page size is **20**; configurable up to **100** for the filter endpoint. Admin endpoints accept `page` and `limit` query parameters.

### Database Indexes

The Prisma schema defines indexes on all high-cardinality foreign keys and commonly filtered columns:

| Index | Table | Fields |
|-------|-------|--------|
| `@@index([agentId])` | House | `agentId` |
| `@@index([city])` | House | `city` |
| `@@index([listingType])` | House | `listingType` |
| `@@index([propertyType])` | House | `propertyType` |
| `@@index([status])` | House, Booking | `status` |
| `@@index([userId])` | Booking, Favorite, Notification, Payment, etc. | `userId` |
| `@@index([houseId])` | Booking, HouseView, etc. | `houseId` |
| `@@index([conversationId])` | Message | `conversationId` |
| `@@index([isRead])` | Notification | `isRead` |

### Bottlenecks

- **Socket.IO on Vercel**: Serverless functions do not support persistent WebSocket connections. A dedicated server or WebSocket service is required for reliable production real-time.
- **MemoryStore in multi-instance environments**: Rate limiting and OTP verification will be inconsistent across multiple server instances without a shared Redis.
- **Admin stats endpoint**: `getPlatformStats` fires 12 parallel Prisma queries in a `Promise.all` — adequate for current scale but may need query optimisation or caching at higher traffic.
- **No query result caching**: Listing and filter queries are executed on every request with no application-level cache layer beyond what Neon's connection pooler provides.

---

## 25. Known Issues / TODOs

| Location | Issue / TODO |
|----------|-------------|
| `src/modules/notification/notification.service.js:172` | `TODO: Integrate with Firebase Cloud Messaging (FCM)` — push notification dispatch to devices is not yet implemented |
| `backend/src/config/redis.js` | MemoryStore fallback is not suitable for multi-instance production deployments |
| `backend/src/app.js` | CORS allows all origins (`cors()`) — should be restricted in production |
| `backend/src/utils/email.js` | SendGrid API key is read from env but Nodemailer/Gmail is always used; SendGrid integration is incomplete |
| `mobile/services/api.js` | Verbose `console.log` / `console.error` statements should be stripped for production builds |
| `mobile/config.js` | Physical-device fallback IP (`192.168.0.100`) is hardcoded — requires manual update per developer machine |
| `backend/server.js` | Socket.IO on Vercel serverless will not maintain persistent connections — needs a long-running server |
| General | No mobile or admin automated tests exist |
| General | No structured logging (Winston / Pino) — `console.*` only |
| General | No CI/CD pipeline (GitHub Actions, etc.) is configured |

---

## 26. Contributing Guide

### Branching Strategy

```
main           <- stable production releases
internal       <- default integration branch
feature/<name> <- individual feature branches
fix/<name>     <- bug fix branches
```

Open PRs against `internal`. Merge `internal` → `main` for production releases.

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

feat(auth): add phone-based OTP login
fix(booking): prevent double-booking on same date range
docs(readme): add deployment section
chore(deps): upgrade prisma to 6.1.0
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### PR Process

1. Create a branch from `internal`: `git checkout -b feature/<name>`
2. Implement changes with appropriate tests
3. Ensure `npm test` passes in `backend/`
4. Run `npm run lint` in the admin dashboard
5. Open a PR against `internal` with a clear description of the change
6. At least one reviewer approval required before merge

---

## 27. License

```
ISC License

Copyright (c) 2026 Housely

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```

> License declared in `backend/package.json` as `"license": "ISC"`.
> Root `package.json` and other sub-packages do not explicitly declare a license — manual review recommended.

---

**Repository**: [jim2107054/Housely](https://github.com/jim2107054/Housely)
