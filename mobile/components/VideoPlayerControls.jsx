import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayerControls = ({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  visible,
}) => {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250 });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: opacity.value > 0 ? 'auto' : 'none',
  }));

  const handleSeekBarPress = (event) => {
    const { locationX } = event.nativeEvent;
    const percentage = Math.min(Math.max(locationX / SCREEN_WIDTH, 0), 1);
    onSeek(percentage);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Seek bar */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleSeekBarPress}
        style={styles.seekBarContainer}
      >
        {/* Track background */}
        <View style={styles.seekTrack}>
          {/* Filled progress */}
          <View style={[styles.seekFill, { width: `${progress}%` }]} />
        </View>
        {/* Thumb */}
        <View
          style={[
            styles.seekThumb,
            { left: `${progress}%`, marginLeft: -7 },
          ]}
        />
      </TouchableOpacity>

      {/* Controls row */}
      <View style={styles.controlsRow}>
        {/* Play / Pause button */}
        <TouchableOpacity onPress={onPlayPause} style={styles.playButton} activeOpacity={0.7}>
          <Ionicons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={48}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* Time display */}
        <Text style={styles.timeText}>
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  seekBarContainer: {
    width: '100%',
    paddingVertical: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  seekTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  seekFill: {
    height: '100%',
    backgroundColor: '#6941C6',
    borderRadius: 2,
  },
  seekThumb: {
    position: 'absolute',
    top: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  playButton: {
    padding: 4,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default VideoPlayerControls;
