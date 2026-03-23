import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import useAuthStore from '../../store/authStore';
import useVideoStore from '../../store/videoStore';
import UploadProgress from '../../components/UploadProgress';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const Upload = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { uploadVideo, error, clearError } = useVideoStore();

  const [videoUri, setVideoUri] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ─── Access guard ──────────────────────────────────────────────────────
  if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') {
    return (
      <View style={styles.accessDeniedContainer}>
        <Ionicons name="lock-closed-outline" size={60} color="#9CA3AF" />
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtitle}>
          Only Agents and Admins can upload videos.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Pick video from library ───────────────────────────────────────────
  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Media library access is needed to pick a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setVideoFile({
        uri: asset.uri,
        name: asset.fileName || `video_${Date.now()}.mp4`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'video/mp4',
      });
    }
  };

  // ─── Upload handler ────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!videoUri || !title.trim()) return;

    clearError();
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();

      formData.append('video', {
        uri: videoFile.uri,
        name: videoFile.name,
        type: videoFile.type,
      });

      formData.append('title', title.trim());
      formData.append('description', description.trim());

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append('tags', JSON.stringify(parsedTags));

      const result = await uploadVideo(formData, (pct) => setProgress(pct));

      setUploading(false);

      if (result.success) {
        Alert.alert('Uploaded!', 'Your video is being processed.', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('Upload Failed', result.message || 'Something went wrong.');
      }
    } catch (err) {
      setUploading(false);
      Alert.alert('Upload Failed', err.message || 'Something went wrong.');
    }
  };

  const isUploadDisabled = !videoUri || !title.trim() || uploading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Video</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Video picker area */}
        <TouchableOpacity
          style={[
            styles.pickerArea,
            videoUri && styles.pickerAreaSelected,
          ]}
          onPress={handlePickVideo}
          activeOpacity={0.75}
        >
          {videoUri ? (
            <View style={styles.pickerSelected}>
              <Ionicons name="checkmark-circle" size={36} color="#6941C6" />
              <Text style={styles.pickerFileName} numberOfLines={2}>
                {videoFile?.name}
              </Text>
              {videoFile?.size > 0 && (
                <Text style={styles.pickerFileSize}>
                  {formatFileSize(videoFile.size)}
                </Text>
              )}
              <Text style={styles.pickerChangeTip}>Tap to change</Text>
            </View>
          ) : (
            <View style={styles.pickerEmpty}>
              <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
              <Text style={styles.pickerEmptyTitle}>Pick a Video</Text>
              <Text style={styles.pickerEmptySubtitle}>
                Tap to select from your library
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter video title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            returnKeyType="next"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Describe your video..."
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={1000}
          />
        </View>

        {/* Tags */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="house, property, luxury"
            placeholderTextColor="#9CA3AF"
            value={tags}
            onChangeText={setTags}
            returnKeyType="done"
          />
          <Text style={styles.fieldHint}>Separate tags with commas</Text>
        </View>

        {/* Upload button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            isUploadDisabled && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={isUploadDisabled}
          activeOpacity={0.8}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={20}
            color={isUploadDisabled ? '#9CA3AF' : '#FFFFFF'}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.uploadButtonText,
              isUploadDisabled && styles.uploadButtonTextDisabled,
            ]}
          >
            Upload Video
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Upload progress modal */}
      <UploadProgress
        isVisible={uploading}
        progress={progress}
        fileName={videoFile?.name || ''}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },

  // ─── Picker area ──────────────────────────────────────────────────────
  pickerArea: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 20,
  },
  pickerAreaSelected: {
    borderColor: '#6941C6',
    borderStyle: 'solid',
    backgroundColor: '#FAF5FF',
  },
  pickerEmpty: {
    alignItems: 'center',
  },
  pickerEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
  },
  pickerEmptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  pickerSelected: {
    alignItems: 'center',
  },
  pickerFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  pickerFileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  pickerChangeTip: {
    fontSize: 12,
    color: '#6941C6',
    marginTop: 8,
  },

  // ─── Form fields ──────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  fieldHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginLeft: 2,
  },

  // ─── Upload button ────────────────────────────────────────────────────
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6941C6',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 8,
    shadowColor: '#6941C6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // ─── Access denied ────────────────────────────────────────────────────
  accessDeniedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  accessDeniedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  backBtn: {
    marginTop: 24,
    backgroundColor: '#6941C6',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default Upload;
