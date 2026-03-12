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
  destructive: '#FF5252',
};

const Settings = () => {
  const router = useRouter();

  // Toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  // Menu Item Component with optional switch
  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true, hasSwitch = false, switchValue, onSwitchChange, destructive = false }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={hasSwitch}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: COLORS.background,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: destructive ? '#FFEBEE' : '#F5F4F8',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Ionicons name={icon} size={20} color={destructive ? COLORS.destructive : COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: destructive ? COLORS.destructive : COLORS.textPrimary }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E0E0E0', true: '#D4CCFF' }}
          thumbColor={switchValue ? COLORS.primary : '#FFFFFF'}
          ios_backgroundColor="#E0E0E0"
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );

  // Divider Component
  const Divider = () => (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
      }}
    />
  );

  // Section Header Component
  const SectionHeader = ({ title }) => (
    <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: COLORS.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
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
          Settings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => router.push('/(tabs)/editProfile')}
          />
          <Divider />
          <MenuItem
            icon="key-outline"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => router.push('/(auth)/changePassword')}
          />
          <Divider />
          <MenuItem
            icon="finger-print-outline"
            title="Biometric Login"
            subtitle="Use fingerprint or face ID"
            hasSwitch
            switchValue={biometric}
            onSwitchChange={setBiometric}
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Receive push notifications"
            hasSwitch
            switchValue={pushNotifications}
            onSwitchChange={setPushNotifications}
          />
          <Divider />
          <MenuItem
            icon="mail-outline"
            title="Email Notifications"
            subtitle="Receive email updates"
            hasSwitch
            switchValue={emailNotifications}
            onSwitchChange={setEmailNotifications}
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            hasSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          <Divider />
          <MenuItem
            icon="language-outline"
            title="Language"
            subtitle="English (US)"
            onPress={() => {}}
          />
          <Divider />
          <MenuItem
            icon="location-outline"
            title="Location Services"
            subtitle="Manage location permissions"
            onPress={() => {}}
          />
        </View>

        {/* Privacy & Security Section */}
        <SectionHeader title="Privacy & Security" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Settings"
            subtitle="Manage your data privacy"
            onPress={() => {}}
          />
          <Divider />
          <MenuItem
            icon="lock-closed-outline"
            title="Security"
            subtitle="Account security options"
            onPress={() => {}}
          />
          <Divider />
          <MenuItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="View terms and conditions"
            onPress={() => {}}
          />
        </View>

        {/* Data Section */}
        <SectionHeader title="Data & Storage" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="cloud-download-outline"
            title="Download Data"
            subtitle="Export your account data"
            onPress={() => {}}
          />
          <Divider />
          <MenuItem
            icon="trash-outline"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={() => {}}
          />
        </View>

        {/* Danger Zone Section */}
        <SectionHeader title="Danger Zone" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            marginBottom: 32,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="close-circle-outline"
            title="Deactivate Account"
            subtitle="Temporarily disable your account"
            onPress={() => {}}
            destructive
          />
          <Divider />
          <MenuItem
            icon="trash-bin-outline"
            title="Delete Account"
            subtitle="Permanently remove your account"
            onPress={() => {}}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
