import { View, Text, Image, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import useAuthStore from "./../store/authStore";

const index = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { user, token, checkAuth } = useAuthStore(); // Initialize auth store

  useEffect(() => {
    checkAuth();
  }, []);

  console.log(user, token);

  useEffect(() => {
    // Parallel animations for a smooth entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(onbording)"); // Navigate to onboarding after 3 seconds
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-primary items-center justify-center px-6">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        }}
        className="items-center"
      >
        <Image
          source={require("../assets/images/icon.png")}
          className="w-80 h-80 mb-8"
          resizeMode="contain"
        />
        <Text className="text-4xl font-bold text-white text-center mb-4">
          Housely
        </Text>
        <Text className="text-lg text-white/80 text-center mb-2">
          Your Digital Real Estate Assistant
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <View className="absolute bottom-16 flex-row space-x-2">
        <View className="w-2 h-2 bg-white/40 rounded-full" />
        <View className="w-2 h-2 bg-white/60 rounded-full" />
        <View className="w-2 h-2 bg-white rounded-full" />
      </View>
    </View>
  );
};

export default index;
