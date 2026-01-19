import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Import SVG icons
import LocationIcon from "../../assets/images/home-icons/Location.svg";
import NotificationIcon from "../../assets/images/home-icons/Notification.svg";
import ChatIcon from "../../assets/images/home-icons/Chat.svg";
import FilterIcon from "../../assets/images/home-icons/Filter.svg";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.55;

// Sample data for recommended properties
const recommendedProperties = [
  {
    id: "1",
    name: "Ayana Homestay",
    location: "Imogiri, Yogyakarta",
    price: 310,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Bali Komang Guest",
    location: "Nusa penida,",
    price: 280,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    isFavorite: false,
  },
  {
    id: "3",
    name: "Villa Paradise",
    location: "Seminyak, Bali",
    price: 450,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    isFavorite: false,
  },
];

// Sample data for nearby properties
const nearbyProperties = [
  {
    id: "1",
    name: "Maharani Villa...",
    location: "Benhil, Jl. Bendungan...",
    price: 320,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200",
    image2: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200",
  },
  {
    id: "2",
    name: "Apartement land...",
    location: "Jl. Tentara Pelajar...",
    price: 320,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=200",
    image2: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
  },
];

// Sample data for top locations
const topLocations = [
  {
    id: "1",
    name: "Malang",
    image: require("../../assets/images/home-icons/Rectangle 14.png"),
  },
  {
    id: "2",
    name: "Bali",
    image: require("../../assets/images/home-icons/Rectangle 15.png"),
    isActive: true,
  },
  {
    id: "3",
    name: "Yogyakarta",
    image: require("../../assets/images/home-icons/Rectangle 16.png"),
  },
  {
    id: "4",
    name: "Jakarta",
    image: require("../../assets/images/home-icons/Rectangle 14.png"),
  },
];

// Sample data for popular properties
const popularProperties = [
  {
    id: "1",
    name: "Takatea Homestay",
    location: "Jl. Tentara Pelajar No.47, RW.001",
    price: 120,
    priceType: "night",
    rating: 4.5,
    image: require("../../assets/images/home-icons/Rectangle 27.png"),
    isFavorite: false,
  },
  {
    id: "2",
    name: "Maharani Villa Yogyakarta",
    location: "Benhil, Jl. Bendungan Hilir Karet...",
    price: 320,
    priceType: "month",
    rating: 4.5,
    image: require("../../assets/images/home-icons/Rectangle 28.png"),
    isFavorite: true,
  },
  {
    id: "3",
    name: "Bali Komang Guest",
    location: "Nusa Penida, Bali",
    price: 280,
    priceType: "month",
    rating: 4.8,
    image: require("../../assets/images/home-icons/Rectangle 29.png"),
    isFavorite: false,
  },
];

const Home = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(["1"]);
  const [popularFavorites, setPopularFavorites] = useState(["2"]);
  const [activeLocation, setActiveLocation] = useState("2");

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
      <View>
        <TouchableOpacity className="flex-row items-center gap-1">
          <Text className="text-xs text-textSecondary font-poppins">Location</Text>
          <Ionicons name="chevron-down" size={12} color="#53587A" />
        </TouchableOpacity>
        <View className="flex-row items-center mt-1">
          <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
            <LocationIcon width={12} height={12} />
          </View>
          <Text className="text-base font-poppins-semibold text-textPrimary ml-2">
            Yogyakarta, Ind
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-10 h-10 rounded-full bg-cardBackground items-center justify-center border border-border">
          <NotificationIcon width={20} height={20} />
        </TouchableOpacity>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-cardBackground items-center justify-center border border-border">
          <ChatIcon width={20} height={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Search Bar Component
  const SearchBar = () => (
    <View className="flex-row items-center mx-5 mb-5">
      <View className="flex-1 flex-row items-center bg-cardBackground rounded-xl h-12 px-4 border border-border">
        <Ionicons name="search-outline" size={20} color="#A1A5C1" />
        <TextInput
          placeholder="Search Property"
          placeholderTextColor="#A1A5C1"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-3 text-textPrimary font-poppins text-sm"
        />
      </View>
      <TouchableOpacity className="ml-3 w-12 h-12 rounded-xl bg-white border border-border items-center justify-center">
        <FilterIcon width={20} height={20} />
      </TouchableOpacity>
    </View>
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
      className="mr-4 rounded-2xl overflow-hidden"
      style={{ width: CARD_WIDTH }}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-44 rounded-2xl"
          resizeMode="cover"
        />
        {/* Price Tag */}
        <View className="absolute top-3 right-3 bg-primary px-3 py-1 rounded-lg">
          <Text className="text-white font-poppins-semibold text-xs">
            ${item.price}
            <Text className="font-poppins text-white/80">/month</Text>
          </Text>
        </View>
        {/* Favorite Button */}
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
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
          <Text className="text-white font-poppins-semibold text-base">
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <LocationIcon width={12} height={12} />
            <Text className="text-white/80 font-poppins text-xs ml-1">
              {item.location}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Nearby Card Component
  const NearbyCard = ({ item }) => (
    <TouchableOpacity className="flex-row bg-white rounded-2xl p-3 mb-3 mx-5 border border-border">
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-textPrimary font-poppins-semibold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <LocationIcon width={10} height={10} />
          <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center mt-2">
          <Text className="text-textPrimary font-poppins-semibold text-xs">
            ${item.price}/month
          </Text>
          <View className="flex-row items-center ml-3">
            <Ionicons name="star" size={12} color="#FFC42D" />
            <Text className="text-textPrimary font-poppins-medium text-xs ml-1">
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
      <Image
        source={{ uri: item.image2 }}
        className="w-16 h-20 rounded-xl ml-2"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Section Header Component
  const SectionHeader = ({ title, onPress }) => (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <Text className="text-textPrimary font-poppins-semibold text-lg">
        {title}
      </Text>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-primary font-poppins-medium text-sm">See all</Text>
      </TouchableOpacity>
    </View>
  );

  // Top Location Chip Component
  const LocationChip = ({ item }) => {
    const isActive = activeLocation === item.id;
    return (
      <TouchableOpacity
        onPress={() => setActiveLocation(item.id)}
        className={`mr-3 rounded-full flex-row items-center px-1 py-1 pr-4 ${
          isActive ? "bg-primary" : "bg-cardBackground border border-border"
        }`}
      >
        <Image
          source={item.image}
          className="w-9 h-9 rounded-full"
          resizeMode="cover"
        />
        <Text
          className={`ml-2 font-poppins-medium text-sm ${
            isActive ? "text-white" : "text-textPrimary"
          }`}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Popular Card Component
  const PopularCard = ({ item }) => (
    <TouchableOpacity className="flex-row bg-white rounded-2xl p-3 mb-3 mx-5 border border-border">
      <Image
        source={item.image}
        className="w-16 h-16 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-center">
        <Text className="text-textPrimary font-poppins-semibold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <LocationIcon width={10} height={10} />
          <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Text className="text-textPrimary font-poppins-semibold text-xs">
            ${item.price}/{item.priceType}
          </Text>
          <View className="flex-row items-center ml-3">
            <Ionicons name="star" size={12} color="#FFC42D" />
            <Text className="text-textPrimary font-poppins-medium text-xs ml-1">
              {item.rating}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => togglePopularFavorite(item.id)}
        className="self-center ml-2"
      >
        <Ionicons
          name={popularFavorites.includes(item.id) ? "heart" : "heart-outline"}
          size={20}
          color={popularFavorites.includes(item.id) ? "#FF6B6B" : "#DADADA"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header />
        <SearchBar />
        <PromoBanner />

        {/* Recommended Section */}
        <SectionHeader
          title="Recommended"
          onPress={() => console.log("See all recommended")}
        />
        <FlatList
          data={recommendedProperties}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RecommendedCard item={item} />}
          className="mb-6"
        />

        {/* Nearby Section */}
        <SectionHeader
          title="Nearby"
          onPress={() => console.log("See all nearby")}
        />
        {nearbyProperties.map((item) => (
          <NearbyCard key={item.id} item={item} />
        ))}

        {/* Top Locations Section */}
        <View className="mt-3">
          <SectionHeader
            title="Top Locations"
            onPress={() => console.log("See all locations")}
          />
          <FlatList
            data={topLocations}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <LocationChip item={item} />}
            className="mb-6"
          />
        </View>

        {/* Popular for you Section */}
        <SectionHeader
          title="Popular for you"
          onPress={() => router.push("/(tabs)/popular")}
        />
        {popularProperties.map((item) => (
          <PopularCard key={item.id} item={item} />
        ))}

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default Home;
