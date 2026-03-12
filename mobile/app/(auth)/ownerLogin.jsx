import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const OwnerLogin = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleOwnerPress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/(owner)");
    });
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim, flex: 1 }}
      className="bg-cardBackground"
    >
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon */}
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="mb-8"
        >
          <View
            className="w-28 h-28 rounded-3xl bg-orange-50 items-center justify-center"
            style={{
              shadowColor: "#FF9800",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
            <Ionicons name="home" size={56} color="#FF9800" />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="mb-10 items-center"
        >
          <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
            House Owner
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            Access your owner dashboard to{"\n"}manage properties & bookings.
          </Text>
        </Animated.View>

        {/* Owner Button */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="w-full"
        >
          <TouchableOpacity
            onPress={handleOwnerPress}
            activeOpacity={0.8}
            className="w-full rounded-2xl py-5 items-center"
            style={{
              backgroundColor: "#FF9800",
              shadowColor: "#FF9800",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="home" size={22} color="#fff" />
              <Text className="text-white text-lg font-bold ml-2">Owner</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default OwnerLogin;
