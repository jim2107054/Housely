import { View, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  withSpring, 
  withSequence,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';

export default function Index() {
  const router = useRouter();
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo with bounce effect
    scale.value = withSequence(
      withSpring(1.2, { damping: 2 }),
      withSpring(1, { damping: 3 })
    );
    
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.ease,
    });

    // Auto redirect to onboarding after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/onboarding1');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../assets/images/Logo.png')}
          className="w-40 h-40"
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
