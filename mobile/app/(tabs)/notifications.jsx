import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import data (structured like backend API response)
import { notificationsScreenData } from '../../data/dummyData';

//!api calls - uncomment when connecting backend
// import api from '../../services/api';
// useEffect(() => {
//   const fetchNotifications = async () => {
//     const response = await api.get('/api/notifications');
//     setNotifications(response.data.notifications);
//   };
//   fetchNotifications();
// }, []);

// Design Tokens
const COLORS = {
  primary: '#7B61FF',
  background: '#FFFFFF',
  screenBackground: '#F5F5F5',
  textPrimary: '#1A1A1A',
  textSecondary: '#9E9E9E',
  border: '#F0F0F0',
  unreadBg: '#F5F4FF',
};

// Helper to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const notifTime = new Date(dateString);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return notifTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Notification Item Component
const NotificationItem = ({ notification, onPress, onMarkRead }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onMarkRead(notification.id);
        onPress(notification);
      }}
      style={{
        backgroundColor: notification.isRead ? COLORS.background : COLORS.unreadBg,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: 'row',
      }}
    >
      {/* Icon or Image */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: notification.senderImage || notification.propertyImage ? 24 : 12,
          backgroundColor: notification.senderImage || notification.propertyImage ? 'transparent' : `${notification.iconColor}20`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
          overflow: 'hidden',
        }}
      >
        {notification.senderImage ? (
          <Image
            source={{ uri: notification.senderImage }}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            resizeMode="cover"
          />
        ) : notification.propertyImage ? (
          <Image
            source={{ uri: notification.propertyImage }}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name={notification.icon} size={24} color={notification.iconColor} />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: notification.isRead ? '500' : 'bold',
              color: COLORS.textPrimary,
              flex: 1,
              paddingRight: 8,
            }}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.textSecondary }}>
            {formatTimeAgo(notification.timestamp)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            marginTop: 4,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
      </View>

      {/* Unread Indicator */}
      {!notification.isRead && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: COLORS.primary,
            position: 'absolute',
            top: 14,
            right: 16,
          }}
        />
      )}
    </TouchableOpacity>
  );
};

// Filter Pills Component
const FilterPills = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'booking', label: 'Bookings' },
    { id: 'message', label: 'Messages' },
    { id: 'promo', label: 'Promos' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => setActiveFilter(filter.id)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: activeFilter === filter.id ? COLORS.primary : '#F0F0F0',
            marginRight: 8,
          }}
        >
          <Text
            style={{
              color: activeFilter === filter.id ? '#FFFFFF' : COLORS.textSecondary,
              fontSize: 13,
              fontWeight: '500',
            }}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Empty State Component
const EmptyState = ({ filter }) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: 80,
    }}
  >
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5F4F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <Ionicons name="notifications-off" size={36} color={COLORS.primary} />
    </View>
    <Text
      style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
      }}
    >
      {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
    </Text>
    <Text
      style={{
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 18,
      }}
    >
      {filter === 'unread'
        ? 'You have read all your notifications.'
        : 'You don\'t have any notifications yet. We\'ll notify you when something arrives.'}
    </Text>
  </View>
);

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState(notificationsScreenData);
  const [activeFilter, setActiveFilter] = useState('all');

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    return n.type === activeFilter;
  });

  // Mark notification as read
  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Handle notification press
  const handleNotificationPress = (notification) => {
    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
      case 'reminder':
        router.push('/(tabs)/myBooking');
        break;
      case 'payment':
        router.push('/(tabs)/paymentHistory');
        break;
      case 'message':
        router.push('/(tabs)/chat');
        break;
      case 'review':
      case 'price_drop':
        if (notification.propertyImage) {
          router.push('/(tabs)/propertyDetails');
        }
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
          Notifications
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={{
              position: 'absolute',
              right: 16,
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '500' }}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <View
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="notifications" size={18} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '500', marginLeft: 8 }}>
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Filter Pills */}
      <View style={{ backgroundColor: COLORS.background }}>
        <FilterPills activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
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
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Notifications;
