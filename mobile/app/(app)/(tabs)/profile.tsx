import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top']}>
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Manage your account
          </Text>
        </View>

        {/* Profile header placeholder */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm flex-row items-center">
          <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full items-center justify-center mr-4">
            <User size={32} color="#059669" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Guest User
            </Text>
            <Text className="text-gray-500 dark:text-gray-400">
              Sign in to access all features
            </Text>
          </View>
        </View>

        {/* Menu items */}
        <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <MenuItem icon={Settings} label="Settings" />
          <MenuItem icon={HelpCircle} label="Help & Support" />
          <MenuItem icon={LogOut} label="Sign Out" isLast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon: Icon,
  label,
  isLast = false
}: {
  icon: typeof Settings;
  label: string;
  isLast?: boolean;
}) {
  return (
    <Pressable
      className={`flex-row items-center p-4 active:bg-gray-50 dark:active:bg-gray-700 ${
        !isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''
      }`}
    >
      <Icon size={20} color="#6b7280" />
      <Text className="ml-3 text-base text-gray-900 dark:text-white">
        {label}
      </Text>
    </Pressable>
  );
}
