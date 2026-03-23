import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-av';

import useVideoStore from '../../store/videoStore';
import VideoPlayerControls from '../../components/VideoPlayerControls';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

const formatViews = (count) => {
  if (!count && count !== 0) return '0 views';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const VideoPlayer = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { currentVideo, isLoading, fetchVideoById, trackView, setCurrentVideo } =
    useVideoStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const controlsTimerRef = useRef(null);

  // ─── Fetch video on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (id) {
      fetchVideoById(id);
      trackView(id, 0);
    }
    return () => {
      setCurrentVideo(null);
    };
  }, [id]);

  // ─── Auto-hide controls after 3 seconds ─────────────────────────────────
  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setControlsVisible(true);
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  // ─── expo-av player ──────────────────────────────────────────────────────
  const player = useVideoPlayer(currentVideo?.url || null, (p) => {
    p.loop = false;
    p.addListener('playingChange', (e) => {
      setIsPlaying(e.isPlaying);
    });
    p.addListener('timeUpdate', (e) => {
      setCurrentTime(e.currentTime ?? 0);
      if (e.duration) setDuration(e.duration);
    });
  });

  const handlePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetControlsTimer();
  }, [player, isPlaying, resetControlsTimer]);

  const handleSeek = useCallback(
    (percentage) => {
      if (!player || !duration) return;
      const seekTo = duration * percentage;
      player.seekBy(seekTo - currentTime);
      resetControlsTimer();
    },
    [player, duration, currentTime, resetControlsTimer]
  );

  const handleVideoPress = useCallback(() => {
    setControlsVisible((prev) => !prev);
    resetControlsTimer();
  }, [resetControlsTimer]);

  // ─── Loading state ───────────────────────────────────────────────────────
  if (isLoading || !currentVideo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6941C6" />
      </View>
    );
  }

  const tags = Array.isArray(currentVideo.tags)
    ? currentVideo.tags
    : typeof currentVideo.tags === 'string' && currentVideo.tags
    ? currentVideo.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const descriptionText = currentVideo.description || '';
  const isLongDescription = descriptionText.length > 160;
  const displayedDescription =
    isLongDescription && !descriptionExpanded
      ? `${descriptionText.substring(0, 160)}...`
      : descriptionText;

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Video container */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleVideoPress}
          style={styles.videoContainer}
        >
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen
            allowsPictureInPicture
          />

          <VideoPlayerControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            visible={controlsVisible}
          />
        </TouchableOpacity>

        {/* Video metadata */}
        <View style={styles.metaContainer}>
          {/* Title */}
          <Text style={styles.title}>{currentVideo.title}</Text>

          {/* Views + date */}
          <View style={styles.statsRow}>
            <Ionicons name="eye-outline" size={15} color="#6B7280" />
            <Text style={styles.statsText}>
              {formatViews(currentVideo.views)}
            </Text>
            {currentVideo.createdAt && (
              <>
                <Text style={styles.statsDot}>·</Text>
                <Text style={styles.statsText}>
                  {formatDate(currentVideo.createdAt)}
                </Text>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Uploader info */}
          {currentVideo.uploader && (
            <View style={styles.uploaderRow}>
              {currentVideo.uploader.avatar ? (
                <Image
                  source={{ uri: currentVideo.uploader.avatar }}
                  style={styles.uploaderAvatar}
                />
              ) : (
                <View style={styles.uploaderAvatarPlaceholder}>
                  <Ionicons name="person" size={18} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.uploaderInfo}>
                <Text style={styles.uploaderName}>
                  {currentVideo.uploader.username || 'Unknown'}
                </Text>
                {currentVideo.uploader.role && (
                  <Text style={styles.uploaderRole}>
                    {currentVideo.uploader.role}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Divider */}
          {currentVideo.description && <View style={styles.divider} />}

          {/* Description */}
          {descriptionText.length > 0 && (
            <View>
              <Text style={styles.description}>{displayedDescription}</Text>
              {isLongDescription && (
                <TouchableOpacity
                  onPress={() => setDescriptionExpanded((prev) => !prev)}
                  style={styles.showMoreButton}
                >
                  <Text style={styles.showMoreText}>
                    {descriptionExpanded ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  metaContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  statsDot: {
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E7EB',
  },
  uploaderAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6941C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploaderInfo: {
    marginLeft: 12,
  },
  uploaderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  uploaderRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  showMoreButton: {
    marginTop: 6,
  },
  showMoreText: {
    fontSize: 13,
    color: '#6941C6',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: '#6941C6',
    fontWeight: '500',
  },
});

export default VideoPlayer;
