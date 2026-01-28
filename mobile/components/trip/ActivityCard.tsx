import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, MapPin, Check } from 'lucide-react-native';

// Activity type colors matching web app
const ACTIVITY_COLORS: Record<string, { bg: string; text: string }> = {
  PICKLEBALL: { bg: 'bg-green-100', text: 'text-green-700' },
  MEDICAL: { bg: 'bg-red-100', text: 'text-red-700' },
  WELLNESS: { bg: 'bg-purple-100', text: 'text-purple-700' },
  CULTURAL: { bg: 'bg-amber-100', text: 'text-amber-700' },
  MEAL: { bg: 'bg-orange-100', text: 'text-orange-700' },
  FREE_TIME: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

interface Activity {
  id: string;
  time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  type: string;
}

interface ActivityCardProps {
  activity: Activity;
  isCheckedIn: boolean;
  canCheckIn: boolean;
  onCheckIn: () => void;
  isCheckingIn: boolean;
}

export function ActivityCard({
  activity,
  isCheckedIn,
  canCheckIn,
  onCheckIn,
  isCheckingIn,
}: ActivityCardProps) {
  const colors = ACTIVITY_COLORS[activity.type] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <View className="bg-white rounded-lg p-3 mb-2 border border-gray-100">
      <View className="flex-row items-start">
        {activity.time && (
          <View className="mr-3">
            <View className="flex-row items-center">
              <Clock size={14} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">{activity.time}</Text>
            </View>
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className={`px-2 py-0.5 rounded-full ${colors.bg}`}>
              <Text className={`text-xs font-medium ${colors.text}`}>
                {activity.type.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text className="text-gray-800 font-medium">{activity.title}</Text>
          {activity.description && (
            <Text className="text-gray-600 text-sm mt-1">{activity.description}</Text>
          )}
          {activity.location && (
            <View className="flex-row items-center mt-2">
              <MapPin size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1">{activity.location}</Text>
            </View>
          )}

          {/* Check-in section */}
          <View className="mt-3 pt-3 border-t border-gray-100">
            {isCheckedIn ? (
              <View className="flex-row items-center">
                <View className="bg-emerald-100 rounded-full p-1 mr-2">
                  <Check size={14} color="#059669" />
                </View>
                <Text className="text-emerald-700 text-sm font-medium">Checked In</Text>
              </View>
            ) : canCheckIn ? (
              <TouchableOpacity
                onPress={onCheckIn}
                disabled={isCheckingIn}
                className="bg-emerald-600 rounded-lg py-2 px-3 flex-row items-center justify-center"
              >
                {isCheckingIn ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Check size={16} color="white" />
                    <Text className="text-white font-medium ml-1">Check In</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-400 text-sm">Check-in available on activity day</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
