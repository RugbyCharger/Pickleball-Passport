import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check, Trash2 } from 'lucide-react-native';

interface PackingListItemProps {
  id: string;
  item: string;
  isPacked: boolean;
  isCustom: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  disabled?: boolean;
}

export function PackingListItem({
  item,
  isPacked,
  isCustom,
  onToggle,
  onDelete,
  disabled,
}: PackingListItemProps) {
  return (
    <View className="flex-row items-center bg-white px-4 py-3 border-b border-gray-100">
      <TouchableOpacity
        onPress={onToggle}
        disabled={disabled}
        className={`w-6 h-6 rounded items-center justify-center mr-3 ${
          isPacked ? 'bg-emerald-500' : 'border-2 border-gray-300'
        }`}
      >
        {isPacked && <Check size={16} color="white" />}
      </TouchableOpacity>

      <Text
        className={`flex-1 ${
          isPacked ? 'text-gray-400 line-through' : 'text-gray-800'
        }`}
      >
        {item}
      </Text>

      {isCustom && onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          disabled={disabled}
          className="p-2 -mr-2"
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}
