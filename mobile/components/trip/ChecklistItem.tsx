import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Circle, ChevronRight } from 'lucide-react-native';

interface ChecklistItemProps {
  title: string;
  description?: string;
  isComplete: boolean;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ChecklistItem({
  title,
  description,
  isComplete,
  onPress,
  showChevron = false,
}: ChecklistItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        isComplete ? 'bg-green-50' : 'bg-white'
      }`}
    >
      <View
        className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
          isComplete ? 'bg-green-500' : 'border-2 border-gray-300'
        }`}
      >
        {isComplete ? (
          <Check size={14} color="white" />
        ) : (
          <Circle size={14} color="#D1D5DB" />
        )}
      </View>
      <View className="flex-1">
        <Text
          className={`font-medium ${
            isComplete ? 'text-green-800' : 'text-gray-800'
          }`}
        >
          {title}
        </Text>
        {description && (
          <Text
            className={`text-sm mt-0.5 ${
              isComplete ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {description}
          </Text>
        )}
      </View>
      {showChevron && onPress && (
        <ChevronRight size={20} color={isComplete ? '#059669' : '#9CA3AF'} />
      )}
    </TouchableOpacity>
  );
}
