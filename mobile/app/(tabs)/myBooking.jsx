import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
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
  activeTabBg: '#7B61FF',
  activeTabText: '#FFFFFF',
  inactiveTabBg: '#F0F0F0',
  inactiveTabText: '#9E9E9E',
  badgeWaitingBg: '#FFF3E0',
  badgeWaitingText: '#FF9800',
  badgeCheckinBg: '#E8F5E9',
  badgeCheckinText: '#4CAF50',
  badgeCompletedBg: '#EDE7F6',
  badgeCompletedText: '#7B61FF',
  badgeCancelledBg: '#FFEBEE',
  badgeCancelledText: '#F44336',
};

// Mock Booking Data
const upcomingBookings = [
  {
    id: '1',
    name: 'Batavia Apartments',
    location: 'Jaksel, Jakarta Selatan',
    dateRange: '08 Aug - 12 Aug',
    status: 'waiting_payment',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
  },
  {
    id: '2',
    name: 'Takatea Homestay',
    location: 'Seminyak, Bali',
    dateRange: '15 Aug - 20 Aug',
    status: 'checkin',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
  },
];

const completedBookings = [
  {
    id: '3',
    name: 'Takatea Homestay',
    location: 'Seminyak, Bali',
    dateRange: '01 Aug - 05 Aug',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
  },
];

const cancelledBookings = [
  {
    id: '4',
    name: 'Tropis Homestay',
    location: 'Ubud, Bali',
    dateRange: '25 Jul - 28 Jul',
    status: 'cancelled',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80',
  },
];

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'waiting_payment':
        return {
          bg: COLORS.badgeWaitingBg,
          text: COLORS.badgeWaitingText,
          label: 'Waiting payment',
        };
      case 'checkin':
        return {
          bg: COLORS.badgeCheckinBg,
          text: COLORS.badgeCheckinText,
          label: 'Check-in',
        };
      case 'completed':
        return {
          bg: COLORS.badgeCompletedBg,
          text: COLORS.badgeCompletedText,
          label: 'Completed',
        };
      case 'cancelled':
        return {
          bg: COLORS.badgeCancelledBg,
          text: COLORS.badgeCancelledText,
          label: 'Cancelled',
        };
      default:
        return {
          bg: COLORS.inactiveTabBg,
          text: COLORS.textSecondary,
          label: status,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <View
      style={{
        backgroundColor: style.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          color: style.text,
          fontSize: 11,
          fontWeight: '600',
        }}
      >
        {style.label}
      </Text>
    </View>
  );
};

// Booking Card Component
const BookingCard = ({ booking }) => {
  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: booking.image }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 10,
        }}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: COLORS.textPrimary,
            }}
            numberOfLines={1}
          >
            {booking.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            <Text
              style={{
                fontSize: 11,
                color: COLORS.textSecondary,
                marginLeft: 4,
              }}
              numberOfLines={1}
            >
              {booking.location}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 11,
              color: COLORS.textSecondary,
              marginTop: 4,
            }}
          >
            {booking.dateRange}
          </Text>
        </View>

        {/* Badge positioned at bottom-right */}
        <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <StatusBadge status={booking.status} />
        </View>
      </View>
    </View>
  );
};

// Tab Switcher Component
const BookingTabSwitcher = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginVertical: 12,
        backgroundColor: COLORS.inactiveTabBg,
        marginHorizontal: 16,
        borderRadius: 25,
        padding: 4,
      }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor:
              activeTab === tab.id ? COLORS.activeTabBg : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color:
                activeTab === tab.id
                  ? COLORS.activeTabText
                  : COLORS.inactiveTabText,
              fontWeight: activeTab === tab.id ? 'bold' : '500',
              fontSize: 14,
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Empty State Component
const BookingEmptyState = ({ setActiveTab }) => {
  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}
    >
      <Image
        source={require('../../assets/images/mybooking_opps.png')}
        style={{
          width: 180,
          height: 180,
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: COLORS.textPrimary,
          textAlign: 'center',
          marginTop: 16,
        }}
      >
        You have no upcoming booking
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: COLORS.textSecondary,
          textAlign: 'center',
          marginTop: 6,
          lineHeight: 20,
        }}
      >
        are you looking to a{' '}
        <Text
          style={{ color: COLORS.primary, fontWeight: '500' }}
          onPress={() => handleTabPress('completed')}
        >
          completed
        </Text>
        {' '}or{' '}
        <Text
          style={{ color: COLORS.primary, fontWeight: '500' }}
          onPress={() => handleTabPress('cancelled')}
        >
          cancelled
        </Text>
        {' '}booking ?
      </Text>
    </View>
  );
};

// Action Row Component
const ActionRow = ({ icon, label, onPress, isLast }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F0F0F0',
      }}
    >
      <Ionicons name={icon} size={20} color={COLORS.textPrimary} />
      <Text
        style={{
          fontSize: 13,
          color: COLORS.textPrimary,
          marginLeft: 12,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

// Main Screen Component
const MyBooking = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showEmptyState, setShowEmptyState] = useState(false); // Toggle this to test empty state

  // Get data based on active tab
  const getBookingData = () => {
    switch (activeTab) {
      case 'upcoming':
        return showEmptyState ? [] : upcomingBookings;
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return [];
    }
  };

  const bookings = getBookingData();

  // Render content based on tab
  const renderTabContent = () => {
    // Empty state for upcoming tab
    if (activeTab === 'upcoming' && bookings.length === 0) {
      return <BookingEmptyState setActiveTab={setActiveTab} />;
    }

    // Content for completed tab with action rows
    if (activeTab === 'completed') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookings.map((booking) => (
            <View key={booking.id}>
              <BookingCard booking={booking} />
              {/* Action Rows */}
              <View
                style={{
                  backgroundColor: COLORS.background,
                  borderRadius: 12,
                  marginHorizontal: 16,
                  marginTop: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <ActionRow
                  icon="create-outline"
                  label="Write review"
                  onPress={() => router.push({
                    pathname: '/(tabs)/writeReview',
                    params: {
                      bookingId: booking.id,
                      propertyName: booking.name,
                      location: booking.location,
                      image: booking.image,
                      reference: booking.reference || `HSL-2024-${booking.id.padStart(4, '0')}`,
                    },
                  })}
                  isLast={false}
                />
                <ActionRow
                  icon="call-outline"
                  label="Call Agent"
                  onPress={() => console.log('Call Agent pressed')}
                  isLast={true}
                />
              </View>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      );
    }

    // Content for cancelled tab with action row
    if (activeTab === 'cancelled') {
      return (
        <ScrollView showsVerticalScrollIndicator={false}>
          {bookings.map((booking) => (
            <View key={booking.id}>
              <BookingCard booking={booking} />
              {/* Action Row */}
              <View
                style={{
                  backgroundColor: COLORS.background,
                  borderRadius: 12,
                  marginHorizontal: 16,
                  marginTop: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <ActionRow
                  icon="call-outline"
                  label="Call Agent"
                  onPress={() => console.log('Call Agent pressed')}
                  isLast={true}
                />
              </View>
            </View>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      );
    }

    // Default content for upcoming tab with bookings
    return (
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    );
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
          My Booking
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={{ backgroundColor: COLORS.background, paddingBottom: 8 }}>
        <BookingTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
    </SafeAreaView>
  );
};

export default MyBooking;