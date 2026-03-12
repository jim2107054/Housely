import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

const RoleSelection = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const card1Anim = useRef(new Animated.Value(60)).current;
  const card2Anim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(card1Anim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelect = (role) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (role === "OWNER") {
        router.push("/(auth)/ownerLogin");
      } else {
        router.push({ pathname: "/(auth)", params: { role } });
      }
    });
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim, flex: 1 }}
      className="bg-cardBackground"
    >
      <View className="flex-1 px-6 justify-center">
        {/* Header */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="mb-10"
        >
          <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
            Welcome to Housely
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            How would you like to use the app?{"\n"}Choose your role to get
            started
          </Text>
        </Animated.View>

        {/* Role Cards */}
        <View className="gap-5">
          {/* User Card */}
          <Animated.View style={{ transform: [{ translateY: card1Anim }] }}>
            <TouchableOpacity
              className="bg-white rounded-2xl p-6 border-2 border-gray-100"
              style={{
                shadowColor: "#7B61FF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
              onPress={() => handleSelect("USER")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-2xl bg-purple-50 items-center justify-center mr-4">
                  <Ionicons name="person" size={32} color="#7B61FF" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-1">
                    I'm a User
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    Find and book your dream property.{"\n"}Browse, save
                    favorites & review stays.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7B61FF" />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Owner Card */}
          <Animated.View style={{ transform: [{ translateY: card2Anim }] }}>
            <TouchableOpacity
              className="bg-white rounded-2xl p-6 border-2 border-gray-100"
              style={{
                shadowColor: "#7B61FF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 3,
              }}
              onPress={() => handleSelect("OWNER")}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-2xl bg-orange-50 items-center justify-center mr-4">
                  <Ionicons name="home" size={32} color="#FF9800" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-1">
                    I'm a House Owner
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">
                    List your properties for rent or sale.{"\n"}Manage bookings,
                    reviews & earnings.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FF9800" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};

export default RoleSelection;
