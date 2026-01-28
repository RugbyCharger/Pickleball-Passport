import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Create Account
        </Text>
        <Text className="text-base text-gray-500 mb-8 text-center">
          Start your pickleball journey today
        </Text>

        {/* Placeholder button - will be replaced with Clerk auth */}
        <Pressable className="w-full bg-emerald-600 py-4 rounded-xl mb-4 active:bg-emerald-700">
          <Text className="text-white text-center font-semibold text-lg">
            Create Account
          </Text>
        </Pressable>

        <View className="flex-row items-center mt-4">
          <Text className="text-gray-500">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="text-emerald-600 font-semibold">Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
