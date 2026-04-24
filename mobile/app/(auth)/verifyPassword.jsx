import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { ArrowLeft } from "lucide-react-native";
import api from "../../services/api";

const VerifyPassword = () => {
  const { identifier, method } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const router = useRouter();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Incomplete Code",
        text2: "Please enter the full 6-digit code",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/verify-otp", {
        identifier,
        otp: otpCode,
      });

      const resetToken = response.data.resetToken;

      Toast.show({
        type: "success",
        text1: "Verified!",
        text2: "OTP verified successfully",
        position: "top",
        visibilityTime: 2000,
      });

      router.push({
        pathname: "/(auth)/changePassword",
        params: { identifier, resetToken },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2:
          error.response?.data?.message || "Invalid or expired OTP. Try again.",
        position: "top",
        visibilityTime: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      if (method === "phone") {
        await api.post("/api/auth/forgot-password/phone", {
          phoneNumber: identifier,
        });
      } else {
        await api.post("/api/auth/forgot-password/email", {
          email: identifier,
        });
      }
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: `A new code has been sent to your ${method || "email"}`,
        position: "top",
        visibilityTime: 3000,
      });
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend code. Try again.",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const maskedIdentifier = identifier
    ? method === "phone"
      ? String(identifier).replace(/(\d{2})\d+(\d{2})$/, "$1****$2")
      : String(identifier).replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))
    : "";

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 bg-white">
        <View className="w-full h-full py-6 px-4">
          <TouchableOpacity className="mb-6">
            <ArrowLeft size={24} color="black" onPress={() => router.back()} />
          </TouchableOpacity>

          <View className="my-8">
            <Text className="text-start text-2xl font-semibold text-gray-900 mb-2">
              Verify your {method === "phone" ? "Phone" : "Email"}
            </Text>
            <Text className="text-start font-light text-gray-500 mb-6">
              Please enter the 6-digit code sent to{"\n"}
              <Text className="font-semibold text-gray-700">
                {maskedIdentifier}
              </Text>
            </Text>

            {/* OTP Input Fields — 6 boxes */}
            <View className="flex-row justify-between mb-6">
              {otp.map((digit, index) => (
                <View
                  key={index}
                  className="w-12 h-14 border-2 rounded-xl justify-center items-center bg-white"
                  style={{ borderColor: digit ? "#7F56D9" : "#E5E7EB" }}
                >
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    className="text-2xl font-semibold text-center text-gray-900 w-full h-full"
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            {/* Resend Code */}
            <View className="flex-col items-center justify-center mb-8">
              <Text className="text-gray-500 text-lg">
                Don&apos;t receive code?{" "}
              </Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendTimer > 0 || isLoading}
              >
                <Text
                  className="font-semibold"
                  style={{ color: resendTimer > 0 ? "#eb3859" : "#7F56D9" }}
                >
                  Resend Code
                  {resendTimer > 0 && ` (${resendTimer}s)`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4"
              onPress={handleVerify}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center text-lg font-semibold">
                  Verify
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyPassword;

