import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import api from "../../services/api";

const forgotPassword = () => {
  const [phonePress, setPhonePress] = useState(false);
  const [emailPress, setEmailPress] = useState(true);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleContinue = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/forgot-password/email", {
        identifier: email.trim(),
      });
      router.push({
        pathname: "/(auth)/verifyPassword",
        params: { identifier: email.trim() },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Request Failed",
        text2:
          error.response?.data?.message ||
          error.message ||
          "An error occurred. Please try again.",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
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
                Forgot Password
              </Text>
              <Text className="text-start font-light text-gray-500 mb-6">
                Select which contact details should we use
                {"\n"}
                to reset your password.
              </Text>
            </View>
            {/* Phone option — visual placeholder, not functional yet */}
            <TouchableOpacity
              onPress={() => {
                setPhonePress(true);
                setEmailPress(false);
              }}
              className={`flex-row items-center border ${
                phonePress ? "border-secondary" : "border-gray-300"
              } rounded-lg p-4 mb-4`}
            >
              <View className="w-16 h-16 justify-center items-center rounded-full bg-secondary/20">
                <Ionicons name="call" size={24} color="#7F56D9" />
              </View>
              <View className="ml-4 flex flex-col">
                <Text className="text-gray-400 font-semibold">
                  Via Phone:{" "}
                </Text>
                <Text className="text-gray-700 text-lg font-semibold">
                  +1 *** *** 1234
                </Text>
              </View>
            </TouchableOpacity>

            {/* Email option — active by default */}
            <TouchableOpacity
              onPress={() => {
                setEmailPress(true);
                setPhonePress(false);
              }}
              className={`flex-row items-center border ${
                emailPress ? "border-secondary" : "border-gray-300"
              } rounded-lg p-4`}
            >
              <View className="w-16 h-16 justify-center items-center rounded-full bg-secondary/20">
                <Ionicons name="mail" size={24} color="#7F56D9" />
              </View>
              <View className="ml-4 flex flex-col text-gray-700">
                <Text className="text-gray-400 font-semibold">
                  Via Email:{" "}
                </Text>
                <Text className="text-gray-700 text-lg font-semibold">
                  Enter your email address
                </Text>
              </View>
            </TouchableOpacity>

            {/* Email input shown when email option is selected */}
            {emailPress && (
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mt-4 text-gray-900 text-base"
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            )}

            {/* Continue Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4 mt-8"
              onPress={handleContinue}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator
                  animating={true}
                  size="small"
                  color="white"
                />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Continue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default forgotPassword;
