import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useLocationStore from "../../store/locationStore";

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
  const [favorites, setFavorites] = useState(["1"]);
  const [popularFavorites, setPopularFavorites] = useState(["2"]);
  const [activeLocation, setActiveLocation] = useState("2");

  // Real data states
  const [recommended, setRecommended] = useState([]);
  const [nearby, setNearby] = useState([]);
  const [popular, setPopular] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Location store - for displaying selected location in header
  const { locationName, isLocationSet, loadLocation } = useLocationStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recRes, nearRes, popRes, locRes] = await Promise.all([
          api.get('/api/houses/recommended'),
          api.get('/api/houses/nearby'),
          api.get('/api/houses/popular'),
          api.get('/api/houses/top-locations'),
        ]);

        const transformHouse = (h) => ({
          id: h.id,
          name: h.name,
          location: `${h.area}, ${h.city}`,
          price: h.listingType === 'RENT' ? h.rentPerMonth : h.salePrice,
          priceType: h.listingType === 'RENT' ? 'month' : 'total',
          rating: h.rating || 4.5,
          image: h.images?.[0]?.url || 'https://via.placeholder.com/300',
          isFavorite: h.isFavorite || false,
        });

        setRecommended(recRes.data.houses.map(transformHouse));
        setNearby(nearRes.data.houses.map(transformHouse));
        setPopular(popRes.data.houses.map(transformHouse));
        setLocations(locRes.data.locations || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll animation for Recommended section
  const recommendedScrollX = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (recommended.length === 0) return;

    // Calculate total content width: (CARD_WIDTH + 16px margin) * number of cards
    const totalWidth = (CARD_WIDTH + 16) * recommended.length;
    
    if (totalWidth > width) {
      const scrollDistance = totalWidth - width + 40;
      
      const animation = Animated.loop(
        Animated.sequence([
          // Scroll from right to left
          Animated.timing(recommendedScrollX, {
            toValue: -scrollDistance,
            duration: 10000,
            useNativeDriver: true,
          }),
          // Reset instantly to starting position
          Animated.timing(recommendedScrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      
      return () => animation.stop();
    }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const togglePopularFavorite = (id) => {
    setPopularFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
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
        >
          <NotificationIcon width={20} height={20} />
          {/* Notification Badge */}
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
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>2</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-cardBackground items-center justify-center border border-border"
          onPress={() => router.push("/(tabs)/chat")}
        >
          <ChatIcon width={20} height={20} />
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
            ${item.price}
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
            ${item.price}<Text className="text-textSecondary font-poppins text-xs">/month</Text>
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
      <TouchableOpacity onPress={onPress}>
        <Text className="text-primary font-poppins-semibold text-sm">See all</Text>
      </TouchableOpacity>
    </View>
  );

  // Top Location Card Component - Rectangle with rounded-md
  const LocationCard = ({ item }) => {
    const isActive = activeLocation === item.id;
    return (
      <TouchableOpacity
        onPress={() => setActiveLocation(item.id)}
        className="mr-3 rounded-xl overflow-hidden"
        style={{ width: 100, height: 80 }}
      >
        <Image
          source={item.image}
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <SearchBar />
        <PromoBanner />

        {/* Recommended Section - Auto-scrolling */}
        <SectionHeader
          title="Recommended"
          onPress={() => router.push("/(tabs)/recommended")}
        />
        <View className="mb-6 overflow-hidden">
          <Animated.View 
            style={{ 
              flexDirection: 'row', 
              transform: [{ translateX: recommendedScrollX }],
              paddingHorizontal: 20,
            }}
          >
            {recommended.map((item) => (
              <RecommendedCard key={item.id} item={item} />
            ))}
          </Animated.View>
        </View>

        {/* Nearby Section - Single horizontal scrollable row */}
        <SectionHeader
          title="Nearby"
          onPress={() => router.push("/(tabs)/nearby")}
        />
        <FlatList
          data={nearby}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NearbyCard item={item} />}
          className="mb-6"
        />

        {/* Top Locations Section */}
        <View className="mt-3">
          <SectionHeader
            title="Top Locations"
            onPress={() => router.push("/(tabs)/topLocations")}
          />
          <FlatList
            data={locations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={({ item }) => <LocationCard item={item} />}
            className="mb-6"
          />
        </View>

        {/* Popular for you Section */}
        <SectionHeader
          title="Popular for you"
          onPress={() => router.push("/(tabs)/popular")}
        />
        {popular.map((item) => (
          <PopularCard key={item.id} item={item} />
        ))}

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Home;
