import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { LogOut, Shield, ChevronRight } from 'lucide-react-native';
import {
  isBiometricsAvailable,
  isBiometricsEnabled,
  setBiometricsEnabled,
  getBiometricType,
} from '../../../lib/biometrics';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsOn, setBiometricsOn] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');

  useEffect(() => {
    const checkBiometrics = async () => {
      const available = await isBiometricsAvailable();
      setBiometricsAvailable(available);
      if (available) {
        const enabled = await isBiometricsEnabled();
        setBiometricsOn(enabled);
        const type = await getBiometricType();
        setBiometricType(type);
      }
    };
    checkBiometrics();
  }, []);

  const handleBiometricsToggle = async (value: boolean) => {
    setBiometricsOn(value);
    await setBiometricsEnabled(value);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

        {/* User Info Card */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center">
              <Text className="text-emerald-600 text-xl font-bold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Settings */}
        {biometricsAvailable && (
          <>
            <Text className="text-sm font-medium text-gray-500 uppercase mb-2 px-1">
              Security
            </Text>
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <Shield size={20} color="#059669" />
                  <View className="ml-3">
                    <Text className="text-gray-900 font-medium">
                      {biometricType}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Unlock with {biometricType.toLowerCase()}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={biometricsOn}
                  onValueChange={handleBiometricsToggle}
                  trackColor={{ false: '#d1d5db', true: '#a7f3d0' }}
                  thumbColor={biometricsOn ? '#059669' : '#f3f4f6'}
                />
              </View>
            </View>
          </>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          className="bg-white rounded-xl p-4 flex-row items-center justify-between shadow-sm border border-gray-100"
          onPress={handleSignOut}
        >
          <View className="flex-row items-center">
            <LogOut size={20} color="#dc2626" />
            <Text className="text-red-600 font-medium ml-3">Sign Out</Text>
          </View>
          <ChevronRight size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
