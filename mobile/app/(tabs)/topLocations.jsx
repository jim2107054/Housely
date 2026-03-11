import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Sample data for top locations
const topLocationsData = [
  {
    id: "1",
    name: "Malang",
    properties: 124,
    image: require("../../assets/images/home-icons/Rectangle 14.png"),
  },
  {
    id: "2",
    name: "Bali",
    properties: 256,
    image: require("../../assets/images/home-icons/Rectangle 15.png"),
  },
  {
    id: "3",
    name: "Yogyakarta",
    properties: 189,
    image: require("../../assets/images/home-icons/Rectangle 16.png"),
  },
  {
    id: "4",
    name: "Jakarta",
    properties: 312,
    image: require("../../assets/images/home-icons/Rectangle 14.png"),
  },
  {
    id: "5",
    name: "Surabaya",
    properties: 145,
    image: require("../../assets/images/home-icons/Rectangle 15.png"),
  },
  {
    id: "6",
    name: "Bandung",
    properties: 178,
    image: require("../../assets/images/home-icons/Rectangle 16.png"),
  },
];

const TopLocations = () => {
  const router = useRouter();

  // Header Component
  const Header = () => (
    <View className="flex-row items-center px-5 py-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={24} color="#252B5C" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-lg font-poppins-semibold text-textPrimary mr-10">
        Top Locations
      </Text>
    </View>
  );

  // Location Card Component
  const LocationCard = ({ item }) => (
    <TouchableOpacity 
      className="mb-4 mx-5 rounded-xl overflow-hidden"
      onPress={() => console.log(`Selected location: ${item.name}`)}
    >
      <View className="relative h-32">
        <Image
          source={item.image}
          className="w-full h-full rounded-xl"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30 rounded-xl" />
        <View className="absolute bottom-3 left-3">
          <Text className="text-white font-poppins-bold text-lg">
            {item.name}
          </Text>
          <Text className="text-white/80 font-poppins text-sm">
            {item.properties} Properties
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {topLocationsData.map((item) => (
          <LocationCard key={item.id} item={item} />
        ))}
        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default TopLocations;
