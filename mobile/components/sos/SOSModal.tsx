import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AlertTriangle, MapPin, MapPinOff, X } from 'lucide-react-native';
import { useLocation } from '@/hooks/useLocation';
import { trpc } from '@/lib/trpc';

interface SOSModalProps {
  visible: boolean;
  tripId: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * SOS confirmation modal with location status and message input.
 *
 * Displays current GPS status and allows user to add a message
 * before triggering the SOS alert.
 */
export function SOSModal({ visible, tripId, onClose, onSuccess }: SOSModalProps) {
  const [message, setMessage] = useState('');
  const { location, isLoading: locationLoading, getCurrentLocation, hasPermission } = useLocation();

  const triggerMutation = trpc.sos.trigger.useMutation({
    onSuccess: () => {
      setMessage('');
      onSuccess();
    },
    onError: (error: unknown) => {
      console.error('Failed to trigger SOS:', error);
    },
  });

  // Fetch location when modal opens
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible, getCurrentLocation]);

  const handleSOS = () => {
    triggerMutation.mutate({
      tripId,
      latitude: location?.latitude,
      longitude: location?.longitude,
      message: message.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!triggerMutation.isPending) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <AlertTriangle size={24} color="#DC2626" />
            <Text className="text-xl font-bold text-gray-900 ml-2">Emergency SOS</Text>
          </View>
          <Pressable
            onPress={handleClose}
            disabled={triggerMutation.isPending}
            className="p-2 -mr-2"
            accessibilityLabel="Close"
          >
            <X size={24} color="#6B7280" />
          </Pressable>
        </View>

        <View className="flex-1 p-4">
          {/* Warning message */}
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-800 font-medium text-base">
              This will send an emergency alert to our 24/7 support team.
            </Text>
            <Text className="text-red-700 text-sm mt-2">
              Only use this for genuine emergencies requiring immediate assistance.
            </Text>
          </View>

          {/* Location status */}
          <View className="flex-row items-center bg-gray-50 rounded-lg p-4 mb-6">
            {locationLoading ? (
              <>
                <ActivityIndicator size="small" color="#059669" />
                <Text className="text-gray-600 ml-3">Getting your location...</Text>
              </>
            ) : location ? (
              <>
                <MapPin size={24} color="#059669" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-medium">Location captured</Text>
                  <Text className="text-gray-500 text-sm">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <MapPinOff size={24} color="#9CA3AF" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-medium">Location unavailable</Text>
                  <Text className="text-gray-500 text-sm">
                    {hasPermission
                      ? 'Unable to get GPS coordinates'
                      : 'Location permission not granted'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Message input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">
              Describe your emergency (optional)
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="What kind of help do you need?"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              maxLength={500}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-900 text-base min-h-[100px]"
              textAlignVertical="top"
              editable={!triggerMutation.isPending}
            />
            <Text className="text-gray-400 text-xs mt-1 text-right">
              {message.length}/500
            </Text>
          </View>

          {/* Error message */}
          {triggerMutation.isError && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm">
                {triggerMutation.error?.message || 'Failed to send SOS. Please try again.'}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View className="p-4 border-t border-gray-200">
          <Pressable
            onPress={handleSOS}
            disabled={triggerMutation.isPending}
            className={`bg-red-600 rounded-lg py-4 items-center ${
              triggerMutation.isPending ? 'opacity-70' : 'active:bg-red-700'
            }`}
          >
            {triggerMutation.isPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-lg ml-2">Sending SOS...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg">Send Emergency Alert</Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleClose}
            disabled={triggerMutation.isPending}
            className="py-3 mt-2 items-center"
          >
            <Text className="text-gray-600 font-medium">Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
