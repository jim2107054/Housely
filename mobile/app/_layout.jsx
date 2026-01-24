import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import "../global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";
import useAuthStore from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  //! segments tells us where we are in the navigation tree(ex: auth stack, main app stack, etc)
  // console.log(segments);

  const {checkAuth, user, token} = useAuthStore();

  //! Firstly check if the user is authenticated
  useEffect(()=>{
    checkAuth();//! it will set the user and token if valid token found in async storage
  },[]); // only once on mount

  useEffect(()=>{
    // Don't navigate until the navigation state is ready
    if (!navigationState?.key) return;
    
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    // Use setTimeout to ensure navigation happens after render
    const timeout = setTimeout(() => {
      //! if user is signed in and trying to access auth screens, redirect to main app
      if(isSignedIn && inAuthScreen){
        router.replace("/(tabs)");
      }
      //! if user is not signed in and trying to access main app screens, redirect to auth
      else if(!isSignedIn && !inAuthScreen && segments[0] !== "(onbording)" && segments[0] !== "index"){
        router.replace("/(auth)");
      }
    }, 0);

    return () => clearTimeout(timeout);
  },[user, token, segments, navigationState?.key]); //! whenever user or token or segments changes

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
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
