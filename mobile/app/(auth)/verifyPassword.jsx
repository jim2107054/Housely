import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import useAuthStore from "../../store/authStore";

const verifyPassword = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const router = useRouter();
  const inputRefs = useRef([]);

  // Timer for resend code
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter the 4-digit code",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement OTP verification API call
      // const response = await verifyOTP(otpCode);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Email verified successfully",
        position: "top",
        visibilityTime: 3000,
      });

      // Navigate to reset password screen
      router.push("/(auth)/resetPassword");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.message || "Invalid verification code",
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
      // TODO: Implement resend OTP API call
      // await resendOTP();

      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "A new code has been sent to your email",
        position: "top",
        visibilityTime: 3000,
      });

      setResendTimer(60);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend code",
        position: "top",
        visibilityTime: 3000,
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
      <View className="flex-1 bg-white">
        <View className="w-full h-full py-6 px-4">
          <TouchableOpacity className="mb-6">
            <ArrowLeft size={24} color="black" onPress={() => router.back()} />
          </TouchableOpacity>

          <View className="my-8">
            <Text className="text-start text-2xl font-semibold text-gray-900 mb-2">
              Verify your Email
            </Text>
            <Text className="text-start font-light text-gray-500 mb-6">
              Please enter 6 digit verification code that have been
              {"\n"}
              sent to your email address
            </Text>

            {/* OTP Input Fields */}
            <View className="flex-row justify-between mb-6">
              {otp.map((digit, index) => (
                <View
                  key={index}
                  className="w-16 h-16 border-2 border-gray-800 rounded-xl justify-center items-center bg-white"
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
            <View className="flex flex-col items-center justify-center mb-8">
              <Text className="text-gray-500 text-lg">
                Don&apos;t receive code?{" "}
              </Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendTimer > 0}
              >
                <Text
                  className="font-semibold"
                  style={{ color: resendTimer > 0 ? "#eb3859" : "#7F56D9" }}
                >
                  Resend Code
                  <Text>{resendTimer > 0 && `(${resendTimer}s)`}</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4"
              // onPress={handleVerify}
              onPress={() => router.push("/(auth)/changePassword")}
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

export default verifyPassword;
