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
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

const PropertyDetailsNew = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id;
  const scrollViewRef = useRef(null);

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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
          if (h.publicFacilities.hospitalDistance) facilities.push({ name: "Hospital", distance: h.publicFacilities.hospitalDistance, icon: "medkit" });
          if (h.publicFacilities.shoppingMallDistance) facilities.push({ name: "Mall", distance: h.publicFacilities.shoppingMallDistance, icon: "cart" });
          if (h.publicFacilities.mosqueDistance) facilities.push({ name: "Mosque", distance: h.publicFacilities.mosqueDistance, icon: "business" });
          if (h.publicFacilities.marketDistance) facilities.push({ name: "Market", distance: h.publicFacilities.marketDistance, icon: "basket" });
        }
        if (h.hasWifi) facilities.push({ name: "WiFi", icon: "wifi" });
        if (h.hasParking) facilities.push({ name: "Parking", icon: "car" });

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

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

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
        case "whatsapp":
          url = `whatsapp://send?text=${encodedMessage} ${encodedUrl}`;
          break;
        case "twitter":
          url = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
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

  const callAgent = () => {
    Linking.openURL(`tel:${property.agent.phone}`);
  };

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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 4px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
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

        const customIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([${property.coordinates.latitude}, ${property.coordinates.longitude}], {icon: customIcon})
          .addTo(map)
          .bindPopup('<b>${property.name}</b><br>${property.location}')
          .openPopup();
      </script>
    </body>
    </html>
  `;
  };

  // Hero Image Carousel
  const HeroCarousel = () => (
    <View style={{ height: height * 0.5 }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setSelectedImageIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {property.images.map((image, index) => (
          <View key={index} style={{ width }}>
            <Image
              source={{ uri: image }}
              style={{ width, height: height * 0.5 }}
              resizeMode="cover"
            />
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 150,
              }}
            />
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center items-center gap-2">
        {property.images.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              selectedImageIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </View>

      {/* Floating Header */}
      <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-5"
        style={{ paddingTop: StatusBar.currentHeight || 40 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur items-center justify-center shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => setShowShareModal(true)}
            className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur items-center justify-center shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="share-social" size={22} color="#1A1A1A" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            className="w-12 h-12 rounded-2xl backdrop-blur items-center justify-center shadow-lg"
            style={{
              backgroundColor: isFavorite ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#FFFFFF" : "#1A1A1A"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Badge */}
      <View className="absolute top-24 right-5 bg-gradient-to-r rounded-full px-4 py-2 shadow-lg"
        style={{
          backgroundColor: property.priceType === 'month' ? '#10B981' : '#3B82F6',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white font-poppins-bold text-sm">
          {property.status}
        </Text>
      </View>
    </View>
  );

  // Property Header Info
  const PropertyHeader = () => (
    <View className="px-5 pt-6 pb-4 bg-white" style={{
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      marginTop: -30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 10,
    }}>
      {/* Title */}
      <Text className="text-3xl font-poppins-bold text-textPrimary mb-2">
        {property.name}
      </Text>

      {/* Location */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
          <Ionicons name="location" size={20} color="#7F56D9" />
        </View>
        <Text className="ml-3 text-textSecondary font-poppins-medium text-base flex-1">
          {property.location}
        </Text>
      </View>

      {/* Price & Rating Row */}
      <View className="flex-row items-center justify-between p-4 rounded-2xl"
        style={{
          backgroundColor: '#F8F5FF',
        }}
      >
        <View>
          <Text className="text-textSecondary font-poppins text-sm mb-1">Price</Text>
          <Text className="text-primary font-poppins-bold text-3xl">
            ${property.price.toLocaleString()}
            <Text className="text-primary/60 font-poppins-medium text-lg">
              /{property.priceType}
            </Text>
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-textSecondary font-poppins text-sm mb-1">Rating</Text>
          <View className="flex-row items-center bg-amber-50 rounded-full px-4 py-2">
            <Ionicons name="star" size={20} color="#FFC107" />
            <Text className="text-xl font-poppins-bold text-textPrimary ml-2">
              {property.rating}
            </Text>
            <Text className="text-sm text-textSecondary font-poppins ml-1">
              ({property.totalReviews})
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Property Features Grid
  const PropertyFeatures = () => {
    const features = [
      { label: 'Bedrooms', value: property.bedrooms, icon: 'bed', color: '#7F56D9', bg: '#F8F5FF' },
      { label: 'Bathrooms', value: property.bathrooms, icon: 'water', color: '#3B82F6', bg: '#EFF6FF' },
      { label: 'Area', value: `${property.area.toLocaleString()} sqft`, icon: 'resize', color: '#10B981', bg: '#ECFDF5' },
      { label: 'Built', value: property.buildYear, icon: 'calendar', color: '#F59E0B', bg: '#FFFBEB' },
    ];

    return (
      <View className="px-5 py-6">
        <Text className="text-2xl font-poppins-bold text-textPrimary mb-4">
          Property Features
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {features.map((feature, index) => (
            <View
              key={index}
              className="flex-1 min-w-[45%] rounded-2xl p-4"
              style={{
                backgroundColor: feature.bg,
                minWidth: '45%',
              }}
            >
              <View className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: feature.color }}
              >
                <Ionicons name={feature.icon} size={28} color="#FFFFFF" />
              </View>
              <Text className="text-textSecondary font-poppins text-xs mb-1">
                {feature.label}
              </Text>
              <Text className="text-textPrimary font-poppins-bold text-xl">
                {feature.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Description Section
  const Description = () => {
    const shortDescription = property.description.substring(0, 180);
    const shouldShowReadMore = property.description.length > 180;

    return (
      <View className="px-5 py-6 bg-gray-50">
        <Text className="text-2xl font-poppins-bold text-textPrimary mb-4">
          About This Property
        </Text>
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Text className="text-base text-textSecondary font-poppins leading-7">
            {showFullDescription ? property.description : shortDescription}
            {!showFullDescription && shouldShowReadMore && "..."}
          </Text>
          {shouldShowReadMore && (
            <TouchableOpacity 
              onPress={() => setShowFullDescription(!showFullDescription)}
              className="mt-4 self-start"
            >
              <Text className="text-primary font-poppins-bold text-base">
                {showFullDescription ? "Show Less" : "Read More"} →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Facilities Section
  const FacilitiesSection = () => (
    <View className="px-5 py-6">
      <Text className="text-2xl font-poppins-bold text-textPrimary mb-4">
        Facilities & Amenities
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row -mx-5 px-5"
      >
        {property.facilities.map((facility, index) => (
          <View
            key={index}
            className="mr-3 bg-white rounded-2xl p-4 items-center shadow-sm"
            style={{
              width: 110,
              shadowColor: '#7F56D9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-3">
              <Ionicons name={facility.icon} size={32} color="#7F56D9" />
            </View>
            <Text className="text-textPrimary font-poppins-semibold text-sm text-center" numberOfLines={2}>
              {facility.name}
            </Text>
            {facility.distance && (
              <Text className="text-textSecondary font-poppins text-xs mt-1">
                {facility.distance} km
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Agent Card
  const AgentCard = () => (
    <View className="px-5 py-6 bg-gray-50">
      <Text className="text-2xl font-poppins-bold text-textPrimary mb-4">
        Meet Your Agent
      </Text>
      <View className="bg-white rounded-3xl p-5 shadow-lg"
        style={{
          shadowColor: '#7F56D9',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center mb-5">
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 3,
            borderColor: '#7F56D9',
          }}>
            <Image
              source={{ uri: property.agent.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-poppins-bold text-textPrimary">
              {property.agent.name}
            </Text>
            <Text className="text-textSecondary font-poppins text-sm mt-1">
              {property.agent.role}
            </Text>
            <View className="flex-row items-center mt-2">
              <Ionicons name="call" size={14} color="#7F56D9" />
              <Text className="text-primary font-poppins-medium text-sm ml-2">
                {property.agent.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/(tabs)/chatConversation",
              params: { 
                id: property.id, 
                name: property.agent.name, 
                avatar: property.agent.image 
              }
            })}
            className="flex-1 flex-row items-center justify-center bg-primary/10 rounded-2xl py-4"
          >
            <Ionicons name="chatbubble-ellipses" size={22} color="#7F56D9" />
            <Text className="text-primary font-poppins-bold ml-2 text-base">Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={callAgent}
            className="flex-1 flex-row items-center justify-center rounded-2xl py-4"
            style={{
              backgroundColor: '#7F56D9',
              shadowColor: '#7F56D9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="call" size={22} color="#FFFFFF" />
            <Text className="text-white font-poppins-bold ml-2 text-base">Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Map Section
  const MapSection = () => (
    <View className="px-5 py-6">
      <Text className="text-2xl font-poppins-bold text-textPrimary mb-4">
        Location on Map
      </Text>
      <View className="rounded-3xl overflow-hidden shadow-lg"
        style={{
          height: 250,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
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

  // Book Now Footer
  const BookNowFooter = () => (
    <View className="px-5 py-6 bg-white"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <TouchableOpacity
        className="rounded-2xl py-5 items-center"
        style={{
          backgroundColor: '#7F56D9',
          shadowColor: '#7F56D9',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <View className="flex-row items-center">
          <Ionicons name="key" size={24} color="#FFFFFF" />
          <Text className="text-white font-poppins-bold text-xl ml-3">
            {property.priceType === 'month' ? 'Book This Property' : 'Buy Now'}
          </Text>
        </View>
        <Text className="text-white/80 font-poppins text-sm mt-2">
          ${property.price.toLocaleString()}/{property.priceType}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Share Modal
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
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
          <Text className="text-xl font-poppins-bold text-textPrimary text-center mb-6">
            Share Property
          </Text>
          <View className="flex-row justify-around">
            <TouchableOpacity
              onPress={() => handleShare("facebook")}
              className="items-center"
            >
              <View className="w-16 h-16 rounded-2xl bg-[#1877F2] items-center justify-center mb-2">
                <Ionicons name="logo-facebook" size={32} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare("whatsapp")}
              className="items-center"
            >
              <View className="w-16 h-16 rounded-2xl bg-[#25D366] items-center justify-center mb-2">
                <Ionicons name="logo-whatsapp" size={32} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare("twitter")}
              className="items-center"
            >
              <View className="w-16 h-16 rounded-2xl bg-[#1DA1F2] items-center justify-center mb-2">
                <Ionicons name="logo-twitter" size={32} color="white" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleShare("native")}
              className="items-center"
            >
              <View className="w-16 h-16 rounded-2xl bg-gray-200 items-center justify-center mb-2">
                <Ionicons name="share-social" size={32} color="#1A1A1A" />
              </View>
              <Text className="text-xs text-textSecondary font-poppins">More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#7F56D9" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#9E9E9E", fontFamily: 'Poppins' }}>
          Loading property details...
        </Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF", padding: 20 }}>
        <Ionicons name="home-outline" size={80} color="#DADADA" />
        <Text style={{ marginTop: 16, fontSize: 20, fontWeight: "700", color: "#1A1A1A", textAlign: "center" }}>
          Property Not Found
        </Text>
        <Text style={{ marginTop: 8, fontSize: 14, color: "#9E9E9E", textAlign: "center" }}>
          This property may have been removed or doesn't exist.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginTop: 24, backgroundColor: "#7F56D9", paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
      >
        <HeroCarousel />
        <PropertyHeader />
        <PropertyFeatures />
        <Description />
        <FacilitiesSection />
        <AgentCard />
        <MapSection />
        <View style={{ height: 100 }} />
      </ScrollView>
      <BookNowFooter />
      <ShareModal />
    </View>
  );
};

export default PropertyDetailsNew;
