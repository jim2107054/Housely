# 🏠 Housely Backend

Production-ready REST API backend for the Housely house rental mobile application.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js v20+ |
| Framework | Express.js v5 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Cache | Redis |
| Auth | JWT (Access + Refresh Tokens) |
| Real-time | Socket.IO |
| File Storage | Cloudinary |
| Validation | Zod |

## Features

- ✅ **Authentication** - Register, Login, JWT tokens, Password reset (Email/SMS OTP)
- ✅ **User Profile** - View/Edit profile, Avatar upload, Notification settings
- ✅ **Houses** - CRUD operations, Advanced filtering, Nearby search, Recommendations
- ✅ **Bookings** - Create/Cancel bookings, Status management for agents
- ✅ **Reviews** - Star ratings, Photo/Video uploads, Rating distribution
- ✅ **Messaging** - Real-time chat via Socket.IO, Typing indicators, Read receipts
- ✅ **Calls** - WebRTC signaling for audio/video calls
- ✅ **Notifications** - In-app notifications, Push notifications (FCM), Device token management
- ✅ **Location** - Reverse geocoding, Saved locations

## Quick Start

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Database Setup (Neon)

1. Go to [console.neon.tech](https://console.neon.tech) and create a free account
2. Create a new project → Select **AWS / ap-southeast-1 (Singapore)**
3. Name your database: `housely`
4. Copy connection strings from **Connection Details** panel

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."
JWT_ACCESS_SECRET="your-secret"
JWT_REFRESH_SECRET="your-secret"
```

### 4. Run Migrations

```bash
npm run db:migrate
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## 📚 API Documentation (Swagger)

Interactive API documentation is available at:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs.json`

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (protected) |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/forgot-password/email` | Send OTP via email |
| POST | `/api/auth/forgot-password/phone` | Send OTP via SMS |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/reset-password` | Reset password |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/me/avatar` | Upload avatar |
| GET | `/api/users/me/recent-viewed` | Recent viewed houses |
| GET | `/api/users/me/notifications` | Notification settings |
| PATCH | `/api/users/me/notifications` | Update notification settings |

### Houses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/houses` | List houses (paginated) |
| GET | `/api/houses/recommended` | Recommended for user |
| GET | `/api/houses/nearby` | Nearby houses (lat/lng) |
| GET | `/api/houses/popular` | Popular houses |
| GET | `/api/houses/top-locations` | Top locations by listing count |
| GET | `/api/houses/:id` | House details |
| POST | `/api/houses` | Create house (Agent) |
| PATCH | `/api/houses/:id` | Update house (Agent) |
| DELETE | `/api/houses/:id` | Delete house (Agent) |
| POST | `/api/houses/:id/view` | Track view |
| GET | `/api/houses/:id/share-link` | Get share link |

### Filter & Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/filter/search` | Advanced filter with all params |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | My bookings |
| GET | `/api/bookings/:id` | Booking details |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| GET | `/api/bookings/agent/all` | Agent's bookings |
| PATCH | `/api/bookings/agent/:id/status` | Update booking status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create review |
| GET | `/api/reviews/house/:houseId` | House reviews |
| GET | `/api/reviews/my` | My reviews |
| PATCH | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/:id` | Get conversation |
| GET | `/api/conversations/:id/messages` | Get messages |
| POST | `/api/conversations/:id/messages` | Send message |
| PATCH | `/api/conversations/:id/read` | Mark as read |
| GET | `/api/conversations/unread-count` | Unread count |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| POST | `/api/notifications/device-token` | Register FCM token |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/location/reverse-geocode` | Reverse geocode |
| GET | `/api/location/saved` | Saved locations |
| POST | `/api/location/save` | Save location |
| DELETE | `/api/location/saved/:id` | Delete saved location |

## Socket.IO Events

### Messaging
```javascript
// Join conversation room
socket.emit('conversation:join', conversationId);

// Send message
socket.emit('message:send', { conversationId, content, type: 'text' });

// Receive message
socket.on('message:received', (message) => {});

// Typing indicators
socket.emit('typing:start', conversationId);
socket.emit('typing:stop', conversationId);
```

### Calls (WebRTC Signaling)
```javascript
socket.emit('call:initiate', { conversationId, callType: 'audio' | 'video' });
socket.emit('call:offer', { conversationId, offer });
socket.emit('call:answer', { conversationId, answer });
socket.emit('call:ice-candidate', { conversationId, candidate });
socket.emit('call:end', { conversationId });
```

## Scripts

```bash
npm run dev        # Start development server
npm run start      # Start production server
npm run db:migrate # Run Prisma migrations
npm run db:seed    # Seed database
npm run db:studio  # Open Prisma Studio
npm run test       # Run tests
```

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── filter/
│   │   ├── house/
│   │   ├── location/
│   │   ├── message/
│   │   ├── notification/
│   │   ├── review/
│   │   └── user/
│   ├── sockets/
│   ├── utils/
│   └── app.js
├── server.js
├── package.json
└── .env.example
```

## Deployment

### Recommended Platforms (Full Features)
- **Railway.app** - Best for Socket.IO support
- **Render.com** - Free tier available
- **Fly.io** - Global edge deployment

### Vercel (REST API Only)
Socket.IO will not work on Vercel due to serverless limitations. REST endpoints will work.

## License

ISC
