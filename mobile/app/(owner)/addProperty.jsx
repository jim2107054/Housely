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
import api from "../../services/api";
import { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";

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

// Extracted components to prevent re-renders and focus loss
const InputField = ({ label, value, onChangeText, placeholder, keyboardType, required, multiline, numberOfLines }) => (
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
      multiline={multiline}
      numberOfLines={numberOfLines}
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

const AddProperty = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const insets = useSafeAreaInsets();
  
  const [images, setImages] = useState([]); // Array of strings (URLs)
  const [video, setVideo] = useState(null); // String (URL)
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    buildYear: "2024",
    hasWifi: false,
    hasWater: true,
  });

  useEffect(() => {
    if (isEditing) {
      const fetchProperty = async () => {
        setFetching(true);
        try {
          const response = await api.get(`/api/houses/${id}`);
          const p = response.data.house;
          setForm({
            name: p.name,
            description: p.description || "",
            propertyType: p.propertyType,
            listingType: p.listingType,
            address: p.address,
            city: p.city,
            area: p.area || "",
            rentPerMonth: p.rentPerMonth?.toString() || "",
            salePrice: p.salePrice?.toString() || "",
            bedrooms: p.bedrooms.toString(),
            bathrooms: p.bathrooms.toString(),
            sizeInSqft: p.sizeInSqft?.toString() || "",
            buildYear: p.buildYear?.toString() || "2024",
            hasWifi: p.hasWifi,
            hasWater: p.hasWater,
          });
          setImages(p.images?.map(img => img.url) || []);
          setVideo(p.video?.url || null);
        } catch (err) {
          console.error('Error fetching property for edit:', err);
          Toast.show({ type: "error", text1: "Error", text2: "Could not load property details" });
        } finally {
          setFetching(false);
        }
      };
      fetchProperty();
    }
  }, [id]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: "error", text1: "Permission Denied", text2: "Cameral roll permission is required" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUploadMedia(result.assets, 'image');
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: "error", text1: "Permission Denied", text2: "Cameral roll permission is required" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUploadMedia([result.assets[0]], 'video');
    }
  };

  const handleUploadMedia = async (assets, type) => {
    setUploading(true);
    try {
      const formData = new FormData();
      assets.forEach((asset, index) => {
        formData.append('files', {
          uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
          type: type === 'image' ? 'image/jpeg' : 'video/mp4',
          name: `${type}_${index}_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
        });
      });

      const response = await api.post('/api/houses/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const newUrls = response.data.urls.map(u => u.url);
        if (type === 'image') {
          setImages(prev => [...prev, ...newUrls]);
        } else {
          setVideo(newUrls[0]);
        }
        Toast.show({ type: "success", text1: "Upload Success", text2: "Media uploaded to Cloudinary" });
      }
    } catch (err) {
      console.error('Error uploading media:', err);
      Toast.show({ type: "error", text1: "Upload Failed", text2: "Could not upload media" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.address || !form.city || (form.listingType === 'RENT' && !form.rentPerMonth) || (form.listingType === 'SALE' && !form.salePrice)) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        propertyType: form.propertyType,
        listingType: form.listingType,
        address: form.address,
        city: form.city,
        area: form.area,
        rentPerMonth: form.listingType === 'RENT' ? parseFloat(form.rentPerMonth) : null,
        salePrice: form.listingType === 'SALE' ? parseFloat(form.salePrice) : null,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        sizeInSqft: parseFloat(form.sizeInSqft) || 0,
        buildYear: parseInt(form.buildYear) || 2024,
        status: 'AVAILABLE',
        images: images.map((url, i) => ({ url, order: i })),
        video: video ? { url: video } : null,
        publicFacilities: {
          wifi: form.hasWifi,
          water: form.hasWater,
          electricity: true,
          parking: true,
        }
      };

      if (isEditing) {
        await api.patch(`/api/houses/${id}`, payload);
        Toast.show({ type: "success", text1: "Property Updated", text2: "Your listing has been updated successfully" });
      } else {
        await api.post('/api/houses', payload);
        Toast.show({ type: "success", text1: "Property Added", text2: "Your listing is now live" });
      }
      router.back();
    } catch (err) {
      console.error('Error submitting property:', err);
      Toast.show({ type: "error", text1: "Submission Failed", text2: err.response?.data?.message || "Please check your network and try again" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
          {isEditing ? "Edit Property" : "Add Property"}
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
          {/* Images Section */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary }}>
                Property Images
              </Text>
              {uploading && <ActivityIndicator size="small" color={COLORS.primary} />}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={pickImages}
                disabled={uploading}
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
                  backgroundColor: '#fff'
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
          </View>

          {/* Video Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 10 }}>
              Property Video (Optional)
            </Text>
            {video ? (
              <View style={{ width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                <Video
                  source={{ uri: video }}
                  style={{ width: '100%', height: '100%' }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />
                <TouchableOpacity
                  onPress={() => setVideo(null)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickVideo}
                disabled={uploading}
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: COLORS.border,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: '#fff'
                }}
              >
                <Ionicons name="videocam-outline" size={32} color={COLORS.textSecondary} />
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
                  Upload Property Video
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Basic Info */}
          <InputField
            label="Property Name"
            value={form.name}
            onChangeText={(v) => updateForm("name", v)}
            placeholder="e.g. Sunset Villa"
            required
          />
          
          <InputField
            label="Description"
            value={form.description}
            onChangeText={(v) => updateForm("description", v)}
            placeholder="Describe your property..."
            multiline
            numberOfLines={4}
          />

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
            disabled={loading || uploading}
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
              opacity: (loading || uploading) ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>
                {isEditing ? "Update Property" : "List Property"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddProperty;
