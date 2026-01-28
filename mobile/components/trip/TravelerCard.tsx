import React from 'react';
import { View, Text, Image } from 'react-native';
import { User } from 'lucide-react-native';

interface TravelerCardProps {
  firstName: string;
  lastName?: string;
  profileImageUrl?: string | null;
}

export function TravelerCard({ firstName, lastName, profileImageUrl }: TravelerCardProps) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
      {profileImageUrl ? (
        <Image
          source={{ uri: profileImageUrl }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center">
          {initials ? (
            <Text className="text-emerald-700 font-semibold text-lg">{initials}</Text>
          ) : (
            <User size={24} color="#059669" />
          )}
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-gray-800 font-medium text-base">
          {firstName} {lastName}
        </Text>
        <Text className="text-gray-500 text-sm">Fellow Traveler</Text>
      </View>
    </View>
  );
}
