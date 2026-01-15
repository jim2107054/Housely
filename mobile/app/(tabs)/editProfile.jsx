import { View, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: 'Brooklyn Simmons',
    username: 'Brooklynsim',
    email: 'brooklynsim@gmail.com',
    dateOfBirth: 'November/21/1992'
  })

  const router = useRouter()

  const handleSaveChanges = () => {
    console.log('Save changes:', formData)
    // Add save logic here
    router.back()
  }

  const handleDatePress = () => {
    console.log('Open date picker')
    // Add date picker logic here
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
              source={require('../../assets/images/profileImage.png')}
              className="w-[100px] h-[100px] rounded-full"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-[#6C5CE7] rounded-[15px] w-[30px] h-[30px] justify-center items-center border-2 border-white"
              onPress={() => console.log('Change profile picture')}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Section */}
        <View className="px-4">
          {/* Full Name */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-black mb-2">
              Text Form
            </Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              className="bg-white border border-[#E0E0E0] rounded-lg px-4 py-3.5 text-base text-black"
              placeholder="Enter your name"
            />
          </View>

          {/* Username */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-black mb-2">
              Username
            </Text>
            <TextInput
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              className="bg-white border border-[#E0E0E0] rounded-lg px-4 py-3.5 text-base text-black"
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-black mb-2">
              Email
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              className="bg-white border border-[#E0E0E0] rounded-lg px-4 py-3.5 text-base text-black"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

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
                {formData.dateOfBirth}
              </Text>
              <Ionicons name="calendar-outline" size={24} color="#6C5CE7" />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveChanges}
            className="bg-[#6C5CE7] rounded-lg py-4 items-center mb-8"
          >
            <Text className="text-base font-semibold text-white">
              Save Change
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default EditProfile
