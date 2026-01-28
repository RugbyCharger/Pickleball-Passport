import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'large';
}

/**
 * Emergency SOS button component.
 *
 * Red circular button with alert icon. Designed for high visibility
 * and easy access during emergencies.
 */
export function SOSButton({ onPress, disabled = false, size = 'large' }: SOSButtonProps) {
  const sizeClasses = size === 'large'
    ? 'w-20 h-20'
    : 'w-14 h-14';

  const iconSize = size === 'large' ? 32 : 24;
  const textSize = size === 'large' ? 'text-xs' : 'text-[10px]';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${sizeClasses} rounded-full bg-red-600 items-center justify-center shadow-lg ${
        disabled ? 'opacity-50' : 'active:bg-red-700'
      }`}
      accessibilityRole="button"
      accessibilityLabel="Emergency SOS"
      accessibilityHint="Press and hold to send an emergency alert"
    >
      <View className="items-center">
        <AlertTriangle size={iconSize} color="white" />
        <Text className={`text-white font-bold ${textSize} mt-0.5`}>SOS</Text>
      </View>
    </Pressable>
  );
}
