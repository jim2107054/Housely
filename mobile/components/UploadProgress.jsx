import { View, Text, Modal, StyleSheet } from 'react-native';

const truncateFileName = (name, maxLen = 30) => {
  if (!name) return '';
  if (name.length <= maxLen) return name;
  const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
  const truncated = name.substring(0, maxLen - ext.length - 3);
  return `${truncated}...${ext}`;
};

const UploadProgress = ({ progress = 0, isVisible = false, fileName = '' }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.title}>Uploading Video...</Text>

          {/* File name */}
          <Text style={styles.fileName} numberOfLines={1}>
            {truncateFileName(fileName)}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${clampedProgress}%` },
              ]}
            />
          </View>

          {/* Percentage */}
          <Text style={styles.percentText}>{clampedProgress}%</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  fileName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    maxWidth: '100%',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6941C6',
    borderRadius: 5,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6941C6',
  },
});

export default UploadProgress;
