import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";

const onBoarding2 = () => {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center">
      <View className="my-16">
        <Image source={require("../../assets/images/o3.png")} />
      </View>
      <View className="px-4 mb-20">
        <Text className="text-3xl text-center mb-2">
          find your <Text className="font-bold">dream home</Text> {"\n"} for
          with us
        </Text>
        <Text className="text-center text-gray-600 px-8">
          Just search and select your favorite property you want to locate
        </Text>
      </View>

      <View className="mb-6 flex flex-row gap-2">
        <View className="h-3 w-3 bg-gray-300 rounded-full self-center"></View>
        <View className="h-3 w-3 bg-gray-300 rounded-full self-center"></View>
        <View className="h-3 w-8 bg-secondary rounded-full self-center"></View>
      </View>

      <TouchableOpacity
        className="bg-secondary mx-6 px-6 py-4 w-11/12 rounded-md items-center"
        onPress={() => router.push("/(auth)")}
      >
        <Text className="text-white text-lg font-semibold">Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default onBoarding2;
