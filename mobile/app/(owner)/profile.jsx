import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useAuthStore from "../../store/authStore";

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  danger: "#F44336",
};

const menuItems = [
  { icon: "cash-outline", label: "Earnings", route: "/(owner)/earnings", color: "#4CAF50" },
  { icon: "star-outline", label: "Reviews", route: "/(owner)/reviews", color: "#FFC107" },
  { icon: "settings-outline", label: "Settings", route: "/(owner)/settings", color: "#607D8B" },
  { icon: "create-outline", label: "Edit Profile", route: "/(owner)/editProfile", color: "#2196F3" },
];

const OwnerProfile = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/roleSelection");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 10,
            paddingBottom: 30,
            backgroundColor: COLORS.primary,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 16 }}>
            My Profile
          </Text>
          <Image
            source={{
              uri: user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg",
            }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              borderWidth: 3,
              borderColor: "#fff",
            }}
          />
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff", marginTop: 12 }}>
            {user?.name || "House Owner"}
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
            {user?.email || "owner@housely.com"}
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              House Owner
            </Text>
          </View>
        </View>

        {/* Menu */}
        <View style={{ padding: 20 }}>
          <View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${item.color}15`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 14,
                    fontSize: 16,
                    fontWeight: "500",
                    color: COLORS.textPrimary,
                  }}
                >
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFF5F5",
              borderRadius: 16,
              paddingVertical: 16,
              marginTop: 20,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600", color: COLORS.danger }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default OwnerProfile;
