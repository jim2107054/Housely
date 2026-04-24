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
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { ArrowLeft } from "lucide-react-native";
import { useSignIn } from "@clerk/clerk-expo";

const VerifyPassword = () => {
  const { identifier } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const { signIn, setActive, isLoaded } = useSignIn();
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
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Toast.show({ type: "error", text1: "Incomplete Code", text2: "Please enter the full 6-digit code", position: "top", visibilityTime: 3000 });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Toast.show({ type: "error", text1: "Weak Password", text2: "New password must be at least 8 characters", position: "top", visibilityTime: 3000 });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords Don't Match", text2: "Both passwords must be the same", position: "top", visibilityTime: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: otpCode,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Toast.show({ type: "success", text1: "Password Reset!", text2: "Your password has been reset successfully", position: "top", visibilityTime: 2000 });
        setTimeout(() => router.replace("/(tabs)"), 500);
      }
    } catch (err) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid or expired code. Try again.";
      Toast.show({ type: "error", text1: "Reset Failed", text2: message, position: "top", visibilityTime: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || resendTimer > 0) return;
    setIsLoading(true);
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier });
      Toast.show({ type: "success", text1: "Code Sent", text2: "A new code has been sent to your email", position: "top", visibilityTime: 3000 });
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
    } catch {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to resend code. Try again.", position: "top", visibilityTime: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const maskedEmail = identifier
    ? String(identifier).replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))
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

          <View className="my-4">
            <Text className="text-start text-2xl font-semibold text-gray-900 mb-2">
              Reset Password
            </Text>
            <Text className="text-start font-light text-gray-500 mb-6">
              Enter the 6-digit code sent to{"\n"}
              <Text className="font-semibold text-gray-700">{maskedEmail}</Text>
              {"\n"}and choose a new password.
            </Text>

            {/* OTP Input Fields */}
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
            <View className="flex-row items-center justify-center mb-6">
              <Text className="text-gray-500 text-lg">Don&apos;t receive code? </Text>
              <TouchableOpacity onPress={handleResendCode} disabled={resendTimer > 0 || isLoading}>
                <Text className="font-semibold" style={{ color: resendTimer > 0 ? "#eb3859" : "#7F56D9" }}>
                  Resend Code{resendTimer > 0 && ` (${resendTimer}s)`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-1">New Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10" pointerEvents="none">
                  <Ionicons name="lock-closed-outline" size={20} color="#888" />
                </View>
                <TextInput
                  className="pl-10 pr-10 border border-gray-300 rounded-md py-4 px-3 text-gray-900"
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity className="absolute right-3 top-1/2 -translate-y-1/2 z-10" onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={!showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-1">Confirm Password</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10" pointerEvents="none">
                  <Ionicons name="lock-closed-outline" size={20} color="#888" />
                </View>
                <TextInput
                  className="pl-10 border border-gray-300 rounded-md py-4 px-3 text-gray-900"
                  placeholder="Confirm new password"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            {/* Reset Button */}
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
                  Reset Password
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