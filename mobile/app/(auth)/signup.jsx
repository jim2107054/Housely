import { useState, useRef } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import { useSignUp } from "@clerk/clerk-expo";
import useAuthStore from "../../store/authStore";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // email verification step
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const { signUp, setActive, isLoaded } = useSignUp();
  const { syncWithBackend } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role || "USER";

  const handleRegister = async () => {
    if (!isLoaded) return;

    if (!userName || !email || !password) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please fill in all fields", position: "top", visibilityTime: 3000 });
      return;
    }
    if (userName.length < 3) {
      Toast.show({ type: "error", text1: "Invalid Username", text2: "Username must be at least 3 characters", position: "top", visibilityTime: 3000 });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: "error", text1: "Invalid Email", text2: "Please enter a valid email address", position: "top", visibilityTime: 3000 });
      return;
    }
    if (password.length < 8) {
      Toast.show({ type: "error", text1: "Weak Password", text2: "Password must be at least 8 characters", position: "top", visibilityTime: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
        username: userName.trim(),
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      Toast.show({ type: "success", text1: "Code Sent", text2: "Check your email for a verification code", position: "top", visibilityTime: 3000 });
    } catch (err) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Registration failed. Please try again.";
      Toast.show({ type: "error", text1: "Registration Failed", text2: message, position: "top", visibilityTime: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      Toast.show({ type: "error", text1: "Incomplete Code", text2: "Enter the 6-digit code from your email", position: "top", visibilityTime: 3000 });
      return;
    }
    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otpCode });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await syncWithBackend({ username: userName.trim(), role });
        Toast.show({ type: "success", text1: "Account Created!", text2: "Welcome to Housely", position: "top", visibilityTime: 2000 });
        setTimeout(() => {
          router.replace(role === "AGENT" ? "/(owner)" : "/(tabs)");
        }, 500);
      }
    } catch (err) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Verification failed. Please try again.";
      Toast.show({ type: "error", text1: "Verification Failed", text2: message, position: "top", visibilityTime: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const RememberMeHandler = () => setIsRemembered(!isRemembered);

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 bg-cardBackground justify-center items-center px-6">
          <TouchableOpacity className="self-start mb-6" onPress={() => setPendingVerification(false)}>
            <ArrowLeft size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Verify Email</Text>
          <Text className="text-gray-500 mb-8 text-center">Enter the 6-digit code sent to {email}</Text>
          <View className="flex-row gap-2 mb-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-14 border border-gray-300 rounded-lg text-center text-xl font-bold text-gray-900"
                maxLength={1}
                keyboardType="number-pad"
                value={digit}
                onChangeText={(v) => handleCodeChange(v, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>
          <TouchableOpacity className="bg-secondary rounded-lg py-4 w-full" onPress={handleVerify}>
            {isLoading ? (
              <ActivityIndicator animating={true} size="small" color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">Verify & Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

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
              Register Account
            </Text>
            <Text className="text-start font-light text-gray-500 mb-6">
              Sign up as {role === "AGENT" ? "House Owner" : "User"} with your{"\n"}
              email and password to continue
            </Text>
          </View>
          {/* UserName Input Field */}
          <View className="mb-4">
            <Text className="text-lg font-bold text-start text-gray-800 mb-1">
              User Name
            </Text>
            <View className="relative">
              <View
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                pointerEvents="none"
              >
                <Ionicons name="person-outline" size={20} color="#888" />
              </View>
              <TextInput
                className="pl-10 border border-gray-300 rounded-md py-4 px-3 text-gray-700"
                placeholder="username"
                autoCapitalize="none"
                value={userName}
                onChangeText={setUserName}
              />
            </View>
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
                placeholder="email"
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
                placeholder="password"
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
          {/*Privacy policy*/}
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
              <Text className="text-gray-700 text-lg">
                Agree with{" "}
                <Text className="text-black font-semibold">terms</Text> and{" "}
                <Text className="text-black font-semibold">privacy</Text>
              </Text>
            </TouchableOpacity>
          </View>
          {/* Register Button */}
          <TouchableOpacity
            className="bg-secondary rounded-lg py-4"
            onPress={handleRegister}
          >
            {isLoading ? (
              <ActivityIndicator animating={true} size="small" color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
          {/* FaceBook or Google Login */}
          <View className="mt-4 flex-col justify-center items-center">
            <View className="flex-row items-center mx-2">
              <View className="h-px bg-gray-300 flex-1" />
              <Text className="mx-2 text-lg text-gray-400">or</Text>
              <View className="h-px bg-gray-300 flex-1" />
            </View>
            {/* social media login buttons */}
            <View className="flex-row my-4 gap-5 justify-center items-center">
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
          {/* Sign In Link */}
          <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600 text-lg">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push({ pathname: "/(auth)", params: { role } })}>
              <Text className="text-secondary text-lg font-semibold">
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Signup;