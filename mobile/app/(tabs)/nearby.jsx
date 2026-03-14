import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LocationIcon from "../../assets/images/home-icons/Location.svg";
import api from "../../services/api";



const Nearby = () => {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNearby = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/houses/nearby');
        const transformed = response.data.houses.map(h => ({
          ...h,
          name: h.name,
          location: `${h.area}, ${h.city}`,
          price: h.listingType === 'RENT' ? h.rentPerMonth : h.salePrice,
          image: h.images?.[0]?.url || 'https://via.placeholder.com/150',
          rating: h.rating || 4.5,
          isFavorite: h.favorites?.length > 0,
        }));
        setProperties(transformed);
      } catch (err) {
        console.error('Error fetching nearby properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNearby();
  }, []);

  const toggleFavorite = async (id) => {
    try {
      const response = await api.post(`/api/houses/${id}/favorite`);
      setProperties(prev => prev.map(p => 
        p.id === id ? { ...p, isFavorite: response.data.isFavorite } : p
      ));
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
        Nearby
      </Text>
    </View>
  );

  // Nearby Card Component
  const NearbyCard = ({ item }) => (
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
          name={item.isFavorite ? "heart" : "heart-outline"}
          size={24}
          color={item.isFavorite ? "#FF6B6B" : "#DADADA"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
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
          {properties.map((item) => (
            <NearbyCard key={item.id} item={item} />
          ))}
          {/* Bottom spacing */}
          <View className="h-24" />
        </ScrollView>
      )}
    </View>
  );
};

export default Nearby;
