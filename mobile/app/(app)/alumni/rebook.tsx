/**
 * Rebook Screen
 *
 * Allows alumni to book their next trip with alumni discount.
 * Opens web checkout with alumni parameters.
 */

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useAlumniStatus } from '../../../hooks/useAlumniStatus';
import { trpc } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';

// Alumni discount config - can be moved to shared config
const ALUMNI_DISCOUNT_RATE = 0.1; // 10% discount

export default function RebookScreen() {
  const { isAlumni, totalTrips, isLoading } = useAlumniStatus();
  const { data: user } = trpc.user.me.useQuery();

  const discountPercent = ALUMNI_DISCOUNT_RATE * 100;

  const handleRebook = async () => {
    // Build URL with alumni parameters
    const webUrl =
      process.env.EXPO_PUBLIC_WEB_URL || 'https://pickleballpassport.com';
    const rebookUrl = `${webUrl}/booking/configure?source=mobile_alumni&user_id=${user?.id || ''}`;

    try {
      const canOpen = await Linking.canOpenURL(rebookUrl);
      if (canOpen) {
        await Linking.openURL(rebookUrl);
      } else {
        Alert.alert(
          'Unable to Open',
          'Could not open the booking page. Please visit pickleballpassport.com directly.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to open booking page');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!isAlumni) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-6">
        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="airplane" size={32} color="#9ca3af" />
        </View>
        <Text className="text-xl font-bold text-gray-900 text-center">
          Book Your Next Adventure
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          Complete your first trip to unlock alumni discounts
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-2xl font-bold">Book Again</Text>
        <Text className="text-purple-200 mt-1">
          Your next transformation awaits
        </Text>
      </View>

      {/* Alumni Status Card */}
      <View className="mx-4 -mt-4 mb-4 bg-white p-4 rounded-xl shadow-sm">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center">
            <Ionicons name="school" size={24} color="#7c3aed" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-bold text-gray-900">Alumni Status</Text>
            <Text className="text-purple-600 text-sm">
              {totalTrips} trip{totalTrips !== 1 ? 's' : ''} completed
            </Text>
          </View>
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-sm font-medium">Active</Text>
          </View>
        </View>
      </View>

      {/* Discount Banner */}
      <View className="mx-4 mb-4 bg-purple-600 p-6 rounded-xl">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-sm">Your Alumni Discount</Text>
            <Text className="text-white text-4xl font-bold">
              {discountPercent}% OFF
            </Text>
          </View>
          <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
            <Ionicons name="pricetag" size={32} color="white" />
          </View>
        </View>
        <Text className="text-purple-200 text-sm mt-2">
          Applied automatically at checkout
        </Text>
      </View>

      {/* Benefits */}
      <View className="mx-4 mb-4 bg-white p-4 rounded-xl shadow-sm">
        <Text className="font-bold text-gray-900 mb-3">Alumni Benefits</Text>

        {[
          { icon: 'pricetag', text: `${discountPercent}% discount on all packages` },
          { icon: 'flash', text: 'Priority booking access' },
          { icon: 'people', text: 'Connect with past travelers' },
          { icon: 'ribbon', text: 'Exclusive alumni events' },
        ].map((benefit, index) => (
          <View key={index} className="flex-row items-center mb-2">
            <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
              <Ionicons
                name={benefit.icon as 'pricetag' | 'flash' | 'people' | 'ribbon'}
                size={16}
                color="#7c3aed"
              />
            </View>
            <Text className="text-gray-700 ml-3">{benefit.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <View className="mx-4 mt-auto mb-8">
        <TouchableOpacity
          onPress={handleRebook}
          className="bg-purple-600 py-4 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="airplane" size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            Book Your Next Adventure
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-400 text-center text-sm mt-3">
          Opens web checkout with your discount applied
        </Text>
      </View>
    </View>
  );
}
