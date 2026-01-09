import { useRouter } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";

const successReset = () => {
  const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center px-4">
      <View className="items-center my-28">
        <View className="border-8 border-secondary/10 rounded-full">
          <Image
            source={require("../../assets/images/verify.png")}
            className="w-44 h-44"
            resizeMode="contain"
          />
        </View>
        <View className="px-4 mt-8">
          <Text className="text-3xl font-semibold text-center mb-2">
            Success!
          </Text>
          <Text className="text-center text-gray-600">
            You password has been changed. Please {"\n"} log in again with a new
            password.
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="mt-28 bg-secondary rounded-lg py-4 w-full items-center"
        onPress={() => router.push("/(auth)")}
      >
        <Text className="text-white text-lg font-semibold">Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default successReset;
