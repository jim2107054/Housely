import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import useAuthStore from "../../store/authStore";
import { ArrowLeft } from "lucide-react-native";

// Extraction to fix input issues and simplify render
const PasswordInput = ({ label, value, onChangeText, placeholder, showPassword, onToggleShow }) => (
  <View className="mb-4">
    <Text className="text-lg font-bold text-start text-gray-800 mb-1">
      {label}
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
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
        onPress={onToggleShow}
      >
        <Ionicons
          name={!showPassword ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#888"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, login } = useAuthStore();
  const router = useRouter();

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "All fields are required" });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Passwords do not match" });
      return;
    }
    
    // Success simulation for now based on user's manual link
    Toast.show({ type: "success", text1: "Success!", text2: "Password changed successfully" });
    router.replace("/(auth)/successReset");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white">
        <View className="flex-1 py-6 px-4">
          <TouchableOpacity className="mb-6 p-2" onPress={() => router.back()}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          
          <View className="my-8">
            <Text className="text-start text-2xl font-semibold text-gray-900 mb-2">
              Create New Password
            </Text>
            <Text className="text-start font-light text-gray-500 mb-6">
              Please enter a new password to change
            </Text>

            <PasswordInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
            />

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              className="bg-[#7B61FF] rounded-lg py-4 mt-8"
              onPress={handleChangePassword}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator animating={true} size="small" color="white" />
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

export default ChangePassword;
