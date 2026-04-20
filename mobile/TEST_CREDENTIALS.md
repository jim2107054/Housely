# 🔑 Housely Test Login Credentials

## ✅ Database Successfully Seeded!

All test accounts use the same password: **`password123`**

---

## 👤 **REGULAR USERS (Renters)**

### User 1 - Amina Sultana
- **Email:** `user.amina@housely.dev`
- **Password:** `password123`
- **Role:** USER
- **Phone:** +8801810002001

### User 2 - Farhan Mahmud
- **Email:** `user.farhan@housely.dev`
- **Password:** `password123`
- **Role:** USER
- **Phone:** +8801810002002

### User 3 - Shila Akter
- **Email:** `user.shila@housely.dev`
- **Password:** `password123`
- **Role:** USER
- **Phone:** +8801810002003

### User 4 - Imon Hasan
- **Email:** `user.imon@housely.dev`
- **Password:** `password123`
- **Role:** USER
- **Phone:** +8801810002004

---

## 🏠 **HOUSE OWNERS (Agents)**

### Owner 1 - Nadia Rahman
- **Email:** `owner.nadia@housely.dev`
- **Password:** `password123`
- **Role:** AGENT
- **Phone:** +8801710001001
- **Location:** Gulshan, Dhaka

### Owner 2 - Tanvir Ahmed
- **Email:** `owner.tanvir@housely.dev`
- **Password:** `password123`
- **Role:** AGENT
- **Phone:** +8801710001002
- **Location:** Dhanmondi, Dhaka

### Owner 3 - Samira Chowdhury
- **Email:** `owner.samira@housely.dev`
- **Password:** `password123`
- **Role:** AGENT
- **Phone:** +8801710001003
- **Location:** Agrabad, Chattogram

### Owner 4 - Rihan Kabir
- **Email:** `owner.rihan@housely.dev`
- **Password:** `password123`
- **Role:** AGENT
- **Phone:** +8801710001004
- **Location:** Zindabazar, Sylhet

---

## 📊 **Database Contents**

- ✅ **4 Owners** (Agents)
- ✅ **4 Renters** (Regular Users)
- ✅ **32 Properties** (Houses)
- ✅ **16 Bookings**
- ✅ **8 Reviews**

---

## 🚀 **How to Login**

### **For Regular User Access:**
1. Open the app
2. Select **"I'm a User"**
3. Enter email: `user.amina@housely.dev`
4. Enter password: `password123`
5. Click Login ✅

### **For Owner/Agent Access:**
1. Open the app
2. Select **"I'm a House Owner"**
3. You'll be redirected to login
4. Enter email: `owner.nadia@housely.dev`
5. Enter password: `password123`
6. Click Login ✅

---

## ⚙️ **App Configuration**

- **API URL:** `http://192.168.1.105:3000`
- **Backend Status:** ✅ Running
- **Database:** ✅ Connected (Neon PostgreSQL)
- **Seeding:** ✅ Complete

---

## 🔧 **Troubleshooting**

### If login fails:
1. Make sure backend is running: `cd backend && npm run dev`
2. Check your IP is correct in `mobile/.env`
3. Try clearing app cache/storage on your device

### If you see network errors:
1. Verify backend is running on `http://localhost:3000`
2. Check your device can reach `http://192.168.1.105:3000`
3. Review the detailed error logs (they show exactly what's wrong!)

---

**✨ Everything is now ready for testing!**

**Quick Test:** Login as `user.amina@housely.dev` / `password123` to see the user experience, or `owner.nadia@housely.dev` / `password123` for the owner dashboard.
