import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Add your login logic here
    console.log('Login with:', email, password);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      <View className="flex-1 px-6 pt-16">
        {/* Logo */}
        <View className="items-center mb-8">
          <Image
            source={require('../assets/images/Logo.png')}
            className="w-24 h-24 mb-4"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-center">
            Sign in to continue to Housely
          </Text>
        </View>

        {/* Form */}
        <View className="mt-8">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Email</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-4 text-base"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 mb-2 font-medium">Password</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-4 text-base"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end mb-6">
            <Text className="text-purple-600 font-medium">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-purple-600 rounded-2xl py-4 mb-6"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-base font-semibold">
              Login
            </Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View className="items-center mb-6">
            <Text className="text-gray-500 mb-4">Or continue with</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 w-16 h-16 items-center justify-center">
                <Image
                  source={require('../assets/images/google.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity className="bg-white border border-gray-200 rounded-xl p-4 w-16 h-16 items-center justify-center ml-4">
                <Image
                  source={require('../assets/images/facebook.png')}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity>
              <Text className="text-purple-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
