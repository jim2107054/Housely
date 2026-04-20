import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useState } from "react";
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

const OwnerSettings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);

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

  const SettingRow = ({ icon, label, value, onValueChange, isSwitch = true }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
      }}
    >
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={{ flex: 1, marginLeft: 14, fontSize: 16, color: COLORS.textPrimary }}>
        {label}
      </Text>
      {isSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#E0E0E0", true: COLORS.primary }}
        />
      )}
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
        <Text style={{ fontSize: 20, fontWeight: "bold", color: COLORS.textPrimary }}>
          Settings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: COLORS.textSecondary,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Notifications
        </Text>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, overflow: "hidden" }}>
          <SettingRow
            icon="notifications-outline"
            label="Push Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingRow
            icon="mail-outline"
            label="Email Notifications"
            value={emailNotifs}
            onValueChange={setEmailNotifs}
          />
          <SettingRow
            icon="calendar-outline"
            label="Booking Alerts"
            value={bookingAlerts}
            onValueChange={setBookingAlerts}
          />
        </View>

        {/* Account Section */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: COLORS.textSecondary,
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Account
        </Text>
        <View style={{ backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 20, overflow: "hidden" }}>
          <TouchableOpacity
            onPress={() => router.push("/(owner)/editProfile")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#F5F5F5",
            }}
          >
            <Ionicons name="person-outline" size={22} color={COLORS.primary} />
            <Text style={{ flex: 1, marginLeft: 14, fontSize: 16, color: COLORS.textPrimary }}>
              Edit Profile
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}
          >
            <Ionicons name="lock-closed-outline" size={22} color={COLORS.primary} />
            <Text style={{ flex: 1, marginLeft: 14, fontSize: 16, color: COLORS.textPrimary }}>
              Change Password
            </Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF5F5",
            borderRadius: 16,
            paddingVertical: 16,
            marginHorizontal: 20,
            marginTop: 30,
            marginBottom: 40,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: "600", color: COLORS.danger }}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OwnerSettings;
