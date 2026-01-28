import React from 'react';
import { View, Text } from 'react-native';

interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
  isToday: boolean;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center mx-2">
      <View className="bg-emerald-600 rounded-lg px-4 py-2 min-w-[60px]">
        <Text className="text-white text-2xl font-bold text-center">{value}</Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1 uppercase">{label}</Text>
    </View>
  );
}

export function CountdownTimer({ days, hours, minutes, isPast, isToday }: CountdownTimerProps) {
  if (isPast) {
    return (
      <View className="bg-blue-50 rounded-xl p-4 items-center">
        <Text className="text-blue-700 text-lg font-semibold">Your trip has started!</Text>
        <Text className="text-blue-600 text-sm mt-1">Enjoy your adventure</Text>
      </View>
    );
  }

  if (isToday) {
    return (
      <View className="bg-emerald-50 rounded-xl p-4 items-center">
        <Text className="text-emerald-700 text-xl font-bold">Departing Today!</Text>
        <View className="flex-row mt-2">
          <CountdownUnit value={hours} label="hours" />
          <CountdownUnit value={minutes} label="mins" />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 items-center shadow-sm">
      <Text className="text-gray-600 text-sm mb-3">Time until departure</Text>
      <View className="flex-row">
        <CountdownUnit value={days} label="days" />
        <CountdownUnit value={hours} label="hours" />
        <CountdownUnit value={minutes} label="mins" />
      </View>
    </View>
  );
}
