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
import Toast from "react-native-toast-message";
import useAuthStore from "../../store/authStore";
import { ActivityIndicator } from "react-native-paper";

const index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    // Implement login logic here
    const result = await login(email, password);

    if(!result.success){
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: result.message || 'An error occurred during login',
        position: 'top',
        visibilityTime: 4000,
      });
    }
    else{
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Logged in successfully',
        position: 'top',
        visibilityTime: 3000,
      })
    }

    // On successful login, you might want to navigate to the main app screen
    if(result.success){
      router.replace('/(tabs)'); // Home screen after login
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center items-center bg-primary/10">
        <Image
          source={require("../../assets/images/Bookshop-bro.png")}
          className="max-h-52 max-w-52 mb-4"
        />
        <View className="w-11/12 bg-cardBackground p-4 rounded-md shadow-md">
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
          {/* Login Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-3"
            onPress={handleLogin}
          >
            {
              isLoading ? (
                <ActivityIndicator animating={true} size="small" color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Log In
                </Text>
              )
            }
          </TouchableOpacity>
          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600">Don&apos;t have an account? </Text>
            <Link href="/(auth)/signup">
              <Text className="text-primary font-semibold">Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default index;
