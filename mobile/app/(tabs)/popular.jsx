import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import SVG icons
import LocationIcon from "../../assets/images/home-icons/Location.svg";

// Sample data for popular properties
const popularProperties = [
  {
    id: "1",
    name: "Takatea Homestay",
    location: "Jl. Tentara Pelajar No.47, RW.001",
    price: 120,
    priceType: "night",
    rating: 4.5,
    image: require("../../assets/images/popular/Rectangle 11.png"),
    isFavorite: false,
  },
  {
    id: "2",
    name: "Maharani Villa Yogyakarta",
    location: "Benhil, Jl. Bendungan Hilir Karet...",
    price: 320,
    priceType: "month",
    rating: 4.5,
    image: require("../../assets/images/popular/Rectangle 12.png"),
    isFavorite: true,
  },
  {
    id: "3",
    name: "Bali Komang Guest",
    location: "Nusa Penida, Bali",
    price: 180,
    priceType: "night",
    rating: 4.5,
    image: require("../../assets/images/popular/Rectangle 13.png"),
    isFavorite: false,
  },
  {
    id: "4",
    name: "Batavia Apartments",
    location: "Benhil, Jl. Bendungan Hilir Karet...",
    price: 120,
    priceType: "night",
    rating: 4.5,
    image: require("../../assets/images/popular/Rectangle 14.png"),
    isFavorite: false,
  },
  {
    id: "5",
    name: "Manhattan Hotel",
    location: "Jl. Prof. DR. Satrio No.Kav.19-24, RT.7/...",
    price: 230,
    priceType: "night",
    rating: 4.5,
    image: require("../../assets/images/popular/Rectangle 15.png"),
    isFavorite: true,
  },
];

const Popular = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState(["2", "5"]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

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
        Popular
      </Text>
    </View>
  );

  // Popular Card Component
  const PopularCard = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center py-3 mx-5 border-b border-border"
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <Image
        source={item.image}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-textPrimary font-poppins-semibold text-base" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <View className="w-4 h-4 rounded-full bg-primary items-center justify-center">
            <LocationIcon width={8} height={8} />
          </View>
          <Text className="text-textSecondary font-poppins text-xs ml-1 flex-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Text className="text-textPrimary font-poppins-semibold text-sm">
            ${item.price}/{item.priceType}
          </Text>
          <View className="flex-row items-center ml-4">
            <Ionicons name="star" size={14} color="#FFC42D" />
            <Text className="text-textPrimary font-poppins-medium text-sm ml-1">
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(item.id);
        }}
        className="p-2"
      >
        <Ionicons
          name={favorites.includes(item.id) ? "heart" : "heart-outline"}
          size={22}
          color={favorites.includes(item.id) ? "#FF6B6B" : "#DADADA"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {popularProperties.map((item) => (
          <PopularCard key={item.id} item={item} />
        ))}
        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Popular;
