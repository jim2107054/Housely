import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useEffect, useState, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import Toast from "react-native-toast-message";
import api from "../../services/api";



const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  danger: "#F44336",
};

const AUTO_SCROLL_INTERVAL = 4000;

// Component for rendering a video slide in the carousel
const VideoSlide = ({ videoUrl, isActive }) => {
  const player = useVideoPlayer(videoUrl ? { uri: videoUrl } : null);
  
  useEffect(() => {
    if (!isActive && player) {
      player.pause();
    }
  }, [isActive, player]);

  if (!videoUrl) return null;
  return (
    <View style={{ width, height: 280, backgroundColor: '#000' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        nativeControls
        contentFit="contain"
      />
    </View>
  );
};

const OwnerPropertyDetails = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const imageScrollRef = useRef(null);
  const autoScrollTimer = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const fetchProperty = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/api/houses/${id}`);
          const house = response.data.house;
          setProperty({
            ...house,
            price: house.listingType === 'RENT' ? house.rentPerMonth : house.salePrice,
            rating: house.rating || 4.5,
            videoUrl: house.video?.url || null,
            imageUrls: house.images?.map(img => img.url) || [],
          });
          
          // Fetch reviews for this house
          const reviewsResponse = await api.get(`/api/reviews/house/${id}`);
          setReviews(reviewsResponse.data.reviews || []);
        } catch (err) {
          console.error('Error fetching owner property details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProperty();
    }, [id])
  );

  // Auto-scroll logic
  const startAutoScroll = useCallback(() => {
    const mediaCount = (property?.imageUrls?.length || 0) + (property?.videoUrl ? 1 : 0);
    if (mediaCount <= 1) return;
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      setSelectedImageIndex((prev) => {
        const next = (prev + 1) % mediaCount;
        imageScrollRef.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [property?.imageUrls?.length, property?.videoUrl]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (property?.imageUrls?.length > 1 || (property?.imageUrls?.length > 0 && property?.videoUrl)) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [property?.imageUrls?.length, property?.videoUrl, startAutoScroll, stopAutoScroll]);

  const onImageScrollBegin = () => stopAutoScroll();
  const onImageScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setSelectedImageIndex(index);
    startAutoScroll();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/houses/${id}`);
              Toast.show({ type: "success", text1: "Property Deleted" });
              router.back();
            } catch (err) {
              console.error('Error deleting property:', err);
              Toast.show({ type: "error", text1: "Delete Failed" });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: COLORS.textSecondary }}>Property not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image/Video Carousel */}
        <View style={{ position: "relative" }}>
          <FlatList
            ref={imageScrollRef}
            data={[
              ...(property.imageUrls || []).map(url => ({ type: 'image', url })),
              ...(property.videoUrl ? [{ type: 'video', url: property.videoUrl }] : [])
            ]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={onImageScrollBegin}
            onMomentumScrollEnd={onImageScrollEnd}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <View style={{ width }}>
                {item.type === 'video' ? (
                  <VideoSlide videoUrl={item.url} isActive={selectedImageIndex === index} />
                ) : (
                  <Image
                    source={{ uri: item.url }}
                    style={{ width, height: 280 }}
                    resizeMode="cover"
                  />
                )}
              </View>
            )}
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Indicators */}
          {((property.imageUrls?.length || 0) + (property.videoUrl ? 1 : 0)) > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: 12,
                alignSelf: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              {[...(property.imageUrls || []), ...(property.videoUrl ? [1] : [])].map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: selectedImageIndex === i ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: selectedImageIndex === i ? "#fff" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Status Badge */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View
              style={{
                backgroundColor: property.status === "AVAILABLE" ? "#E8F5E9" : "#FFF3E0",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: property.status === "AVAILABLE" ? "#4CAF50" : "#FF9800",
                }}
              >
                {property.status || "AVAILABLE"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.textPrimary, marginLeft: 4 }}>
                {property.rating}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary, marginTop: 12 }}>
            {property.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginLeft: 4 }}>
              {property.address}, {property.city}
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: "bold", color: COLORS.primary, marginTop: 16 }}>
            ৳{property.price}
            <Text style={{ fontSize: 14, fontWeight: "400", color: COLORS.textSecondary }}>
              /{property.listingType === "RENT" ? "month" : "total"}
            </Text>
          </Text>

          {/* Details Grid */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: COLORS.card,
              borderRadius: 16,
              padding: 16,
              marginTop: 20,
              justifyContent: "space-around",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Ionicons name="bed-outline" size={22} color={COLORS.primary} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginTop: 4 }}>
                {property.bedrooms}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>Bedrooms</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Ionicons name="water-outline" size={22} color={COLORS.primary} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginTop: 4 }}>
                {property.bathrooms}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>Bathrooms</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Ionicons name="resize-outline" size={22} color={COLORS.primary} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: COLORS.textPrimary, marginTop: 4 }}>
                {property.sizeInSqft || "N/A"}
              </Text>
              <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>Sq.ft</Text>
            </View>
          </View>

          {/* Description */}
          {property.description && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 8 }}>
                Description
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 }}>
                {property.description}
              </Text>
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12 }}>
                Reviews ({reviews.length})
              </Text>
              {reviews.map((review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: COLORS.card,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <Image
                      source={{ uri: review.user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg" }}
                      style={{ width: 32, height: 32, borderRadius: 16 }}
                    />
                    <Text style={{ flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "600", color: COLORS.textPrimary }}>
                      {review.user?.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="star" size={13} color="#FFC107" />
                      <Text style={{ marginLeft: 3, fontSize: 13, fontWeight: "600" }}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 }}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 24, paddingBottom: 20 }}>
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: COLORS.danger,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.danger, fontSize: 16, fontWeight: "600" }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/(owner)/addProperty", params: { id: property.id } })}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: COLORS.primary,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OwnerPropertyDetails;
