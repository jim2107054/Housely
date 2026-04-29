import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import useAuthStore from "../store/authStore";
import useLocationStore from "../store/locationStore";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { setTokenProvider } from "../services/api";
import { connectSocket, disconnectSocket, setSocketTokenProvider } from "../services/socketService";

// Clerk token cache backed by expo-secure-store
const tokenCache = {
  async getToken(key) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key, value) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key) {
    return SecureStore.deleteItemAsync(key);
  },
};

// Inner component so it can use Clerk hooks
function AppNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth();
  const { user, isLoading, syncWithBackend, clearUser, setSignOutAction } = useAuthStore();
  const { detectGpsLocation } = useLocationStore();
  const hasDetectedGps = useRef(false);

  // Provide Clerk token to the axios instance and socket
  useEffect(() => {
    setTokenProvider(getToken);
    setSocketTokenProvider(getToken);
  }, [getToken]);

  useEffect(() => {
    setSignOutAction(signOut);
  }, [setSignOutAction, signOut]);

  // On sign-in, sync user profile with backend.
  // Guard against double-sync: login's finishSignIn calls syncWithBackend({ role })
  // first, which sets isLoading=true synchronously before the re-render that
  // triggers this effect. Skipping when isLoading prevents a concurrent roleless
  // sync from overwriting the role-aware one and causing wrong navigation.
  useEffect(() => {
    if (isLoaded && isSignedIn && !user && !isLoading) {
      syncWithBackend();
    }
    if (isLoaded && !isSignedIn) {
      disconnectSocket();
      clearUser();
    }
  }, [isLoaded, isSignedIn]);

  // Connect socket only once the user role is confirmed (user object populated)
  // This prevents the "no auth token" warning when Clerk session is still loading.
  useEffect(() => {
    if (isSignedIn && user) {
      connectSocket();
    }
  }, [isSignedIn, user]);

  // Auto-detect GPS location once per session after the user is fully confirmed
  useEffect(() => {
    if (isSignedIn && user && !isLoading && !hasDetectedGps.current) {
      hasDetectedGps.current = true;
      detectGpsLocation();
    }
  }, [isSignedIn, user, isLoading]);

  useEffect(() => {
    if (!isLoaded || !navigationState?.key) return;

    // While a signed-in user's profile is being fetched from the backend,
    // do not navigate — wait until syncWithBackend resolves so the role is known.
    if (isSignedIn && (isLoading || !user)) return;

    const inAuthScreen = segments[0] === "(auth)";
    const inOwnerScreen = segments[0] === "(owner)";
    const inOnboarding = segments[0] === "(onbording)";
    const inIndex = segments[0] === "index" || segments[0] === undefined;

    if (isSignedIn && inAuthScreen && segments[1] !== "ownerLogin") {
      if (user?.role === "AGENT") {
        router.replace("/(owner)");
      } else {
        router.replace("/(tabs)");
      }
    } else if (
      isSignedIn &&
      inOwnerScreen &&
      user?.role !== "AGENT" &&
      user?.role !== "ADMIN"
    ) {
      router.replace("/(tabs)");
    } else if (!isSignedIn && !inAuthScreen && !inOnboarding && !inIndex) {
      router.replace("/(auth)");
    }
  }, [isSignedIn, isLoaded, isLoading, user, segments, navigationState?.key]);

  // Show a neutral loading screen while Clerk is initialising or while
  // syncWithBackend is resolving the signed-in user's role from the backend.
  // This prevents any navigation from firing with an incomplete user object.
  if (!isLoaded || (isSignedIn && (isLoading || !user))) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(owner)" />
            <Stack.Screen name="(location)" />
            <Stack.Screen name="(onbording)" />
          </Stack>
        </PaperProvider>
      </SafeScreen>
      <StatusBar style="dark" />
      <Toast />
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <AppNavigator />
    </ClerkProvider>
  );
}
