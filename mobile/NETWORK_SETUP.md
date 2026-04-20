# 🔧 Network Error Fix - Setup Guide

## ✅ Issues Fixed

### 1. **Configuration Issues**
- ✅ Hardcoded IP address replaced with environment variable support
- ✅ Platform-specific fallback URLs (Android Emulator, iOS Simulator, Physical Device)
- ✅ Comprehensive logging for debugging

### 2. **Android Configuration**
- ✅ Added `usesCleartextTraffic: true` to allow HTTP connections
- ✅ Added network permissions (INTERNET, ACCESS_NETWORK_STATE)

### 3. **API Error Handling**
- ✅ Enhanced API service with detailed error logging
- ✅ Comprehensive error diagnostics (shows exact cause of failure)
- ✅ Better error messages with actionable steps

### 4. **UI Error States**
- ✅ Fixed Owner Dashboard with error UI and retry button
- ✅ Fixed Home screen error handling
- ✅ Fixed Favorites, Properties, Chat, and Bookings screens
- ✅ All screens now show meaningful error messages instead of blank screens

---

## 🚀 Quick Setup

### Step 1: Configure Your API URL

**Option A: Using Environment Variable (Recommended)**

1. Copy `.env.example` to `.env`:
   ```bash
   cd mobile
   cp .env.example .env
   ```

2. Edit `.env` and update the IP address:
   ```bash
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
   ```

**Option B: Edit config.js Directly**

If you prefer not to use environment variables, edit `mobile/config.js`:
```javascript
// Line 42-44: Update this fallback URL for physical devices
fallbackUrl = 'http://YOUR_COMPUTER_IP:3000';
```

### Step 2: Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
# Example: 192.168.1.100
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
# Look for "inet" address (not 127.0.0.1)
```

### Step 3: Ensure Backend is Running

```bash
cd backend
npm install
npm run dev
```

You should see:
```
Server started on port 3000
```

### Step 4: Rebuild Your App

Since we modified `app.json` (Android config), you need to rebuild:

```bash
cd mobile
npx expo start --clear
```

Press `a` for Android or `i` for iOS.

---

## 🔍 Troubleshooting

### Still Getting "Network Error"?

**Check the logs in your terminal/console:**

The enhanced error logging will now show exactly what's wrong:

```
========== API ERROR ==========
[Base URL] http://192.168.1.100:3000
[Network Error] No response received from server
[Request URL] http://192.168.1.100:3000/api/houses/agent/dashboard
[Possible Causes]:
  1. Backend server is not running
  2. Wrong IP address in config.js
  3. Device/emulator cannot reach the server
  4. Firewall blocking the connection
  5. Android cleartext traffic not allowed (HTTP)
==============================
```

### Common Issues & Solutions:

1. **"Cannot connect to server"**
   - ✅ Verify backend is running on port 3000
   - ✅ Check your IP address is correct
   - ✅ Ensure phone and computer are on the same WiFi network
   - ✅ Disable firewall temporarily to test

2. **Works on iOS but not Android**
   - ✅ Already fixed: Added `usesCleartextTraffic: true` to app.json
   - ✅ Rebuild the app after this change

3. **Works on emulator but not physical device**
   - ✅ Use your computer's local IP (not `localhost` or `127.0.0.1`)
   - ✅ Ensure device is on the same network
   - ✅ Check firewall isn't blocking port 3000

4. **401 Unauthorized errors**
   - The app will automatically clear expired tokens
   - You'll need to log in again

---

## 📱 Platform-Specific URLs

The app automatically uses the right URL based on platform:

| Platform | Default URL | When to Use |
|----------|-------------|-------------|
| Android Emulator | `http://10.0.2.2:3000` | Running in Android Studio emulator |
| iOS Simulator | `http://localhost:3000` | Running in Xcode simulator |
| Physical Device | `http://192.168.x.x:3000` | Testing on real phone/tablet |

---

## 🧪 Testing the Fix

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the mobile app:**
   ```bash
   cd mobile
   npx expo start --clear
   ```

3. **Open the app** - You should now see:
   - Detailed logging in the terminal
   - Better error messages if something goes wrong
   - A retry button if connection fails
   - Proper loading states

4. **Check the logs:**
   - Look for `[Config] Using API URL from environment:` or fallback message
   - Look for `[API Request]` and `[API Response]` logs
   - Any errors will show detailed diagnostic information

---

## 🎯 What Changed?

### Files Modified:

1. **mobile/config.js**
   - Added environment variable support
   - Added platform detection
   - Added detailed logging
   - Added smart fallbacks

2. **mobile/services/api.js**
   - Enhanced error logging (shows exact cause)
   - Added request/response logging
   - Better 401 handling
   - Detailed network error diagnostics

3. **mobile/app.json**
   - Added Android `usesCleartextTraffic: true`
   - Added network permissions
   - Added package identifier

4. **API Call Components (7 screens fixed):**
   - `app/(owner)/index.jsx` - Owner Dashboard
   - `app/(tabs)/index.jsx` - Home Screen
   - `app/(tabs)/favorite.jsx` - Favorites
   - `app/(tabs)/chat.jsx` - Chat/Messages
   - `app/(owner)/properties.jsx` - Properties List
   - `app/(owner)/bookings.jsx` - Bookings
   - All now have: error state, detailed logging, error UI, retry functionality

---

## 📚 Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native Networking](https://reactnative.dev/docs/network)
- [Android Cleartext Traffic](https://developer.android.com/training/articles/security-config#CleartextTrafficPermitted)

---

## 🆘 Still Having Issues?

1. **Enable verbose logging:**
   - All API calls now log with `[ComponentName]` prefix
   - Check your terminal for detailed error messages

2. **Test the backend directly:**
   ```bash
   # From your computer
   curl http://localhost:3000/api/health
   
   # From your device (use your computer's IP)
   curl http://192.168.1.100:3000/api/health
   ```

3. **Check network connectivity:**
   ```bash
   # From your device, ping your computer
   ping 192.168.1.100
   ```

4. **Review the logs** - The enhanced error logging will tell you exactly what's wrong!

---

**✨ All network errors should now be resolved with clear, actionable error messages!**
