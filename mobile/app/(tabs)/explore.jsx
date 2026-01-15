import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import useAuthStore from "../../store/authStore";
import axios from "axios";
import { API_URL } from "../../config";

const Create = () => {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null); //! to display image preview
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState(null); //! to send to backend

  const router = useRouter();
  const { token } = useAuthStore();

  // Image picker function
  const pickImage = async () => {
    try {
      //! request permission and pick image
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("parmission:", status);
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Sorry, we need camera roll permissions to make this work!"
          );
          return;
        }
      }

      //! launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true, //! allow user to edit image
        aspect: [4, 3],
        quality: 0.5, //! image quality, 1 is highest and 0 is lowest
        base64: true, //! include base64 data
      });

      console.log(result);

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          //! otherwise, convert to base64
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            { encoding: FileSystem.EncodingType.Base64 }
          );
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "An error occurred while picking the image.");
    }
  };
  const handleSubmit = async () => {
    if (!title || !caption || !rating || !imageBase64) {
      Alert.alert("Error", "Please fill in all fields and select an image.");
      return;
    }
    try {
      setLoading(true);

      //get file extension from URI or default to jpeg
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

      const response = await axios.post(
        `${API_URL}/api/books/create`,
        {
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        Alert.alert("Success", "Book submitted successfully!");
        setTitle("");
        setCaption("");
        setRating(0);
        setImage(null);
        setImageBase64(null);
        setLoading(false);
        router.replace("/");
      } else {
        Alert.alert("Error", data.message || "Failed to submit the book.");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      Alert.alert("Error", "An error occurred while submitting the book.");
    }
  };

  const renderingRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Ionicons
            name={rating >= i ? "star" : "star-outline"}
            size={24}
            color={rating >= i ? "gold" : "gray"}
          />
        </TouchableOpacity>
      );
    }
    return <View className="flex flex-row gap-4">{stars}</View>;
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 52 }}
        className="w-full px-2 py-8 bg-primary/25"
        showsVerticalScrollIndicator={true}
      >
        <View className="w-full px-5 py-2 rounded-lg flex flex-col shadow-green-800 bg-white items-center pb-10">
          <View className="w-full my-4 items-center">
            <Text className="text-gray-900 text-2xl font-bold">
              Create Book
            </Text>
            <Text className="text-gray-900 text-base mb-2">
              share your favorite books with the community
            </Text>
          </View>
          {/*Form data*/}
          <View className="w-full flex flex-col ">
            {/* Title Input */}
            <View className="w-full mb-6">
              <Text className="text-gray-700 mb-2">Book Title</Text>
              {/* Input field for title */}
              <View className="w-full relative">
                <Ionicons
                  name="book-outline"
                  size={20}
                  color="gray"
                  className="absolute top-4 left-3"
                />
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter book title"
                  className="border border-gray-300 rounded px-3 py-4 pl-10"
                />
              </View>
            </View>
            <View className="w-full mb-6">
              <Text className="text-gray-700 mb-2">Your Rating</Text>
              {/* Rating related function*/}
              {renderingRatingPicker()}
            </View>
            {/* Image */}
            <View className="w-full mb-6">
              <Text className="text-gray-700 mb-2">Book Image</Text>
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg justify-center items-center mb-4"
              >
                {image ? (
                  <View className="w-full h-full">
                    <Image
                      source={{ uri: image }}
                      className="w-full h-full rounded-lg"
                    />
                  </View>
                ) : (
                  <View className="justify-center items-center">
                    <Ionicons name="image-outline" size={48} color="gray" />
                    <Text className="text-gray-500 mt-2">
                      Tap to select an image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/* Caption Input */}
            <View className="w-full mb-6">
              <Text className="text-gray-700 mb-2">Caption</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Write a review or thoughts about the book..."
                className="border border-gray-300 rounded px-3 py-2 h-24"
                multiline
              />
            </View>
            {/* Submit Button */}
            <TouchableOpacity
              disabled={loading}
              onPress={handleSubmit}
              className="bg-green-500 rounded-lg py-3 items-center"
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex flex-row items-center gap-2">
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white text-lg font-semibold mt-1">
                    Submit
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Create;
