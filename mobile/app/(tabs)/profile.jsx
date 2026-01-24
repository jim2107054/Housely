import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import useAuthStore from '../../store/authStore'
import Toast from 'react-native-toast-message'

const Profile = () => {
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      id: 1,
      title: 'Settings',
      iconName: 'settings-outline',
      onPress: () => console.log('Settings pressed')
    },
    {
      id: 2,
      title: 'Payment',
      iconName: 'wallet-outline',
      onPress: () => console.log('Payment pressed')
    },
    {
      id: 3,
      title: 'Notification',
      iconName: 'notifications-outline',
      onPress: () => console.log('Notification pressed')
    },
    {
      id: 4,
      title: 'Recent Viewed',
      iconName: 'time-outline',
      onPress: () => console.log('Recent Viewed pressed')
    },
    {
      id: 5,
      title: 'About',
      iconName: 'information-circle-outline',
      onPress: () => console.log('About pressed')
    }
  ]

  const handleSignOut = async () => {
    try {
      await logout();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
        position: 'top',
        visibilityTime: 2000,
      });
      setTimeout(() => {
        router.replace('/(auth)');
      }, 500);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to logout. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
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
          Profile
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Section */}
        <View className="items-center py-8 px-4">
          {/* Profile Image with Edit Icon */}
          <TouchableOpacity 
            onPress={() => router.push("(tabs)/editProfile")}
            className="relative mb-4"
          >
            <Image
              source={require('../../assets/images/profileImage.png')}
              className="w-[100px] h-[100px] rounded-full"
            />
            <View className="absolute bottom-0 right-0 bg-[#6C5CE7] rounded-[15px] w-[30px] h-[30px] justify-center items-center border-2 border-white">
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* User Info */}
          <Text className="text-lg font-semibold text-black mb-1">
            {user?.username || 'Guest User'}
          </Text>
          <Text className="text-sm text-[#888] mb-2">
            {user?.email || 'No email'}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-2 bg-[#F5F5F5]" />

        {/* Menu Items */}
        <View className="px-4 py-2">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className={`flex-row items-center py-4 ${index < menuItems.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
            >
              <View className="w-10 h-10 justify-center items-center">
                <Ionicons name={item.iconName} size={24} color="#6C5CE7" />
              </View>
              <Text className="flex-1 text-base text-black ml-3">
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          className="items-center py-6 mt-4"
        >
          <Text className="text-base font-medium text-[#FF5252]">
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile