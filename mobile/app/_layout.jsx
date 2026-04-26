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
import { useEffect } from "react";
import { setTokenProvider } from "../services/api";
import { disconnectSocket, setSocketTokenProvider } from "../services/socketService";

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
  const { user, syncWithBackend, clearUser, setSignOutAction } = useAuthStore();

  // Provide Clerk token to the axios instance and socket
  useEffect(() => {
    setTokenProvider(getToken);
    setSocketTokenProvider(getToken);
  }, [getToken]);

  useEffect(() => {
    setSignOutAction(signOut);
  }, [setSignOutAction, signOut]);

  // On sign-in, sync user profile with backend
  useEffect(() => {
    if (isLoaded && isSignedIn && !user) {
      syncWithBackend();
    }
    if (isLoaded && !isSignedIn) {
      disconnectSocket();
      clearUser();
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !navigationState?.key) return;

    const inAuthScreen = segments[0] === "(auth)";
    const inOwnerScreen = segments[0] === "(owner)";
    const inOnboarding = segments[0] === "(onbording)";
    const inIndex = segments[0] === "index" || segments[0] === undefined;

    const timeout = setTimeout(() => {
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
    }, 0);

    return () => clearTimeout(timeout);
  }, [isSignedIn, isLoaded, user, segments, navigationState?.key]);

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
