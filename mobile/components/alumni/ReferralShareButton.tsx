import { TouchableOpacity, Text, Alert, View, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

interface ReferralShareButtonProps {
  referralCode: string;
  userName: string;
}

/**
 * Share button component for referral links.
 *
 * Uses React Native's native Share API to open the system share sheet,
 * with a fallback to clipboard copy.
 */
export function ReferralShareButton({
  referralCode,
  userName,
}: ReferralShareButtonProps) {
  const shareUrl = `https://pickleballpassport.com/r/${referralCode}`;
  const message = `Join me on an incredible Pickleball Passport trip! Use my code ${referralCode} for a special discount: ${shareUrl}`;

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message,
        url: shareUrl,
        title: 'Join Pickleball Passport',
      });

      if (result.action === Share.dismissedAction) {
        // User dismissed the share dialog
        return;
      }
    } catch (error) {
      // Fallback to clipboard if share fails
      await Clipboard.setStringAsync(message);
      Alert.alert('Copied!', 'Referral message copied to clipboard');
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  return (
    <View className="gap-3">
      <TouchableOpacity
        onPress={handleShare}
        className="bg-purple-600 flex-row items-center justify-center py-4 px-6 rounded-xl"
      >
        <Ionicons name="share-outline" size={20} color="white" />
        <Text className="text-white font-bold ml-2">Share Referral Link</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleCopy}
        className="bg-gray-100 flex-row items-center justify-center py-3 px-6 rounded-xl"
      >
        <Ionicons name="copy-outline" size={18} color="#6b7280" />
        <Text className="text-gray-600 font-medium ml-2">Copy Link</Text>
      </TouchableOpacity>
    </View>
  );
}
