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

// Import data (structured like backend API response)
import api from "../../services/api";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";



const Favorite = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/houses/favorites');
        const transformedFavorites = response.data.houses.map(h => ({
          ...h,
          name: h.name,
          location: `${h.area}, ${h.city}`,
          price: h.listingType === 'RENT' ? h.rentPerMonth : h.salePrice,
          priceType: h.listingType === 'RENT' ? 'month' : 'total',
          image: h.images?.[0]?.url || 'https://via.placeholder.com/150',
          rating: h.rating || 4.5,
          isFavorite: true,
        }));
        setFavorites(transformedFavorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (id) => {
    try {
      const response = await api.post(`/api/houses/${id}/favorite`);
      if (!response.data.isFavorite) {
        // If removed, filter out from local state
        setFavorites(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
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
              name="heart"
              size={22}
              color="#FF6B6B"
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
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6C5CE7" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {favorites.length > 0 ? (
            favorites.map((item) => (
              <FavoriteCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState />
          )}
          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>
      )}
    </View>
  );
};

export default Favorite;