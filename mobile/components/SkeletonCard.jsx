import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SkeletonCard = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Thumbnail placeholder */}
      <View style={styles.thumbnail} />

      {/* Text line placeholders */}
      <View style={styles.textContainer}>
        <View style={[styles.textLine, styles.titleLine]} />
        <View style={[styles.textLine, styles.subtitleLine]} />
        <View style={[styles.textLine, styles.metaLine]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: 148,
    backgroundColor: '#D1D5DB',
  },
  textContainer: {
    padding: 12,
  },
  textLine: {
    height: 12,
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
    marginBottom: 8,
  },
  titleLine: {
    width: '80%',
  },
  subtitleLine: {
    width: '55%',
  },
  metaLine: {
    width: '40%',
  },
});

export default SkeletonCard;
