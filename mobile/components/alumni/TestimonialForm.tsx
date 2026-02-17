/**
 * Testimonial Form Component
 *
 * Form for alumni to submit testimonials with text content
 * and optional before/after photos.
 */

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { trpc } from '../../lib/api';
import { useImageCompressor } from '../../hooks/useImageCompressor';
import { useAlumniStatus } from '../../hooks/useAlumniStatus';

interface TestimonialFormProps {
  onSuccess?: () => void;
}

export function TestimonialForm({ onSuccess }: TestimonialFormProps) {
  const [content, setContent] = useState('');
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { completedBookings } = useAlumniStatus();
  const { compressImage } = useImageCompressor();

  // Get user info for form
  const { data: user } = trpc.user.me.useQuery();

  const submitTestimonial = trpc.guestTestimonial.submit.useMutation({
    onSuccess: () => {
      Alert.alert(
        'Thank You!',
        "Your testimonial has been submitted for review. We'll notify you when it's published.",
        [{ text: 'OK', onPress: onSuccess }]
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to submit testimonial');
    },
  });

  const pickPhoto = async (setPhoto: (uri: string | null) => void) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        // Compress image per existing pattern
        const compressed = await compressImage(result.assets[0].uri);
        if (compressed) {
          setPhoto(compressed.uri);
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!content.trim() && !beforePhoto && !afterPhoto) {
      Alert.alert('Required', 'Please add your story or photos');
      return;
    }

    if (content.trim().length < 10 && !beforePhoto && !afterPhoto) {
      Alert.alert('Required', 'Please write at least 10 characters');
      return;
    }

    if (!consentGiven) {
      Alert.alert('Consent Required', 'Please agree to share your testimonial');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine testimonial type
      let type: 'TEXT' | 'BEFORE_AFTER' | 'COMBINED' = 'TEXT';
      if (beforePhoto && afterPhoto && content.trim()) {
        type = 'COMBINED';
      } else if (beforePhoto && afterPhoto) {
        type = 'BEFORE_AFTER';
      }

      // Get guest profile data
      const guestProfile = user?.guestProfile as
        | { firstName?: string; lastName?: string; city?: string }
        | null
        | undefined;
      const guestName = guestProfile
        ? `${guestProfile.firstName || ''} ${guestProfile.lastName || ''}`.trim()
        : 'Guest';

      // Note: In real implementation, upload photos to Supabase Storage first
      // For now, we'll submit with local URIs and handle upload later
      await submitTestimonial.mutateAsync({
        type,
        content: content.trim() || undefined,
        beforePhotoUrl: beforePhoto || undefined,
        afterPhotoUrl: afterPhoto || undefined,
        guestName: guestName || 'Guest',
        guestLocation: guestProfile?.city || undefined,
        bookingId: completedBookings[0]?.id,
        consentGiven: true,
      });
    } catch {
      // Error handled by onError callback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Story Input */}
      <View className="mb-4">
        <Text className="text-gray-900 font-semibold mb-2">Your Story</Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Share how The Pickleball Passport transformed your experience..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="bg-white p-4 rounded-xl border border-gray-200 min-h-[150px] text-gray-900"
        />
        <Text className="text-gray-400 text-xs mt-1 text-right">
          {content.length} characters
        </Text>
      </View>

      {/* Before/After Photos */}
      <View className="mb-4">
        <Text className="text-gray-900 font-semibold mb-2">
          Before & After Photos (Optional)
        </Text>
        <Text className="text-gray-500 text-sm mb-3">
          Show your transformation with before and after photos
        </Text>

        <View className="flex-row justify-between">
          {/* Before Photo */}
          <TouchableOpacity
            onPress={() => pickPhoto(setBeforePhoto)}
            className="flex-1 mr-2 bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ aspectRatio: 4 / 3 }}
          >
            {beforePhoto ? (
              <View className="flex-1">
                <Image
                  source={{ uri: beforePhoto }}
                  className="flex-1"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setBeforePhoto(null)}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
                <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
                  <Text className="text-white text-center text-xs">Before</Text>
                </View>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                <Text className="text-gray-400 text-sm mt-2">Before</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* After Photo */}
          <TouchableOpacity
            onPress={() => pickPhoto(setAfterPhoto)}
            className="flex-1 ml-2 bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ aspectRatio: 4 / 3 }}
          >
            {afterPhoto ? (
              <View className="flex-1">
                <Image
                  source={{ uri: afterPhoto }}
                  className="flex-1"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setAfterPhoto(null)}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
                <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-1">
                  <Text className="text-white text-center text-xs">After</Text>
                </View>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                <Text className="text-gray-400 text-sm mt-2">After</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Consent Toggle */}
      <View className="bg-gray-50 p-4 rounded-xl mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-gray-900 font-medium">Consent to Share</Text>
            <Text className="text-gray-500 text-sm mt-1">
              I agree to have my testimonial and photos shared publicly on the
              The Pickleball Passport website
            </Text>
          </View>
          <Switch
            value={consentGiven}
            onValueChange={setConsentGiven}
            trackColor={{ false: '#d1d5db', true: '#a78bfa' }}
            thumbColor={consentGiven ? '#7c3aed' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting || !consentGiven}
        className={`py-4 rounded-xl items-center mb-8 ${
          isSubmitting || !consentGiven ? 'bg-gray-300' : 'bg-purple-600'
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Submit Testimonial</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
