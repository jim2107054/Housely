import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { TouchableOpacity } from 'react-native';

import useVideoStore from '../../store/videoStore';
import useAuthStore from '../../store/authStore';
import VideoCard from '../../components/VideoCard';
import SkeletonCard from '../../components/SkeletonCard';

const LIMIT = 20;

const VideoFeed = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuthStore();
  const {
    videos,
    isLoading,
    hasMore,
    page,
    fetchVideos,
  } = useVideoStore();

  useEffect(() => {
    fetchVideos({ page: 1, limit: LIMIT }, true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos({ page: 1, limit: LIMIT }, true);
    setRefreshing(false);
  }, [fetchVideos]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchVideos({ page: page + 1, limit: LIMIT }, false);
    }
  }, [hasMore, isLoading, page, fetchVideos]);

  const handleVideoPress = useCallback(
    (item) => {
      router.push({ pathname: '/(tabs)/videoPlayer', params: { id: item.id } });
    },
    [router]
  );

  const canUpload = user?.role === 'AGENT' || user?.role === 'ADMIN';

  // ─── Skeleton loader ────────────────────────────────────────────────────
  if (isLoading && videos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Videos</Text>
        </View>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  // ─── Empty state ────────────────────────────────────────────────────────
  const ListEmptyComponent = !isLoading ? (
    <View style={styles.emptyContainer}>
      <Ionicons name="film-outline" size={56} color="#9CA3AF" />
      <Text style={styles.emptyText}>No videos yet</Text>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Videos</Text>
      </View>

      <FlashList
        data={videos}
        keyExtractor={(item) => item.id?.toString()}
        estimatedItemSize={220}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => handleVideoPress(item)}
            style={styles.videoCard}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#6941C6"
            colors={['#6941C6']}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB — upload button for AGENT / ADMIN */}
      {canUpload && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(tabs)/upload')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  videoCard: {
    marginBottom: 12,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6941C6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6941C6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default VideoFeed;
