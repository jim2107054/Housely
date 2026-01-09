import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import useAuthStore from "../../store/authStore";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";

const signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {user, isLoading, register} = useAuthStore();
  const router = useRouter();

  const handleSignup = async () => {
    // Implement signup logic here
    const result = await register(name, email, password);

    if(!result.success){
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: result.message || 'An error occurred during signup',
        position: 'top',
        visibilityTime: 4000,
      });
    }
    else{
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Account created successfully',
        position: 'top',
        visibilityTime: 3000,
      });
      // On successful signup, navigate to login
      router.replace('/(auth)');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center items-center bg-primary/10">
        <Image
          source={require("../../assets/images/Learning-bro.png")}
          className="max-h-56 max-w-56 mb-2"
        />
        <View className="w-11/12 bg-cardBackground p-4 rounded-md shadow-md">
          <Text className="text-2xl font-bold text-center text-gray-700 mb-2">
            Create an Account
          </Text>
          {/* Full Name Input Field */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-start text-gray-500 mb-1">
              Full Name
            </Text>
            <View className="relative">
              <View
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                pointerEvents="none"
              >
                <Ionicons name="person-outline" size={20} color="#888" />
              </View>
              <TextInput
                className="pl-10 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
                placeholder="Enter your full name"
                keyboardType="default"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
          {/* Email Input Field */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-start text-gray-500 mb-1">
              Email
            </Text>
            <View className="relative">
              <View
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                pointerEvents="none"
              >
                <Ionicons name="mail-outline" size={20} color="#888" />
              </View>
              <TextInput
                className="pl-10 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>
          {/* Password Input Field */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-start text-gray-500 mb-1">
              Password
            </Text>
            <View className="relative">
              <View
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                pointerEvents="none"
              >
                <Ionicons name="lock-closed-outline" size={20} color="#888" />
              </View>
              <TextInput
                className="pl-10 pr-10 border border-gray-300 rounded-md py-4 px-3 text-gray-900"
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={!showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Sign Up Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-3"
            onPress={handleSignup}
          >
            {
              isLoading ? (
                <ActivityIndicator animating={true} size="small" color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Sign Up
                </Text>
              )
            }
          </TouchableOpacity>
          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/(auth)">
              <Text className="text-primary font-semibold">Login</Text>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default signup;
