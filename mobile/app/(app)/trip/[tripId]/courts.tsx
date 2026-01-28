import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users, MessageSquare, X, ChevronDown } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

// Generate time slots from 6:00 to 21:00
const TIME_SLOTS = Array.from({ length: 31 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
});

// Generate next 14 days for date selection
function generateDateOptions(): { value: Date; label: string }[] {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push({
      value: date,
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    });
  }
  return dates;
}

interface CourtBooking {
  id: string;
  date: Date;
  startTime: string;
  duration: number;
  players: number;
  notes: string | null;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  return (
    <View className={`px-2 py-0.5 rounded-full ${colors.bg}`}>
      <Text className={`text-xs font-medium ${colors.text}`}>{status}</Text>
    </View>
  );
}

function CourtBookingCard({
  booking,
  onCancel,
  isCancelling,
}: {
  booking: CourtBooking;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Calendar size={16} color="#6B7280" />
          <Text className="text-gray-800 font-medium ml-2">{formattedDate}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View className="flex-row items-center mb-2">
        <Clock size={14} color="#9CA3AF" />
        <Text className="text-gray-600 text-sm ml-2">
          {booking.startTime} - {booking.duration} min
        </Text>
      </View>

      <View className="flex-row items-center">
        <Users size={14} color="#9CA3AF" />
        <Text className="text-gray-600 text-sm ml-2">{booking.players} players</Text>
      </View>

      {booking.notes && (
        <View className="flex-row items-start mt-2">
          <MessageSquare size={14} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-2 flex-1">{booking.notes}</Text>
        </View>
      )}

      {booking.status === 'PENDING' && (
        <TouchableOpacity
          onPress={onCancel}
          disabled={isCancelling}
          className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-center"
        >
          {isCancelling ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <X size={16} color="#DC2626" />
              <Text className="text-red-600 font-medium ml-1">Cancel Request</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

interface SelectorModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { value: string | Date; label: string }[];
  selectedValue: string | Date;
  onSelect: (value: string | Date) => void;
}

function SelectorModal({ visible, onClose, title, options, selectedValue, onSelect }: SelectorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl max-h-96">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => {
              const isSelected = String(item.value) === String(selectedValue);
              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                  className={`p-4 border-b border-gray-100 ${isSelected ? 'bg-emerald-50' : ''}`}
                >
                  <Text className={`text-base ${isSelected ? 'text-emerald-700 font-medium' : 'text-gray-800'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function CourtsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const utils = trpc.useUtils();

  // Date options
  const dateOptions = useMemo(() => generateDateOptions(), []);

  // Form state
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState(60);
  const [players, setPlayers] = useState(2);
  const [notes, setNotes] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const selectedDate = dateOptions[selectedDateIndex].value;

  // Fetch court bookings
  const {
    data: bookings,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.court.list.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  // Create booking mutation
  const createBooking = trpc.court.create.useMutation({
    onSuccess: () => {
      utils.court.list.invalidate({ tripId: tripId! });
      // Reset form
      setSelectedDateIndex(0);
      setStartTime('09:00');
      setDuration(60);
      setPlayers(2);
      setNotes('');
      Alert.alert('Success', 'Court booking request submitted!');
    },
    onError: (error: { message?: string }) => {
      Alert.alert('Error', error.message || 'Could not submit request. Please try again.');
    },
  });

  // Cancel booking mutation
  const cancelBooking = trpc.court.cancel.useMutation({
    onSuccess: () => {
      utils.court.list.invalidate({ tripId: tripId! });
      setCancellingId(null);
      Alert.alert('Cancelled', 'Court booking request cancelled.');
    },
    onError: (error: { message?: string }) => {
      setCancellingId(null);
      Alert.alert('Error', error.message || 'Could not cancel request. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!tripId) return;

    createBooking.mutate({
      tripId,
      date: selectedDate.toISOString(),
      startTime,
      duration,
      players,
      notes: notes.trim() || undefined,
    });
  };

  const handleCancel = (bookingId: string) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this court booking request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setCancellingId(bookingId);
            cancelBooking.mutate({ courtBookingId: bookingId });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Book a Court Form */}
        <View className="p-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Book a Court</Text>

          <View className="bg-white rounded-lg p-4 mb-4">
            {/* Date */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Calendar size={18} color="#6B7280" />
                  <Text className="text-gray-800 ml-2">{dateOptions[selectedDateIndex].label}</Text>
                </View>
                <ChevronDown size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Start Time */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Start Time</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Clock size={18} color="#6B7280" />
                  <Text className="text-gray-800 ml-2">{startTime}</Text>
                </View>
                <ChevronDown size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Duration */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Duration</Text>
              <View className="flex-row">
                {[60, 90, 120].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDuration(d)}
                    className={`flex-1 py-2 mr-2 rounded-lg ${
                      duration === d ? 'bg-emerald-600' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        duration === d ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {d} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Players */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Number of Players</Text>
              <View className="flex-row">
                {[1, 2, 3, 4].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPlayers(p)}
                    className={`flex-1 py-2 mr-2 rounded-lg ${
                      players === p ? 'bg-emerald-600' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        players === p ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-gray-600 text-sm mb-2">Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any special requests?"
                multiline
                numberOfLines={3}
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                textAlignVertical="top"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createBooking.isPending}
              className="bg-emerald-600 rounded-lg p-4"
            >
              {createBooking.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center">Request Court</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* My Bookings */}
        <View className="px-4 pb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">My Bookings</Text>

          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : !bookings || bookings.length === 0 ? (
            <View className="bg-white rounded-lg p-8 items-center">
              <Calendar size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-4 text-center">No court bookings yet</Text>
              <Text className="text-gray-400 text-sm mt-1 text-center">
                Submit a request above to book a court
              </Text>
            </View>
          ) : (
            bookings.map((booking: CourtBooking) => (
              <CourtBookingCard
                key={booking.id}
                booking={booking}
                onCancel={() => handleCancel(booking.id)}
                isCancelling={cancellingId === booking.id}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Date Selector Modal */}
      <SelectorModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        title="Select Date"
        options={dateOptions.map((d, i) => ({ value: String(i), label: d.label }))}
        selectedValue={String(selectedDateIndex)}
        onSelect={(value) => setSelectedDateIndex(parseInt(String(value), 10))}
      />

      {/* Time Selector Modal */}
      <SelectorModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        title="Select Time"
        options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
        selectedValue={startTime}
        onSelect={(value) => setStartTime(String(value))}
      />
    </SafeAreaView>
  );
}
