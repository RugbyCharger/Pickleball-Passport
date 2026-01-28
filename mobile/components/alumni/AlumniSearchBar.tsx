import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlumniSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function AlumniSearchBar({ value, onChangeText, placeholder = 'Search by name...' }: AlumniSearchBarProps) {
  return (
    <View className="mx-4 my-3 flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
      <Ionicons name="search" size={20} color="#9ca3af" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 ml-3 text-gray-900"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons
            name="close-circle"
            size={20}
            color="#9ca3af"
          />
        </Pressable>
      )}
    </View>
  );
}
