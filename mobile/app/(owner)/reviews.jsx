import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../../services/api";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";



const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
};

const OwnerReviews = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/reviews/agent');
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error('Error fetching agent reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? "star" : "star-outline"}
        size={14}
        color="#FFC107"
        style={{ marginRight: 2 }}
      />
    ));
  };

  const renderReview = ({ item }) => (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: item.user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg" }}
          style={{ width: 44, height: 44, borderRadius: 22 }}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.textPrimary }}>
            {item.user?.name}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
            {item.house?.name} • {item.house?.city}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </View>
      <View style={{ flexDirection: "row", marginTop: 10 }}>{renderStars(item.rating)}</View>
      <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 8 }}>
        {item.comment}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.textPrimary, flex: 1 }}>
          Reviews
        </Text>
      </View>

      {/* Summary */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 20,
          gap: 16,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 40, fontWeight: "bold", color: COLORS.textPrimary }}>
            {avgRating}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 4 }}>{renderStars(Math.round(Number(avgRating)))}</View>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
            {reviews.length} reviews
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons name="star-outline" size={60} color="#E0E0E0" />
              <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>No reviews yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default OwnerReviews;
