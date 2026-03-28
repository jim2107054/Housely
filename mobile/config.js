// ─── API URL Configuration ───────────────────────────────────────────────────
//
// Physical device (Android or iOS) on the same WiFi as your dev machine:
//   → Set LOCAL_IP to your machine's IP (run `ipconfig` on Windows / `ifconfig` on Mac)
//
// Android Emulator:
//   → Use 'http://10.0.2.2:3000' (special alias for host machine localhost)
//
// iOS Simulator:
//   → Use 'http://localhost:3000'
//
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_IP = '192.168.1.103'; // ← your dev machine's WiFi IP

export const API_URL = `http://${LOCAL_IP}:3000`;

// Uncomment one of these instead if needed:
// export const API_URL = 'http://10.0.2.2:3000';  // Android emulator
// export const API_URL = 'http://localhost:3000';  // iOS simulator

