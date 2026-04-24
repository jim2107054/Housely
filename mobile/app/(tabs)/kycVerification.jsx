import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "../../services/api";

const DOC_TYPES = [
  { key: "nid", label: "National ID (NID)" },
  { key: "passport", label: "Passport" },
  { key: "driving_license", label: "Driving License" },
];

const PhotoSlot = ({ label, uri, onPick, required = true }) => (
  <TouchableOpacity
    onPress={onPick}
    className={`border-2 border-dashed rounded-2xl items-center justify-center mb-4 h-40 ${
      uri ? "border-primary bg-primary/5" : "border-border bg-cardBackground"
    }`}
  >
    {uri ? (
      <Image source={{ uri }} className="w-full h-full rounded-2xl" resizeMode="cover" />
    ) : (
      <View className="items-center">
        <Ionicons name="camera-outline" size={36} color="#A1A5C1" />
        <Text className="text-textSecondary font-poppins text-sm mt-2">{label}</Text>
        {required && (
          <Text className="text-red-400 font-poppins text-xs">(Required)</Text>
        )}
      </View>
    )}
  </TouchableOpacity>
);

const StatusBanner = ({ status }) => {
  const config = {
    PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "time-outline", label: "Under Review" },
    APPROVED: { bg: "bg-green-50", text: "text-green-700", icon: "checkmark-circle-outline", label: "Verified" },
    REJECTED: { bg: "bg-red-50", text: "text-red-700", icon: "close-circle-outline", label: "Rejected — please resubmit" },
  }[status];

  if (!config) return null;

  return (
    <View className={`flex-row items-center p-4 rounded-2xl mb-4 ${config.bg}`}>
      <Ionicons name={config.icon} size={24} color={config.text.replace("text-", "")} />
      <Text className={`font-poppins-semibold text-base ml-3 ${config.text}`}>{config.label}</Text>
    </View>
  );
};

const KYCVerification = () => {
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState(null);
  const [docType, setDocType] = useState("nid");
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    api.get("/api/kyc/status")
      .then((res) => setKycStatus(res.data.status))
      .catch(() => setKycStatus("NOT_SUBMITTED"))
      .finally(() => setLoadingStatus(false));
  }, []);

  const pickImage = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera roll access is needed to upload photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setter(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!frontPhoto || !selfie) {
      Alert.alert("Missing photos", "Please provide the document front and a selfie.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("documentType", docType);
      formData.append("documentFront", {
        uri: frontPhoto.uri,
        type: "image/jpeg",
        name: "doc_front.jpg",
      });
      if (backPhoto) {
        formData.append("documentBack", {
          uri: backPhoto.uri,
          type: "image/jpeg",
          name: "doc_back.jpg",
        });
      }
      formData.append("selfie", {
        uri: selfie.uri,
        type: "image/jpeg",
        name: "selfie.jpg",
      });

      await api.post("/api/kyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setKycStatus("PENDING");
      Alert.alert(
        "Submitted",
        "Your documents have been submitted for review. You will be notified once verified.",
      );
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6941C6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color="#252B5C" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-poppins-bold text-textPrimary">
          Identity Verification
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 py-5" showsVerticalScrollIndicator={false}>
        {/* Status banner for non-fresh states */}
        {kycStatus && kycStatus !== "NOT_SUBMITTED" && kycStatus !== "REJECTED" && (
          <StatusBanner status={kycStatus} />
        )}
        {kycStatus === "REJECTED" && <StatusBanner status="REJECTED" />}

        {kycStatus === "APPROVED" ? (
          <View className="items-center py-10">
            <Ionicons name="shield-checkmark" size={80} color="#22c55e" />
            <Text className="text-textPrimary font-poppins-bold text-xl mt-4">You're Verified!</Text>
            <Text className="text-textSecondary font-poppins text-center mt-2 px-4">
              Your identity has been verified. You can now book properties and list your own.
            </Text>
          </View>
        ) : kycStatus === "PENDING" ? (
          <View className="items-center py-10">
            <Ionicons name="hourglass-outline" size={80} color="#F59E0B" />
            <Text className="text-textPrimary font-poppins-bold text-xl mt-4">Under Review</Text>
            <Text className="text-textSecondary font-poppins text-center mt-2 px-4">
              Your documents are being reviewed. This usually takes 1–2 business days.
            </Text>
          </View>
        ) : (
          <>
            {/* Info */}
            <View className="bg-blue-50 p-4 rounded-2xl mb-5">
              <Text className="text-blue-800 font-poppins-semibold text-sm mb-1">Why verify?</Text>
              <Text className="text-blue-700 font-poppins text-sm">
                Verification builds trust between renters and owners. It's required to make bookings
                and list properties.
              </Text>
            </View>

            {/* Document type selector */}
            <Text className="text-textPrimary font-poppins-semibold text-sm mb-2">
              Document Type
            </Text>
            <View className="flex-row flex-wrap mb-4 gap-2">
              {DOC_TYPES.map((dt) => (
                <TouchableOpacity
                  key={dt.key}
                  onPress={() => setDocType(dt.key)}
                  className={`px-4 py-2 rounded-full border ${
                    docType === dt.key
                      ? "bg-primary border-primary"
                      : "bg-white border-border"
                  }`}
                >
                  <Text
                    className={`font-poppins text-sm ${
                      docType === dt.key ? "text-white" : "text-textSecondary"
                    }`}
                  >
                    {dt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Photo slots */}
            <Text className="text-textPrimary font-poppins-semibold text-sm mb-3">
              Upload Documents
            </Text>

            <PhotoSlot
              label="Document Front"
              uri={frontPhoto?.uri}
              onPick={() => pickImage(setFrontPhoto)}
              required
            />
            <PhotoSlot
              label="Document Back (optional for passport)"
              uri={backPhoto?.uri}
              onPick={() => pickImage(setBackPhoto)}
              required={false}
            />
            <PhotoSlot
              label="Selfie (face clearly visible)"
              uri={selfie?.uri}
              onPick={() => pickImage(setSelfie)}
              required
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-2xl items-center mt-2 mb-8 ${
                submitting ? "bg-gray-300" : "bg-primary"
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-poppins-bold text-base">Submit for Verification</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default KYCVerification;
