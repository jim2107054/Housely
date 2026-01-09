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

const forgotPassword = () => {
  const hasPhone = true; // Set to true if using phone number for reset
  const hasEmail = true; // Set to true if using email for reset
  const [phonePress, setPhonePress] = useState(false);
  const [emailPress, setEmailPress] = useState(false);

  const { isLoading, login } = useAuthStore();
  const router = useRouter();

  // const handleChangePassword = async () => {
  //   // Implement change password logic here
  //   const result = await login(newPassword, confirmPassword);

  //   if (!result.success) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Change Password Failed",
  //       text2: result.message || "An error occurred during password change",
  //       position: "top",
  //       visibilityTime: 4000,
  //     });
  //   } else {
  //     Toast.show({
  //       type: "success",
  //       text1: "Success!",
  //       text2: "Logged in successfully",
  //       position: "top",
  //       visibilityTime: 3000,
  //     });
  //   }

  //   // On successful login, you might want to navigate to the main app screen
  //   if (result.success) {
  //     router.replace("/(auth)/successReset"); // go to success screen after password change
  //   }
  // };

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
            {/* Options for resetting password */}
            {hasPhone && (
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
            )}
            {hasEmail && (
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
                    mu***@gmail.com
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {/* Continue Button */}
            <TouchableOpacity
              className="bg-secondary rounded-lg py-4 mt-8"
              //! onPress={handleChangePassword}
              onPress={() => router.push("/(auth)/verifyPassword")}
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
