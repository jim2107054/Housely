import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import useAuthStore from "../../store/authStore";

//!api calls - uncomment when connecting backend
// import api from "../../services/api";
// const handleSave = async () => {
//   const response = await api.put('/api/users/profile', form);
//   if (response.data) setUser(response.data.user);
// };

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  border: "#E8E8E8",
};

const OwnerEditProfile = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    bio: user?.bio || "",
  });

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.name || !form.email) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Name and email are required" });
      return;
    }
    // Update local store
    setUser({ ...user, name: form.name, email: form.email, phoneNumber: form.phone, bio: form.bio });
    Toast.show({ type: "success", text1: "Profile Updated" });
    router.back();
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType, multiline }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          backgroundColor: "#F8F8F8",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 15,
          color: COLORS.textPrimary,
          borderWidth: 1,
          borderColor: COLORS.border,
          ...(multiline && { minHeight: 100 }),
        }}
      />
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
          Edit Profile
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {/* Avatar */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View style={{ position: "relative" }}>
              <Image
                source={{
                  uri: user?.avatar || "https://randomuser.me/api/portraits/women/44.jpg",
                }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: COLORS.primary,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "#fff",
                }}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <InputField
            label="Full Name"
            value={form.name}
            onChangeText={(v) => updateForm("name", v)}
            placeholder="Your full name"
          />
          <InputField
            label="Email"
            value={form.email}
            onChangeText={(v) => updateForm("email", v)}
            placeholder="your@email.com"
            keyboardType="email-address"
          />
          <InputField
            label="Phone"
            value={form.phone}
            onChangeText={(v) => updateForm("phone", v)}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
          />
          <InputField
            label="Bio"
            value={form.bio}
            onChangeText={(v) => updateForm("bio", v)}
            placeholder="Tell tenants about yourself..."
            multiline
          />

          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OwnerEditProfile;
