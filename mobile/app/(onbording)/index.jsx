import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "react-native";

const index = () => {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={() => router.push("/(auth)")}
        className="absolute border border-gray-300 top-12 right-6 z-10 rounded-full px-5 py-2"
      >
        <Text className="text-gray-500">Skip</Text>
      </TouchableOpacity>
      <View className="my-16">
        <Image source={require("../../assets/images/o1.png")} />
      </View>
      <View className="px-4 mb-16">
        <Text className="text-3xl text-center mb-2">
          Find the <Text className="font-bold">perfect place</Text> {"\n"} for
          your future house
        </Text>
        <Text className="text-center text-gray-600 px-8">
          find the best place for your dream house with your family and loved
          ones
        </Text>
      </View>
      <View className="mb-6 flex flex-row gap-2">
        <View className="h-3 w-8 bg-secondary rounded-full self-center"></View>
        <View className="h-3 w-3 bg-gray-300 rounded-full self-center"></View>
        <View className="h-3 w-3 bg-gray-300 rounded-full self-center"></View>
      </View>

      <TouchableOpacity
        className="bg-secondary mx-6 px-6 py-4 w-11/12 rounded-md items-center"
        onPress={() => router.push("/(onbording)/onBoarding1")}
      >
        <Text className="text-white text-lg font-semibold">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default index;
