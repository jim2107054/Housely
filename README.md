# 🏠 Housely

> A modern, full-stack property rental application built with React Native and Node.js

Housely is a comprehensive house rental platform that connects property seekers with agents, featuring real-time messaging, advanced search filters, booking management, and an intuitive mobile-first experience.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Expo](https://img.shields.io/badge/expo-~54.0.30-000020.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/react--native-0.81.5-61DAFB.svg)](https://reactnative.dev/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Backend Setup](#1-backend-setup)
  - [Mobile App Setup](#2-mobile-app-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Multi-provider authentication (Local, Google, Facebook)
- JWT-based access and refresh tokens
- Password reset via Email/SMS OTP
- Role-based access control (User, Agent, Admin)

### 🏘️ Property Management
- Advanced property search with filters (price, type, location, amenities)
- Property listings with photo galleries
- Nearby properties with geolocation
- AI-powered property recommendations
- Property favorites and recently viewed
- Real-time property availability

### 📅 Booking System
- Seamless booking flow with calendar integration
- Booking status tracking (Upcoming, Completed, Cancelled)
- Payment history and transaction management
- Agent-side booking management

### ⭐ Reviews & Ratings
- 5-star rating system with detailed feedback
- Photo/video upload support
- Rating distribution analytics
- Review moderation

### 💬 Real-Time Communication
- In-app messaging with Socket.IO
- Typing indicators and read receipts
- WebRTC audio/video calling
- Agent-user chat conversations

### 🔔 Notifications
- In-app notification center
- Push notifications (Firebase Cloud Messaging)
- Customizable notification settings
- Real-time updates for bookings and messages

### 👤 User Profile
- Profile customization with avatar upload
- Payment history tracking
- Notification preferences
- Saved locations management
- Account settings (password, biometric, privacy)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js v20** | Runtime environment |
| **Express.js v5** | Web framework |
| **PostgreSQL** | Primary database (hosted on Neon) |
| **Prisma** | ORM and database migrations |
| **Redis** | Caching and session management |
| **Socket.IO** | Real-time bidirectional communication |
| **JWT** | Authentication tokens |
| **Zod** | Schema validation |
| **Multer** | File upload handling |
| **Cloudinary** | Media storage |
| **Nodemailer** | Email notifications |
| **Swagger** | API documentation |
| **Jest** | Testing framework |

### Mobile App
| Technology | Purpose |
|------------|---------|
| **React Native 0.81** | Mobile framework |
| **Expo SDK 54** | Development platform |
| **Expo Router v6** | File-based routing |
| **NativeWind v4** | TailwindCSS for React Native |
| **Zustand** | State management |
| **Axios** | API client |
| **Expo Image Picker** | Media selection |
| **Expo Location** | Geolocation services |
| **React Native Toast** | User notifications |

---

## 📁 Project Structure

```
Housely/
├── backend/                    # Node.js backend API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Database seeding
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── middlewares/       # Express middlewares
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── house/
│   │   │   ├── message/
│   │   │   ├── notification/
│   │   │   ├── review/
│   │   │   └── user/
│   │   ├── sockets/           # Socket.IO configuration
│   │   ├── utils/             # Helper functions
│   │   └── app.js             # Express app setup
│   ├── __tests__/             # API tests
│   ├── server.js              # Server entry point
│   └── package.json
│
├── mobile/                     # React Native mobile app
│   ├── app/                   # Expo Router pages
│   │   ├── (auth)/            # Authentication screens
│   │   ├── (location)/        # Location screens
│   │   ├── (onbording)/       # Onboarding screens
│   │   ├── (tabs)/            # Tab navigation screens
│   │   │   ├── index.jsx      # Home screen
│   │   │   ├── explore.jsx    # Explore properties
│   │   │   ├── favorite.jsx   # Favorites
│   │   │   ├── myBooking.jsx  # Bookings management
│   │   │   ├── profile.jsx    # User profile
│   │   │   ├── search.jsx     # Search with filters
│   │   │   ├── settings.jsx   # App settings
│   │   │   └── ...            # Other screens
│   │   └── _layout.jsx        # Root layout
│   ├── assets/                # Images and fonts
│   ├── components/            # Reusable components
│   ├── constants/             # App constants
│   ├── services/              # API services
│   ├── store/                 # Zustand stores
│   └── package.json
│
└── README.md                   # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v10.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** account on [Neon](https://neon.tech/) (free tier available)
- **Redis** instance (optional, for caching)
- **Expo Go** app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

---

## 🚀 Getting Started

### 1. Backend Setup

#### Clone the repository
```bash
git clone https://github.com/jim2107054/Housely.git
cd Housely/backend
```

#### Install dependencies
```bash
npm install
```

#### Configure Database (Neon)

1. Go to [console.neon.tech](https://console.neon.tech) and create an account
2. Create a new project → Select **AWS / ap-southeast-1 (Singapore)**
3. Name your database: `housely`
4. Copy the connection strings from **Connection Details** panel

#### Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL="postgresql://...?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://...?sslmode=require"

# JWT Secrets
JWT_ACCESS_SECRET="your-secure-access-secret-key"
JWT_REFRESH_SECRET="your-secure-refresh-secret-key"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server
PORT=3000
NODE_ENV=development
```

#### Run database migrations
```bash
npm run db:migrate
npm run db:seed       # Seed with sample data
```

#### Start the development server
```bash
npm run dev
```

Server will run at `http://localhost:3000`

✅ Test it: Visit `http://localhost:3000/api/docs` for Swagger documentation

---

### 2. Mobile App Setup

#### Navigate to mobile directory
```bash
cd ../mobile
```

#### Install dependencies
```bash
npm install
```

#### Configure environment
Create `config.js` in the root of `mobile/`:
```javascript
export default {
  API_URL: 'http://192.168.1.100:3000/api', // Replace with your local IP
  SOCKET_URL: 'http://192.168.1.100:3000',
};
```

> **Note**: Replace `192.168.1.100` with your computer's local IP address. 
> - On Windows: Run `ipconfig` in terminal
> - On Mac/Linux: Run `ifconfig` or `ip addr`

#### Start Expo development server
```bash
npx expo start
```

#### Run on device or simulator

**Option 1: Physical Device (Recommended)**
1. Install **Expo Go** on your phone
2. Scan the QR code from terminal with:
   - iOS: Camera app
   - Android: Expo Go app

**Option 2: Simulator**
- Press `i` for iOS simulator (Mac only)
- Press `a` for Android emulator (requires Android Studio)

---

## 🔐 Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL=                    # Neon PostgreSQL connection string (pooled)
DIRECT_URL=                      # Neon PostgreSQL direct connection

# Authentication
JWT_ACCESS_SECRET=               # Secret key for access tokens (min 32 chars)
JWT_REFRESH_SECRET=              # Secret key for refresh tokens (min 32 chars)
JWT_ACCESS_EXPIRY=15m           # Access token expiration
JWT_REFRESH_EXPIRY=7d           # Refresh token expiration

# Redis Cache
REDIS_URL=redis://localhost:6379

# Cloudinary Media
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# SMS Provider (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Server
PORT=3000
NODE_ENV=development
```

### Mobile `config.js`
```javascript
export default {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000',
};
```

---

## 📚 API Documentation

### Swagger UI
Interactive API documentation is available when the backend server is running:

**URL**: `http://localhost:3000/api/docs`

### Postman Collection
Import the Postman collection for testing:
- File: `backend/Housely_API_Collection.postman_collection.json`

### Key Endpoints

#### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password with OTP
```

#### Houses
```
GET    /api/houses                 # List all properties
GET    /api/houses/:id             # Get property details
POST   /api/houses                 # Create property (Agent only)
PUT    /api/houses/:id             # Update property
DELETE /api/houses/:id             # Delete property
GET    /api/houses/nearby          # Get nearby properties
GET    /api/houses/recommended     # Get AI recommendations
```

#### Bookings
```
GET    /api/bookings               # List user bookings
POST   /api/bookings               # Create booking
PUT    /api/bookings/:id           # Update booking status
DELETE /api/bookings/:id           # Cancel booking
```

#### Reviews
```
GET    /api/reviews/house/:houseId # Get property reviews
POST   /api/reviews                # Submit review
PUT    /api/reviews/:id            # Update review
DELETE /api/reviews/:id            # Delete review
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- api.test.js
```

### Mobile Tests
```bash
cd mobile

# Run lint checks
npm run lint

# Type checking (if TypeScript)
npx tsc --noEmit
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feat/amazing-feature
   ```
3. **Commit your changes** (use conventional commits)
   ```bash
   git commit -m "feat(booking): add calendar date picker"
   ```
4. **Push to your branch**
   ```bash
   git push origin feat/amazing-feature
   ```
5. **Open a Pull Request**

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👥 Team

**Developer**: Jim  
**Repository**: [jim2107054/Housely](https://github.com/jim2107054/Housely)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing mobile development platform
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Neon](https://neon.tech/) for serverless PostgreSQL hosting
- [NativeWind](https://www.nativewind.dev/) for TailwindCSS integration

---

<div align="center">
  <p>Built with ❤️ by the Housely Team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>