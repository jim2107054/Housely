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

const extractHost = (hostUri) => {
  if (!hostUri || typeof hostUri !== 'string') return null;
  return hostUri.split(':')[0] || null;
};

const isPrivateLanHost = (host) => {
  if (!host) return false;
  return (
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
};

const normalizeDeviceApiUrl = (envUrl, lanHost) => {
  if (!envUrl || !lanHost) return envUrl;

  try {
    const parsed = new URL(envUrl);
    const envHost = parsed.hostname;

    // If env points to a stale LAN IP, auto-align to current Expo LAN host.
    if (isPrivateLanHost(envHost) && envHost !== lanHost) {
      const port = parsed.port || '3000';
      const normalized = `${parsed.protocol}//${lanHost}:${port}`;
      console.warn(
        `[Config] Detected stale LAN API host (${envHost}). Using current Expo LAN host (${lanHost}).`
      );
      return normalized;
    }
  } catch {
    // Keep original envUrl if parsing fails.
  }

  return envUrl;
};

const detectExpoLanHost = () => {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoConfig?.extra?.expoGo?.debuggerHost,
    Constants.manifest2?.extra?.expoClient?.hostUri,
    Constants.manifest?.debuggerHost,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  return null;
};

// Get API URL from environment variable
const getApiUrl = () => {
  const lanHost = detectExpoLanHost();

  // First try environment variable
  const envUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 
                 process.env.EXPO_PUBLIC_API_URL;
  
  if (envUrl) {
    const resolvedEnvUrl = Constants.isDevice
      ? normalizeDeviceApiUrl(envUrl, lanHost)
      : envUrl;

    console.log('[Config] Using API URL from environment:', resolvedEnvUrl);
    return resolvedEnvUrl;
  }

  // Fallback based on runtime/device
  let fallbackUrl;

  if (!Constants.isDevice && Platform.OS === 'android') {
    fallbackUrl = 'http://10.0.2.2:3000'; // Android emulator
  } else if (!Constants.isDevice && Platform.OS === 'ios') {
    fallbackUrl = 'http://localhost:3000'; // iOS simulator
  } else if (lanHost) {
    fallbackUrl = `http://${lanHost}:3000`; // Physical device on LAN
  } else {
    fallbackUrl = 'http://192.168.0.100:3000'; // Final fallback if host detection fails
  }

  console.warn('[Config] No EXPO_PUBLIC_API_URL found, using fallback:', fallbackUrl);
  console.warn('[Config] For physical devices, update the IP in config.js or set EXPO_PUBLIC_API_URL');
  return fallbackUrl;
};

export const API_URL = getApiUrl();
