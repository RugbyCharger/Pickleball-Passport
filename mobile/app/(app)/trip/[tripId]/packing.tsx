import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Package } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { PackingListItem } from '@/components/trip/PackingListItem';

interface PackingItem {
  id: string;
  item: string;
  category: string;
  isPacked: boolean;
  isCustom: boolean;
}

export default function PackingScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');
  const utils = trpc.useUtils();

  // Get trip details to find booking
  const { data: trip } = trpc.trip.getTripDetails.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  // Get packing list
  const {
    data: packingItems,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.packing.getPackingList.useQuery(
    { bookingId: trip?.userBookingId! },
    { enabled: !!trip?.userBookingId }
  );

  // Toggle item mutation
  const toggleItem = trpc.packing.toggleItem.useMutation({
    onSuccess: () => {
      utils.packing.getPackingList.invalidate();
    },
  });

  // Add custom item mutation
  const addItem = trpc.packing.addCustomItem.useMutation({
    onSuccess: () => {
      utils.packing.getPackingList.invalidate();
      setNewItem('');
    },
  });

  // Delete custom item mutation
  const deleteItem = trpc.packing.deleteCustomItem.useMutation({
    onSuccess: () => {
      utils.packing.getPackingList.invalidate();
    },
  });

  const handleAddItem = () => {
    if (!newItem.trim() || !trip?.userBookingId) return;
    addItem.mutate({
      bookingId: trip.userBookingId,
      item: newItem.trim(),
      category: selectedCategory,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Remove this item from your packing list?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem.mutate({ itemId }) },
    ]);
  };

  // Group items by category
  const sections = React.useMemo(() => {
    if (!packingItems) return [];

    const items = packingItems as PackingItem[];
    const grouped: Record<string, PackingItem[]> = {};

    for (const item of items) {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((category) => {
        const categoryData = grouped[category] || [];
        return {
          title: category,
          data: categoryData,
          packedCount: categoryData.filter((i) => i.isPacked).length,
          totalCount: categoryData.length,
        };
      });
  }, [packingItems]);

  // Category options for adding items
  const categories = ['Clothing', 'Documents', 'Electronics', 'Medical', 'Toiletries', 'Other'];

  const totalPacked = packingItems?.filter((i: PackingItem) => i.isPacked).length || 0;
  const totalItems = packingItems?.length || 0;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Progress Header */}
        <View className="bg-white p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-800 font-semibold">Packing Progress</Text>
            <Text className="text-emerald-600 font-medium">
              {totalPacked} / {totalItems} items
            </Text>
          </View>
          <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${totalItems > 0 ? (totalPacked / totalItems) * 100 : 0}%` }}
            />
          </View>
        </View>

        {/* Packing List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-500">Loading packing list...</Text>
          </View>
        ) : sections.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Package size={64} color="#D1D5DB" />
            <Text className="text-gray-600 font-medium text-lg mt-4 text-center">
              No packing list yet
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Add items below to start tracking what you need to pack
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PackingListItem
                {...item}
                onToggle={() =>
                  toggleItem.mutate({ itemId: item.id, isPacked: !item.isPacked })
                }
                onDelete={item.isCustom ? () => handleDeleteItem(item.id) : undefined}
                disabled={toggleItem.isPending}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View className="bg-gray-100 px-4 py-2 flex-row justify-between items-center">
                <Text className="text-gray-700 font-semibold">{section.title}</Text>
                <Text className="text-gray-500 text-sm">
                  {section.packedCount}/{section.totalCount}
                </Text>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
            }
            stickySectionHeadersEnabled
          />
        )}

        {/* Add Item Input */}
        <View className="bg-white border-t border-gray-200 p-4">
          <View className="flex-row items-center">
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add custom item..."
              className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-gray-800"
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
            />
            <TouchableOpacity
              onPress={handleAddItem}
              disabled={!newItem.trim() || addItem.isPending}
              className={`ml-2 w-12 h-12 rounded-lg items-center justify-center ${
                newItem.trim() ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>
          {/* Category selector for custom items */}
          <View className="flex-row flex-wrap mt-2 gap-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full ${
                  selectedCategory === cat ? 'bg-emerald-100' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm ${
                    selectedCategory === cat ? 'text-emerald-700' : 'text-gray-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
