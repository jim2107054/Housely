import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

//!api calls - uncomment when connecting backend
// import api from '../../services/api';
// const submitReview = async (data) => {
//   const response = await api.post('/api/reviews', data);
//   return response.data;
// };

// Design Tokens
const COLORS = {
  primary: '#7B61FF',
  background: '#FFFFFF',
  screenBackground: '#FAFAFA',
  inputBg: '#F5F5F5',
  inputBorder: '#E0E0E0',
  textPrimary: '#1A1A1A',
  textSecondary: '#9E9E9E',
  textHint: '#BDBDBD',
  starFilled: '#FFC107',
  starEmpty: '#E0E0E0',
  uploadBg: '#F8F8FF',
  uploadBorder: '#D0D0FF',
  successGreen: '#4CAF50',
  errorRed: '#F44336',
};

const MAX_REVIEW_LENGTH = 350;
const MAX_IMAGES = 5;

// Star Rating Component
const StarRating = ({ rating, setRating, size = 32 }) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((index) => (
        <TouchableOpacity key={index} onPress={() => setRating(index)}>
          <Ionicons
            name={index <= rating ? 'star' : 'star-outline'}
            size={size}
            color={index <= rating ? COLORS.starFilled : COLORS.starEmpty}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Property Summary Card
const PropertySummaryCard = ({ booking }) => {
  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        borderRadius: 14,
        padding: 14,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: booking.image }}
        style={{
          width: 72,
          height: 72,
          borderRadius: 10,
          backgroundColor: COLORS.inputBg,
        }}
      />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }}>
          {booking.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
          <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 4 }}>
            {booking.location}
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: COLORS.textHint, marginTop: 4 }}>
          Booking Ref: {booking.reference}
        </Text>
      </View>
    </View>
  );
};

// Media Upload Zone
const MediaUploadZone = ({ images, onAddPress, onRemoveImage }) => {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 }}>
        Add Photos ({images.length}/{MAX_IMAGES})
      </Text>
      
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {/* Upload Button */}
        <TouchableOpacity
          onPress={onAddPress}
          disabled={images.length >= MAX_IMAGES}
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: images.length >= MAX_IMAGES ? COLORS.inputBorder : COLORS.uploadBorder,
            backgroundColor: images.length >= MAX_IMAGES ? COLORS.inputBg : COLORS.uploadBg,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons
            name="camera-outline"
            size={24}
            color={images.length >= MAX_IMAGES ? COLORS.textHint : COLORS.primary}
          />
          <Text
            style={{
              fontSize: 10,
              color: images.length >= MAX_IMAGES ? COLORS.textHint : COLORS.primary,
              marginTop: 4,
              fontWeight: '500',
            }}
          >
            Upload
          </Text>
        </TouchableOpacity>

        {/* Image Previews */}
        {images.map((image, index) => (
          <View
            key={index}
            style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Image
              source={{ uri: image.uri }}
              style={{ width: '100%', height: '100%' }}
            />
            <TouchableOpacity
              onPress={() => onRemoveImage(index)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="close" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// Review Text Area
const ReviewTextArea = ({ text, setText }) => {
  const charCount = text.length;
  const isNearLimit = charCount >= MAX_REVIEW_LENGTH - 50;
  const isAtLimit = charCount >= MAX_REVIEW_LENGTH;

  return (
    <View style={{ marginHorizontal: 16, marginTop: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 }}>
        Your Review
      </Text>
      <View
        style={{
          backgroundColor: COLORS.inputBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.inputBorder,
          padding: 14,
        }}
      >
        <TextInput
          value={text}
          onChangeText={(newText) => {
            if (newText.length <= MAX_REVIEW_LENGTH) {
              setText(newText);
            }
          }}
          placeholder="Share your experience about this property..."
          placeholderTextColor={COLORS.textHint}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{
            fontSize: 14,
            color: COLORS.textPrimary,
            minHeight: 120,
            lineHeight: 22,
          }}
        />
        <Text
          style={{
            fontSize: 11,
            color: isAtLimit ? COLORS.errorRed : isNearLimit ? COLORS.starFilled : COLORS.textSecondary,
            textAlign: 'right',
            marginTop: 8,
          }}
        >
          {charCount}/{MAX_REVIEW_LENGTH}
        </Text>
      </View>
    </View>
  );
};

// Gallery Permission Modal - Shows when permission denied
const GalleryPermissionModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View
          style={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {/* Drag Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: COLORS.inputBorder,
                borderRadius: 2,
              }}
            />
          </View>

          {/* Content */}
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Ionicons name="images-outline" size={48} color={COLORS.textSecondary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.textPrimary,
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Gallery Access Required
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Please enable photo library access in settings to upload images.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                marginTop: 20,
                backgroundColor: COLORS.primary,
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Submit Review Button
const SubmitReviewButton = ({ onPress, loading, disabled }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBorder,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={{
          backgroundColor: disabled ? COLORS.inputBorder : COLORS.primary,
          borderRadius: 14,
          height: 52,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
            Submit Review
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Main Write Review Screen
const WriteReviewScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock booking data (in real app, fetch from params)
  const booking = {
    id: params?.bookingId || '1',
    name: params?.propertyName || 'Greenhost Boutique Hotel',
    location: params?.location || 'Yogyakarta, Indonesia',
    image: params?.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    reference: params?.reference || 'HSL-2024-0156',
  };

  const handleAddImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setShowPermissionModal(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES - images.length,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = [...images, ...result.assets].slice(0, MAX_IMAGES);
        setImages(newImages);
      }
    } catch (_error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters in your review.');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback! Your review will be visible soon.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (_error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = rating === 0 || reviewText.trim().length < 10;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.screenBackground }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: COLORS.background,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.inputBorder,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>
            Write a Review
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Property Card */}
          <PropertySummaryCard booking={booking} />

          {/* Rating Section */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 24,
              backgroundColor: COLORS.background,
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 16 }}>
              How was your experience?
            </Text>
            <StarRating rating={rating} setRating={setRating} size={36} />
            {rating > 0 && (
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 12 }}>
                {rating === 1
                  ? 'Poor'
                  : rating === 2
                  ? 'Fair'
                  : rating === 3
                  ? 'Good'
                  : rating === 4
                  ? 'Very Good'
                  : 'Excellent'}
              </Text>
            )}
          </View>

          {/* Review Text */}
          <ReviewTextArea text={reviewText} setText={setReviewText} />

          {/* Media Upload */}
          <MediaUploadZone
            images={images}
            onAddPress={handleAddImages}
            onRemoveImage={handleRemoveImage}
          />

          {/* Tips Section */}
          <View style={{ marginHorizontal: 16, marginTop: 24, marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 }}>
              Tips for a helpful review:
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.successGreen} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8, flex: 1 }}>
                Describe the amenities and cleanliness
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.successGreen} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8, flex: 1 }}>
                Share what made your stay memorable
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.successGreen} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginLeft: 8, flex: 1 }}>
                Add photos to help others decide
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <SubmitReviewButton
          onPress={handleSubmit}
          loading={submitting}
          disabled={isSubmitDisabled}
        />

        {/* Permission Modal - Only shows when permission denied */}
        <GalleryPermissionModal
          visible={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WriteReviewScreen;
