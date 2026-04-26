import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import LocationIcon from "../../assets/images/home-icons/Location.svg";
import api from "../../services/api";
import useLocationStore from "../../store/locationStore";



const Nearby = () => {
  const router = useRouter();
  const { getCoordinates, locationName, selectedLocation } = useLocationStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNearby = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const coords = getCoordinates();
      const response = await api.get('/api/houses/nearby', {
        params: {
          lat: coords.latitude,
          lng: coords.longitude,
          radius: 20,
        }
      });
      const transformed = (response.data.houses || []).map((h) => ({
        ...h,
        name: h.name,
        location: [h.area, h.city].filter(Boolean).join(', '),
        price: h.listingType === 'RENT' ? h.rentPerMonth : h.salePrice,
        image: h.images?.[0]?.url || 'https://via.placeholder.com/150',
        rating: h.rating || 4.5,
        isFavorite: h.favorites?.length > 0,
      }));
      setProperties(transformed);
    } catch (err) {
      console.error('Error fetching nearby properties:', err);
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCoordinates]);

  useFocusEffect(
    useCallback(() => {
      fetchNearby({ silent: false });
    }, [fetchNearby])
  );

  useEffect(() => {
    fetchNearby({ silent: true });
  }, [selectedLocation, fetchNearby]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNearby({ silent: true });
  };

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
    <View className="px-5 py-4">
      <View className="flex-row items-center">
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

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-textSecondary font-poppins text-xs" numberOfLines={1}>
          Location: {locationName}
        </Text>
        <TouchableOpacity onPress={() => router.push('/(location)')}>
          <Text className="text-primary font-poppins-semibold text-xs">Change</Text>
        </TouchableOpacity>
      </View>
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
            ৳{item.price}
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
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NearbyCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 96 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6C5CE7"]} tintColor="#6C5CE7" />}
          ListEmptyComponent={
            <View style={{ paddingTop: 80, alignItems: 'center' }}>
              <Ionicons name="location-outline" size={48} color="#C9CBD9" />
              <Text style={{ marginTop: 8, color: '#A1A5C1' }}>No nearby houses found for this location.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default Nearby;
