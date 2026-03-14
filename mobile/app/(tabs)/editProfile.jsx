import { View, Text, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import useAuthStore from '../../store/authStore'
import api from '../../services/api';
import Toast from 'react-native-toast-message';

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize }) => (
  <View className="mb-5">
    <Text className="text-sm font-medium text-black mb-2">
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      className="bg-white border border-[#E0E0E0] rounded-lg px-4 py-3.5 text-base text-black"
      placeholder={placeholder}
      keyboardType={keyboardType || "default"}
      autoCapitalize={autoCapitalize || "none"}
    />
  </View>
);

const EditProfile = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : ''
  })
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const router = useRouter()

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Permission to access media library is required' });
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
      const body = new FormData();
      body.append('avatar', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      const response = await api.post('/api/users/me/avatar', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setUser(response.data.user);
        Toast.show({ type: 'success', text1: 'Avatar Updated' });
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: 'Failed to upload profile picture' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData.name || !formData.email) {
      Toast.show({ type: "error", text1: "Missing Fields", text2: "Name and email are required" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/api/users/me', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      });
      if (response.data.success) {
        setUser(response.data.user);
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile has been updated successfully',
        });
        router.back();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDatePress = () => {
    console.log('Open date picker')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 py-3 relative">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute left-4 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-black">
          Edit Profile
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Image Section */}
        <View className="items-center py-8 px-4">
          <View className="relative">
            <Image
              source={user?.avatar ? { uri: user.avatar } : require('../../assets/images/profileImage.png')}
              className="w-[100px] h-[100px] rounded-full bg-gray-100"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-[#6C5CE7] rounded-[15px] w-[30px] h-[30px] justify-center items-center border-2 border-white"
              onPress={handlePickImage}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-4">
          <InputField
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter your name"
            autoCapitalize="words"
          />

          <InputField
            label="Username"
            value={formData.username}
            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
            placeholder="Enter your username"
          />

          <InputField
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          {/* Date of Birth */}
          <View className="mb-8">
            <Text className="text-sm font-medium text-black mb-2">
              Date of birth
            </Text>
            <TouchableOpacity
              onPress={handleDatePress}
              className="bg-white border border-[#E0E0E0] rounded-lg px-4 py-3.5 flex-row items-center justify-between"
            >
              <Text className="text-base text-black">
                {formData.dateOfBirth || "Select Date"}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#6C5CE7" />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveChanges}
            disabled={loading}
            className="bg-[#6C5CE7] rounded-lg py-4 items-center mb-8 flex-row justify-center"
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-base font-semibold text-white">
                Save Change
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default EditProfile
