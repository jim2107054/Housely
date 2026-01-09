import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { useEffect, useRef } from "react";

const onBoarding2 = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

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

  const handleGetStarted = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push("/(auth)");
    });
  };

  return (
    <Animated.View 
      style={{ opacity: fadeAnim }}
      className="flex-1 items-center justify-center"
    >
      <Animated.View 
        style={{
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
        }}
        className="my-16"
      >
        <Image source={require("../../assets/images/o3.png")} />
      </Animated.View>
      
      <Animated.View 
        style={{ transform: [{ translateY: slideAnim }] }}
        className="px-4 mb-20"
      >
        <Text className="text-3xl text-center mb-2">
          find your <Text className="font-bold">dream home</Text> {"\n"} for
          with us
        </Text>
        <Text className="text-center text-gray-600 px-8">
          Just search and select your favorite property you want to locate
        </Text>
      </Animated.View>

      <Animated.View 
        style={{ transform: [{ translateY: buttonSlideAnim }] }}
        className="mb-6 flex flex-row gap-2"
      >
        <View className="h-3 w-3 bg-gray-300 rounded-full self-center"></View>
        <View className="h-3 w-3 bg-gray-300 rounded-full self-center"></View>
        <View className="h-3 w-8 bg-secondary rounded-full self-center"></View>
      </Animated.View>

      <Animated.View 
        style={{ transform: [{ translateY: buttonSlideAnim }] }}
        className="w-full items-center"
      >
        <TouchableOpacity
          className="bg-secondary mx-6 px-6 py-4 w-11/12 rounded-md items-center active:opacity-80"
          onPress={handleGetStarted}
        >
          <Text className="text-white text-lg font-semibold">Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default onBoarding2;
