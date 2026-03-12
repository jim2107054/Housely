import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import SVG icons
import LocationIcon from "../../assets/images/home-icons/Location.svg";
import FilterIcon from "../../assets/images/home-icons/Filter.svg";

// Import data (structured like backend API response)
import {
  allProperties,
  recommendedProperties,
  nearbyPropertiesRow1,
  nearbyPropertiesRow2,
  popularProperties,
} from "../../data/dummyData";

//!api calls - uncomment when connecting backend
// import api from "../../services/api";
// useEffect(() => {
//   const fetchHouses = async () => {
//     const response = await api.get('/api/houses');
//     setHouses(response.data.houses);
//   };
//   fetchHouses();
// }, []);

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2; // Two cards per row with gaps

// Combine all properties into one array
const getAllHouses = () => {
  const combined = [
    ...allProperties,
    ...recommendedProperties.map(p => ({ ...p, priceType: p.priceType || "month" })),
    ...nearbyPropertiesRow1.map(p => ({ ...p, priceType: "month" })),
    ...nearbyPropertiesRow2.map(p => ({ ...p, priceType: "month" })),
    ...popularProperties,
  ];
  
  // Remove duplicates by id
  const uniqueMap = new Map();
  combined.forEach(property => {
    if (!uniqueMap.has(property.id)) {
      uniqueMap.set(property.id, property);
    }
  });
  
  return Array.from(uniqueMap.values());
};

const categories = [
  { id: "all", name: "All", icon: "apps" },
  { id: "house", name: "House", icon: "home" },
  { id: "apartment", name: "Apartment", icon: "business" },
  { id: "villa", name: "Villa", icon: "leaf" },
  { id: "hotel", name: "Hotel", icon: "bed" },
];

const sortOptions = [
  { id: "default", name: "Default" },
  { id: "price_low", name: "Price: Low to High" },
  { id: "price_high", name: "Price: High to Low" },
  { id: "rating", name: "Highest Rating" },
];

const Explore = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState(["1", "4"]);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  const allHouses = useMemo(() => getAllHouses(), []);

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = [...allHouses];
    
    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        p => p.type?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Price range filter
    result = result.filter(
      p => p.price >= priceRange.min && p.price <= priceRange.max
    );
    
    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [allHouses, selectedCategory, sortBy, priceRange]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  // Header with search
  const Header = () => (
    <View className="px-5 pt-2 pb-4">
      <Text className="text-2xl font-poppins-bold text-textPrimary mb-4">
        Explore
      </Text>
      
      {/* Search Bar - Matching Home Screen Style */}
      <TouchableOpacity 
        className="flex-row items-center"
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
    </View>
  );

  // Category pills
  const CategoryFilter = () => (
    <View className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            className={`flex-row items-center px-4 py-2.5 rounded-full mr-3 ${
              selectedCategory === category.id 
                ? "bg-primary" 
                : "bg-cardBackground border border-border"
            }`}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={18} 
              color={selectedCategory === category.id ? "#FFFFFF" : "#6941C6"} 
            />
            <Text 
              className={`ml-2 font-poppins-semibold text-sm ${
                selectedCategory === category.id ? "text-white" : "text-textPrimary"
              }`}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Results info bar
  const ResultsBar = () => (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <Text className="text-textSecondary font-poppins text-sm">
        Found <Text className="text-textPrimary font-poppins-bold">{filteredProperties.length}</Text> properties
      </Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity 
          className={`w-9 h-9 rounded-lg items-center justify-center ${
            viewMode === "grid" ? "bg-primary" : "bg-cardBackground border border-border"
          }`}
          onPress={() => setViewMode("grid")}
        >
          <Ionicons 
            name="grid" 
            size={18} 
            color={viewMode === "grid" ? "#FFFFFF" : "#6941C6"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          className={`w-9 h-9 rounded-lg items-center justify-center ${
            viewMode === "list" ? "bg-primary" : "bg-cardBackground border border-border"
          }`}
          onPress={() => setViewMode("list")}
        >
          <Ionicons 
            name="list" 
            size={18} 
            color={viewMode === "list" ? "#FFFFFF" : "#6941C6"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Grid card component
  const GridCard = ({ item }) => (
    <TouchableOpacity
      className="mb-4"
      style={{ width: CARD_WIDTH }}
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-36 rounded-2xl"
          resizeMode="cover"
        />
        {/* Price tag */}
        <View className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-lg">
          <Text className="text-primary font-poppins-bold text-xs">
            ${item.price}
            <Text className="text-textSecondary font-poppins text-xs">/{item.priceType || "month"}</Text>
          </Text>
        </View>
        {/* Favorite button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 items-center justify-center"
        >
          <Ionicons
            name={favorites.includes(item.id) ? "heart" : "heart-outline"}
            size={16}
            color={favorites.includes(item.id) ? "#FF6B6B" : "#252B5C"}
          />
        </TouchableOpacity>
        {/* Rating */}
        {item.rating && (
          <View className="absolute bottom-2 left-2 flex-row items-center bg-white/90 px-2 py-1 rounded-lg">
            <Ionicons name="star" size={12} color="#FFC42D" />
            <Text className="text-textPrimary font-poppins-bold text-xs ml-1">
              {item.rating}
            </Text>
          </View>
        )}
      </View>
      <View className="mt-2">
        <Text className="text-textPrimary font-poppins-bold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <LocationIcon width={12} height={12} />
          <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // List card component
  const ListCard = ({ item }) => (
    <TouchableOpacity
      className="flex-row bg-white rounded-2xl p-3 mb-3 mx-5 border border-border"
      onPress={() => router.push({ pathname: "/(tabs)/propertyDetails", params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.image }}
        className="w-28 h-28 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between py-1">
        <View>
          <View className="flex-row items-start justify-between">
            <Text className="text-textPrimary font-poppins-bold text-base flex-1 pr-2" numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
            >
              <Ionicons
                name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                size={22}
                color={favorites.includes(item.id) ? "#FF6B6B" : "#DADADA"}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center mt-1">
            <LocationIcon width={12} height={12} />
            <Text className="text-textSecondary font-poppins text-xs ml-1" numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-primary font-poppins-bold text-base">
            ${item.price}
            <Text className="text-textSecondary font-poppins text-xs">/{item.priceType || "month"}</Text>
          </Text>
          {item.rating && (
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#FFC42D" />
              <Text className="text-textPrimary font-poppins-bold text-sm ml-1">
                {item.rating}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Filter Modal
  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View 
          className="bg-white rounded-t-3xl p-5"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-poppins-bold text-textPrimary">
              Filter & Sort
            </Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#252B5C" />
            </TouchableOpacity>
          </View>

          {/* Sort Options */}
          <Text className="text-textPrimary font-poppins-semibold text-base mb-3">
            Sort by
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className={`px-4 py-2.5 rounded-full ${
                  sortBy === option.id 
                    ? "bg-primary" 
                    : "bg-cardBackground border border-border"
                }`}
                onPress={() => setSortBy(option.id)}
              >
                <Text 
                  className={`font-poppins-semibold text-sm ${
                    sortBy === option.id ? "text-white" : "text-textPrimary"
                  }`}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range */}
          <Text className="text-textPrimary font-poppins-semibold text-base mb-3">
            Price Range ($/month)
          </Text>
          <View className="flex-row items-center gap-4 mb-6">
            <View className="flex-1 bg-cardBackground rounded-xl px-4 py-3 border border-border">
              <Text className="text-textSecondary font-poppins text-xs mb-1">Min</Text>
              <TextInput
                value={String(priceRange.min)}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: Number(text) || 0 }))}
                keyboardType="numeric"
                className="text-textPrimary font-poppins-semibold text-base"
              />
            </View>
            <Text className="text-textSecondary font-poppins">-</Text>
            <View className="flex-1 bg-cardBackground rounded-xl px-4 py-3 border border-border">
              <Text className="text-textSecondary font-poppins text-xs mb-1">Max</Text>
              <TextInput
                value={String(priceRange.max)}
                onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: Number(text) || 0 }))}
                keyboardType="numeric"
                className="text-textPrimary font-poppins-semibold text-base"
              />
            </View>
          </View>

          {/* Apply & Reset Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 py-4 rounded-xl border border-primary"
              onPress={() => {
                setSortBy("default");
                setPriceRange({ min: 0, max: 1000 });
              }}
            >
              <Text className="text-primary font-poppins-semibold text-center">
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 py-4 rounded-xl bg-primary"
              onPress={() => setShowFilterModal(false)}
            >
              <Text className="text-white font-poppins-semibold text-center">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Empty state
  const EmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="search-outline" size={64} color="#A1A5C1" />
      <Text className="text-textPrimary font-poppins-bold text-lg mt-4">
        No properties found
      </Text>
      <Text className="text-textSecondary font-poppins text-sm text-center mt-2 px-10">
        Try adjusting your search or filters to find what you're looking for
      </Text>
      <TouchableOpacity 
        className="mt-6 px-6 py-3 bg-primary rounded-xl"
        onPress={() => {
          setSearchQuery("");
          setSortBy("default");
          setPriceRange({ min: 0, max: 1000 });
        }}
      >
        <Text className="text-white font-poppins-semibold">Clear all filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <Header />
      <CategoryFilter />
      <ResultsBar />
      
      {filteredProperties.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        <FlatList
          data={filteredProperties}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GridCard item={item} />}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredProperties.map((item) => (
            <ListCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
      
      <FilterModal />
    </View>
  );
};

export default Explore;
