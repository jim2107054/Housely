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
import { ArrowLeft } from "lucide-react-native";
import api from "../../services/api";

const ForgotPassword = () => {
  const [method, setMethod] = useState(null); // null | 'email' | 'phone'
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!method) {
      Toast.show({
        type: "error",
        text1: "Select Recovery Method",
        text2: "Please select Email or Phone to continue",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    const identifier =
      method === "email" ? email.trim().toLowerCase() : phone.trim();

    if (!identifier) {
      Toast.show({
        type: "error",
        text1: "Required",
        text2: `Please enter your ${method === "email" ? "email address" : "phone number"}`,
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (method === "email" && !/\S+@\S+\.\S+/.test(identifier)) {
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      if (method === "email") {
        await api.post("/api/auth/forgot-password/email", { email: identifier });
      } else {
        await api.post("/api/auth/forgot-password/phone", {
          phoneNumber: identifier,
        });
      }

      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: `A 6-digit OTP has been sent to your ${method}`,
        position: "top",
        visibilityTime: 3000,
      });

      router.push({
        pathname: "/(auth)/verifyPassword",
        params: { identifier, method },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Send OTP",
        text2:
          error.response?.data?.message ||
          `Could not send OTP to your ${method}`,
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
            <Text className="text-start text-2xl font-semibold text-gray-900 mb-2">
              Forgot Password
            </Text>
            <Text className="text-start font-light text-gray-500 mb-6">
              Select a recovery method and enter your{"\n"}
              contact details to reset your password.
            </Text>

            {/* Via Email Option */}
            <TouchableOpacity
              onPress={() => setMethod("email")}
              className={`flex-row items-center border ${
                method === "email" ? "border-secondary" : "border-gray-300"
              } rounded-lg p-4 mb-4`}
            >
              <View className="w-16 h-16 justify-center items-center rounded-full bg-secondary/20">
                <Ionicons name="mail" size={24} color="#7F56D9" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 font-semibold">Via Email</Text>
                {method === "email" ? (
                  <TextInput
                    className="text-gray-700 text-base font-semibold mt-1 border-b border-gray-300 py-1"
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    autoFocus
                  />
                ) : (
                  <Text className="text-gray-500 text-sm mt-1">
                    Tap to enter your email
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Via Phone Option */}
            <TouchableOpacity
              onPress={() => setMethod("phone")}
              className={`flex-row items-center border ${
                method === "phone" ? "border-secondary" : "border-gray-300"
              } rounded-lg p-4`}
            >
              <View className="w-16 h-16 justify-center items-center rounded-full bg-secondary/20">
                <Ionicons name="call" size={24} color="#7F56D9" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 font-semibold">Via Phone</Text>
                {method === "phone" ? (
                  <TextInput
                    className="text-gray-700 text-base font-semibold mt-1 border-b border-gray-300 py-1"
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    autoFocus
                  />
                ) : (
                  <Text className="text-gray-500 text-sm mt-1">
                    Tap to enter your phone number
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4 mt-8"
              onPress={handleContinue}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
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

export default ForgotPassword;
