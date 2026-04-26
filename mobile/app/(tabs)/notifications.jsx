import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';

const { width } = Dimensions.get('window');

// Design Tokens
const COLORS = {
  primary: '#8B5CF6',
  primaryLight: '#EDE9FE',
  background: '#FFFFFF',
  screenBackground: '#F9FAFB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  unreadBg: '#F3F4F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

// Helper to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const notifTime = new Date(dateString);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d`;
  return notifTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get icon config based on notification type
const getNotificationIcon = (type) => {
  const iconMap = {
    BOOKING_CONFIRMED: { name: 'calendar', color: COLORS.success, bg: '#ECFDF5' },
    BOOKING_CANCELLED: { name: 'calendar-outline', color: COLORS.danger, bg: '#FEF2F2' },
    PAYMENT_SUCCESS: { name: 'card', color: COLORS.success, bg: '#ECFDF5' },
    NEW_MESSAGE: { name: 'chatbubble-ellipses', color: COLORS.info, bg: '#EFF6FF' },
    REVIEW_POSTED: { name: 'star', color: COLORS.warning, bg: '#FFFBEB' },
    GENERAL: { name: 'notifications', color: COLORS.primary, bg: COLORS.primaryLight },
  };
  return iconMap[type] || { name: 'notifications', color: COLORS.primary, bg: COLORS.primaryLight };
};

// Notification Item Component (Redesigned)
const NotificationItem = ({ notification, onPress, onMarkRead }) => {
  const iconConfig = getNotificationIcon(notification.type);

  return (
    <TouchableOpacity
      onPress={() => {
        onPress(notification);
      }}
      style={{
        backgroundColor: COLORS.background,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 16,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'flex-start',
        elevation: notification.isRead ? 0 : 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        borderWidth: notification.isRead ? 1 : 0,
        borderColor: COLORS.border,
      }}
      activeOpacity={0.7}
    >
      {/* Icon or Image */}
      <View style={{ marginRight: 12 }}>
        {notification.senderImage || notification.propertyImage ? (
          <Image
            source={{ uri: notification.senderImage || notification.propertyImage }}
            style={{
              width: 52,
              height: 52,
              borderRadius: notification.senderImage ? 26 : 12,
              borderWidth: 2,
              borderColor: notification.isRead ? COLORS.border : COLORS.primary,
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: iconConfig.bg,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name={iconConfig.name} size={26} color={iconConfig.color} />
          </View>
        )}
        {!notification.isRead && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: COLORS.primary,
              borderWidth: 2,
              borderColor: COLORS.background,
            }}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: notification.isRead ? '600' : '700',
              color: COLORS.textPrimary,
              flex: 1,
              marginRight: 8,
            }}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: '500' }}>
            {formatTimeAgo(notification.createdAt || notification.timestamp)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
      </View>

      {/* Mark as Read Button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          if (!notification.isRead) {
            onMarkRead(notification.id);
          }
        }}
        style={{
          marginLeft: 8,
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: notification.isRead ? '#F3F4F6' : COLORS.primaryLight,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}
        activeOpacity={notification.isRead ? 1 : 0.6}
      >
        <Ionicons
          name={notification.isRead ? 'checkmark-done' : 'checkmark'}
          size={18}
          color={notification.isRead ? COLORS.textMuted : COLORS.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Filter Pills Component (Redesigned)
const FilterPills = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'unread', label: 'Unread', icon: 'mail-unread' },
    { id: 'booking', label: 'Bookings', icon: 'calendar' },
    { id: 'payment', label: 'Payments', icon: 'card' },
    { id: 'message', label: 'Messages', icon: 'chatbubbles' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: isActive ? COLORS.primary : COLORS.background,
              borderWidth: 1.5,
              borderColor: isActive ? COLORS.primary : COLORS.border,
              marginRight: 8,
              elevation: isActive ? 2 : 0,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isActive ? 0.2 : 0,
              shadowRadius: 4,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filter.icon}
              size={16}
              color={isActive ? '#FFFFFF' : COLORS.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                color: isActive ? '#FFFFFF' : COLORS.textSecondary,
                fontSize: 14,
                fontWeight: isActive ? '700' : '600',
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// Empty State Component (Redesigned)
const EmptyState = ({ filter }) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 100,
    }}
  >
    <View
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
      }}
    >
      <Ionicons
        name={filter === 'unread' ? 'checkmark-done-circle' : 'notifications-off'}
        size={56}
        color={COLORS.primary}
      />
    </View>
    <Text
      style={{
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
      }}
    >
      {filter === 'unread' ? 'All Caught Up!' : 'No Notifications Yet'}
    </Text>
    <Text
      style={{
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
      }}
    >
      {filter === 'unread'
        ? 'You\'ve read all your notifications.\nGreat job staying organized!'
        : 'We\'ll notify you when something\nimportant happens.'}
    </Text>
  </View>
);

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications || []);
    } catch (err) {
      setError(err.request ? 'Cannot connect to server' : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'booking') return n.type === 'BOOKING_CONFIRMED' || n.type === 'BOOKING_CANCELLED';
    if (activeFilter === 'payment') return n.type === 'PAYMENT_SUCCESS';
    if (activeFilter === 'message') return n.type === 'NEW_MESSAGE';
    return n.type === activeFilter;
  });

  // Mark notification as read
  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Handle notification press
  const handleNotificationPress = (notification) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
        router.push('/(tabs)/myBooking');
        break;
      case 'PAYMENT_SUCCESS':
        router.push('/(tabs)/myBooking');
        break;
      case 'NEW_MESSAGE':
        router.push('/(tabs)/chat');
        break;
      case 'REVIEW_POSTED':
        router.push('/(tabs)/myBooking');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.screenBackground }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.background,
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: COLORS.screenBackground,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 12 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: COLORS.textPrimary,
              }}
            >
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View
                style={{
                  backgroundColor: COLORS.primary,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginTop: 4,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>
                  {unreadCount} New
                </Text>
              </View>
            )}
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: COLORS.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="checkmark-done" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <View style={{ backgroundColor: COLORS.background, paddingBottom: 4 }}>
        <FilterPills activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 14 }}>
            Loading notifications...
          </Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Ionicons name="cloud-offline-outline" size={64} color={COLORS.textMuted} />
          <Text style={{ marginTop: 12, fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' }}>
            Connection Error
          </Text>
          <Text style={{ marginTop: 6, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchNotifications}
            activeOpacity={0.7}
            style={{ marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
              onMarkRead={handleMarkRead}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Notifications;
