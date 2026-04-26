import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import useLocationStore from "../../store/locationStore";
import { getSocket } from "../../services/socketService";

// Import SVG icons
import LocationIcon from "../../assets/images/home-icons/Location.svg";
import NotificationIcon from "../../assets/images/home-icons/Notification.svg";
import ChatIcon from "../../assets/images/home-icons/Chat.svg";
import FilterIcon from "../../assets/images/home-icons/Filter.svg";



import api from "../../services/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.65;

const Home = () => {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [popularFavorites, setPopularFavorites] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Real data states
  const [recommended, setRecommended] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [popular, setPopular] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Location store - for displaying selected location in header
  const { locationName, isLocationSet, loadLocation, getCoordinates, selectedLocation } = useLocationStore();

  const recommendedListRef = useRef(null);
  const recommendedIndexRef = useRef(0);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data?.notificationCount ?? 0);
      setChatUnreadCount(res.data?.chatCount ?? 0);
    } catch {
      setUnreadCount(0);
      setChatUnreadCount(0);
    }
  }, []);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const coords = getCoordinates();

      const [recRes, nearRes, popRes, locRes, favRes] = await Promise.all([
        api.get('/api/houses/recommended'),
        api.get('/api/houses/nearby', {
          params: {
            lat: coords.latitude,
            lng: coords.longitude,
          },
        }),
        api.get('/api/houses/popular'),
        api.get('/api/houses/top-locations'),
        api.get('/api/houses/favorites').catch(() => ({ data: { houses: [] } })),
      ]);

      const transformHouse = (h) => ({
        id: h.id,
        name: h.name,
        location: [h.area, h.city].filter(Boolean).join(', '),
        price: h.listingType === 'RENT' ? h.rentPerMonth : h.salePrice,
        priceType: h.listingType === 'RENT' ? 'month' : 'total',
        rating: h.rating || 4.5,
        image: h.images?.[0]?.url || 'https://via.placeholder.com/300',
        isFavorite: h.isFavorite || false,
      });

      const transformedLocations = (locRes.data.locations || []).map((l, index) => ({
        id: `${l.city}-${index}`,
        name: l.city,
        count: l.count,
        image: { uri: `https://picsum.photos/seed/location-${encodeURIComponent(l.city)}/300/200` },
      }));

      const favIds = (favRes.data.houses || []).map((h) => h.id);
      setFavorites(favIds);
      setPopularFavorites(favIds);

      setRecommended((recRes.data.houses || []).map(transformHouse));
      setNearby((nearRes.data.houses || []).map(transformHouse));
      setPopular((popRes.data.houses || []).map(transformHouse));
      setLocations(transformedLocations);
      if (transformedLocations.length > 0 && !activeLocation) {
        setActiveLocation(transformedLocations[0].id);
      }
    } catch (err) {
      let errorMessage = 'Failed to load homes';
      if (err.request) {
        errorMessage = 'Cannot connect to server';
      } else if (err.response) {
        errorMessage = err.response.data?.message || 'Server error';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getCoordinates, activeLocation]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchData({ silent: false });
    }, [fetchData, fetchUnreadCount])
  );

  useEffect(() => {
    fetchData({ silent: false });
  }, [selectedLocation, fetchData]);

  useEffect(() => {
    if (recommended.length < 2) return;

    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % recommended.length;
      recommendedListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [recommended.length]);

  // Socket listener for real-time unread count
  // Socket is connected from _layout.jsx once role is confirmed; just grab the reference.
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleMessageNew = () => {
      fetchUnreadCount();
    };

    sock.on('message:new', handleMessageNew);

    return () => {
      sock.off('message:new', handleMessageNew);
    };
  }, [fetchUnreadCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData({ silent: true }), fetchUnreadCount()]);
  };

  const toggleFavorite = async (id) => {
    try {
      const response = await api.post(`/api/houses/${id}/favorite`);
      if (response.data.isFavorite) {
        setFavorites((prev) => [...prev, id]);
      } else {
        setFavorites((prev) => prev.filter((fId) => fId !== id));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const togglePopularFavorite = async (id) => {
    try {
      const response = await api.post(`/api/houses/${id}/favorite`);
      if (response.data.isFavorite) {
        setPopularFavorites((prev) => [...prev, id]);
      } else {
        setPopularFavorites((prev) => prev.filter((fId) => fId !== id));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Header Component
  const Header = () => (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
      <TouchableOpacity onPress={() => router.push("/(location)")}>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm text-textSecondary font-poppins">Location</Text>
          <Ionicons name="chevron-down" size={16} color="#6941C6" />
        </View>
        <View className="flex-row items-center mt-1">
          <LocationIcon width={20} height={20} />
          <Text 
            className="text-lg font-poppins-semibold text-textPrimary ml-2"
            numberOfLines={1}
            style={{ maxWidth: 180 }}
          >
            {isLocationSet ? locationName : "Select Location"}
          </Text>
        </View>
      </TouchableOpacity>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-cardBackground items-center justify-center border border-border"
          onPress={() => router.push("/(tabs)/notifications")}
          activeOpacity={0.7}
        >
          <NotificationIcon width={20} height={20} />
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <View 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#FF5252',
                width: 18,
                height: 18,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-cardBackground items-center justify-center border border-border"
          onPress={() => router.push("/(tabs)/chat")}
          activeOpacity={0.7}
        >
          <ChatIcon width={20} height={20} />
          {/* Chat Badge */}
          {chatUnreadCount > 0 && (
            <View 
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#7B61FF',
                width: 18,
                height: 18,
                borderRadius: 9,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{chatUnreadCount > 9 ? '9+' : chatUnreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Search Bar Component
  const SearchBar = () => (
    <TouchableOpacity 
      className="flex-row items-center mx-5 mb-5"
      onPress={() => router.push("/(tabs)/search")}
      activeOpacity={0.7}
    >
      <View className="flex-1 flex-row items-center bg-cardBackground rounded-xl py-3 px-4 border border-border">
        <Ionicons name="search-outline" size={24} color="#6941C6" />
        <Text className="flex-1 ml-3 text-textHint font-poppins text-base">
          Search Property
        </Text>
        <FilterIcon width={24} height={24} color="#6941C6" />
      </View>
    </TouchableOpacity>
  );

  // Promo Banner Component
  const PromoBanner = () => (
    <View className="mx-5 mb-6 rounded-3xl overflow-hidden bg-primary relative h-36">
      {/* Yellow decorative shapes */}
      <View className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent" />
      <View className="absolute bottom-0 right-0 w-24 h-24">
        <View className="absolute bottom-0 right-0 w-full h-full bg-accent rounded-tl-full" />
      </View>
      <View className="p-5 flex-1 justify-center">
        <Text className="text-white font-poppins-bold text-lg">
          GET YOUR 20%
        </Text>
        <Text className="text-white font-poppins-bold text-lg">CASHBACK</Text>
        <Text className="text-white/70 font-poppins text-xs mt-1">
          *Expired 25 Aug 2022
        </Text>
      </View>
    </View>
  );

  // Recommended Card Component
  const RecommendedCard = ({ item }) => (
    <TouchableOpacity
      className="mr-4 rounded-xl border-gray-200 overflow-hidden"
      style={{ width: CARD_WIDTH }}
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-44 rounded-2xl"
          resizeMode="cover"
        />
        {/* Price Tag */}
        <View className="absolute top-3 right-3 bg-white px-3 py-1 rounded-lg">
          <Text className="text-primary font-bold font-poppins-semibold">
            ৳{item.price}
            <Text className="font-poppins text-gray-800/50">/month</Text>
          </Text>
        </View>
        {/* Favorite Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white items-center justify-center"
        >
          <Ionicons
            name={favorites.includes(item.id) ? "heart" : "heart-outline"}
            size={18}
            color={favorites.includes(item.id) ? "#FF6B6B" : "#252B5C"}
          />
        </TouchableOpacity>
        {/* Property Info */}
        <View className="absolute bottom-3 left-3">
          <Text className="text-white font-bold font-poppins-semibold text-xl" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <LocationIcon width={16} height={16} />
            <Text className="text-white font-poppins text-base ml-1">
              {item.location}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Nearby Card Component - Horizontal layout with image on left
  const NearbyCard = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl p-3 mr-4 flex-row border border-border"
      style={{ width: width * 0.75 }}
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-24 h-24 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-textPrimary font-poppins-bold text-base" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <LocationIcon width={12} height={12} />
            <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-primary font-poppins-bold text-sm">
            ৳{item.price}<Text className="text-textSecondary font-poppins text-xs">/month</Text>
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

  // Section Header Component
  const SectionHeader = ({ title, onPress }) => (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <Text className="text-textPrimary font-bold font-poppins-bold text-xl">
        {title}
      </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text className="text-primary font-poppins-semibold text-sm">See all</Text>
      </TouchableOpacity>
    </View>
  );

  // Top Location Card Component - Rectangle with rounded-md
  const LocationCard = ({ item }) => {
    const isActive = activeLocation === item.id;
    const imageSource =
      typeof item.image === 'string'
        ? { uri: item.image }
        : item.image || { uri: 'https://picsum.photos/seed/location-fallback/300/200' };

    return (
      <TouchableOpacity
        onPress={() => setActiveLocation(item.id)}
        className="mr-3 rounded-xl overflow-hidden"
        style={{ width: 100, height: 80 }}
      >
        <Image
          source={imageSource}
          className="w-full h-full rounded-xl"
          resizeMode="cover"
        />
        <View className={`absolute inset-0 rounded-xl ${isActive ? 'bg-primary/40' : 'bg-black/30'}`} />
        <View className="absolute bottom-2 left-2 right-2">
          <Text className="text-white font-poppins-bold text-sm text-center">
            {item.name}
          </Text>
        </View>
        {isActive && (
          <View className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Popular Card Component - Reduced gaps and improved layout
  const PopularCard = ({ item }) => (
    <TouchableOpacity 
      className="flex-row bg-white rounded-2xl p-3 mb-3 mx-5 border border-border"
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-xl"
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
              togglePopularFavorite(item.id);
            }}
          >
            <Ionicons
              name={popularFavorites.includes(item.id) ? "heart" : "heart-outline"}
              size={22}
              color={popularFavorites.includes(item.id) ? "#FF6B6B" : "#DADADA"}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <LocationIcon width={10} height={10} />
          <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-primary font-poppins-bold text-sm">
            ৳{item.price}<Text className="text-textSecondary font-poppins text-xs">/{item.priceType}</Text>
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

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <Header />
        <SearchBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color="#6941C6" />
          <Text style={{ marginTop: 12, color: '#A1A5C1', fontSize: 14 }}>Loading properties...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <Header />
        <SearchBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
          <Ionicons name="cloud-offline-outline" size={64} color="#A1A5C1" />
          <Text style={{ marginTop: 12, color: '#252B5C', fontSize: 18, fontWeight: '700' }}>Connection Error</Text>
          <Text style={{ marginTop: 6, color: '#A1A5C1', fontSize: 14, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchData({ silent: false })}
            style={{ marginTop: 16, backgroundColor: '#6941C6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#6941C6"]} tintColor="#6941C6" />}
      >
        <Header />
        <SearchBar />
        <PromoBanner />

        {/* Recommended Section - Auto-scrolling */}
        <SectionHeader
          title="Recommended"
          onPress={() => router.push("/(tabs)/recommended")}
        />
        {recommended.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' }}>
            <Ionicons name="home-outline" size={40} color="#A1A5C1" />
            <Text style={{ color: '#A1A5C1', fontSize: 13, marginTop: 8 }}>No recommended properties yet</Text>
          </View>
        ) : (
          <FlatList
            ref={recommendedListRef}
            data={recommended}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RecommendedCard item={item} />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            className="mb-6"
            getItemLayout={(data, index) => ({
              length: CARD_WIDTH + 16,
              offset: (CARD_WIDTH + 16) * index,
              index,
            })}
          />
        )}

        {/* Nearby Section - Single horizontal scrollable row */}
        <SectionHeader
          title="Nearby"
          onPress={() => router.push("/(tabs)/nearby")}
        />
        {nearby.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' }}>
            <Ionicons name="location-outline" size={40} color="#A1A5C1" />
            <Text style={{ color: '#A1A5C1', fontSize: 13, marginTop: 8 }}>No nearby properties found</Text>
          </View>
        ) : (
          <FlatList
            data={nearby}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NearbyCard item={item} />}
            className="mb-6"
          />
        )}

        {/* Top Locations Section */}
        <View className="mt-3">
          <SectionHeader
            title="Top Locations"
            onPress={() => router.push("/(tabs)/topLocations")}
          />
          {locations.length === 0 ? (
            <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' }}>
              <Ionicons name="map-outline" size={40} color="#A1A5C1" />
              <Text style={{ color: '#A1A5C1', fontSize: 13, marginTop: 8 }}>No locations available</Text>
            </View>
          ) : (
            <FlatList
              data={locations}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyExtractor={(item, index) => item.id || String(index)}
              renderItem={({ item }) => <LocationCard item={item} />}
              className="mb-6"
            />
          )}
        </View>

        {/* Popular for you Section */}
        <SectionHeader
          title="Popular for you"
          onPress={() => router.push("/(tabs)/popular")}
        />
        {popular.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' }}>
            <Ionicons name="star-outline" size={40} color="#A1A5C1" />
            <Text style={{ color: '#A1A5C1', fontSize: 13, marginTop: 8 }}>No popular properties yet</Text>
          </View>
        ) : popular.map((item) => (
          <PopularCard key={item.id} item={item} />
        ))}

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Home;
