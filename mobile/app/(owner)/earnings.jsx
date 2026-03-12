import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ownerEarnings } from "../../data/dummyData";

//!api calls - uncomment when connecting backend
// import api from "../../services/api";
// useEffect(() => {
//   const fetchEarnings = async () => {
//     const response = await api.get('/api/agent/earnings');
//     setEarnings(response.data);
//   };
//   fetchEarnings();
// }, []);

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  success: "#4CAF50",
  warning: "#FF9800",
};

const OwnerEarnings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [earnings] = useState(ownerEarnings);

  const summaryCards = [
    { label: "Total Earnings", value: `$${earnings.totalEarnings.toLocaleString()}`, icon: "wallet", color: "#4CAF50", bgColor: "#E8F5E9" },
    { label: "This Month", value: `$${earnings.thisMonth.toLocaleString()}`, icon: "trending-up", color: "#7B61FF", bgColor: "#F0ECFF" },
    { label: "Last Month", value: `$${earnings.lastMonth.toLocaleString()}`, icon: "analytics", color: "#2196F3", bgColor: "#E3F2FD" },
    { label: "Pending Payouts", value: `$${earnings.pendingPayouts.toLocaleString()}`, icon: "time", color: "#FF9800", bgColor: "#FFF3E0" },
  ];

  const renderTransaction = ({ item }) => {
    const isCompleted = item.status === "COMPLETED";
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: "#F5F5F5",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: isCompleted ? "#E8F5E9" : "#FFF3E0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isCompleted ? "checkmark-circle" : "time"}
            size={22}
            color={isCompleted ? COLORS.success : COLORS.warning}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.textPrimary }}>
            {item.description}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>
            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: isCompleted ? COLORS.success : COLORS.warning }}>
            +${item.amount}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
            {isCompleted ? "Completed" : "Pending"}
          </Text>
        </View>
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
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.textPrimary }}>
          Earnings
        </Text>
      </View>

      <FlatList
        data={earnings.transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Summary Cards */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 }}>
              {summaryCards.map((card, index) => (
                <View
                  key={index}
                  style={{
                    width: "47%",
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
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: card.bgColor,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name={card.icon} size={20} color={card.color} />
                  </View>
                  <Text style={{ fontSize: 22, fontWeight: "bold", color: COLORS.textPrimary }}>
                    {card.value}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                    {card.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Transactions Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: COLORS.textPrimary }}>
                Transaction History
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="receipt-outline" size={60} color="#E0E0E0" />
            <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>No transactions yet</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

export default OwnerEarnings;
