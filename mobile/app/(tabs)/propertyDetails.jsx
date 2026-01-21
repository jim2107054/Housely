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
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

// Import SVG icons
import LocationIcon from "../../assets/images/home-icons/Location.svg";

const { width } = Dimensions.get("window");

// Sample property data (this would typically come from an API or route params)
const propertiesData = {
  "1": {
    id: "1",
    name: "House of Mormon",
    location: "Denpasar, Bali",
    price: 310,
    priceType: "month",
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    ],
    bedrooms: 3,
    bathrooms: 2,
    area: 1880,
    buildYear: 2020,
    parking: "1 Indoor",
    status: "For Rent",
    description:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. 1500s, when an unknown printer took a type specimen book. Lorem ipsum is simply dummy text of the printing and typesetting industry.",
    agent: {
      name: "Esther Howard",
      role: "Real Estate Agent",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      phone: "+1234567890",
    },
    facilities: ["Hospital", "Gas stations", "Mall", "Mosque"],
    coordinates: {
      latitude: -8.4095,
      longitude: 115.1889,
    },
    reviews: [
      {
        id: "1",
        name: "Theresa Webb",
        rating: 4,
        comment:
          "Lorem ipsum is simply dummy text of the printing and typesetting industry. 1500s.",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
      },
      {
        id: "2",
        name: "Alex Johnson",
        rating: 5,
        comment: "Amazing property with great amenities. Highly recommended!",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
      },
    ],
    totalReviews: 152,
  },
  "2": {
    id: "2",
    name: "Ayana Homestay",
    location: "Imogiri, Yogyakarta",
    price: 310,
    priceType: "month",
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    ],
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    buildYear: 2019,
    parking: "2 Indoor",
    status: "For Rent",
    description:
      "Beautiful homestay with modern amenities and stunning views. Perfect for families looking for a comfortable stay with all the facilities needed.",
    agent: {
      name: "John Smith",
      role: "Property Manager",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      phone: "+1987654321",
    },
    facilities: ["Hospital", "School", "Mall", "Park"],
    coordinates: {
      latitude: -7.9361,
      longitude: 110.3634,
    },
    reviews: [
      {
        id: "1",
        name: "Sarah Williams",
        rating: 5,
        comment: "Excellent property! Very clean and well maintained.",
        image: "https://randomuser.me/api/portraits/women/22.jpg",
      },
    ],
    totalReviews: 89,
  },
  "3": {
    id: "3",
    name: "Bali Komang Guest",
    location: "Nusa Penida, Bali",
    price: 280,
    priceType: "month",
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    ],
    bedrooms: 2,
    bathrooms: 2,
    area: 1500,
    buildYear: 2021,
    parking: "1 Outdoor",
    status: "For Rent",
    description:
      "Cozy guest house in the heart of Nusa Penida with easy access to famous beaches and attractions.",
    agent: {
      name: "Made Komang",
      role: "Local Host",
      image: "https://randomuser.me/api/portraits/men/55.jpg",
      phone: "+6281234567890",
    },
    facilities: ["Beach", "Restaurant", "ATM", "Pharmacy"],
    coordinates: {
      latitude: -8.7275,
      longitude: 115.5444,
    },
    reviews: [
      {
        id: "1",
        name: "Michael Brown",
        rating: 4,
        comment: "Great location and friendly host!",
        image: "https://randomuser.me/api/portraits/men/75.jpg",
      },
    ],
    totalReviews: 124,
  },
};

// Default property for fallback
const defaultProperty = propertiesData["1"];

const PropertyDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id || "1";
  const property = propertiesData[propertyId] || defaultProperty;

  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

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
      School: "school",
      Park: "leaf",
      Beach: "water",
      Restaurant: "restaurant",
      ATM: "cash",
      Pharmacy: "medical",
    };
    return icons[facility] || "location";
  };

  // OpenStreetMap HTML for WebView
  const mapHtml = `
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
          width: 20px;
          height: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
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
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        L.marker([${property.coordinates.latitude}, ${property.coordinates.longitude}], {icon: customIcon})
          .addTo(map)
          .bindPopup('<b>${property.name}</b><br>${property.location}');
      </script>
    </body>
    </html>
  `;

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
    <View className="px-5 mb-4">
      {/* Main Image */}
      <View className="rounded-3xl overflow-hidden mb-3">
        <Image
          source={{ uri: property.images[selectedImageIndex] }}
          className="w-full h-56"
          resizeMode="cover"
        />
      </View>
      {/* Thumbnail Images */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {property.images.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedImageIndex(index)}
            className={`mr-2 rounded-xl overflow-hidden border-2 ${
              selectedImageIndex === index
                ? "border-primary"
                : "border-transparent"
            }`}
          >
            <Image
              source={{ uri: image }}
              className="w-16 h-12"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Property Title & Price Component
  const PropertyTitlePrice = () => (
    <View className="flex-row items-center justify-between px-5 mb-4">
      <View className="flex-1">
        <Text className="text-xl font-poppins-bold text-textPrimary">
          {property.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
            <LocationIcon width={12} height={12} />
          </View>
          <Text className="text-textSecondary font-poppins text-sm ml-2">
            {property.location}
          </Text>
        </View>
      </View>
      <View>
        <Text className="text-xl font-poppins-bold text-primary">
          ${property.price}
          <Text className="text-sm font-poppins text-textSecondary">
            /{property.priceType}
          </Text>
        </Text>
      </View>
    </View>
  );

  // Property Details Grid Component
  const PropertyDetailsGrid = () => (
    <View className="px-5 mb-4">
      <Text className="text-base font-poppins-semibold text-textPrimary mb-3">
        Property Details
      </Text>
      <View className="flex-row flex-wrap">
        {/* Bedrooms */}
        <View className="w-1/3 mb-3">
          <Text className="text-xs text-textSecondary font-poppins">
            Bedrooms
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="bed-outline" size={16} color="#7F56D9" />
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-1">
              {property.bedrooms}
            </Text>
          </View>
        </View>
        {/* Bathrooms */}
        <View className="w-1/3 mb-3">
          <Text className="text-xs text-textSecondary font-poppins">
            Bathubs
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="water-outline" size={16} color="#7F56D9" />
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-1">
              {property.bathrooms}
            </Text>
          </View>
        </View>
        {/* Area */}
        <View className="w-1/3 mb-3">
          <Text className="text-xs text-textSecondary font-poppins">Area</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="resize-outline" size={16} color="#7F56D9" />
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-1">
              {property.area.toLocaleString()} sqft
            </Text>
          </View>
        </View>
        {/* Build Year */}
        <View className="w-1/3 mb-3">
          <Text className="text-xs text-textSecondary font-poppins">Build</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={16} color="#7F56D9" />
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-1">
              {property.buildYear}
            </Text>
          </View>
        </View>
        {/* Parking */}
        <View className="w-1/3 mb-3">
          <Text className="text-xs text-textSecondary font-poppins">
            Parking
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="car-outline" size={16} color="#7F56D9" />
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-1">
              {property.parking}
            </Text>
          </View>
        </View>
        {/* Status */}
        <View className="w-1/3 mb-3">
          <Text className="text-xs text-textSecondary font-poppins">
            Status
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="checkmark-circle-outline" size={16} color="#7F56D9" />
            <Text className="text-sm font-poppins-semibold text-textPrimary ml-1">
              {property.status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Description Component
  const Description = () => {
    const shortDescription = property.description.substring(0, 120);
    const shouldShowReadMore = property.description.length > 120;

    return (
      <View className="px-5 mb-4">
        <Text className="text-base font-poppins-semibold text-textPrimary mb-2">
          Description
        </Text>
        <Text className="text-sm text-textSecondary font-poppins leading-5">
          {showFullDescription ? property.description : shortDescription}
          {!showFullDescription && shouldShowReadMore && "..."}
          {shouldShowReadMore && (
            <Text
              onPress={() => setShowFullDescription(!showFullDescription)}
              className="text-primary font-poppins-semibold"
            >
              {showFullDescription ? " Show less" : " Read more"}
            </Text>
          )}
        </Text>
      </View>
    );
  };

  // Agent Component
  const AgentSection = () => (
    <View className="px-5 mb-4">
      <Text className="text-base font-poppins-semibold text-textPrimary mb-3">
        Agent
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={{ uri: property.agent.image }}
            className="w-12 h-12 rounded-full"
            resizeMode="cover"
          />
          <View className="ml-3">
            <Text className="text-sm font-poppins-semibold text-textPrimary">
              {property.agent.name}
            </Text>
            <Text className="text-xs text-textSecondary font-poppins">
              {property.agent.role}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={callAgent}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          <Ionicons name="call" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Facilities Component
  const FacilitiesSection = () => (
    <View className="px-5 mb-4">
      <Text className="text-base font-poppins-semibold text-textPrimary mb-3">
        Location & Public Facilities
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {property.facilities.map((facility, index) => (
          <View
            key={index}
            className="flex-row items-center bg-cardBackground rounded-full px-4 py-2 mr-2"
          >
            <Ionicons
              name={getFacilityIcon(facility)}
              size={16}
              color="#7F56D9"
            />
            <Text className="text-xs font-poppins-medium text-textPrimary ml-2">
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
      <View className="rounded-2xl overflow-hidden h-40 border border-border">
        <WebView
          source={{ html: mapHtml }}
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

  // Rent Now Button
  const RentButton = () => (
    <View className="px-5 pb-8">
      <TouchableOpacity className="bg-primary rounded-xl py-4 items-center">
        <Text className="text-white font-poppins-semibold text-base">
          Rent now
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

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 60 }}
      >
        <ImageGallery />
        <PropertyTitlePrice />
        <PropertyDetailsGrid />
        <Description />
        <AgentSection />
        <FacilitiesSection />
        <MapSection />
        <ReviewsSection />
        <RentButton />
      </ScrollView>
      <ShareModal />
    </View>
  );
};

export default PropertyDetails;
