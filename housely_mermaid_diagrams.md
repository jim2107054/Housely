# Housely - Print-Friendly Mermaid Diagrams

> Each diagram uses Times New Roman and larger text for printing.

---

## 1. System Architecture (3-Tier)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph TB
    subgraph UI["UI"]
        RN["Mobile"]
        NEXT["Admin"]
    end

    subgraph APP["App"]
        API["Backend API"]
    end

    subgraph DATA["Data"]
        PG[("Postgres")]
        RD[("Redis")]
        CLD["Cloudinary"]
    end

    subgraph EXT["External"]
        CLERK["Clerk"]
        NM["Email"]
        FCM["FCM"]
    end

    RN -->|REST/Socket| API
    NEXT -->|REST| API
    API -->|ORM| PG
    API --> RD
    API --> CLD
    API --> NM
    API --> FCM
    RN --> CLERK
    NEXT --> CLERK
    API --> CLERK
```

---

## 2. DFD Level 0 (Context)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph LR
    USER(["User/Agent"])
    ADMIN(["Admin"])
    EXT(["External"])
    SYS[["Housely"]]

    USER -->|Req| SYS
    SYS -->|Resp| USER
    ADMIN -->|Ops| SYS
    SYS -->|Stats| ADMIN
    SYS -->|Auth/Media/Push| EXT
    EXT -->|Tokens/URLs| SYS
```

---

## 3. DFD Level 1 (Main)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph TD
    UA(["User/Agent"])
    AD(["Admin"])

    P1["Auth"]
    P2["Property"]
    P3["Booking"]
    P4["Chat/Notif"]
    P5["Review"]
    P6["Payment"]
    P7["Admin"]

    D1[("Users")]
    D2[("Houses")]
    D3[("Bookings")]
    D4[("Chat")]
    D5[("Reviews")]
    D6[("Notifs")]
    D7[("Payments")]
    D8[("SavedLoc")]
    D9[("Redis")]

    UA --> P1
    P1 --- D1
    UA --> P2
    P2 --- D2
    UA --> P3
    P3 --- D2
    P3 --- D3
    UA --> P4
    P4 --- D4
    P4 --- D6
    UA --> P5
    P5 --- D3
    P5 --- D5
    UA --> P6
    P6 --- D3
    P6 --- D7
    AD --> P7
    P7 --- D1
    P7 --- D2
    P7 --- D3
    P7 --- D5
    P7 --- D7
    P7 --- D8
    P7 --- D9
```

---

## 4. DFD Level 2 (Property Search)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph TD
    U(["User"])
    S1["Input"]
    S2["Filter"]
    S3["Query"]
    S4["Track"]
    S5["Output"]
    H[("Houses")]
    V[("HouseViews")]

    U -->|GET /search| S1
    S1 --> S2 --> S3
    S3 --- H
    S3 --> S4
    S4 --- V
    S4 --> S5
    S5 --> U
```

---

## 5. ERD (Compact)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
erDiagram
    USER {
        string id PK
        string clerkId UK
        string role
    }
    HOUSE {
        string id PK
        string agentId FK
        string city
        float price
    }
    BOOKING {
        string id PK
        string userId FK
        string houseId FK
        string status
    }
    PAYMENT {
        string id PK
        string bookingId FK
        string status
    }
    REVIEW {
        string id PK
        string userId FK
        string houseId FK
    }
    CONVERSATION {
        string id PK
        string userId FK
        string agentId FK
        string houseId FK
    }
    MESSAGE {
        string id PK
        string conversationId FK
        string senderId FK
    }
    NOTIFICATION {
        string id PK
        string userId FK
        string type
    }
    DEVICE_TOKEN {
        string id PK
        string userId FK
        string token UK
    }
    FAVORITE {
        string id PK
        string userId FK
        string houseId FK
    }
    HOUSE_VIEW {
        string id PK
        string userId FK
        string houseId FK
    }
    SAVED_LOCATION {
        string id PK
        string userId FK
    }

    USER ||--o{ HOUSE : lists
    USER ||--o{ BOOKING : books
    USER ||--o{ REVIEW : writes
    USER ||--o{ NOTIFICATION : gets
    USER ||--o{ DEVICE_TOKEN : has
    USER ||--o{ FAVORITE : saves
    USER ||--o{ HOUSE_VIEW : views
    USER ||--o{ SAVED_LOCATION : stores

    HOUSE ||--o{ BOOKING : has
    HOUSE ||--o{ REVIEW : has
    HOUSE ||--o{ FAVORITE : in
    HOUSE ||--o{ HOUSE_VIEW : tracked
    HOUSE ||--o{ CONVERSATION : context

    BOOKING ||--o{ PAYMENT : pays
    BOOKING ||--o| REVIEW : reviewed
    CONVERSATION ||--o{ MESSAGE : contains
```

---

## 6. Booking FSM

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
stateDiagram-v2
    [*] --> PENDING : Create
    PENDING --> CONFIRMED : Approve
    PENDING --> CANCELLED : Cancel
    CONFIRMED --> COMPLETED : Complete
    CONFIRMED --> CANCELLED : Cancel
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

## 7. Use Case (User + Agent)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph LR
    U(["User"])
    A(["Agent"])

    UC1(Login)
    UC2(Browse)
    UC3(Filter)
    UC4(Book)
    UC5(Chat)
    UC6(Review)
    UC7(Favorite)
    UC8(Notify)

    AC1(List)
    AC2(Manage Bookings)
    AC3(Reply)
    AC4(Dashboard)

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8

    A --> UC1
    A --> AC1
    A --> AC2
    A --> AC3
    A --> AC4
```

---

## 8. Use Case (Admin + System)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph LR
    AD(["Admin"])
    SYS(["System"])

    A1(View Users)
    A2(Update Roles)
    A3(Manage Houses)
    A4(Manage Bookings)
    A5(View Payments)
    A6(Moderate Reviews)
    A7(View Analytics)
    A8(Broadcast)

    S1(Push)
    S2(Email)
    S3(Socket)
    S4(Upload)
    S5(Rate Limit)

    AD --> A1
    AD --> A2
    AD --> A3
    AD --> A4
    AD --> A5
    AD --> A6
    AD --> A7
    AD --> A8

    SYS --> S1
    SYS --> S2
    SYS --> S3
    SYS --> S4
    SYS --> S5
```

---

## 9. App Flow (Happy Path)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
flowchart TD
    A([Open App]) --> B{Session?}
    B -- No --> C[Sign In/Up]
    B -- Yes --> D{Role}
    C --> D

    D -- Agent --> E[Agent Home]
    D -- User --> F[User Home]

    F --> G[Browse]
    G --> H[View House]
    H --> I[Book]
    I --> J[(PENDING)]
    J --> K{Agent Action}
    K -- Confirm --> L[(CONFIRMED)]
    K -- Cancel --> M[(CANCELLED)]
    L --> N[(COMPLETED)]
    N --> O[Review]
    O --> P([End])
    M --> P
```

---

## 10. UML Component (Compact)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
graph TB
    subgraph MOBILE["Mobile"]
        MA1["Auth"]
        MA2["Router"]
        MA3["State"]
        MA4["API Client"]
        MA5["Socket Client"]
    end

    subgraph ADMIN["Admin"]
        AD1["Auth"]
        AD2["Pages"]
        AD3["Charts"]
    end

    subgraph BACKEND["Backend"]
        BE1["Router"]
        BE2["Middleware"]
        BE3["Modules"]
        BE4["Socket Server"]
    end

    subgraph DATA["Data"]
        D1["Prisma"]
        D2[("Postgres")]
        D3[("Redis")]
        D4["Cloudinary"]
    end

    subgraph EXT["External"]
        X1["Clerk"]
        X2["Email"]
        X3["FCM"]
    end

    MA4 --> BE1
    MA5 --> BE4
    MA1 --> X1
    AD2 --> BE1
    AD1 --> X1

    BE1 --> BE2 --> BE3
    BE3 --> D1 --> D2
    BE2 --> D3
    BE3 --> D4
    BE3 --> X1
    BE3 --> X2
    BE3 --> X3
```

---

## 11. Class Diagram (Compact)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
classDiagram
    class User {
        +id
        +role
        +login()
        +updateProfile()
    }
    class House {
        +id
        +agentId
        +create()
        +update()
    }
    class Booking {
        +id
        +status
        +create()
        +updateStatus()
    }
    class Review {
        +id
        +rating
        +create()
    }
    class Conversation {
        +id
        +create()
    }
    class Message {
        +id
        +send()
        +markRead()
    }
    class Notification {
        +id
        +type
        +sendPush()
    }
    class DeviceToken {
        +id
        +token
        +register()
    }
    class AuthService {
        +syncUser()
    }
    class SocketService {
        +init()
        +emitToUser()
    }

    User "1" --> "*" House : lists
    User "1" --> "*" Booking : books
    User "1" --> "*" Review : writes
    User "1" --> "*" Notification : gets
    User "1" --> "*" DeviceToken : has
    House "1" --> "*" Booking : has
    House "1" --> "*" Review : has
    Conversation "1" --> "*" Message : has
    AuthService --> SocketService : uses
```

---

## 12. Sequence (Auth Login)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
sequenceDiagram
    actor U as User
    participant M as Mobile
    participant C as Clerk
    participant A as API
    participant D as DB

    U->>M: Login
    M->>C: signIn
    C-->>M: token
    M->>A: auth/sync
    A->>C: verify
    C-->>A: ok
    A->>D: upsert user
    D-->>A: user
    A-->>M: user
    M-->>U: redirect
```

---

## 13. Sequence (Token Refresh)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
sequenceDiagram
    actor U as User
    participant M as Mobile
    participant C as Clerk
    participant A as API

    M->>A: request + token
    A->>C: verify

    alt valid
        A-->>M: 200
        M-->>U: data
    else expired
        A-->>M: 401
        M->>C: getToken
        C-->>M: new token
        M->>A: retry
        A-->>M: 200
    end
```

---

## 14. Sequence (Messaging)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
sequenceDiagram
    actor U as User
    actor A as Agent
    participant MU as User App
    participant MA as Agent App
    participant S as Socket
    participant API as API
    participant DB as DB

    U->>MU: Open chat
    MU->>API: create conversation
    API->>DB: find/create
    DB-->>API: conversation
    API-->>MU: id
    MU->>S: join
    MA->>S: join
    U->>MU: send
    MU->>S: message
    S->>DB: save
    S-->>MA: message:new
    A->>MA: reply
    MA->>S: message
    S->>DB: save
    S-->>MU: message:new
```

---

## 15. Activity (Booking)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
stateDiagram-v2
    [*] --> Browse
    Browse --> View
    View --> Auth
    Auth --> Login : no session
    Login --> View
    Auth --> Form : has session
    Form --> Validate
    Validate --> Form : invalid
    Validate --> PENDING : valid
    PENDING --> CONFIRMED : agent confirm
    PENDING --> CANCELLED : cancel
    CONFIRMED --> COMPLETED
    COMPLETED --> Review
    Review --> [*]
    CANCELLED --> [*]
```

---

## 16. Activity (Password Reset)

```mermaid
%%{init: {"theme":"base","themeVariables":{"fontFamily":"Times New Roman","fontSize":"24px"}}}%%
stateDiagram-v2
    [*] --> Login
    Login --> Forgot
    Forgot --> Email
    Email --> Code
    Code --> Verify
    Verify --> Code : invalid
    Verify --> NewPass : valid
    NewPass --> Updated
    Updated --> AutoSignIn
    AutoSignIn --> Sync
    Sync --> [*]
```

---

## Summary Table

| # | Diagram | Type | Scope |
|---|---------|------|-------|
| 1 | Architecture | graph TB | UI, API, Data, External |
| 2 | DFD L0 | graph LR | Context flow |
| 3 | DFD L1 | graph TD | Core processes |
| 4 | DFD L2 | graph TD | Search path |
| 5 | ERD | erDiagram | Core entities |
| 6 | Booking FSM | stateDiagram-v2 | Status transitions |
| 7 | Use Case User/Agent | graph LR | Main actions |
| 8 | Use Case Admin/System | graph LR | Ops and automation |
| 9 | App Flow | flowchart TD | Happy path |
| 10 | Component | graph TB | Major modules |
| 11 | Class | classDiagram | Core classes |
| 12 | Sequence Auth | sequenceDiagram | Login sync |
| 13 | Sequence Token | sequenceDiagram | Refresh flow |
| 14 | Sequence Chat | sequenceDiagram | Real-time messaging |
| 15 | Activity Booking | stateDiagram-v2 | Book lifecycle |
| 16 | Activity Reset | stateDiagram-v2 | Password reset |
