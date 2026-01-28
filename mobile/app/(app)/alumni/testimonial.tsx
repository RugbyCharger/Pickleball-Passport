/**
 * Testimonial Screen
 *
 * Screen for alumni to submit their transformation story
 * with text and optional before/after photos.
 */

import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { TestimonialForm } from '../../../components/alumni/TestimonialForm';
import { useAlumniStatus } from '../../../hooks/useAlumniStatus';
import { trpc } from '../../../lib/api';

interface Testimonial {
  id: string;
  status: string;
}

export default function TestimonialScreen() {
  const { isAlumni, isLoading } = useAlumniStatus();

  // Check if user already has pending testimonial
  const { data: myTestimonials } = trpc.guestTestimonial.myTestimonials.useQuery();
  const hasPendingTestimonial = (myTestimonials as Testimonial[] | undefined)?.some(
    (t) => t.status === 'PENDING' || t.status === 'EDIT_REQUESTED'
  );

  const handleSuccess = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!isAlumni) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Text className="text-6xl mb-4">X</Text>
        <Text className="text-xl font-bold text-gray-900 text-center">
          Share Your Story
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Complete your first trip to submit a testimonial
        </Text>
      </View>
    );
  }

  if (hasPendingTestimonial) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <Text className="text-6xl mb-4">...</Text>
        <Text className="text-xl font-bold text-gray-900 text-center">
          Testimonial Pending
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          You already have a testimonial under review. We'll notify you when
          it's published!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-2xl font-bold">Share Your Story</Text>
        <Text className="text-purple-200 mt-1">
          Help future travelers discover their transformation
        </Text>
      </View>

      {/* Tips */}
      <View className="mx-4 -mt-4 mb-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
        <Text className="text-purple-800 font-semibold mb-2">
          Tips for a Great Testimonial
        </Text>
        <Text className="text-purple-600 text-sm">
          {'- Share specific moments that impacted you\n'}
          {'- Mention what surprised you about the experience\n'}
          {'- Include before/after photos for visual impact'}
        </Text>
      </View>

      {/* Form */}
      <View className="px-4">
        <TestimonialForm onSuccess={handleSuccess} />
      </View>
    </ScrollView>
  );
}
