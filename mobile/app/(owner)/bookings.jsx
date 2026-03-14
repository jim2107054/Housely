import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "../../services/api";



const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#F44336",
  info: "#2196F3",
};

const TABS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const statusConfig = {
  PENDING: { bg: "#FFF3E0", text: "#FF9800", label: "Pending" },
  CONFIRMED: { bg: "#E3F2FD", text: "#2196F3", label: "Confirmed" },
  COMPLETED: { bg: "#E8F5E9", text: "#4CAF50", label: "Completed" },
  CANCELLED: { bg: "#FFEBEE", text: "#F44336", label: "Cancelled" },
};

const OwnerBookings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/bookings/agent/all');
        setBookings(response.data.bookings || []);
      } catch (err) {
        console.error('Error fetching agent bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  const handleAction = async (bookingId, action) => {
    const newStatus = action === "accept" ? "CONFIRMED" : "CANCELLED";
    try {
      await api.patch(`/api/bookings/agent/${bookingId}/status`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      Toast.show({
        type: "success",
        text1: action === "accept" ? "Booking Accepted" : "Booking Declined",
        text2: action === "accept" ? "The tenant has been notified." : "The booking has been cancelled.",
      });
    } catch (err) {
      console.error('Error updating booking status:', err);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Please try again later.",
      });
    }
  };

  const renderBooking = ({ item }) => {
    const config = statusConfig[item.status];
    const checkIn = new Date(item.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const checkOut = new Date(item.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          marginHorizontal: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={{ uri: item.house?.images?.[0]?.url }}
            style={{ width: 80, height: 80, borderRadius: 12 }}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.textPrimary }} numberOfLines={1}>
              {item.house?.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Ionicons name="person-outline" size={13} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 }}>
                {item.user?.name || "Guest"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
              <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 }}>
                {checkIn} - {checkOut}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F5F5F5" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ backgroundColor: config.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: config.text }}>{config.label}</Text>
            </View>
            {item.notes && (
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 }} numberOfLines={1}>
                "{item.notes}"
              </Text>
            )}
          </View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary }}>
            ${item.totalAmount}
          </Text>
        </View>

        {item.status === "PENDING" && (
          <View style={{ flexDirection: "row", marginTop: 12, gap: 10 }}>
            <TouchableOpacity
              onPress={() => handleAction(item.id, "decline")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: COLORS.danger,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.danger, fontWeight: "600", fontSize: 14 }}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAction(item.id, "accept")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: COLORS.success,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

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
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary }}>
          Bookings
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isActive ? COLORS.primary : "#F0F0F0",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isActive ? "#fff" : COLORS.textSecondary,
                }}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Ionicons name="calendar-outline" size={60} color="#E0E0E0" />
              <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginTop: 12 }}>
                No {activeTab.toLowerCase()} bookings
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default OwnerBookings;
