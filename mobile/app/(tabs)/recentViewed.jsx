import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import data (structured like backend API response)
import { recentlyViewedScreenData } from '../../data/dummyData';

//!api calls - uncomment when connecting backend
// import api from '../../services/api';
// useEffect(() => {
//   const fetchRecentlyViewed = async () => {
//     const response = await api.get('/api/houses/recently-viewed');
//     setRecentItems(response.data.recentlyViewed);
//   };
//   fetchRecentlyViewed();
// }, []);

// Design Tokens
const COLORS = {
  primary: '#7B61FF',
  background: '#FFFFFF',
  screenBackground: '#F5F5F5',
  textPrimary: '#1A1A1A',
  textSecondary: '#9E9E9E',
  border: '#F0F0F0',
};

// Helper to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const viewed = new Date(dateString);
  const diffMs = now - viewed;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return viewed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Group items by time period
const groupByTimePeriod = (items) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  items.forEach((item) => {
    const viewedDate = new Date(item.viewedAt);
    if (viewedDate >= todayStart) {
      groups.today.push(item);
    } else if (viewedDate >= yesterdayStart) {
      groups.yesterday.push(item);
    } else if (viewedDate >= weekStart) {
      groups.thisWeek.push(item);
    } else {
      groups.earlier.push(item);
    }
  });

  return groups;
};

// Property Card Component
const PropertyCard = ({ property, onPress, onRemove }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: COLORS.background,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        flexDirection: 'row',
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Image */}
      <Image
        source={{ uri: property.image }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
        }}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View
              style={{
                backgroundColor: '#F5F4F8',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, color: COLORS.primary, fontWeight: '600' }}>
                {property.type}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: COLORS.textSecondary }}>
              {formatTimeAgo(property.viewedAt)}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: COLORS.textPrimary,
              marginTop: 6,
            }}
            numberOfLines={1}
          >
            {property.name}
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
              {property.location}
            </Text>
          </View>
        </View>

        {/* Bottom Row - Price & Rating */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: COLORS.primary }}>
            ${property.price}
            <Text style={{ fontSize: 11, fontWeight: 'normal', color: COLORS.textSecondary }}>/month</Text>
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={14} color="#FFC42D" />
            <Text style={{ fontSize: 12, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 4 }}>
              {property.rating}
            </Text>
          </View>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        onPress={onRemove}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#F5F5F5',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Ionicons name="close" size={14} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Section Header Component
const SectionHeader = ({ title, count }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    }}
  >
    <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary }}>
      {title}
    </Text>
    <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>
      {count} {count === 1 ? 'property' : 'properties'}
    </Text>
  </View>
);

// Empty State Component
const EmptyState = () => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    }}
  >
    <View
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F5F4F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <Ionicons name="time-outline" size={48} color={COLORS.primary} />
    </View>
    <Text
      style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
      }}
    >
      No Recently Viewed
    </Text>
    <Text
      style={{
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
      }}
    >
      Properties you view will appear here. Start exploring to build your history!
    </Text>
  </View>
);

const RecentViewed = () => {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState(recentlyViewedScreenData);

  // Group items by time period
  const groupedItems = groupByTimePeriod(recentItems);

  // Handle remove item
  const handleRemoveItem = (itemId) => {
    setRecentItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Handle clear all
  const handleClearAll = () => {
    setRecentItems([]);
  };

  // Handle item press
  const handleItemPress = (item) => {
    router.push({ pathname: '/(tabs)/propertyDetails', params: { id: item.id } });
  };

  // Render grouped sections
  const renderSections = () => {
    const sections = [];

    if (groupedItems.today.length > 0) {
      sections.push(
        <View key="today">
          <SectionHeader title="Today" count={groupedItems.today.length} />
          {groupedItems.today.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              onPress={() => handleItemPress(item)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}
        </View>
      );
    }

    if (groupedItems.yesterday.length > 0) {
      sections.push(
        <View key="yesterday">
          <SectionHeader title="Yesterday" count={groupedItems.yesterday.length} />
          {groupedItems.yesterday.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              onPress={() => handleItemPress(item)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}
        </View>
      );
    }

    if (groupedItems.thisWeek.length > 0) {
      sections.push(
        <View key="thisWeek">
          <SectionHeader title="This Week" count={groupedItems.thisWeek.length} />
          {groupedItems.thisWeek.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              onPress={() => handleItemPress(item)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}
        </View>
      );
    }

    if (groupedItems.earlier.length > 0) {
      sections.push(
        <View key="earlier">
          <SectionHeader title="Earlier" count={groupedItems.earlier.length} />
          {groupedItems.earlier.map((item) => (
            <PropertyCard
              key={item.id}
              property={item}
              onPress={() => handleItemPress(item)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          ))}
        </View>
      );
    }

    return sections;
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
          Recently Viewed
        </Text>
        {recentItems.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={{
              position: 'absolute',
              right: 16,
              padding: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '500' }}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {recentItems.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => <View>{renderSections()}</View>}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default RecentViewed;
