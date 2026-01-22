import { View, Text, TouchableOpacity, Animated, Image, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import useLocationStore from "../../store/locationStore";

const SelectLocation = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location permissions to use this feature.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const formattedAddress = address
        ? `${address.street || ""}, ${address.district || ""}, ${address.subregion || ""}, ${address.city || ""}`
        : "Location found";

      // Navigate to maps with current location
      router.push({
        pathname: "/(location)/maps",
        params: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: formattedAddress,
          fromCurrentLocation: "true",
        },
      });
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try selecting manually.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectManually = () => {
    router.push("/(location)/maps");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="flex-row justify-end px-5 pt-4">
        <TouchableOpacity
          onPress={handleSkip}
          className="border border-border rounded-lg px-5 py-2"
        >
          <Text className="text-textSecondary font-poppins text-sm">Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 items-center justify-center px-6"
      >
        {/* Illustration */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          }}
          className="mb-10"
        >
          <View className="w-64 h-64 items-center justify-center">
            {/* Map Illustration SVG Replacement */}
            <View className="relative">
              {/* Map background */}
              <View className="w-56 h-44 bg-cardBackground rounded-2xl overflow-hidden">
                {/* Map lines (streets) */}
                <View className="absolute w-full h-0.5 bg-white top-10" />
                <View className="absolute w-full h-0.5 bg-white top-20" />
                <View className="absolute w-full h-0.5 bg-white top-32" />
                <View className="absolute w-0.5 h-full bg-white left-10" />
                <View className="absolute w-0.5 h-full bg-white left-24" />
                <View className="absolute w-0.5 h-full bg-white left-40" />
                
                {/* Location markers */}
                <View className="absolute top-14 left-16">
                  <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                    <View className="w-4 h-4 rounded-full bg-white items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    </View>
                  </View>
                </View>
                
                <View className="absolute top-24 left-32">
                  <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                    <View className="w-3 h-3 rounded-full bg-white" />
                  </View>
                </View>
              </View>

              {/* Magnifying glass */}
              <View className="absolute -right-4 -bottom-4">
                <View className="w-20 h-20 rounded-full bg-white border-4 border-primary items-center justify-center shadow-lg">
                  <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                    <View className="w-5 h-5 rounded-full bg-white items-center justify-center">
                      <View className="w-2 h-2 rounded-full bg-primary" />
                    </View>
                  </View>
                </View>
                {/* Magnifying glass handle */}
                <View 
                  className="absolute -bottom-3 -right-3 w-8 h-3 bg-primary rounded-full"
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </View>

              {/* Decorative elements */}
              <View className="absolute -left-6 top-4">
                <View className="w-4 h-4 rounded-full bg-green-400" />
              </View>
              <View className="absolute -left-2 bottom-0">
                <View className="w-3 h-8 rounded-full bg-green-500" />
              </View>
              <View className="absolute right-16 -top-2">
                <View className="w-2 h-6 rounded-full bg-green-400" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="items-center mb-16"
        >
          <Text className="text-2xl font-poppins-bold text-textPrimary mb-3">
            Hi, Nice to meet you !
          </Text>
          <Text className="text-center text-textSecondary font-poppins text-sm px-4">
            Choose your location to find property around you
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={{ transform: [{ translateY: buttonSlideAnim }] }}
          className="w-full px-4"
        >
          {/* Use current location button */}
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            disabled={loading}
            className="bg-primary rounded-xl py-4 items-center mb-4"
          >
            <Text className="text-white font-poppins-semibold text-base">
              {loading ? "Getting location..." : "Use current location"}
            </Text>
          </TouchableOpacity>

          {/* Select manually button */}
          <TouchableOpacity
            onPress={handleSelectManually}
            className="border border-primary rounded-xl py-4 items-center"
          >
            <Text className="text-primary font-poppins-semibold text-base">
              Select it manually
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default SelectLocation;
