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
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import { useSignIn } from "@clerk/clerk-expo";
import useAuthStore from "../../store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP / second-factor state
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [secondFactorStrategy, setSecondFactorStrategy] = useState("email_code");

  const { signIn, setActive, isLoaded } = useSignIn();
  const { syncWithBackend, setLoading } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role || "USER";

  const timeout = (ms) =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Check your network.")), ms)
    );

  const finishSignIn = async (result) => {
    setLoading(true); // prevent _layout.jsx from running parameterless sync
    await setActive({ session: result.createdSessionId });
    await syncWithBackend({ role });
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: "Logged in successfully",
      position: "top",
      visibilityTime: 2000,
    });
    // Navigation is handled automatically by the _layout.jsx guard
    // which checks user.role after syncWithBackend sets the user in the store.
  };

  const handleLogin = async () => {
    if (!isLoaded) {
      Toast.show({ type: "info", text1: "Please wait", text2: "Authentication is loading.", position: "top", visibilityTime: 2000 });
      return;
    }
    if (!email || !password) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter both email and password", position: "top", visibilityTime: 3000 });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: "error", text1: "Invalid Email", text2: "Please enter a valid email address", position: "top", visibilityTime: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      // Single-step: explicitly use password strategy to avoid Clerk picking email_code
      const result = await Promise.race([
        signIn.create({
          strategy: "password",
          identifier: email.trim().toLowerCase(),
          password,
        }),
        timeout(15000),
      ]);

      if (result.status === "complete") {
        await finishSignIn(result);
      } else if (result.status === "needs_second_factor") {
        // Clerk requires a verification code — determine which strategy and send it
        const sf = result.supportedSecondFactors?.[0]?.strategy ?? "email_code";
        setSecondFactorStrategy(sf);
        await signIn.prepareSecondFactor({ strategy: sf });
        setShowOTP(true);
        Toast.show({
          type: "info",
          text1: "Verification Required",
          text2: sf === "phone_code"
            ? "A code was sent to your phone."
            : "A verification code was sent to your email.",
          position: "top",
          visibilityTime: 4000,
        });
      } else if (result.status === "needs_first_factor") {
        // strategy: "password" not accepted as direct — fall back to attemptFirstFactor
        const r2 = await Promise.race([
          signIn.attemptFirstFactor({ strategy: "password", password }),
          timeout(15000),
        ]);
        if (r2.status === "complete") {
          await finishSignIn(r2);
        } else if (r2.status === "needs_second_factor") {
          const sf = r2.supportedSecondFactors?.[0]?.strategy ?? "email_code";
          setSecondFactorStrategy(sf);
          await signIn.prepareSecondFactor({ strategy: sf });
          setShowOTP(true);
          Toast.show({
            type: "info",
            text1: "Verification Required",
            text2: "A verification code was sent to your email.",
            position: "top",
            visibilityTime: 4000,
          });
        }
      }
    } catch (err) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Login failed. Please check your credentials.";
      Toast.show({ type: "error", text1: "Login Failed", text2: message, position: "top", visibilityTime: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (!otpCode.trim()) {
      Toast.show({ type: "error", text1: "Enter Code", text2: "Please enter the verification code.", position: "top", visibilityTime: 3000 });
      return;
    }
    setIsLoading(true);
    try {
      const result = await Promise.race([
        signIn.attemptSecondFactor({ strategy: secondFactorStrategy, code: otpCode.trim() }),
        timeout(15000),
      ]);
      if (result.status === "complete") {
        await finishSignIn(result);
      } else {
        Toast.show({ type: "error", text1: "Verification Failed", text2: "Invalid or expired code. Try again.", position: "top", visibilityTime: 4000 });
      }
    } catch (err) {
      const message =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "Verification failed. Please try again.";
      Toast.show({ type: "error", text1: "Error", text2: message, position: "top", visibilityTime: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const RememberMeHandler = () => {
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
            <ArrowLeft size={24} color="black" onPress={() => router.push("/(auth)/roleSelection")} />
          </TouchableOpacity>

          {showOTP ? (
            /* ── OTP Verification Screen ── */
            <View>
              <Text className="text-start text-3xl font-bold text-gray-900 mb-2">
                Verify your account
              </Text>
              <Text className="text-start font-semibold text-gray-500 mb-6">
                Enter the verification code sent to{"\n"}
                <Text className="text-gray-800">{email}</Text>
              </Text>
              <View className="mb-6">
                <Text className="text-lg font-bold text-start text-gray-800 mb-1">
                  Verification Code
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-md py-4 px-3 text-gray-900 text-center text-2xl tracking-widest"
                  placeholder="Enter code"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>
              <TouchableOpacity
                className="bg-secondary rounded-lg py-4 mb-4"
                onPress={handleOTPVerify}
              >
                {isLoading ? (
                  <ActivityIndicator animating={true} size="small" color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">
                    Verify
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowOTP(false); setOtpCode(""); }}>
                <Text className="text-secondary text-center font-semibold">
                  ← Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Login Form ── */
            <View>
              <Text className="text-start text-3xl font-bold text-gray-900 mb-2">
                Welcome Back !
              </Text>
              <Text className="text-start font-semibold text-gray-500 mb-6">
                Sign in as {role === "AGENT" ? "House Owner" : "User"} with your{"\n"}
                email and password to continue
              </Text>
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
              {/* Remember me & Forgot Password */}
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
                <Link href="/(auth)/forgotPassword">
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
              {/* Social Login */}
              <View className="mt-6 flex-col justify-center items-center">
                <View className="flex-row items-center mx-2">
                  <View className="h-px bg-gray-300 flex-1" />
                  <Text className="mx-2 text-lg text-gray-400">or</Text>
                  <View className="h-px bg-gray-300 flex-1" />
                </View>
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
                <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)/signup", params: { role } })}>
                  <Text className="text-secondary text-lg font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
