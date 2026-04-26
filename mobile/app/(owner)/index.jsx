import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";
import { RefreshControl } from "react-native";
import { connectSocket } from "../../services/socketService";



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
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications/unread-count');
      setUnreadCount(res.data?.notificationCount ?? 0);
      setChatUnreadCount(res.data?.chatCount ?? 0);
    } catch {
      setUnreadCount(0);
      setChatUnreadCount(0);
    }
  }, []);

  const fetchDashboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      console.log('[Owner Dashboard] Fetching dashboard data...');
      const response = await api.get('/api/houses/agent/dashboard');
      console.log('[Owner Dashboard] Success:', response.data);
      setDashboardData(response.data);
    } catch (err) {
      console.error('[Owner Dashboard] Error fetching dashboard:', err);
      let errorMessage = 'Failed to load dashboard';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Cannot connect to server. Please check:\n• Backend server is running\n• Your network connection\n• API URL in config.js';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard({ silent: false });
      fetchUnreadCount();
    }, [fetchDashboard, fetchUnreadCount])
  );

  // Socket listener for real-time unread count
  useEffect(() => {
    let sock;
    const initSocket = async () => {
      sock = await connectSocket();
      if (!sock) return;

      sock.on('message:new', () => {
        fetchUnreadCount();
      });
    };
    initSocket();

    return () => {
      if (sock) {
        sock.off('message:new');
      }
    };
  }, [fetchUnreadCount]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard({ silent: true });
  };

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
      value: `৳${statsData.totalEarnings.toLocaleString()}`,
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
        <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background, paddingHorizontal: 30 }}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.warning} />
        <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginTop: 16, textAlign: "center" }}>
          Connection Error
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setLoading(true);
            const fetchDashboard = async () => {
              try {
                const response = await api.get('/api/houses/agent/dashboard');
                setDashboardData(response.data);
              } catch (err) {
                let errorMessage = 'Failed to load dashboard';
                if (err.response) {
                  errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                } else if (err.request) {
                  errorMessage = 'Cannot connect to server. Please check:\n• Backend server is running\n• Your network connection\n• API URL in config.js';
                } else {
                  errorMessage = err.message || 'Unknown error occurred';
                }
                setError(errorMessage);
              } finally {
                setLoading(false);
              }
            };
            fetchDashboard();
          }}
          style={{
            marginTop: 20,
            backgroundColor: COLORS.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/chat")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
                {chatUnreadCount > 0 && (
                  <View 
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: '#FFFFFF',
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                    }}
                  >
                    <Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: 'bold' }}>{chatUnreadCount > 9 ? '9+' : chatUnreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/notifications")}
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
                {unreadCount > 0 && (
                  <View 
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: '#FF5252',
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: COLORS.primary,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
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
              ৳{statsData.thisMonthEarnings.toLocaleString()}
            </Text>
            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                  Pending
                </Text>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  ৳{statsData.pendingPayouts.toLocaleString()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
                  Total Earned
                </Text>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                  ৳{statsData.totalEarnings.toLocaleString()}
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
                    ৳{booking.totalAmount?.toLocaleString()}
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
