# Housely – All System Development Mermaid Diagrams

> Paste any block into [mermaid.live](https://mermaid.live) or any Markdown renderer
> that supports Mermaid to preview and export as PNG/SVG.

---

## 1. System Architecture Diagram (Three-Tier)

```mermaid
graph TB
    subgraph PresentationTier["Presentation Tier"]
        RN["React Native Mobile App\nExpo 54 · NativeWind 4\nZustand 5 · TanStack Query 5\nClerk Expo SDK · expo-secure-store"]
        NEXT["Next.js 14 Admin Dashboard\nApp Router · Clerk Next.js\nRecharts · Shadcn/ui · Tailwind CSS\nTanStack Query 5 · Zustand 5"]
    end

    subgraph ApplicationTier["Application Tier"]
        API["Express.js REST API\nNode.js 20 ESM · Express 4\nZod 3 · Multer · Socket.IO 4\nClerk Express SDK"]
    end

    subgraph DataTier["Data Tier"]
        PG[("Neon PostgreSQL\nPrisma 6 ORM\n20 Models · 7 Enums")]
        RD[("Redis\nRate Limiting")]
        CLD["Cloudinary\nImages & Videos"]
    end

    subgraph ExternalServices["External Services"]
        CLERK["Clerk\nIdentity & Auth"]
        NM["Nodemailer / Gmail\nTransactional Email"]
        FCM["Firebase FCM\nPush Notifications"]
    end

    RN   -- "REST + Socket.IO (Clerk token)" --> API
    NEXT -- "REST (Clerk session token)"     --> API

    API -- "Prisma ORM"    --> PG
    API -- "ioredis"       --> RD
    API -- "Cloudinary SDK"--> CLD
    API -- "Email"         --> NM
    API -- "Push"          --> FCM
    RN   -- "Sign-in / Sign-up" --> CLERK
    NEXT -- "Sign-in"           --> CLERK
    API  -- "verifyToken"       --> CLERK
```

---

## 2. DFD Level 0 – Context Diagram

```mermaid
graph LR
    USER(["User / Agent\nMobile App"])
    ADMIN(["Administrator\nWeb Dashboard"])
    EXT(["External Services\nClerk · Cloudinary · Gmail · FCM"])

    SYS[["Housely Platform"]]

    USER  -->|"Search · Book · Message · Review · Pay"| SYS
    SYS   -->|"Listings · Bookings · Notifications · Chat"| USER
    ADMIN -->|"Moderate · Manage · Analytics"| SYS
    SYS   -->|"Reports · Stats"| ADMIN
    SYS   -->|"Auth · Media upload · Email · Push"| EXT
    EXT   -->|"Identity tokens · CDN URLs · Delivery confirmations"| SYS
```

---

## 3. DFD Level 1 – Main Processes

```mermaid
graph TD
    subgraph Actors
        UA(["User / Agent"])
        AD(["Admin"])
    end

    subgraph Processes
        P1["1.0 Authentication\n& Account Sync (Clerk)"]
        P2["2.0 Property\nManagement"]
        P3["3.0 Booking\nManagement"]
        P4["4.0 Messaging &\nNotifications"]
        P5["5.0 Review\nManagement"]
        P6["6.0 Payment\nManagement"]
        P7["7.0 Admin &\nAnalytics"]
    end

    subgraph DataStores
        DS1[("D1 Users")]
        DS2[("D2 Houses")]
        DS3[("D3 Bookings")]
        DS4[("D4 Conversations & Messages")]
        DS5[("D5 Reviews")]
        DS6[("D6 Notifications")]
        DS7[("D7 Payments")]
        DS8[("D8 SavedLocations")]
        DS9[("D9 Redis – Rate Limiting")]
    end

    UA -->|"Clerk session token"| P1
    P1 -->|"Synced user profile"| UA
    P1 --- DS1

    UA -->|"Create / Edit listing / Upload media"| P2
    P2 -->|"Listing details / Images"| UA
    P2 --- DS2

    UA -->|"Booking request / Status update"| P3
    P3 -->|"Confirmation / Notification"| UA
    P3 --- DS3
    P3 --- DS2

    UA -->|"Send message / Read messages"| P4
    P4 -->|"Real-time messages / Push"| UA
    P4 --- DS4
    P4 --- DS6

    UA -->|"Submit review / Upload media"| P5
    P5 -->|"Review confirmation"| UA
    P5 --- DS5
    P5 --- DS3

    UA -->|"Payment for booking"| P6
    P6 -->|"Payment receipt"| UA
    P6 --- DS7
    P6 --- DS3

    AD -->|"Manage users / Moderate / Analytics"| P7
    P7 -->|"Platform stats / Reports"| AD
    P7 --- DS1
    P7 --- DS2
    P7 --- DS3
    P7 --- DS5
    P7 --- DS7
```

---

## 4. DFD Level 2 – Property Search Drill-down

```mermaid
graph TD
    UA(["User"])

    P2_1["2.1 Receive Search\nParameters"]
    P2_2["2.2 Apply Filters\ncity · price · listingType · propertyType\nbeds · baths · area · sortBy"]
    P2_3["2.3 Query Database\nwith Pagination"]
    P2_4["2.4 Record Property View"]
    P2_5["2.5 Return Paginated\nResults"]

    DS_HOUSE[("D2 Houses")]
    DS_VIEW[("D2a HouseViews")]

    UA       -->|"GET /api/filter/search + query params"| P2_1
    P2_1     --> P2_2
    P2_2     --> P2_3
    P2_3     --- DS_HOUSE
    P2_3     --> P2_4
    P2_4     --- DS_VIEW
    P2_4     --> P2_5
    P2_5     -->|"Listing results + pagination"| UA
```

---

## 5. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER {
        string id           PK
        string clerkId      UK
        string username     UK
        string email        UK
        string password
        string phoneNumber  UK
        string name
        string bio
        datetime dateOfBirth
        string avatar
        enum   role         "USER | AGENT | ADMIN"
        enum   authProvider "LOCAL | GOOGLE | FACEBOOK"
        string googleId     UK
        string facebookId   UK
        bool   isVerified
        datetime createdAt
        datetime updatedAt
    }
    SAVED_LOCATION {
        string id       PK
        string userId   FK
        string label
        string address
        string city
        string area
        string street
        float  latitude
        float  longitude
        datetime createdAt
    }
    HOUSE {
        string id           PK
        string name
        string description
        enum   status       "AVAILABLE | UNAVAILABLE"
        float  rentPerMonth
        float  salePrice
        enum   listingType  "RENT | SALE"
        enum   propertyType "APARTMENT | PENTHOUSE | HOTEL | VILLA | STUDIO | DUPLEX | TOWNHOUSE | CONDO"
        string address
        string city
        string area
        float  latitude
        float  longitude
        int    bedrooms
        int    bathrooms
        float  sizeInSqft
        int    buildYear
        bool   hasWifi
        bool   hasWater
        string agentId      FK
        datetime createdAt
        datetime updatedAt
    }
    HOUSE_IMAGE {
        string id       PK
        string houseId  FK
        string url
        int    order
    }
    HOUSE_VIDEO {
        string id       PK
        string houseId  FK "unique"
        string url
    }
    PUBLIC_FACILITY {
        string id               PK
        string houseId          FK "unique"
        bool   wifi
        bool   water
        bool   electricity
        bool   parking
        float  mosqueDistance
        float  hospitalDistance
        float  shoppingMallDistance
        float  marketDistance
    }
    BOOKING {
        string   id            PK
        string   userId        FK
        string   houseId       FK
        string   agentId       FK
        datetime checkIn
        datetime checkOut
        float    totalAmount
        enum     status        "PENDING | CONFIRMED | COMPLETED | CANCELLED"
        enum     paymentStatus "PENDING | COMPLETED | FAILED | REFUNDED"
        string   notes
        datetime createdAt
        datetime updatedAt
    }
    PAYMENT {
        string id             PK
        string userId         FK
        string bookingId      FK
        float  amount
        string currency
        string method
        string transactionId  UK
        enum   status         "PENDING | COMPLETED | FAILED | REFUNDED"
        datetime createdAt
    }
    REVIEW {
        string   id        PK
        string   userId    FK
        string   houseId   FK
        string   bookingId FK "unique"
        int      rating
        string   comment
        datetime createdAt
        datetime updatedAt
    }
    REVIEW_MEDIA {
        string id       PK
        string reviewId FK
        string url
        string type     "image | video"
    }
    CONVERSATION {
        string   id        PK
        string   userId    FK
        string   agentId   FK
        string   houseId   FK
        datetime createdAt
        datetime updatedAt
    }
    MESSAGE {
        string   id             PK
        string   conversationId FK
        string   senderId       FK
        string   content
        string   type           "text | image | audio | video"
        bool     isRead
        datetime createdAt
    }
    NOTIFICATION {
        string   id        PK
        string   userId    FK
        enum     type      "BOOKING_CONFIRMED | BOOKING_CANCELLED | PAYMENT_SUCCESS | NEW_MESSAGE | REVIEW_POSTED | GENERAL"
        string   title
        string   message
        json     data
        bool     isRead
        datetime createdAt
    }
    NOTIFICATION_SETTINGS {
        string id             PK
        string userId         FK "unique"
        bool   pushEnabled
        bool   emailEnabled
        bool   smsEnabled
        bool   bookingUpdates
        bool   promotions
    }
    DEVICE_TOKEN {
        string id        PK
        string userId    FK
        string token     UK
        string platform  "android | ios"
        datetime createdAt
    }
    HOUSE_VIEW {
        string   id       PK
        string   userId   FK
        string   houseId  FK
        datetime viewedAt
    }
    FAVORITE {
        string id        PK
        string userId    FK
        string houseId   FK
    }

    USER              ||--o{ SAVED_LOCATION       : "saves"
    USER              ||--o{ HOUSE                : "lists as agent"
    USER              ||--o{ BOOKING              : "creates (user)"
    USER              ||--o{ BOOKING              : "receives (agent)"
    USER              ||--o{ PAYMENT              : "makes"
    USER              ||--o{ REVIEW               : "writes"
    USER              ||--o{ NOTIFICATION         : "receives"
    USER              ||--o| NOTIFICATION_SETTINGS: "configures"
    USER              ||--o{ DEVICE_TOKEN         : "registers"
    USER              ||--o{ HOUSE_VIEW           : "generates"
    USER              ||--o{ FAVORITE             : "saves"
    USER              ||--o{ CONVERSATION         : "starts (user)"
    USER              ||--o{ CONVERSATION         : "receives (agent)"
    USER              ||--o{ MESSAGE              : "sends"

    HOUSE             ||--o{ HOUSE_IMAGE          : "has"
    HOUSE             ||--o| HOUSE_VIDEO          : "has"
    HOUSE             ||--o| PUBLIC_FACILITY      : "has"
    HOUSE             ||--o{ BOOKING              : "subject of"
    HOUSE             ||--o{ REVIEW               : "receives"
    HOUSE             ||--o{ HOUSE_VIEW           : "tracked by"
    HOUSE             ||--o{ FAVORITE             : "saved in"
    HOUSE             ||--o{ CONVERSATION         : "linked to"

    BOOKING           ||--o| REVIEW               : "reviewed after"
    BOOKING           ||--o{ PAYMENT              : "paid via"

    REVIEW            ||--o{ REVIEW_MEDIA         : "has"

    CONVERSATION      ||--o{ MESSAGE              : "contains"
```

---

## 6. Booking Lifecycle Finite-State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : User submits booking request\n(POST /api/bookings)

    PENDING   --> CONFIRMED : Agent confirms\n(PATCH /bookings/agent/:id/status)
    PENDING   --> CANCELLED : User cancels\n(PATCH /bookings/:id/cancel)

    CONFIRMED --> COMPLETED : Agent marks completed
    CONFIRMED --> CANCELLED : User or agent cancels

    COMPLETED --> [*]
    CANCELLED --> [*]

    note right of PENDING
        paymentStatus starts as PENDING
        Conflict check runs on checkIn/checkOut dates
    end note

    note right of CONFIRMED
        Socket.IO + FCM push notification
        dispatched to user on this transition
    end note

    note right of COMPLETED
        User is now eligible
        to submit a review
        (POST /api/reviews)
    end note
```

---

## 7. Use Case Diagram – User and Agent Workflows

```mermaid
graph LR
    subgraph Actors
        U(["USER"])
        A(["AGENT"])
    end

    subgraph AuthModule["Authentication (Clerk)"]
        UC1(Register Account)
        UC2(Login)
        UC3(Change Password)
        UC4(Select Role at Signup)
    end

    subgraph PropertyModule["Property Discovery"]
        UC5(Browse Listings)
        UC6(Apply Advanced Filters)
        UC7(View Property Details)
        UC8(Save to Favourites)
        UC9(View Saved Locations)
        UC10(Browse Nearby Properties)
        UC11(Browse Popular Properties)
        UC12(Browse Recommended)
        UC13(Browse Top Locations)
    end

    subgraph BookingModule["Booking"]
        UC14(Submit Booking Request)
        UC15(View My Bookings)
        UC16(Cancel Booking)
        UC17(Accept Booking Request)
        UC18(Reject / Cancel Booking)
    end

    subgraph MessagingModule["Messaging"]
        UC19(Start Conversation with Agent)
        UC20(Send Message)
        UC21(Receive Real-time Message)
        UC22(Mark Messages as Read)
    end

    subgraph ReviewModule["Review"]
        UC23(Submit Review after Booking)
        UC24(View Property Reviews)
        UC25(Update Own Review)
        UC26(Delete Own Review)
    end

    subgraph AgentModule["Agent Portal"]
        UC27(Create Property Listing)
        UC28(Edit Listing Details)
        UC29(Upload Images and Videos)
        UC30(View Agent Dashboard)
        UC31(View Earnings Overview)
        UC32(Manage Agent Bookings)
    end

    subgraph NotifModule["Notifications"]
        UC33(Receive Push Notifications)
        UC34(Mark Notifications as Read)
        UC35(Register Device Token)
        UC36(Manage Notification Settings)
    end

    subgraph LocationModule["Location"]
        UC37(Save Location)
        UC38(Reverse Geocode)
        UC39(View Saved Locations)
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    U --> UC11
    U --> UC12
    U --> UC14
    U --> UC15
    U --> UC16
    U --> UC19
    U --> UC20
    U --> UC21
    U --> UC22
    U --> UC23
    U --> UC24
    U --> UC33
    U --> UC34
    U --> UC35
    U --> UC36
    U --> UC37
    U --> UC38
    U --> UC39

    A --> UC2
    A --> UC17
    A --> UC18
    A --> UC20
    A --> UC21
    A --> UC24
    A --> UC25
    A --> UC27
    A --> UC28
    A --> UC29
    A --> UC30
    A --> UC31
    A --> UC32
    A --> UC33
    A --> UC34
```

---

## 8. Use Case Diagram – Admin and System Side Effects

```mermaid
graph LR
    subgraph Actors
        AD(["ADMIN"])
        SYS(["System Automated"])
    end

    subgraph ModerationModule["Property Management"]
        A1(View All Properties)
        A2(Update Property Status)
        A3(Delete Property)
    end

    subgraph UserMgmtModule["User Management"]
        A4(View All Users)
        A5(Get User Details)
        A6(Update User Role)
        A7(Toggle User Verification)
        A8(Delete User)
    end

    subgraph BookingOversight["Booking Oversight"]
        A9(View All Bookings)
        A10(Update Booking Status)
    end

    subgraph PaymentModule["Payment Oversight"]
        A11(View All Payments)
    end

    subgraph ReviewManagement["Review Management"]
        A12(View All Reviews)
        A13(Delete Review)
    end

    subgraph AnalyticsModule["Platform Analytics"]
        A14(View Platform Stats)
        A15(View Revenue Data)
        A16(View Top Agents)
        A17(View Top Properties)
        A18(View System Health)
    end

    subgraph NotifBroadcast["Notifications"]
        A19(Send Broadcast Notification)
    end

    subgraph SystemTriggers["Automated System Events"]
        S1(Send FCM Push on Booking Confirm)
        S2(Send Email via Nodemailer/Gmail)
        S3(Emit Socket.IO Event to User Room)
        S4(Upload Media to Cloudinary)
        S5(Track Property View)
        S6(Rate-limit via Redis)
    end

    AD --> A1
    AD --> A2
    AD --> A3
    AD --> A4
    AD --> A5
    AD --> A6
    AD --> A7
    AD --> A8
    AD --> A9
    AD --> A10
    AD --> A11
    AD --> A12
    AD --> A13
    AD --> A14
    AD --> A15
    AD --> A16
    AD --> A17
    AD --> A18
    AD --> A19

    SYS --> S1
    SYS --> S2
    SYS --> S3
    SYS --> S4
    SYS --> S5
    SYS --> S6
```

---

## 9. Application Flow Diagram (Happy Path)

```mermaid
flowchart TD
    A([User opens App]) --> B{Clerk session\nexists?}
    B -- No --> C[Onboarding Screens]
    C --> D{New or existing?}
    D -- New --> E[Clerk Sign-up]
    E --> F{Role selected?}
    F -- AGENT --> G[Agent Portal /(owner)/]
    F -- USER  --> H[Set Location / Home /(tabs)/]
    D -- Existing --> I[Clerk Login]
    I --> J{User role?}
    J -- AGENT --> G
    J -- USER  --> H
    B -- Yes --> K[POST /api/auth/sync]
    K --> J

    H --> L[Home Feed – Recommended / Popular Listings]

    L --> M{User Action}
    M -- Filter/Search  --> N[GET /api/filter/search\ncity · price · propertyType · beds]
    M -- View listing   --> O[Property Detail Page\nGET /api/houses/:id]
    M -- Chat           --> P[Open Conversation\nPOST /api/conversations]
    M -- Profile        --> Q[View / Edit Profile\nGET /api/users/me]

    N --> O
    O --> R{Signed in as USER?}
    R -- Yes --> S[Submit Booking Request\nPOST /api/bookings]
    R -- No  --> I

    S --> T[(Booking → PENDING)]
    T --> U[Agent notified via\nSocket.IO + FCM]
    U --> V{Agent Decision\nPATCH /bookings/agent/:id/status}
    V -- CONFIRMED --> W[(Booking → CONFIRMED)]
    V -- CANCELLED --> X[(Booking → CANCELLED)]

    W --> Y[User notified via\nSocket.IO + FCM]
    Y --> Z{Agent marks\nCOMPLETED}
    Z --> AA[(Booking → COMPLETED)]
    AA --> AB[User submits Review\nPOST /api/reviews]
    AB --> AC([End])
    X --> AC
```

---

## 10. UML Component Diagram

```mermaid
graph TB
    subgraph MobileApp["React Native Mobile App (Expo 54)"]
        MA_AUTH["Auth Screens\nClerk Sign-in · Sign-up · Role Selection\nChange / Forgot / Reset Password"]
        MA_NAV["Expo Router\nFile-based Navigation\n/(tabs)/ · /(owner)/"]
        MA_STATE["Zustand Store\nAuthStore · LocationStore"]
        MA_QUERY["TanStack Query 5\nServer State Cache"]
        MA_AXIOS["Axios Client\nClerk token interceptor"]
        MA_SOCK["Socket.IO Client\nClerk token handshake"]
        MA_SCREENS["User Screens\nHome · Explore · Bookings · Favorites\nChat · Notifications · Profile\nNearby · Popular · Recommended"]
        MA_AGENT["Agent Portal\nListings · Bookings · Earnings\nMessages · Reviews · Dashboard"]
        MA_CLERK["@clerk/clerk-expo\nexpo-secure-store token cache"]
    end

    subgraph AdminDash["Next.js 14 Admin Dashboard"]
        AD_AUTH["@clerk/nextjs\nclerkMiddleware · Clerk session"]
        AD_PAGES["Server & Client Components"]
        AD_CHARTS["Recharts\nAnalytics Visualisation"]
        AD_QUERY["TanStack Query 5\nClient Cache"]
        AD_UI["Shadcn/ui + Tailwind\nUI Components"]
        AD_MODULES["Dashboard · Users · Properties\nBookings · Payments · Reviews\nRevenue · Notifications"]
    end

    subgraph BackendAPI["Express.js REST API (Node.js 20)"]
        BE_ROUTER["Express Router\n10 Route Modules"]
        BE_MIDDLE["Middleware\nprotect (Clerk) · requireRole · errorHandler"]
        BE_AUTH["Auth Module\nPOST /auth/sync — upsert Clerk user"]
        BE_HOUSE["House Module\nCRUD · Cloudinary upload · Filters"]
        BE_FILTER["Filter Module\nAdvanced search + pagination"]
        BE_BOOK["Booking Module\nFSM · date conflict check"]
        BE_MSG["Message Module\nConversations + Socket.IO"]
        BE_REVIEW["Review Module\nWith ReviewMedia"]
        BE_NOTIF["Notification Module\nFCM push · DeviceToken"]
        BE_ADMIN["Admin Module\nStats · Revenue · User/House mgmt"]
        BE_LOC["Location Module\nReverse Geocode · SavedLocations"]
        BE_USER["User Module\nProfile · Avatar · Payment history"]
        BE_PAY["Payment Model\n(via Booking service)"]
        BE_ZOD["Zod 3\nInput Validation"]
        BE_SOCK["Socket.IO Server\nClerk token handshake\nmessage:send · conversation:join"]
        BE_CLERK["@clerk/express\nclerkMiddleware · getAuth · verifyToken"]
    end

    subgraph DataLayer["Data Layer"]
        PRISMA["Prisma 6 ORM"]
        PG[("Neon PostgreSQL\n20 Models · 7 Enums")]
        REDIS[("Redis\nRate Limiting")]
        CLD["Cloudinary\nImages & Videos"]
    end

    subgraph ExtServices["External Services"]
        CLERK_SVC["Clerk\nIdentity & Auth"]
        NODEMAILER["Nodemailer / Gmail"]
        FCM_SVC["Firebase FCM"]
    end

    MA_AXIOS  --> BE_ROUTER
    MA_SOCK   --> BE_SOCK
    MA_CLERK  --> CLERK_SVC
    AD_PAGES  --> BE_ROUTER
    AD_QUERY  --> BE_ROUTER
    AD_AUTH   --> CLERK_SVC

    BE_ROUTER --> BE_MIDDLE
    BE_MIDDLE --> BE_AUTH
    BE_MIDDLE --> BE_HOUSE
    BE_MIDDLE --> BE_FILTER
    BE_MIDDLE --> BE_BOOK
    BE_MIDDLE --> BE_MSG
    BE_MIDDLE --> BE_REVIEW
    BE_MIDDLE --> BE_NOTIF
    BE_MIDDLE --> BE_ADMIN
    BE_MIDDLE --> BE_LOC
    BE_MIDDLE --> BE_USER

    BE_BOOK   --> BE_ZOD
    BE_HOUSE  --> BE_ZOD
    BE_CLERK  --> CLERK_SVC

    BE_AUTH   --> PRISMA
    BE_HOUSE  --> PRISMA
    BE_FILTER --> PRISMA
    BE_BOOK   --> PRISMA
    BE_MSG    --> PRISMA
    BE_REVIEW --> PRISMA
    BE_NOTIF  --> PRISMA
    BE_ADMIN  --> PRISMA
    BE_LOC    --> PRISMA
    BE_USER   --> PRISMA
    BE_PAY    --> PRISMA

    PRISMA    --> PG
    BE_HOUSE  --> CLD
    BE_REVIEW --> CLD
    BE_USER   --> CLD
    BE_NOTIF  --> FCM_SVC
    BE_AUTH   --> NODEMAILER
    BE_MIDDLE --> REDIS
    BE_SOCK   --> PRISMA
```

---

## 11. Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String phone
        +String passwordHash
        +Role role
        +Boolean isVerified
        +DateTime createdAt
        +register(dto) Promise
        +login(dto) Promise
        +updateProfile(id, dto) Promise
    }

    class House {
        +String id
        +String title
        +String description
        +String city
        +Float price
        +ListingType listingType
        +PropertyType propertyType
        +Int bedrooms
        +Int bathrooms
        +HouseStatus status
        +String agentId
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
        +DateTime startDate
        +DateTime endDate
        +Float totalPrice
        +BookingStatus status
        +String message
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
        +update(userId, id, dto) Promise
        +delete(userId, id) Promise
        +getByHouse(houseId) Promise
        +getMyReviews(userId) Promise
    }

    class Conversation {
        +String id
        +String userId
        +String agentId
        +String houseId
        +DateTime createdAt
        +create(userId, agentId, houseId) Promise
        +getByUser(userId) Promise
        +delete(userId, id) Promise
    }

    class Message {
        +String id
        +String conversationId
        +String senderId
        +String content
        +String type
        +Boolean isRead
        +DateTime createdAt
        +send(senderId, conversationId, content, type) Promise
        +markRead(conversationId, userId) Promise
        +getMessages(conversationId, userId) Promise
    }

    class Notification {
        +String id
        +String userId
        +NotificationType type
        +String title
        +String message
        +Json data
        +Boolean isRead
        +DateTime createdAt
        +getByUser(userId, filters) Promise
        +markAsRead(userId, id) Promise
        +markAllAsRead(userId) Promise
        +sendPush(userId, title, body) Promise
    }

    class DeviceToken {
        +String id
        +String userId
        +String token
        +String platform
        +register(userId, token, platform) Promise
        +remove(userId, token) Promise
    }

    class AuthService {
        +syncUser(clerkUserId, extraData) Promise
    }

    class SocketService {
        +initializeSocket(server) IO
        +authenticateSocket(socket, next) void
        +handleMessageSend(socket, data) void
        +handleConversationJoin(socket, data) void
        +emitToUser(io, userId, event, data) void
    }

    User "1" --> "0..*" House         : lists as agent
    User "1" --> "0..*" Booking       : creates (user)
    User "1" --> "0..*" Booking       : manages (agent)
    User "1" --> "0..*" Payment       : makes
    User "1" --> "0..*" Review        : writes
    User "1" --> "0..*" Conversation  : starts / receives
    User "1" --> "0..*" Message       : sends
    User "1" --> "0..*" Notification  : receives
    User "1" --> "0..*" DeviceToken   : registers

    House "1" --> "0..*" Booking      : subject of
    House "1" --> "0..*" Review       : receives

    Booking "1" --> "0..1" Review     : reviewed after
    Booking "1" --> "0..*" Payment    : paid via
    Conversation "1" --> "0..*" Message : contains

    AuthService --> SocketService  : initializes
```

---

## 12. Sequence Diagram – Authentication (Clerk-based Login)

```mermaid
sequenceDiagram
    actor U as User
    participant MA as Mobile App
    participant CL as Clerk
    participant API as Backend API
    participant DB as PostgreSQL

    U  ->> MA  : Enter credentials and tap Login
    MA ->> CL  : Clerk signIn() with email + password
    CL -->> MA : Session token (JWT)

    MA ->> MA  : setTokenProvider(getToken)
    MA ->> API : POST /api/auth/sync\n(Authorization: Bearer clerkToken)
    API ->> CL : clerkClient.verifyToken(token)
    CL -->> API : payload { sub: clerkUserId }

    API ->> DB : upsert User WHERE clerkId = ?
    DB -->> API : User record

    API -->> MA : 200 { user }
    MA  ->> MA  : authStore.setUser(user)

    alt User role is AGENT
        MA  -->> U  : Redirect to /(owner)/ portal
    else User role is USER
        MA  -->> U  : Redirect to /(tabs)/ home
    end
```

---

## 13. Sequence Diagram – Clerk Token Lifecycle (Silent Refresh)

```mermaid
sequenceDiagram
    actor U as User
    participant MA as Mobile App
    participant CL as Clerk
    participant API as Backend API

    MA ->> API : Authenticated API request\n(Axios interceptor attaches Clerk token)
    API ->> CL : clerkMiddleware verifies session token
    CL -->> API : Valid session payload

    alt Session active
        API -->> MA : 200 Requested data
        MA  -->> U  : Seamless experience
    else Session expired
        CL  -->> API : Token invalid
        API -->> MA  : 401 Unauthorized
        MA  ->> CL   : getToken() — Clerk auto-refreshes session
        CL  -->> MA  : New session token

        alt Token refreshed successfully
            MA  ->> API : Retry original request with new token
            API -->> MA : 200 Requested data
            MA  -->> U  : Seamless experience
        else Refresh failed (signed out)
            MA  ->> MA  : authStore.clearUser()
            MA  -->> U  : Redirect to /(auth)/ login screen
        end
    end
```

---

## 14. Sequence Diagram – Real-time Messaging

```mermaid
sequenceDiagram
    actor U as User
    actor A as Agent
    participant MAU as Mobile App (User)
    participant MAA as Mobile App (Agent)
    participant SOCK as Socket.IO Server
    participant API as REST API
    participant DB as PostgreSQL

    U   ->> MAU  : Tap Message Agent on property
    MAU ->> API  : POST /api/conversations\n{ agentId, houseId }
    API ->> DB   : findOrCreate Conversation (userId+agentId unique)
    DB  -->> API : Conversation record
    API -->> MAU : { conversationId }

    MAU ->> SOCK : emit conversation:join { conversationId }\n(Clerk token in handshake)
    MAA ->> SOCK : emit conversation:join { conversationId }
    SOCK ->> DB  : Verify both users belong to conversation

    U   ->> MAU  : Type message and tap Send
    MAU ->> SOCK : emit message:send { conversationId, content, type }
    SOCK ->> DB  : INSERT Message record
    SOCK -->> MAA : event message:new { id, content, senderId, type, createdAt }
    A   -->> MAA : Sees new message in real time

    A   ->> MAA  : Type reply and tap Send
    MAA ->> SOCK : emit message:send { conversationId, content, type }
    SOCK ->> DB  : INSERT Message record
    SOCK -->> MAU : event message:new { id, content, senderId, type, createdAt }
    U   -->> MAU : Sees reply in real time

    MAU ->> API  : PATCH /api/conversations/:id/read
    API ->> DB   : UPDATE Message SET isRead=true WHERE conversationId
    SOCK -->> MAA : event messages:read { conversationId }
```

---

## 15. Activity Diagram – User Booking Flow

```mermaid
stateDiagram-v2
    [*] --> BrowseListings : User opens app

    BrowseListings --> ViewProperty  : Tap on listing
    ViewProperty   --> CheckAuth     : Tap Book Now

    CheckAuth --> LoginPrompt : Not authenticated (Clerk session missing)
    LoginPrompt --> ViewProperty : Clerk sign-in success

    CheckAuth --> FillBookingForm : Authenticated

    FillBookingForm --> ValidateInput  : Submit form
    ValidateInput   --> FillBookingForm : Validation fails
    ValidateInput   --> CreateBooking   : Validation passes

    CreateBooking --> PENDING          : POST /api/bookings
    PENDING       --> NotifyAgent      : FCM push notification sent

    NotifyAgent --> AgentReviews
    AgentReviews --> CONFIRMED         : PATCH /api/bookings/:id/status (CONFIRMED)
    AgentReviews --> CANCELLED         : PATCH /api/bookings/:id/status (CANCELLED)

    CONFIRMED --> NotifyUser           : FCM push to user
    CANCELLED --> NotifyUser           : FCM push to user

    NotifyUser --> COMPLETED           : PATCH /api/bookings/:id/status (COMPLETED)
    COMPLETED  --> SubmitReview        : POST /api/reviews
    SubmitReview --> [*]
    CANCELLED  --> [*]
```

---

## 16. Activity Diagram – Clerk-managed Password Reset Flow

```mermaid
stateDiagram-v2
    [*] --> LoginScreen : User opens app

    LoginScreen --> ForgotPassword : Tap "Forgot Password"

    ForgotPassword --> EnterEmail : Clerk forgot-password form
    EnterEmail --> EmailSent      : Clerk sends reset email

    EmailSent --> CheckEmail      : User opens email
    CheckEmail --> EnterResetCode : Click reset link or enter code

    EnterResetCode --> ValidateCode
    ValidateCode   --> EnterResetCode : Invalid / expired code (retry)
    ValidateCode   --> SetNewPassword : Code valid

    SetNewPassword --> PasswordUpdated : Clerk updates credential
    PasswordUpdated --> AutoSignIn     : Clerk signs user in automatically
    AutoSignIn --> SyncBackend         : POST /api/auth/sync with new Clerk session
    SyncBackend --> [*]                : User lands on home screen
```

---

## Summary Table

| # | Diagram | Mermaid Type | Description |
|---|---------|--------------|-------------|
| 1 | System Architecture – Three-Tier | `graph TB` | Mobile + Admin → Express API → Neon PostgreSQL; Clerk auth; Cloudinary; FCM; Redis rate limiting |
| 2 | DFD Level 0 – Context | `graph LR` | Top-level data flows between User, Agent, Admin, Clerk, Cloudinary, FCM, PostgreSQL |
| 3 | DFD Level 1 – Main Processes | `graph TD` | Six core processes: Auth Sync, Property Mgmt, Booking & Payment, Messaging, Notifications, Filter/Search |
| 4 | DFD Level 2 – Property Search | `graph TD` | Filter pipeline: query params → Redis rate limit → Prisma query → Cloudinary URLs |
| 5 | Entity Relationship Diagram | `erDiagram` | All 20 Prisma models with fields and relationships; 7 enums |
| 6 | Booking Finite State Machine | `stateDiagram-v2` | PENDING → CONFIRMED → COMPLETED / CANCELLED; paymentStatus transitions |
| 7 | Use Case – User & Agent | `graph LR` | User: browse, book, review, message, favorites; Agent: manage listings, handle bookings |
| 8 | Use Case – Admin & System | `graph LR` | Admin dashboard actions; system-automated notifications and cleanup |
| 9 | Application Flow – Happy Path | `flowchart TD` | Clerk sign-in → role-based routing → core feature flows |
| 10 | UML Component Diagram | `graph TB` | All 10 backend modules + mobile + admin + external services (Clerk, Cloudinary, FCM, Neon) |
| 11 | Class Diagram | `classDiagram` | 9 domain classes + AuthService + SocketService; actual fields and methods |
| 12 | Sequence – Clerk Login | `sequenceDiagram` | Clerk sign-in → getToken → POST /api/auth/sync → upsert DB → role-based redirect |
| 13 | Sequence – Token Lifecycle | `sequenceDiagram` | Clerk auto-refreshes session; Axios interceptor attaches fresh token on each request |
| 14 | Sequence – Real-time Messaging | `sequenceDiagram` | Socket.IO Clerk auth; conversation:join; message:send → DB insert → message:new emit |
| 15 | Activity – Booking Flow | `stateDiagram-v2` | Browse → Book → PENDING → CONFIRMED → COMPLETED → Review (no ACTIVE state) |
| 16 | Activity – Clerk Password Reset | `stateDiagram-v2` | Clerk forgot-password email flow → code validation → credential update → auto sign-in |
