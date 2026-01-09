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
import { ArrowLeft } from "lucide-react-native";

const index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);

  const { isLoading, login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    // Implement login logic here
    const result = await login(email, password);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: result.message || "An error occurred during login",
        position: "top",
        visibilityTime: 4000,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Logged in successfully",
        position: "top",
        visibilityTime: 3000,
      });
    }

    // On successful login, you might want to navigate to the main app screen
    if (result.success) {
      router.replace("/(tabs)"); // Home screen after login
    }
  };

  const RememberMeHandler = () => {
    // Implement Remember Me functionality here
    setIsRemembered(!isRemembered);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 bg-cardBackground justify-center items-center">
        <View className="w-full h-full py-6 px-4">
          <TouchableOpacity className="mb-6">
            <ArrowLeft size={24} color="black" onPress={() => router.back()} />
          </TouchableOpacity>
          <View>
            <Text className="text-start text-3xl font-bold text-gray-900 mb-2">
              Welcome Back !
            </Text>
            <Text className="text-start font-semibold text-gray-500 mb-6">
              Sign in with your email and password {"\n"}
              or social media to continue
            </Text>
          </View>
          {/* Email Input Field */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-start text-gray-800 mb-1">
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
            <Text className="text-lg font-bold text-start text-gray-800 mb-1">
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
          {/*Remember me & Forgot Password */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={RememberMeHandler}
            >
              <Ionicons
                name={isRemembered ? "checkbox" : "square-outline"}
                size={20}
                color={isRemembered ? "#4F46E5" : "secondary"}
                className="mr-2"
              />
              <Text className="text-gray-700 font-semibold">Remember me</Text>
            </TouchableOpacity>
            <Link href="/(auth)/successReset">
              <Text className="text-secondary">Forgot Password?</Text>
            </Link>
          </View>
          {/* Login Button */}
          <TouchableOpacity
            className="bg-secondary rounded-lg py-4"
            onPress={handleLogin}
          >
            {isLoading ? (
              <ActivityIndicator animating={true} size="small" color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>
          {/* FaceBook or Google Login */}
          <View className="mt-6 flex-col justify-center items-center">
            <View className="flex-row items-center mx-2">
              <View className="h-px bg-gray-300 flex-1" />
              <Text className="mx-2 text-lg text-gray-400">or</Text>
              <View className="h-px bg-gray-300 flex-1" />
            </View>
            {/* social media login buttons */}
            <View className="flex-row my-6 gap-5 justify-center items-center">
              <TouchableOpacity className="mx-2 bg-gray-500/10 p-3 rounded-full">
                <Image
                  source={require("../../assets/images/facebook.png")}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity className="mx-2 bg-gray-500/10 p-3 rounded-full">
                <Image
                  source={require("../../assets/images/google.png")}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Sign Up Link */}
          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600 text-lg">
              Don&apos;t have an account?{" "}
            </Text>
            <Link href="/(auth)/signup">
              <Text className="text-secondary text-lg font-semibold">
                Sign Up
              </Text>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default index;
