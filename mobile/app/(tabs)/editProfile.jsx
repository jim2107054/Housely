import { View, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import CalendarIcon from '../../assets/images/profile-icons/Calendar.svg'
import COLORS from '../../constants/colors'

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
    // router.back()
  }

  const handleDatePress = () => {
    console.log('Open date picker')
    // Add date picker logic here
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
          Edit Profile
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Profile Image Section */}
        <View style={{
          alignItems: 'center',
          paddingVertical: 32,
          paddingHorizontal: 16
        }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={require('../../assets/images/profileImage.png')}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50
              }}
            />
            <TouchableOpacity
              style={{
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
              }}
              onPress={() => console.log('Change profile picture')}
            >
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Section */}
        <View style={{ paddingHorizontal: 16 }}>
          {/* Full Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: 8
            }}>
              Text Form
            </Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: COLORS.black
              }}
              placeholder="Enter your name"
            />
          </View>

          {/* Username */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: 8
            }}>
              Username
            </Text>
            <TextInput
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: COLORS.black
              }}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: 8
            }}>
              Email
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: COLORS.black
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Date of Birth */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: COLORS.black,
              marginBottom: 8
            }}>
              Date of birth
            </Text>
            <TouchableOpacity
              onPress={handleDatePress}
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Text style={{
                fontSize: 16,
                color: COLORS.black
              }}>
                {formData.dateOfBirth}
              </Text>
              <CalendarIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveChanges}
            style={{
              backgroundColor: '#6C5CE7',
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 32
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: COLORS.white
            }}>
              Save Change
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default EditProfile
