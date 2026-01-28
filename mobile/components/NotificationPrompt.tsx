/**
 * NotificationPrompt
 *
 * Contextual notification permission prompt displayed in trip overview.
 * Shows once per install and only if permission not already granted.
 */

import { View, Text, Pressable } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { storage } from '@/lib/mmkv';
import { useState, useEffect } from 'react';

const PROMPT_SHOWN_KEY = 'notification_prompt_shown';

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkShouldShow = async () => {
      // Don't show if already dismissed
      if (storage.getBoolean(PROMPT_SHOWN_KEY)) {
        return;
      }

      // Don't show if already has permission
      const permission = await OneSignal.Notifications.getPermissionAsync();
      if (permission) {
        return;
      }

      setVisible(true);
    };

    checkShouldShow();
  }, []);

  if (!visible) return null;

  const handleEnable = async () => {
    await OneSignal.Notifications.requestPermission(true);
    storage.set(PROMPT_SHOWN_KEY, true);
    setVisible(false);
  };

  const handleDismiss = () => {
    storage.set(PROMPT_SHOWN_KEY, true);
    setVisible(false);
  };

  return (
    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 my-2">
      <Text className="text-blue-900 font-semibold text-base mb-2">
        Stay Updated on Your Trip
      </Text>
      <Text className="text-blue-700 text-sm mb-3">
        Get notified about trip updates, activity reminders, and messages from your group.
      </Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={handleEnable}
          className="bg-blue-600 px-4 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center font-medium">Enable</Text>
        </Pressable>
        <Pressable
          onPress={handleDismiss}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          <Text className="text-gray-700 text-center">Not Now</Text>
        </Pressable>
      </View>
    </View>
  );
}
