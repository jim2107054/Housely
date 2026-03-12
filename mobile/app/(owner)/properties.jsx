import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ownerHouses } from "../../data/dummyData";

//!api calls - uncomment when connecting backend
// import api from "../../services/api";
// useEffect(() => {
//   const fetchProperties = async () => {
//     const response = await api.get('/api/houses/my-houses');
//     setProperties(response.data.houses);
//   };
//   fetchProperties();
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

const statusColors = {
  AVAILABLE: { bg: "#E8F5E9", text: "#4CAF50" },
  RENTED: { bg: "#E3F2FD", text: "#2196F3" },
  MAINTAINED: { bg: "#FFF3E0", text: "#FF9800" },
};

const OwnerProperties = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [properties] = useState(ownerHouses);

  const renderProperty = ({ item }) => {
    const statusStyle = statusColors[item.status] || statusColors.AVAILABLE;
    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/(owner)/propertyDetails", params: { id: item.id } })}
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 16,
          marginHorizontal: 20,
          marginBottom: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: item.images?.[0]?.url }}
          style={{ width: "100%", height: 180, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            backgroundColor: statusStyle.bg,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: statusStyle.text }}>
            {item.status || "AVAILABLE"}
          </Text>
        </View>
        <View style={{ padding: 14 }}>
          <Text style={{ fontSize: 17, fontWeight: "700", color: COLORS.textPrimary }} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 }} numberOfLines={1}>
              {item.city}, {item.area}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: COLORS.primary }}>
              ${item.price}<Text style={{ fontSize: 13, fontWeight: "400", color: COLORS.textSecondary }}>/night</Text>
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textPrimary, marginLeft: 3 }}>
                {item.rating}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary }}>
            My Properties
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(owner)/addProperty")}
            style={{
              backgroundColor: COLORS.primary,
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
          {properties.length} {properties.length === 1 ? "property" : "properties"} listed
        </Text>
      </View>

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderProperty}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="home-outline" size={60} color="#E0E0E0" />
            <Text style={{ fontSize: 16, color: COLORS.textSecondary, marginTop: 12 }}>
              No properties listed yet
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(owner)/addProperty")}
              style={{
                marginTop: 16,
                backgroundColor: COLORS.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Add Property</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default OwnerProperties;
