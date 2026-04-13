/**
 * API Configuration
 * 
 * Priority:
 * 1. EXPO_PUBLIC_API_URL environment variable (set in .env or EAS secrets)
 * 2. Platform-specific fallback:
 *    - Android Emulator: http://10.0.2.2:3000
 *    - iOS Simulator: http://localhost:3000
 *    - Physical Device: Update IP to your computer's local IP
 * 
 * To set environment variable, create .env file:
 * EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get API URL from environment variable
const getApiUrl = () => {
  // First try environment variable
  const envUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                 process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl) {
    console.log('[Config] Using API URL from environment:', envUrl);
    return envUrl;
  }

  // Fallback based on platform
  let fallbackUrl;
  if (Platform.OS === 'android') {
    fallbackUrl = 'http://10.0.2.2:3000'; // Android emulator
  } else if (Platform.OS === 'ios') {
    fallbackUrl = 'http://localhost:3000'; // iOS simulator
  } else {
    fallbackUrl = 'http://192.168.0.100:3000'; // Physical device - UPDATE THIS IP
  }

  console.warn('[Config] No EXPO_PUBLIC_API_URL found, using fallback:', fallbackUrl);
  console.warn('[Config] For physical devices, update the IP in config.js or set EXPO_PUBLIC_API_URL');
  return fallbackUrl;
};

export const API_URL = getApiUrl();
