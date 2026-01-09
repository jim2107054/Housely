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

const changePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, login } = useAuthStore();
  const router = useRouter();

  const handleChangePassword = async () => {
    // Implement change password logic here
    const result = await login(newPassword, confirmPassword);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Change Password Failed",
        text2: result.message || "An error occurred during password change",
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
      router.replace("/(auth)/successReset"); // go to success screen after password change
    }
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
          <View className="my-8">
            <View>
              <Text className="text-start text-2xl font-semibold text-gray-900 mb-2">
                Create New Password
              </Text>
              <Text className="text-start font-light text-gray-500 mb-6">
                Please enter a new password
                {"\n"}
                to change
              </Text>
            </View>
            {/* New Password Input Field */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-start text-gray-800 mb-1">
                New Password
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
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
            {/* Confirm Password Input Field */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-start text-gray-800 mb-1">
                Confirm Password
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
                  placeholder="Confirm your password"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
            {/* Change Password Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4 mt-8"
              //! onPress={handleChangePassword}
              onPress={() => router.push("/(auth)/successReset")}
            >
              {/* Need to fix it */}
              {isLoading ? (
                <ActivityIndicator
                  animating={true}
                  size="small"
                  color="white"
                />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Change Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default changePassword;
