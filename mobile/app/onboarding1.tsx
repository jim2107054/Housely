import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Onboarding1() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Skip Button */}
      <View className="absolute top-12 right-6 z-10">
        <Pressable onPress={() => router.push('/login')}>
          <Text className="text-gray-500 text-base">Skip</Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        
        {/* Image Container */}
        <View className="items-center mb-10">
          <View className="relative">
            {/* Purple decorative overlay */}
            <View className="absolute bottom-0 right-0 w-48 h-64 bg-purple-300 rounded-tl-[120px] opacity-60 z-0" />
            
            {/* Main rounded image container */}
            <View className="w-80 h-80 rounded-tl-[160px] rounded-tr-[160px] overflow-hidden z-10">
              <Image
                source={require('../assets/images/OnBording/o1.png')}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View className="items-center px-4">
          <Text className="text-3xl font-bold text-gray-900 text-center leading-tight">
            Find the <Text className="text-gray-900">perfect place</Text>
          </Text>
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            for your future house
          </Text>
          <Text className="text-gray-500 text-center text-sm leading-5 px-2">
            find the best place for your dream house with{'\n'}your family and loved ones
          </Text>
        </View>

        {/* Dots Indicator */}
        <View className="flex-row mt-8 mb-8">
          <View className="h-2 w-8 rounded-full bg-purple-600 mx-1" />
          <View className="h-2 w-2 rounded-full bg-gray-300 mx-1" />
          <View className="h-2 w-2 rounded-full bg-gray-300 mx-1" />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={() => router.push('/onboarding2')}
          className="bg-purple-600 rounded-2xl py-4 w-full max-w-sm"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center text-base font-semibold">
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
