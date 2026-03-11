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

// Sample data for recommended properties
const recommendedProperties = [
  {
    id: "1",
    name: "Ayana Homestay",
    location: "Imogiri, Yogyakarta",
    price: 310,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Bali Komang Guest",
    location: "Nusa penida, Bali",
    price: 280,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    isFavorite: false,
  },
  {
    id: "3",
    name: "Villa Paradise",
    location: "Seminyak, Bali",
    price: 450,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    isFavorite: false,
  },
  {
    id: "4",
    name: "Sunset Villa",
    location: "Ubud, Bali",
    price: 380,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    isFavorite: false,
  },
  {
    id: "5",
    name: "Ocean View Resort",
    location: "Kuta, Bali",
    price: 520,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=400",
    isFavorite: true,
  },
];

const Recommended = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState(["1", "5"]);

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
        Recommended
      </Text>
    </View>
  );

  // Recommended Card Component
  const RecommendedCard = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center py-3 mx-5 border-b border-border"
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <Text className="text-textPrimary font-poppins-semibold text-base" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <LocationIcon width={12} height={12} />
          <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center mt-2">
          <Text className="text-primary font-poppins-bold text-sm">
            ${item.price}
            <Text className="text-textSecondary font-poppins text-xs">/month</Text>
          </Text>
          <View className="flex-row items-center ml-3">
            <Ionicons name="star" size={14} color="#FFC42D" />
            <Text className="text-textPrimary font-poppins-semibold text-xs ml-1">
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
        className="ml-2"
      >
        <Ionicons
          name={favorites.includes(item.id) ? "heart" : "heart-outline"}
          size={24}
          color={favorites.includes(item.id) ? "#FF6B6B" : "#DADADA"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {recommendedProperties.map((item) => (
          <RecommendedCard key={item.id} item={item} />
        ))}
        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Recommended;
