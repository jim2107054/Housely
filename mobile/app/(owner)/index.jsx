import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";



const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",
};

const OwnerDashboard = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/houses/agent/dashboard');
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statsData = dashboardData?.stats || {
    housesCount: 0,
    bookingsCount: 0,
    reviewsCount: 0,
    avgRating: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    pendingPayouts: 0,
  };

  const recentBookings = dashboardData?.recentBookings || [];

  // Stats
  const stats = [
    {
      label: "Properties",
      value: statsData.housesCount,
      icon: "home",
      color: "#7B61FF",
      bgColor: "#F0ECFF",
      onPress: () => router.push("/(owner)/properties"),
    },
    {
      label: "Bookings",
      value: statsData.bookingsCount,
      icon: "calendar",
      color: "#FF9800",
      bgColor: "#FFF3E0",
      onPress: () => router.push("/(owner)/bookings"),
    },
    {
      label: "Rating",
      value: statsData.avgRating.toFixed(1),
      icon: "star",
      color: "#FFC107",
      bgColor: "#FFFDE7",
      onPress: () => router.push("/(owner)/reviews"),
    },
    {
      label: "Earnings",
      value: `$${statsData.totalEarnings.toLocaleString()}`,
      icon: "cash",
      color: "#4CAF50",
      bgColor: "#E8F5E9",
      onPress: () => router.push("/(owner)/earnings"),
    },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 10,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: COLORS.primary,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri: user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg",
                }}
                style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#fff" }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Welcome back,</Text>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
                  {user?.name || "House Owner"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Earnings Summary */}
          <View
            style={{
              marginTop: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              This Month's Earnings
            </Text>
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold", marginTop: 4 }}>
              ${statsData.thisMonthEarnings.toLocaleString()}
            </Text>
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                  Pending
                </Text>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  ${statsData.pendingPayouts.toLocaleString()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                  Total Earned
                </Text>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  ${statsData.totalEarnings.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 16,
            marginTop: 20,
            gap: 12,
          }}
        >
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              onPress={stat.onPress}
              style={{
                width: (width - 44) / 2,
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: stat.bgColor,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
                {stat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pending Bookings */}
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary }}>
              Pending Bookings
            </Text>
            <TouchableOpacity onPress={() => router.push("/(owner)/bookings")}>
              <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {recentBookings.length === 0 ? (
            <View
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
              <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>
                No recent bookings
              </Text>
            </View>
          ) : (
            recentBookings.map((booking) => {
              const checkIn = new Date(booking.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const checkOut = new Date(booking.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <View
                  key={booking.id}
                  style={{
                    backgroundColor: COLORS.card,
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: "row",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <Image
                    source={{ uri: booking.house?.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                    style={{ width: 70, height: 70, borderRadius: 12 }}
                  />
                  <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.textPrimary }} numberOfLines={1}>
                      {booking.house?.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                      {booking.user?.name} • {checkIn} - {checkOut}
                    </Text>
                    <View
                      style={{
                        marginTop: 6,
                        backgroundColor: booking.status === 'COMPLETED' ? '#E8F5E9' : '#FFF3E0',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ fontSize: 11, color: booking.status === 'COMPLETED' ? '#4CAF50' : '#FF9800', fontWeight: "600" }}>
                        {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.primary }}>
                    ${booking.totalAmount}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Recent Reviews */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary }}>
              Recent Reviews
            </Text>
            <TouchableOpacity onPress={() => router.push("/(owner)/reviews")}>
              <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: "600" }}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {(dashboardData?.recentReviews || []).slice(0, 2).map((review) => (
            <View
              key={review.id}
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Image
                  source={{ uri: review.user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg" }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary }}>
                    {review.user?.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
                    {review.house?.name}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="star" size={14} color="#FFC107" />
                  <Text style={{ marginLeft: 3, fontSize: 13, fontWeight: "600", color: COLORS.textPrimary }}>
                    {review.rating}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 }} numberOfLines={2}>
                {review.comment}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default OwnerDashboard;
