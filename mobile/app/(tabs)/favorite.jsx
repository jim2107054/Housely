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

// Import data
import { allProperties } from "../../data/properties";

const Favorite = () => {
  const router = useRouter();
  // IDs of favorited properties
  const [favoriteIds, setFavoriteIds] = useState(["1", "2", "4"]);

  // Filter to show only favorited properties
  const favoriteProperties = allProperties.filter(prop => favoriteIds.includes(prop.id));

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) =>
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
        Favorite
      </Text>
    </View>
  );

  // Favorite Card Component - Similar to Popular card but with larger image
  const FavoriteCard = ({ item }) => (
    <TouchableOpacity 
      className="flex-row bg-white rounded-2xl p-3 mb-3 mx-5 border border-border"
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-24 h-24 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <View className="flex-row items-start justify-between">
          <Text className="text-textPrimary font-poppins-bold text-sm flex-1 pr-2" numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <Ionicons
              name={favoriteIds.includes(item.id) ? "heart" : "heart-outline"}
              size={22}
              color={favoriteIds.includes(item.id) ? "#FF6B6B" : "#DADADA"}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <LocationIcon width={10} height={10} />
          <Text className="text-textSecondary font-poppins text-xs ml-1 flex-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-primary font-poppins-bold text-sm">
            ${item.price}<Text className="text-textSecondary font-poppins text-xs">/{item.priceType}</Text>
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FFC42D" />
            <Text className="text-textPrimary font-poppins-bold text-xs ml-1">
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty State Component
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="heart-outline" size={64} color="#DADADA" />
      <Text className="text-textSecondary font-poppins-semibold text-lg mt-4">
        No favorites yet
      </Text>
      <Text className="text-textSecondary font-poppins text-sm mt-2 text-center px-10">
        Start adding properties to your favorites by tapping the heart icon
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false}>
        {favoriteProperties.length > 0 ? (
          favoriteProperties.map((item) => (
            <FavoriteCard key={item.id} item={item} />
          ))
        ) : (
          <EmptyState />
        )}
        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Favorite;