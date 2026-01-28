import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { trpc } from '../../../lib/trpc';
import { AlumniCard } from '../../../components/alumni/AlumniCard';
import { AlumniSearchBar } from '../../../components/alumni/AlumniSearchBar';
import { useState, useDeferredValue, useCallback } from 'react';

export default function DirectoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.alumni.directory.useInfiniteQuery(
      { search: deferredQuery, limit: 20 },
      {
        getNextPageParam: (lastPage: { items: unknown[]; offset?: number }) =>
          lastPage.items.length === 20 ? (lastPage.offset ?? 0) + 20 : undefined,
        initialCursor: 0,
      }
    );

  // Flatten paginated data
  const alumni = data?.pages?.flatMap((page: { items: unknown[] }) => page.items) ?? [];
  const total = (data?.pages?.[0] as { total?: number })?.total ?? 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(({ item }: { item: {
    id: string;
    email: string;
    guestProfile?: { firstName?: string; lastName?: string };
    alumniProfileBio?: string;
    completedTripsCount?: number;
  } }) => (
    <AlumniCard
      firstName={item.guestProfile?.firstName}
      lastName={item.guestProfile?.lastName}
      email={item.email}
      bio={item.alumniProfileBio}
      tripsCompleted={item.completedTripsCount ?? 1}
    />
  ), []);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const ListHeader = () => (
    <>
      {/* Header */}
      <View className="bg-purple-600 pt-4 pb-8 px-4">
        <Text className="text-white text-2xl font-bold">Alumni Directory</Text>
        <Text className="text-purple-200 mt-1">
          Connect with fellow Pickleball Passport travelers
        </Text>
      </View>

      {/* Search Bar */}
      <View className="-mt-4">
        <AlumniSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Results Count */}
      <View className="px-4 mb-2">
        <Text className="text-gray-500 text-sm">
          {isLoading ? 'Searching...' : `${total} alumni found`}
        </Text>
      </View>
    </>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      );
    }

    return (
      <View className="py-8 items-center px-4">
        <Text className="text-5xl mb-3">👋</Text>
        <Text className="text-gray-900 font-semibold text-center">
          {searchQuery ? 'No alumni found' : 'Be the first!'}
        </Text>
        <Text className="text-gray-500 text-center mt-1">
          {searchQuery
            ? 'Try a different search term'
            : 'Alumni who opt in will appear here'}
        </Text>
      </View>
    );
  };

  const ListFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#7c3aed" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={alumni}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}
