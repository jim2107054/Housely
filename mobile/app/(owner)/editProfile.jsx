import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import useAuthStore from "../../store/authStore";
import api from "../../services/api";

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  border: "#E8E8E8",
};

// Moved InputField outside to prevent re-creation and focus loss
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

const OwnerEditProfile = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Permission Needed", text2: "Cameral roll permission is required" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleUploadAvatar = async (uri) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
        type: "image/jpeg",
        name: "avatar.jpg",
      });

      const response = await api.post("/api/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setUser(response.data.user);
        Toast.show({ type: "success", text1: "Avatar Updated" });
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      Toast.show({ type: "error", text1: "Upload Failed", text2: "Failed to upload avatar" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Name and email are required" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch("/api/users/me", form);
      if (response.data.success) {
        setUser(response.data.user);
        Toast.show({ type: "success", text1: "Profile Updated" });
        router.back();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      Toast.show({ type: "error", text1: "Update Failed", text2: "Please try again later." });
    } finally {
      setLoading(false);
    }
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
                source={
                  user?.avatar 
                    ? { uri: user.avatar } 
                    : require("../../assets/images/profile-icons/profile.png")
                }
                style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee' }}
              />
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={uploadingAvatar}
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
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="camera" size={16} color="#fff" />
                )}
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
            value={form.phoneNumber}
            onChangeText={(v) => updateForm("phoneNumber", v)}
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
            disabled={loading}
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
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OwnerEditProfile;
