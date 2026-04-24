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
import { useSignIn } from "@clerk/clerk-expo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const handleContinue = async () => {
    if (!isLoaded) return;

    const identifier = email.trim().toLowerCase();
    if (!identifier) {
      Toast.show({ type: "error", text1: "Required", text2: "Please enter your email address", position: "top", visibilityTime: 3000 });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(identifier)) {
      Toast.show({ type: "error", text1: "Invalid Email", text2: "Please enter a valid email address", position: "top", visibilityTime: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier });
      Toast.show({ type: "success", text1: "Code Sent", text2: "A 6-digit code has been sent to your email", position: "top", visibilityTime: 3000 });
      router.push({ pathname: "/(auth)/verifyPassword", params: { identifier } });
    } catch (err) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Could not send reset code. Please try again.";
      Toast.show({ type: "error", text1: "Failed to Send Code", text2: message, position: "top", visibilityTime: 4000 });
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
              Enter your email address and we'll send you{"\n"}
              a code to reset your password.
            </Text>

            {/* Email Option */}
            <View className="flex-row items-center border border-secondary rounded-lg p-4 mb-8">
              <View className="w-16 h-16 justify-center items-center rounded-full bg-secondary/20">
                <Ionicons name="mail" size={24} color="#7F56D9" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-400 font-semibold">Via Email</Text>
                <TextInput
                  className="text-gray-700 text-base font-semibold mt-1 border-b border-gray-300 py-1"
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4 mt-2"
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