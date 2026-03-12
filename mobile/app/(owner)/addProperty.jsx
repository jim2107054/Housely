import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

//!api calls - uncomment when connecting backend
// import api from "../../services/api";
// import * as ImagePicker from "expo-image-picker";
// const handleSubmit = async () => {
//   const formData = new FormData();
//   Object.keys(form).forEach(key => formData.append(key, form[key]));
//   images.forEach((img, i) => {
//     formData.append('images', { uri: img, name: `image_${i}.jpg`, type: 'image/jpeg' });
//   });
//   const response = await api.post('/api/houses', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// };

const COLORS = {
  primary: "#7B61FF",
  background: "#FAFBFF",
  card: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#9E9E9E",
  border: "#E8E8E8",
};

const PROPERTY_TYPES = ["APARTMENT", "PENTHOUSE", "HOTEL", "VILLA", "STUDIO", "DUPLEX", "TOWNHOUSE", "CONDO"];
const LISTING_TYPES = ["RENT", "SALE"];

const AddProperty = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    propertyType: "APARTMENT",
    listingType: "RENT",
    address: "",
    city: "",
    area: "",
    rentPerMonth: "",
    salePrice: "",
    bedrooms: "1",
    bathrooms: "1",
    sizeInSqft: "",
    buildYear: "",
    hasWifi: false,
    hasWater: true,
  });

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickImages = () => {
    // Placeholder for image picker
    const placeholderImages = [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    ];
    setImages(placeholderImages);
    Toast.show({ type: "info", text1: "Image Added", text2: "Placeholder image added" });
  };

  const handleSubmit = () => {
    if (!form.name || !form.address || !form.city) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill in all required fields" });
      return;
    }
    Toast.show({ type: "success", text1: "Property Added", text2: "Your property has been listed successfully" });
    router.back();
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType, required }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 6 }}>
        {label} {required && <Text style={{ color: "#F44336" }}>*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        keyboardType={keyboardType || "default"}
        style={{
          backgroundColor: "#F8F8F8",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 15,
          color: COLORS.textPrimary,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      />
    </View>
  );

  const ChipSelector = ({ label, options, selected, onSelect }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: isSelected ? COLORS.primary : "#F0F0F0",
                borderWidth: 1,
                borderColor: isSelected ? COLORS.primary : COLORS.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: isSelected ? "#fff" : COLORS.textSecondary,
                }}
              >
                {opt.charAt(0) + opt.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
          Add Property
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
          {/* Images */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 }}>
            Property Images
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            <TouchableOpacity
              onPress={pickImages}
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: COLORS.border,
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="camera-outline" size={28} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>
                Add Photo
              </Text>
            </TouchableOpacity>
            {images.map((img, index) => (
              <View key={index} style={{ marginRight: 10, position: "relative" }}>
                <Image source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 12 }} />
                <TouchableOpacity
                  onPress={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#F44336",
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Basic Info */}
          <InputField
            label="Property Name"
            value={form.name}
            onChangeText={(v) => updateForm("name", v)}
            placeholder="e.g. Sunset Villa"
            required
          />
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 6 }}>
              Description
            </Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => updateForm("description", v)}
              placeholder="Describe your property..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                backgroundColor: "#F8F8F8",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: COLORS.textPrimary,
                borderWidth: 1,
                borderColor: COLORS.border,
                minHeight: 100,
              }}
            />
          </View>

          {/* Type */}
          <ChipSelector
            label="Property Type"
            options={PROPERTY_TYPES}
            selected={form.propertyType}
            onSelect={(v) => updateForm("propertyType", v)}
          />
          <ChipSelector
            label="Listing Type"
            options={LISTING_TYPES}
            selected={form.listingType}
            onSelect={(v) => updateForm("listingType", v)}
          />

          {/* Pricing */}
          {form.listingType === "RENT" ? (
            <InputField
              label="Rent Per Month ($)"
              value={form.rentPerMonth}
              onChangeText={(v) => updateForm("rentPerMonth", v)}
              placeholder="e.g. 1500"
              keyboardType="numeric"
              required
            />
          ) : (
            <InputField
              label="Sale Price ($)"
              value={form.salePrice}
              onChangeText={(v) => updateForm("salePrice", v)}
              placeholder="e.g. 250000"
              keyboardType="numeric"
              required
            />
          )}

          {/* Location */}
          <InputField
            label="Address"
            value={form.address}
            onChangeText={(v) => updateForm("address", v)}
            placeholder="Full address"
            required
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="City"
                value={form.city}
                onChangeText={(v) => updateForm("city", v)}
                placeholder="City"
                required
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Area"
                value={form.area}
                onChangeText={(v) => updateForm("area", v)}
                placeholder="Area"
              />
            </View>
          </View>

          {/* Details */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Bedrooms"
                value={form.bedrooms}
                onChangeText={(v) => updateForm("bedrooms", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Bathrooms"
                value={form.bathrooms}
                onChangeText={(v) => updateForm("bathrooms", v)}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Size (sqft)"
                value={form.sizeInSqft}
                onChangeText={(v) => updateForm("sizeInSqft", v)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="Build Year"
                value={form.buildYear}
                onChangeText={(v) => updateForm("buildYear", v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Amenities */}
          <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 12 }}>
            Amenities
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="wifi" size={20} color={COLORS.primary} />
              <Text style={{ marginLeft: 10, fontSize: 15, color: COLORS.textPrimary }}>WiFi</Text>
            </View>
            <Switch
              value={form.hasWifi}
              onValueChange={(v) => updateForm("hasWifi", v)}
              trackColor={{ false: "#E0E0E0", true: COLORS.primary }}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="water" size={20} color="#2196F3" />
              <Text style={{ marginLeft: 10, fontSize: 15, color: COLORS.textPrimary }}>Water</Text>
            </View>
            <Switch
              value={form.hasWater}
              onValueChange={(v) => updateForm("hasWater", v)}
              trackColor={{ false: "#E0E0E0", true: "#2196F3" }}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>List Property</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddProperty;
