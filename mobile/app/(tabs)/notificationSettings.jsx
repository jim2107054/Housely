import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Design Tokens
const COLORS = {
  primary: '#7B61FF',
  background: '#FFFFFF',
  screenBackground: '#F5F5F5',
  textPrimary: '#1A1A1A',
  textSecondary: '#9E9E9E',
  border: '#F0F0F0',
};

const NotificationSettings = () => {
  const router = useRouter();
  
  // Notification States
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    bookingUpdates: true,
    promotions: false,
    newListings: true,
    priceDrops: true,
    messages: true,
    reviews: true,
    paymentAlerts: true,
    securityAlerts: true,
    newsletter: false,
    tips: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Setting Item Component
  const SettingItem = ({ icon, title, description, settingKey, isLast }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: '#F5F4F8',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>
          {title}
        </Text>
        {description && (
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
        trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  // Section Header Component
  const SectionHeader = ({ title }) => (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.screenBackground }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: COLORS.background,
          position: 'relative',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            left: 16,
            padding: 8,
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: COLORS.textPrimary,
          }}
        >
          Notification Settings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* General Section */}
        <SectionHeader title="General" />
        <View style={{ backgroundColor: COLORS.background, borderRadius: 12, marginHorizontal: 16 }}>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive notifications on your device"
            settingKey="pushNotifications"
            isLast={false}
          />
          <SettingItem
            icon="mail"
            title="Email Notifications"
            description="Get updates via email"
            settingKey="emailNotifications"
            isLast={true}
          />
        </View>

        {/* Booking Section */}
        <SectionHeader title="Bookings & Reservations" />
        <View style={{ backgroundColor: COLORS.background, borderRadius: 12, marginHorizontal: 16 }}>
          <SettingItem
            icon="calendar"
            title="Booking Updates"
            description="Status changes, confirmations"
            settingKey="bookingUpdates"
            isLast={false}
          />
          <SettingItem
            icon="chatbubble"
            title="Messages"
            description="New messages from hosts"
            settingKey="messages"
            isLast={false}
          />
          <SettingItem
            icon="star"
            title="Reviews"
            description="Review requests and responses"
            settingKey="reviews"
            isLast={true}
          />
        </View>

        {/* Deals Section */}
        <SectionHeader title="Deals & Recommendations" />
        <View style={{ backgroundColor: COLORS.background, borderRadius: 12, marginHorizontal: 16 }}>
          <SettingItem
            icon="pricetag"
            title="Promotions"
            description="Special offers and discounts"
            settingKey="promotions"
            isLast={false}
          />
          <SettingItem
            icon="home"
            title="New Listings"
            description="Properties in your saved areas"
            settingKey="newListings"
            isLast={false}
          />
          <SettingItem
            icon="trending-down"
            title="Price Drops"
            description="Price changes on saved properties"
            settingKey="priceDrops"
            isLast={true}
          />
        </View>

        {/* Security Section */}
        <SectionHeader title="Account & Security" />
        <View style={{ backgroundColor: COLORS.background, borderRadius: 12, marginHorizontal: 16 }}>
          <SettingItem
            icon="card"
            title="Payment Alerts"
            description="Payment confirmations and issues"
            settingKey="paymentAlerts"
            isLast={false}
          />
          <SettingItem
            icon="shield-checkmark"
            title="Security Alerts"
            description="Login attempts and account changes"
            settingKey="securityAlerts"
            isLast={true}
          />
        </View>

        {/* Other Section */}
        <SectionHeader title="Other" />
        <View style={{ backgroundColor: COLORS.background, borderRadius: 12, marginHorizontal: 16, marginBottom: 100 }}>
          <SettingItem
            icon="newspaper"
            title="Newsletter"
            description="Weekly digest and travel tips"
            settingKey="newsletter"
            isLast={false}
          />
          <SettingItem
            icon="bulb"
            title="Tips & Tutorials"
            description="App usage tips and guides"
            settingKey="tips"
            isLast={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettings;
