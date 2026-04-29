import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import api from '../../services/api';
import { getSocket, setBookingRefreshCallback } from '../../services/socketService';



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
  cancelRed: '#F44336',
  cancelRedLight: '#FFEBEE',
  modalOverlay: 'rgba(0,0,0,0.45)',
};

const TABS = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
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

// Animated Tab Switcher Component
const BookingTabSwitcher = ({ activeTab, setActiveTab }) => {
  const tabCount = TABS.length;
  const tabIndexMap = { upcoming: 0, completed: 1, cancelled: 2 };
  const slideAnim = useRef(new Animated.Value(tabIndexMap[activeTab] || 0)).current;

  // Track container width for pill position calculation
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const targetIndex = tabIndexMap[activeTab] ?? 0;
    Animated.spring(slideAnim, {
      toValue: targetIndex,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  }, [activeTab]);

  const pillWidth = containerWidth > 0 ? (containerWidth - 8) / tabCount : 0;

  const pillTranslateX = slideAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, pillWidth, pillWidth * 2],
  });

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginVertical: 12,
        backgroundColor: COLORS.inactiveTabBg,
        marginHorizontal: 16,
        borderRadius: 25,
        padding: 4,
        position: 'relative',
      }}
    >
      {/* Animated sliding pill */}
      {pillWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: pillWidth,
            height: '100%',
            backgroundColor: COLORS.activeTabBg,
            borderRadius: 20,
            transform: [{ translateX: pillTranslateX }],
          }}
        />
      )}

      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 20,
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

// Cancel Confirmation Modal Component
const CancelBookingModal = ({ visible, onClose, onConfirm, isCancelling }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: COLORS.modalOverlay,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 36,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#E0E0E0',
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          {/* Icon */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: COLORS.cancelRedLight,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="close-circle-outline" size={32} color={COLORS.cancelRed} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: COLORS.textPrimary,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Cancel Booking?
          </Text>

          {/* Body */}
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 28,
            }}
          >
            This action cannot be undone. Your booking will be cancelled immediately.
          </Text>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isCancelling}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: COLORS.primary,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.primary, fontWeight: '600', fontSize: 14 }}>
                Keep Booking
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isCancelling}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: isCancelling ? '#FFCDD2' : COLORS.cancelRed,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isCancelling ? (
                <ActivityIndicator size="small" color={COLORS.cancelRed} />
              ) : (
                <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 14 }}>
                  Yes, Cancel
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Main Screen Component
const MyBooking = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await api.get('/api/bookings/my');
      setBookings(response.data.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Re-fetch whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings({ silent: false });
    }, [fetchBookings])
  );

  // Register this screen's fetchBookings as the booking refresh callback so
  // Agent 10 (payment flow) can call triggerBookingRefresh() after payment success.
  useEffect(() => {
    setBookingRefreshCallback(() => fetchBookings({ silent: true }));
    return () => setBookingRefreshCallback(null);
  }, [fetchBookings]);

  // Listen for real-time booking:cancelled events so cancelled bookings appear
  // in the Cancelled tab immediately without requiring a manual refresh.
  useEffect(() => {
    const sock = getSocket();
    if (!sock) return;

    const handleBookingCancelled = () => {
      fetchBookings({ silent: true });
    };

    sock.on('booking:cancelled', handleBookingCancelled);

    return () => {
      sock.off('booking:cancelled', handleBookingCancelled);
    };
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings({ silent: true });
  };

  const handleCancelConfirm = async () => {
    if (!cancellingBookingId) return;

    setIsCancelling(true);
    try {
      await api.patch(`/api/bookings/${cancellingBookingId}/cancel`);
      setCancellingBookingId(null);
      await fetchBookings({ silent: true });
      Toast.show({
        type: 'success',
        text1: 'Booking cancelled',
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel booking. Please try again.';
      setCancellingBookingId(null);
      Alert.alert('Error', message);
    } finally {
      setIsCancelling(false);
    }
  };

  // Get data based on active tab
  const getBookingData = () => {
    const formatBookingDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };

    const transformedBookings = bookings.map(b => ({
      ...b,
      image: b.house?.images?.[0]?.url || 'https://via.placeholder.com/150',
      name: b.house?.name || 'Property',
      location: `${b.house?.area || ''}, ${b.house?.city || ''}`,
      price: b.totalAmount,
      dateRange: `${formatBookingDate(b.checkIn)} - ${formatBookingDate(b.checkOut)}`,
      status: b.status === 'PENDING' ? 'waiting_payment' :
              b.status === 'CONFIRMED' ? 'checkin' :
              b.status === 'COMPLETED' ? 'completed' : 'cancelled',
      rawStatus: b.status,
    }));

    switch (activeTab) {
      case 'upcoming':
        return transformedBookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.rawStatus));
      case 'completed':
        return transformedBookings.filter(b => b.rawStatus === 'COMPLETED');
      case 'cancelled':
        return transformedBookings.filter(b => b.rawStatus === 'CANCELLED');
      default:
        return [];
    }
  };

  const filteredBookings = getBookingData();

  // Render content based on tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    // Empty state for upcoming tab
    if (activeTab === 'upcoming' && filteredBookings.length === 0) {
      return <BookingEmptyState setActiveTab={setActiveTab} />;
    }

    // Content for completed tab with action rows
    if (activeTab === 'completed') {
      if (filteredBookings.length === 0) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="checkmark-done-circle-outline" size={64} color={COLORS.textSecondary} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginTop: 16 }}>
              No completed bookings
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 }}>
              Bookings you complete will appear here
            </Text>
          </View>
        );
      }
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >
          {filteredBookings.map((booking) => (
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
                  onPress={() => Alert.alert('Coming Soon', 'Call Agent feature will be available in a future update.')}
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
      if (filteredBookings.length === 0) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
            <Ionicons name="close-circle-outline" size={64} color={COLORS.textSecondary} />
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginTop: 16 }}>
              No cancelled bookings
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6 }}>
              Any cancelled bookings will appear here
            </Text>
          </View>
        );
      }
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >
          {filteredBookings.map((booking) => (
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
                  onPress={() => Alert.alert('Coming Soon', 'Call Agent feature will be available in a future update.')}
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
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <BookingCard booking={item} />

            {/* Pay Now button for PENDING bookings */}
            {item.rawStatus === 'PENDING' && (
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/paymentWebView',
                  params: {
                    bookingId: item.id,
                    amount: item.totalAmount,
                    propertyName: item.house?.name
                  }
                })}
                style={{
                  backgroundColor: COLORS.primary,
                  marginHorizontal: 16,
                  marginTop: -2,
                  marginBottom: 4,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>
                  Pay Now ৳{item.totalAmount?.toLocaleString()}
                </Text>
              </TouchableOpacity>
            )}

            {/* Cancel button for PENDING and CONFIRMED bookings */}
            {(item.rawStatus === 'PENDING' || item.rawStatus === 'CONFIRMED') && (
              <TouchableOpacity
                onPress={() => setCancellingBookingId(item.id)}
                style={{
                  marginHorizontal: 16,
                  marginTop: item.rawStatus === 'PENDING' ? 0 : -2,
                  marginBottom: 12,
                  paddingVertical: 9,
                  borderRadius: 10,
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: COLORS.cancelRed,
                  backgroundColor: 'transparent',
                }}
              >
                <Text style={{ color: COLORS.cancelRed, fontWeight: '600', fontSize: 13 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
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

      {/* Cancel Booking Confirmation Modal */}
      <CancelBookingModal
        visible={cancellingBookingId !== null}
        onClose={() => setCancellingBookingId(null)}
        onConfirm={handleCancelConfirm}
        isCancelling={isCancelling}
      />
    </SafeAreaView>
  );
};

export default MyBooking;
