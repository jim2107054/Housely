import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
  Share,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

// Import SVG icons
import LocationIcon from "../../assets/images/home-icons/Location.svg";

import api from "../../services/api";
import { useEffect } from "react";



const { width } = Dimensions.get("window");

// Fallback property state handled via useEffect and API call
const defaultProperty = null;

const PropertyDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id;

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      setLoading(true);
      try {
        const response = await api.get(`/api/houses/${propertyId}`);
        const h = response.data.house;
        
        // Transform facilities
        const facilities = [];
        if (h.publicFacilities) {
          if (h.publicFacilities.hospitalDistance) facilities.push("Hospital");
          if (h.publicFacilities.shoppingMallDistance) facilities.push("Mall");
          if (h.publicFacilities.mosqueDistance) facilities.push("Mosque");
          if (h.publicFacilities.marketDistance) facilities.push("Market");
        }
        if (h.hasWifi) facilities.push("WiFi");

        const transformedProperty = {
          id: h.id,
          name: h.name,
          location: `${h.area}, ${h.city}`,
          price: h.listingType === 'RENT' ? h.rentPerMonth : h.salePrice,
          priceType: h.listingType === 'RENT' ? 'month' : 'total',
          rating: h.rating || 4.5,
          images: h.images?.map(img => img.url) || [],
          bedrooms: h.bedrooms,
          bathrooms: h.bathrooms,
          area: h.sizeInSqft,
          buildYear: h.buildYear,
          status: h.listingType === 'RENT' ? 'For Rent' : 'For Sale',
          description: h.description,
          agent: {
            name: h.agent?.name || "Unknown Agent",
            role: h.agent?.role === "AGENT" ? "Real Estate Agent" : "Property Owner",
            image: h.agent?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
            phone: h.agent?.phoneNumber || "+000000000",
          },
          facilities,
          totalReviews: h._count?.reviews || 0,
          coordinates: {
            latitude: h.latitude || -8.4095,
            longitude: h.longitude || 115.1889,
          }
        };
        setProperty(transformedProperty);
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  // Toggle favorite
  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  // Share property
  const handleShare = async (platform) => {
    const shareMessage = `Check out this property: ${property.name} in ${property.location} - $${property.price}/${property.priceType}`;
    const shareUrl = `https://housely.app/property/${property.id}`;

    if (platform === "native") {
      try {
        await Share.share({
          message: `${shareMessage}\n${shareUrl}`,
          title: property.name,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      let url = "";
      const encodedMessage = encodeURIComponent(shareMessage);
      const encodedUrl = encodeURIComponent(shareUrl);

      switch (platform) {
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case "instagram":
          // Instagram doesn't have a direct share URL, open the app
          url = `instagram://`;
          break;
        case "twitter":
          url = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
          break;
        case "whatsapp":
          url = `whatsapp://send?text=${encodedMessage} ${encodedUrl}`;
          break;
        case "linkedin":
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          break;
        case "pinterest":
          url = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedMessage}`;
          break;
      }

      try {
        await Linking.openURL(url);
      } catch (error) {
        console.log("Error opening URL:", error);
      }
    }

    setShowShareModal(false);
  };

  // Call agent
  const callAgent = () => {
    Linking.openURL(`tel:${property.agent.phone}`);
  };

  // Get facility icon
  const getFacilityIcon = (facility) => {
    const icons = {
      Hospital: "medkit",
      "Gas stations": "car",
      Mall: "cart",
      Mosque: "business",
      Market: "basket",
      School: "school",
      Park: "leaf",
      Beach: "water",
      Restaurant: "restaurant",
      ATM: "cash",
      Pharmacy: "medical",
      WiFi: "wifi",
    };
    return icons[facility] || "location";
  };

  // Generate OpenStreetMap HTML for WebView - only when property is loaded
  const getMapHtml = () => {
    if (!property?.coordinates) return "";
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .custom-marker {
          background: #7F56D9;
          border: 3px solid white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          box-shadow: 0 4px 10px rgba(127, 86, 217, 0.4);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${property.coordinates.latitude}, ${property.coordinates.longitude}], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom marker icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([${property.coordinates.latitude}, ${property.coordinates.longitude}], {icon: customIcon})
          .addTo(map)
          .bindPopup('<b>${property.name}</b><br>${property.location}');
      </script>
    </body>
    </html>
  `;
  };

  // Header Component
  const Header = () => (
    <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-5 pt-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
      >
        <Ionicons name="arrow-back" size={22} color="#252B5C" />
      </TouchableOpacity>
      <Text className="text-lg font-poppins-semibold text-textPrimary">
        Details
      </Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => setShowShareModal(true)}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="share-social-outline" size={20} color="#252B5C" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleFavorite}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#FF6B6B" : "#252B5C"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Image Gallery Component
  const ImageGallery = () => (
    <View className="mb-4">
      {/* Main Image */}
      <View className="px-5 mb-3">
        <View className="rounded-3xl overflow-hidden shadow-lg">
          <Image
            source={{ uri: property.images[selectedImageIndex] }}
            className="w-full h-72"
            resizeMode="cover"
          />
          {/* Image Counter Badge */}
          <View className="absolute bottom-4 right-4 bg-black/60 rounded-full px-3 py-1">
            <Text className="text-white font-poppins-medium text-xs">
              {selectedImageIndex + 1} / {property.images.length}
            </Text>
          </View>
        </View>
      </View>
      {/* Thumbnail Images */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row px-5"
      >
        {property.images.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImageIndex(index)}
            className={`mr-3 rounded-2xl overflow-hidden border-3 shadow-sm ${
              selectedImageIndex === index
                ? "border-primary"
                : "border-border"
            }`}
          >
            <Image
              source={{ uri: image }}
              className="w-20 h-16"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Property Title & Price Component
  const PropertyTitlePrice = () => (
    <View className="px-5 mb-5">
      <View className="mb-2">
        <Text className="text-2xl font-poppins-bold text-textPrimary mb-2">
          {property.name}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="location" size={16} color="#7F56D9" />
          <Text className="text-textSecondary font-poppins text-sm ml-1">
            {property.location}
          </Text>
        </View>
      </View>
      
      {/* Price and Rating Row */}
      <View className="flex-row items-center justify-between mt-3">
        <View className="bg-primary/10 rounded-full px-4 py-2">
          <Text className="text-2xl font-poppins-bold text-primary">
            ${property.price.toLocaleString()}
            <Text className="text-sm font-poppins-medium text-primary/70">
              /{property.priceType}
            </Text>
          </Text>
        </View>
        
        {/* Rating Badge */}
        <View className="flex-row items-center bg-amber-50 rounded-full px-3 py-1.5">
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text className="text-sm font-poppins-bold text-textPrimary ml-1">
            {property.rating}
          </Text>
          <Text className="text-xs text-textSecondary font-poppins ml-1">
            ({property.totalReviews})
          </Text>
        </View>
      </View>
    </View>
  );

  // Property Details Grid Component
  const PropertyDetailsGrid = () => (
    <View className="px-5 mb-5">
      <Text className="text-lg font-poppins-bold text-textPrimary mb-4">
        Property Features
      </Text>
      <View className="bg-cardBackground rounded-2xl p-4">
        <View className="flex-row flex-wrap">
          {/* Bedrooms */}
          <View className="w-1/2 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Ionicons name="bed-outline" size={20} color="#7F56D9" />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-textSecondary font-poppins">
                  Bedrooms
                </Text>
                <Text className="text-base font-poppins-bold text-textPrimary">
                  {property.bedrooms}
                </Text>
              </View>
            </View>
          </View>
          {/* Bathrooms */}
          <View className="w-1/2 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
                <Ionicons name="water-outline" size={20} color="#2196F3" />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-textSecondary font-poppins">
                  Bathrooms
                </Text>
                <Text className="text-base font-poppins-bold text-textPrimary">
                  {property.bathrooms}
                </Text>
              </View>
            </View>
          </View>
          {/* Area */}
          <View className="w-1/2 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                <Ionicons name="resize-outline" size={20} color="#4CAF50" />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-textSecondary font-poppins">Area</Text>
                <Text className="text-base font-poppins-bold text-textPrimary">
                  {property.area.toLocaleString()} sqft
                </Text>
              </View>
            </View>
          </View>
          {/* Build Year */}
          <View className="w-1/2 mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center">
                <Ionicons name="calendar-outline" size={20} color="#FF9800" />
              </View>
              <View className="ml-3">
                <Text className="text-xs text-textSecondary font-poppins">Built</Text>
                <Text className="text-base font-poppins-bold text-textPrimary">
                  {property.buildYear}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  // Description Component
  const Description = () => {
    const shortDescription = property.description.substring(0, 150);
    const shouldShowReadMore = property.description.length > 150;

    return (
      <View className="px-5 mb-5">
        <Text className="text-lg font-poppins-bold text-textPrimary mb-3">
          About This Property
        </Text>
        <View className="bg-cardBackground rounded-2xl p-4">
          <Text className="text-sm text-textSecondary font-poppins leading-6">
            {showFullDescription ? property.description : shortDescription}
            {!showFullDescription && shouldShowReadMore && "..."}
          </Text>
          {shouldShowReadMore && (
            <TouchableOpacity 
              onPress={() => setShowFullDescription(!showFullDescription)}
              className="mt-2"
            >
              <Text className="text-primary font-poppins-semibold text-sm">
                {showFullDescription ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Agent Component
  const AgentSection = () => (
    <View className="px-5 mb-5">
      <Text className="text-lg font-poppins-bold text-textPrimary mb-3">
        Property Agent
      </Text>
      <View className="bg-cardBackground rounded-2xl p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20">
              <Image
                source={{ uri: property.agent.image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-base font-poppins-bold text-textPrimary">
                {property.agent.name}
              </Text>
              <Text className="text-xs text-textSecondary font-poppins mt-0.5">
                {property.agent.role}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="call-outline" size={12} color="#7F56D9" />
                <Text className="text-xs text-primary font-poppins-medium ml-1">
                  {property.agent.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="flex-row items-center gap-3 mt-4">
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/(tabs)/chatConversation",
              params: { 
                id: property.id, 
                name: property.agent.name, 
                avatar: property.agent.image 
              }
            })}
            className="flex-1 flex-row items-center justify-center bg-white border-2 border-primary rounded-xl py-3"
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#7F56D9" />
            <Text className="text-primary font-poppins-semibold ml-2">Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={callAgent}
            className="flex-1 flex-row items-center justify-center bg-primary rounded-xl py-3 shadow-sm"
          >
            <Ionicons name="call" size={20} color="white" />
            <Text className="text-white font-poppins-semibold ml-2">Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Facilities Component
  const FacilitiesSection = () => (
    <View className="px-5 mb-5">
      <Text className="text-lg font-poppins-bold text-textPrimary mb-3">
        Facilities & Amenities
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {property.facilities.map((facility, index) => (
          <View
            key={index}
            className="flex-row items-center bg-gradient-to-r bg-cardBackground rounded-2xl px-5 py-3 mr-3 shadow-sm border border-border"
          >
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Ionicons
                name={getFacilityIcon(facility)}
                size={18}
                color="#7F56D9"
              />
            </View>
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-3">
              {facility}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Map Component using OpenStreetMap
  const MapSection = () => (
    <View className="px-5 mb-4">
      <Text className="text-base font-poppins-semibold text-textPrimary mb-3">
        Location on Map
      </Text>
      <View className="rounded-2xl overflow-hidden h-52 border border-border shadow-sm">
        <WebView
          source={{ html: getMapHtml() }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </View>
  );

  // Reviews Component
  const ReviewsSection = () => (
    <View className="px-5 mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-poppins-semibold text-textPrimary">
          Reviews {property.totalReviews}
        </Text>
        <TouchableOpacity>
          <Text className="text-sm text-primary font-poppins-medium">
            See all
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {property.reviews.map((review) => (
          <View
            key={review.id}
            className="bg-cardBackground rounded-xl p-4 mr-3"
            style={{ width: width * 0.6 }}
          >
            <View className="flex-row items-center mb-2">
              <Image
                source={{ uri: review.image }}
                className="w-10 h-10 rounded-full"
                resizeMode="cover"
              />
              <View className="ml-2 flex-1">
                <Text className="text-sm font-poppins-semibold text-textPrimary">
                  {review.name}
                </Text>
                <View className="flex-row items-center">
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < review.rating ? "star" : "star-outline"}
                      size={12}
                      color="#FFC42D"
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text
              className="text-xs text-textSecondary font-poppins"
              numberOfLines={3}
            >
              {review.comment}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Rent/Buy Now Button
  const ActionButton = () => (
    <View className="px-5 pb-8 mt-2">
      <TouchableOpacity className="bg-primary rounded-2xl py-4 items-center shadow-lg">
        <View className="flex-row items-center">
          <Ionicons name="key" size={20} color="white" />
          <Text className="text-white font-poppins-bold text-lg ml-2">
            {property.priceType === 'month' ? 'Book This Property' : 'Buy Now'}
          </Text>
        </View>
        <Text className="text-white/80 font-poppins text-xs mt-1">
          ${property.price.toLocaleString()}/{property.priceType}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Share Modal Component
  const ShareModal = () => (
    <Modal
      visible={showShareModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowShareModal(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setShowShareModal(false)}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-lg font-poppins-semibold text-textPrimary text-center mb-6">
            Share to
          </Text>
          <View className="flex-row flex-wrap justify-center">
            {/* Facebook */}
            <TouchableOpacity
              onPress={() => handleShare("facebook")}
              className="items-center mx-4 mb-4"
            >
              <View className="w-14 h-14 rounded-full bg-[#1877F2] items-center justify-center mb-2">
                <Ionicons name="logo-facebook" size={28} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                Facebook
              </Text>
            </TouchableOpacity>
            {/* Instagram */}
            <TouchableOpacity
              onPress={() => handleShare("instagram")}
              className="items-center mx-4 mb-4"
            >
              <View className="w-14 h-14 rounded-full bg-[#E4405F] items-center justify-center mb-2">
                <Ionicons name="logo-instagram" size={28} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                Instagram
              </Text>
            </TouchableOpacity>
            {/* Twitter */}
            <TouchableOpacity
              onPress={() => handleShare("twitter")}
              className="items-center mx-4 mb-4"
            >
              <View className="w-14 h-14 rounded-full bg-[#1DA1F2] items-center justify-center mb-2">
                <Ionicons name="logo-twitter" size={28} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                Twitter
              </Text>
            </TouchableOpacity>
            {/* WhatsApp */}
            <TouchableOpacity
              onPress={() => handleShare("whatsapp")}
              className="items-center mx-4 mb-4"
            >
              <View className="w-14 h-14 rounded-full bg-[#25D366] items-center justify-center mb-2">
                <Ionicons name="logo-whatsapp" size={28} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                Whatsapp
              </Text>
            </TouchableOpacity>
            {/* LinkedIn */}
            <TouchableOpacity
              onPress={() => handleShare("linkedin")}
              className="items-center mx-4 mb-4"
            >
              <View className="w-14 h-14 rounded-full bg-[#0A66C2] items-center justify-center mb-2">
                <Ionicons name="logo-linkedin" size={28} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                Linkedin
              </Text>
            </TouchableOpacity>
            {/* Pinterest */}
            <TouchableOpacity
              onPress={() => handleShare("pinterest")}
              className="items-center mx-4 mb-4"
            >
              <View className="w-14 h-14 rounded-full bg-[#E60023] items-center justify-center mb-2">
                <Ionicons name="logo-pinterest" size={28} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">
                Pinterest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#6941C6" />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={60} color="#DADADA" />
        <Text style={{ marginTop: 12, fontSize: 16, color: "#252B5C", textAlign: "center" }}>Property not found or failed to load.</Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginTop: 20, backgroundColor: "#6941C6", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60, paddingBottom: 20 }}
      >
        <ImageGallery />
        <PropertyTitlePrice />
        <PropertyDetailsGrid />
        <Description />
        <FacilitiesSection />
        <AgentSection />
        <MapSection />
        {property.reviews && property.reviews.length > 0 && <ReviewsSection />}
        <ActionButton />
      </ScrollView>
      <ShareModal />
    </View>
  );
};

export default PropertyDetails;
