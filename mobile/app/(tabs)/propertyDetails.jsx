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
  FlatList,
} from "react-native";
import { useState, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { Video, ResizeMode } from "expo-av";
import api from "../../services/api";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");
const AUTO_SCROLL_INTERVAL = 4000;

const PropertyDetailsNew = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id;
  const scrollViewRef = useRef(null);
  const imageScrollRef = useRef(null);
  const autoScrollTimer = useRef(null);

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
        
        const facilities = [];
        if (h.publicFacilities) {
          if (h.publicFacilities.hospitalDistance) facilities.push({ name: "Hospital", distance: h.publicFacilities.hospitalDistance, icon: "medkit" });
          if (h.publicFacilities.shoppingMallDistance) facilities.push({ name: "Mall", distance: h.publicFacilities.shoppingMallDistance, icon: "cart" });
          if (h.publicFacilities.mosqueDistance) facilities.push({ name: "Mosque", distance: h.publicFacilities.mosqueDistance, icon: "business" });
          if (h.publicFacilities.marketDistance) facilities.push({ name: "Market", distance: h.publicFacilities.marketDistance, icon: "basket" });
        }
        if (h.hasWifi) facilities.push({ name: "WiFi", icon: "wifi" });
        if (h.hasParking) facilities.push({ name: "Parking", icon: "car" });

        setProperty({
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
            id: h.agent?.id,
            name: h.agent?.name || "Unknown Agent",
            role: h.agent?.role === "AGENT" ? "Real Estate Agent" : "Property Owner",
            image: h.agent?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
            phone: h.agent?.phoneNumber || "+000000000",
          },
          facilities,
          totalReviews: h._count?.reviews || 0,
          videoUrl: h.video?.url || null,
          coordinates: {
            latitude: h.latitude || -8.4095,
            longitude: h.longitude || 115.1889,
          }
        });
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  // Auto-scroll images
  const startAutoScroll = useCallback(() => {
    if (!property?.images?.length || property.images.length <= 1) return;
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      setSelectedImageIndex((prev) => {
        const next = (prev + 1) % property.images.length;
        imageScrollRef.current?.scrollToOffset({ offset: next * width, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [property?.images?.length]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (property?.images?.length > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [property?.images?.length, startAutoScroll, stopAutoScroll]);

  const onImageScrollBegin = () => stopAutoScroll();
  const onImageScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setSelectedImageIndex(index);
    startAutoScroll();
  };

  const toggleFavorite = () => setIsFavorite((prev) => !prev);

  const handleShare = async (platform) => {
    const shareMessage = `Check out this property: ${property.name} in ${property.location} - $${property.price}/${property.priceType}`;
    const shareUrl = `https://housely.app/property/${property.id}`;

    if (platform === "native") {
      try {
        await Share.share({ message: `${shareMessage}\n${shareUrl}`, title: property.name });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      let url = "";
      const encodedMessage = encodeURIComponent(shareMessage);
      const encodedUrl = encodeURIComponent(shareUrl);
      switch (platform) {
        case "facebook": url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
        case "whatsapp": url = `whatsapp://send?text=${encodedMessage} ${encodedUrl}`; break;
        case "twitter": url = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`; break;
      }
      try { await Linking.openURL(url); } catch (error) { console.log("Error opening URL:", error); }
    }
    setShowShareModal(false);
  };

  const callAgent = () => Linking.openURL(`tel:${property.agent.phone}`);

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
          border: 4px solid white; border-radius: 50%;
          width: 32px; height: 32px;
          box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
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
        const customIcon = L.divIcon({ className: 'custom-marker', iconSize: [32, 32], iconAnchor: [16, 16] });
        L.marker([${property.coordinates.latitude}, ${property.coordinates.longitude}], {icon: customIcon})
          .addTo(map).bindPopup('<b>${property.name}</b><br>${property.location}').openPopup();
      </script>
    </body>
    </html>`;
  };

  // ─── Loading Skeleton ───
  const LoadingSkeleton = () => (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      {/* Image skeleton */}
      <View style={{ width, height: height * 0.45, backgroundColor: '#F0F0F0' }}>
        {/* Back button */}
        <View style={{ position: 'absolute', top: StatusBar.currentHeight || 40, left: 20, zIndex: 10 }}>
          <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
          }}
        >
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        {/* Shimmer placeholder */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#7F56D9" />
        </View>
      </View>
      {/* Content skeleton */}
      <View style={{ padding: 20, marginTop: -24, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <View style={{ height: 24, width: '70%', backgroundColor: '#F0F0F0', borderRadius: 8, marginBottom: 12 }} />
        <View style={{ height: 16, width: '50%', backgroundColor: '#F0F0F0', borderRadius: 8, marginBottom: 20 }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <View key={i} style={{ flex: 1, height: 80, backgroundColor: '#F8F5FF', borderRadius: 16 }} />
          ))}
        </View>
        <View style={{ height: 16, width: '90%', backgroundColor: '#F0F0F0', borderRadius: 8, marginTop: 24 }} />
        <View style={{ height: 16, width: '80%', backgroundColor: '#F0F0F0', borderRadius: 8, marginTop: 8 }} />
        <View style={{ height: 16, width: '60%', backgroundColor: '#F0F0F0', borderRadius: 8, marginTop: 8 }} />
      </View>
    </View>
  );

  // ─── Image Carousel ───
  const HeroCarousel = () => (
    <View style={{ height: height * 0.45 }}>
      <FlatList
        ref={imageScrollRef}
        data={property.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={onImageScrollBegin}
        onMomentumScrollEnd={onImageScrollEnd}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <Image source={{ uri: item }} style={{ width, height: height * 0.45 }} resizeMode="cover" />
            {/* Bottom gradient overlay */}
            <View style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
              backgroundColor: 'transparent',
            }}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.0)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} />
            </View>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={{
        position: 'absolute', bottom: 16, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
      }}>
        {property.images.map((_, index) => (
          <View
            key={index}
            style={{
              height: 8,
              width: selectedImageIndex === index ? 28 : 8,
              borderRadius: 4,
              backgroundColor: selectedImageIndex === index ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </View>

      {/* Image Counter */}
      <View style={{
        position: 'absolute', bottom: 16, right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
        paddingHorizontal: 10, paddingVertical: 4,
      }}>
        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>
          {selectedImageIndex + 1}/{property.images.length}
        </Text>
      </View>

      {/* Floating Header */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: StatusBar.currentHeight || 40,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setShowShareModal(true)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="share-social" size={18} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: isFavorite ? '#FF6B6B' : 'rgba(255,255,255,0.9)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"} size={18}
              color={isFavorite ? "#FFF" : "#1A1A1A"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Badge */}
      <View style={{
        position: 'absolute', top: (StatusBar.currentHeight || 40) + 56, right: 20,
        backgroundColor: property.priceType === 'month' ? '#10B981' : '#3B82F6',
        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
      }}>
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>
          {property.status}
        </Text>
      </View>
    </View>
  );

  // ─── Property Info Card ───
  const PropertyHeader = () => (
    <View style={{
      paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16,
      backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
      marginTop: -24,
    }}>
      {/* Name + Rating row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1A1A1A', flex: 1, marginRight: 12 }}>
          {property.name}
        </Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#FFFBEB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
        }}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginLeft: 4 }}>
            {property.rating}
          </Text>
          <Text style={{ fontSize: 12, color: '#9E9E9E', marginLeft: 2 }}>
            ({property.totalReviews})
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Ionicons name="location" size={18} color="#7F56D9" />
        <Text style={{ marginLeft: 6, color: '#6B7280', fontSize: 15 }}>
          {property.location}
        </Text>
      </View>

      {/* Price */}
      <View style={{
        backgroundColor: '#F8F5FF', borderRadius: 16, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <View>
          <Text style={{ color: '#9E9E9E', fontSize: 12, marginBottom: 4 }}>Price</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ color: '#7F56D9', fontSize: 28, fontWeight: '800' }}>
              ${property.price?.toLocaleString()}
            </Text>
            <Text style={{ color: '#7F56D9', fontSize: 15, fontWeight: '500', opacity: 0.6 }}>
              /{property.priceType}
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: '#7F56D9', borderRadius: 12,
          paddingHorizontal: 14, paddingVertical: 8,
        }}>
          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>
            {property.status}
          </Text>
        </View>
      </View>
    </View>
  );

  // ─── Quick Stats Row ───
  const QuickStats = () => {
    const stats = [
      { label: 'Beds', value: property.bedrooms, icon: 'bed', color: '#7F56D9' },
      { label: 'Baths', value: property.bathrooms, icon: 'water', color: '#3B82F6' },
      { label: 'Sqft', value: property.area?.toLocaleString(), icon: 'resize', color: '#10B981' },
      { label: 'Built', value: property.buildYear, icon: 'calendar', color: '#F59E0B' },
    ];
    return (
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}>
        {stats.map((stat, i) => (
          <View key={i} style={{
            flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB',
            borderRadius: 16, paddingVertical: 14, paddingHorizontal: 4,
          }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: stat.color, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
            }}>
              <Ionicons name={stat.icon} size={20} color="#FFF" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>{stat.value}</Text>
            <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>
    );
  };

  // ─── Description ───
  const Description = () => {
    if (!property.description) return null;
    const shortDesc = property.description.substring(0, 180);
    const hasMore = property.description.length > 180;

    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>
          About This Property
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>
          {showFullDescription ? property.description : shortDesc}
          {!showFullDescription && hasMore && "..."}
        </Text>
        {hasMore && (
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)} style={{ marginTop: 8 }}>
            <Text style={{ color: '#7F56D9', fontWeight: '700', fontSize: 14 }}>
              {showFullDescription ? "Show Less" : "Read More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ─── Facilities ───
  const FacilitiesSection = () => {
    if (!property.facilities?.length) return null;
    return (
      <View style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, paddingHorizontal: 20 }}>
          Facilities & Amenities
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {property.facilities.map((f, i) => (
            <View key={i} style={{ marginRight: 12, backgroundColor: '#FFF', borderRadius: 16, padding: 14,
              alignItems: 'center', width: 100, borderWidth: 1, borderColor: '#F0F0F0',
            }}>
              <View style={{
                width: 48, height: 48, borderRadius: 14, backgroundColor: '#F8F5FF',
                alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              }}>
                <Ionicons name={f.icon} size={24} color="#7F56D9" />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' }} numberOfLines={1}>
                {f.name}
              </Text>
              {f.distance && (
                <Text style={{ fontSize: 11, color: '#9E9E9E', marginTop: 2 }}>{f.distance} km</Text>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ─── Agent Card ───
  const AgentCard = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>
        Listed By
      </Text>
      <View style={{
        backgroundColor: '#FFF', borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#F0F0F0',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Image
            source={{ uri: property.agent.image }}
            style={{ width: 56, height: 56, borderRadius: 16, borderWidth: 2, borderColor: '#7F56D9' }}
          />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A1A1A' }}>
              {property.agent.name}
            </Text>
            <Text style={{ fontSize: 13, color: '#9E9E9E', marginTop: 2 }}>
              {property.agent.role}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={async () => {
              try {
                const res = await api.post('/api/conversations', {
                  agentId: property.agent.id,
                  houseId: property.id,
                });
                const convoId = res.data?.conversation?.id || res.data?.id;
                if (convoId) {
                  router.push({
                    pathname: '/(tabs)/chatConversation',
                    params: { id: convoId, name: property.agent.name, avatar: property.agent.image },
                  });
                }
              } catch (err) {
                console.error('Failed to open conversation:', err);
              }
            }}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#F8F5FF', borderRadius: 14, paddingVertical: 12,
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#7F56D9" />
            <Text style={{ color: '#7F56D9', fontWeight: '700', marginLeft: 6, fontSize: 14 }}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={callAgent}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#7F56D9', borderRadius: 14, paddingVertical: 12,
            }}
          >
            <Ionicons name="call" size={20} color="#FFF" />
            <Text style={{ color: '#FFF', fontWeight: '700', marginLeft: 6, fontSize: 14 }}>Call Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ─── Video Player ───
  const VideoSection = () => {
    if (!property.videoUrl) return null;
    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>
          Property Video
        </Text>
        <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' }}>
          <Video
            source={{ uri: property.videoUrl }}
            style={{ width: '100%', height: 220 }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={false}
          />
        </View>
      </View>
    );
  };

  // ─── Map ───
  const MapSection = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>
        Location
      </Text>
      <View style={{ borderRadius: 20, overflow: 'hidden', height: 220 }}>
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

  // ─── Book Button (inline, not sticky) ───
  const BookNowButton = () => (
    <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#7F56D9', borderRadius: 16, paddingVertical: 18,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18 }}>
          Book This Property
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Share Modal ───
  const ShareModal = () => (
    <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
      <TouchableOpacity activeOpacity={1} onPress={() => setShowShareModal(false)}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 }}>
            Share Property
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {[
              { platform: "facebook", icon: "logo-facebook", bg: "#1877F2", label: "Facebook" },
              { platform: "whatsapp", icon: "logo-whatsapp", bg: "#25D366", label: "WhatsApp" },
              { platform: "twitter", icon: "logo-twitter", bg: "#1DA1F2", label: "Twitter" },
              { platform: "native", icon: "share-social", bg: "#E5E7EB", label: "More", iconColor: "#1A1A1A" },
            ].map(({ platform, icon, bg, label, iconColor }) => (
              <TouchableOpacity key={platform} onPress={() => handleShare(platform)} style={{ alignItems: 'center' }}>
                <View style={{
                  width: 56, height: 56, borderRadius: 16, backgroundColor: bg,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                }}>
                  <Ionicons name={icon} size={28} color={iconColor || "#FFF"} />
                </View>
                <Text style={{ fontSize: 11, color: '#9E9E9E' }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) return <LoadingSkeleton />;

  if (!property) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", padding: 20 }}>
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
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <HeroCarousel />
        <PropertyHeader />
        <QuickStats />
        <View style={{ height: 8, backgroundColor: '#F9FAFB' }} />
        <Description />
        <View style={{ height: 8, backgroundColor: '#F9FAFB' }} />
        <FacilitiesSection />
        <View style={{ height: 8, backgroundColor: '#F9FAFB' }} />
        <AgentCard />
        <View style={{ height: 8, backgroundColor: '#F9FAFB' }} />
        <VideoSection />
        <View style={{ height: 8, backgroundColor: '#F9FAFB' }} />
        <MapSection />
        <BookNowButton />
      </ScrollView>
      <ShareModal />
    </View>
  );
};

export default PropertyDetailsNew;
