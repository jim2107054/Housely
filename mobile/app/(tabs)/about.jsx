import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import React from 'react';
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

// App Info
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '100';

const About = () => {
  const router = useRouter();

  // Menu Item Component
  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity
      onPress={onPress}
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
        {subtitle && (
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      )}
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

  // Open URL handler
  const openURL = (url) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

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
          About
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Logo & Info */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 32,
            backgroundColor: COLORS.background,
            marginBottom: 8,
          }}
        >
          <Image
            source={require('../../assets/images/housely.png')}
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: COLORS.textPrimary,
              marginTop: 16,
            }}
          >
            Housely
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              marginTop: 4,
            }}
          >
            Version {APP_VERSION} ({BUILD_NUMBER})
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              marginTop: 8,
              textAlign: 'center',
              paddingHorizontal: 48,
              lineHeight: 18,
            }}
          >
            Find your perfect home with Housely - your trusted property rental companion.
          </Text>
        </View>

        {/* Legal Section */}
        <SectionHeader title="Legal" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="document-text"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => openURL('https://housely.com/terms')}
          />
          <Divider />
          <MenuItem
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="How we handle your data"
            onPress={() => openURL('https://housely.com/privacy')}
          />
          <Divider />
          <MenuItem
            icon="reader"
            title="Licenses"
            subtitle="Open source attributions"
            onPress={() => console.log('Open licenses')}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="help-circle"
            title="Help Center"
            subtitle="FAQs and support articles"
            onPress={() => openURL('https://housely.com/help')}
          />
          <Divider />
          <MenuItem
            icon="chatbubble-ellipses"
            title="Contact Us"
            subtitle="Get in touch with our team"
            onPress={() => openURL('mailto:support@housely.com')}
          />
          <Divider />
          <MenuItem
            icon="bug"
            title="Report a Bug"
            subtitle="Help us improve the app"
            onPress={() => openURL('mailto:bugs@housely.com')}
          />
        </View>

        {/* Social Section */}
        <SectionHeader title="Connect With Us" />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="logo-instagram"
            title="Instagram"
            subtitle="@housely.app"
            onPress={() => openURL('https://instagram.com/housely.app')}
          />
          <Divider />
          <MenuItem
            icon="logo-twitter"
            title="Twitter"
            subtitle="@houselyapp"
            onPress={() => openURL('https://twitter.com/houselyapp')}
          />
          <Divider />
          <MenuItem
            icon="logo-facebook"
            title="Facebook"
            subtitle="Housely Official"
            onPress={() => openURL('https://facebook.com/houselyapp')}
          />
        </View>

        {/* Rate Us Section */}
        <View
          style={{
            backgroundColor: COLORS.background,
            borderRadius: 12,
            marginHorizontal: 16,
            marginTop: 24,
            marginBottom: 100,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon="star"
            title="Rate Housely"
            subtitle="Leave a review on the App Store"
            onPress={() => console.log('Open App Store')}
          />
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingBottom: 32 }}>
          <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
            Made with ❤️ by Housely Team
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>
            © 2024 Housely. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;
