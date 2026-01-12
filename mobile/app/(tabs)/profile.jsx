import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import COLORS from '../../constants/colors'

const Profile = () => {
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

  const handleSignOut = () => {
    console.log('Sign out pressed')
    // Add sign out logic here
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: 'relative'
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            left: 16,
            padding: 8
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.black
        }}>
          Profile
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Section */}
        <View style={{
          alignItems: 'center',
          paddingVertical: 32,
          paddingHorizontal: 16
        }}>
          {/* Profile Image with Edit Icon */}
          <View style={{ position: 'relative', marginBottom: 16 }}>
            <Image
              source={require('../../assets/images/profileImage.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50
              }}
            />
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#6C5CE7',
              borderRadius: 15,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: COLORS.white
            }}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </View>

          {/* User Info */}
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.black,
            marginBottom: 4
          }}>
            Brooklyn Simmons
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#888',
            marginBottom: 8
          }}>
            brooklynsim@gmail.com
          </Text>
        </View>

        {/* Divider */}
        <View style={{
          height: 8,
          backgroundColor: '#F5F5F5'
        }} />

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: '#F0F0F0'
              }}
            >
              <View style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Ionicons name={item.iconName} size={24} color="#6C5CE7" />
              </View>
              <Text style={{
                flex: 1,
                fontSize: 16,
                color: COLORS.black,
                marginLeft: 12
              }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            alignItems: 'center',
            paddingVertical: 24,
            marginTop: 16
          }}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#FF5252'
          }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile