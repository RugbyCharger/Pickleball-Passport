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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin, Users, MessageSquare, X, ChevronDown, Car, ArrowRight } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  CONFIRMED: { bg: 'bg-green-100', text: 'text-green-700' },
  COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-700' },
  CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

// Generate time slots from 5:00 to 23:00
const TIME_SLOTS = Array.from({ length: 37 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
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

interface TransportRequest {
  id: string;
  date: Date;
  pickupTime: string;
  pickupLocation: string;
  destination: string;
  passengers: number;
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

function TransportRequestCard({
  request,
  onCancel,
  isCancelling,
}: {
  request: TransportRequest;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const formattedDate = new Date(request.date).toLocaleDateString('en-US', {
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
        <StatusBadge status={request.status} />
      </View>

      <View className="flex-row items-center mb-2">
        <Clock size={14} color="#9CA3AF" />
        <Text className="text-gray-600 text-sm ml-2">Pickup at {request.pickupTime}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <MapPin size={14} color="#9CA3AF" />
        <Text className="text-gray-600 text-sm ml-2 flex-1">{request.pickupLocation}</Text>
        <ArrowRight size={14} color="#9CA3AF" className="mx-2" />
        <Text className="text-gray-600 text-sm flex-1">{request.destination}</Text>
      </View>

      <View className="flex-row items-center">
        <Users size={14} color="#9CA3AF" />
        <Text className="text-gray-600 text-sm ml-2">{request.passengers} passenger{request.passengers > 1 ? 's' : ''}</Text>
      </View>

      {request.notes && (
        <View className="flex-row items-start mt-2">
          <MessageSquare size={14} color="#9CA3AF" />
          <Text className="text-gray-500 text-sm ml-2 flex-1">{request.notes}</Text>
        </View>
      )}

      {request.status === 'PENDING' && (
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

export default function TransportScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const utils = trpc.useUtils();

  // Date options
  const dateOptions = useMemo(() => generateDateOptions(), []);

  // Form state
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [notes, setNotes] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const selectedDate = dateOptions[selectedDateIndex].value;

  // Fetch transport requests
  const {
    data: requests,
    isLoading,
    refetch,
    isRefetching,
  } = trpc.transport.list.useQuery(
    { tripId: tripId! },
    { enabled: !!tripId }
  );

  // Create request mutation
  const createRequest = trpc.transport.create.useMutation({
    onSuccess: () => {
      utils.transport.list.invalidate({ tripId: tripId! });
      // Reset form
      setSelectedDateIndex(0);
      setPickupTime('09:00');
      setPickupLocation('');
      setDestination('');
      setPassengers(1);
      setNotes('');
      Alert.alert('Success', 'Transportation request submitted!');
    },
    onError: (error: { message?: string }) => {
      Alert.alert('Error', error.message || 'Could not submit request. Please try again.');
    },
  });

  // Cancel request mutation
  const cancelRequest = trpc.transport.cancel.useMutation({
    onSuccess: () => {
      utils.transport.list.invalidate({ tripId: tripId! });
      setCancellingId(null);
      Alert.alert('Cancelled', 'Transportation request cancelled.');
    },
    onError: (error: { message?: string }) => {
      setCancellingId(null);
      Alert.alert('Error', error.message || 'Could not cancel request. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!tripId) return;

    if (!pickupLocation.trim()) {
      Alert.alert('Error', 'Please enter a pickup location.');
      return;
    }

    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }

    createRequest.mutate({
      tripId,
      date: selectedDate.toISOString(),
      pickupTime,
      pickupLocation: pickupLocation.trim(),
      destination: destination.trim(),
      passengers,
      notes: notes.trim() || undefined,
    });
  };

  const handleCancel = (requestId: string) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this transportation request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setCancellingId(requestId);
            cancelRequest.mutate({ transportRequestId: requestId });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          keyboardShouldPersistTaps="handled"
        >
          {/* Request Transportation Form */}
          <View className="p-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Request Transportation</Text>

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

              {/* Pickup Time */}
              <View className="mb-4">
                <Text className="text-gray-600 text-sm mb-2">Pickup Time</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    <Clock size={18} color="#6B7280" />
                    <Text className="text-gray-800 ml-2">{pickupTime}</Text>
                  </View>
                  <ChevronDown size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Pickup Location */}
              <View className="mb-4">
                <Text className="text-gray-600 text-sm mb-2">Pickup Location</Text>
                <View className="flex-row items-center bg-gray-100 rounded-lg p-3">
                  <MapPin size={18} color="#6B7280" />
                  <TextInput
                    value={pickupLocation}
                    onChangeText={setPickupLocation}
                    placeholder="e.g., Hotel lobby, Golf course"
                    className="flex-1 ml-2 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Destination */}
              <View className="mb-4">
                <Text className="text-gray-600 text-sm mb-2">Destination</Text>
                <View className="flex-row items-center bg-gray-100 rounded-lg p-3">
                  <MapPin size={18} color="#6B7280" />
                  <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    placeholder="e.g., Airport, Shopping mall"
                    className="flex-1 ml-2 text-gray-800"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Passengers */}
              <View className="mb-4">
                <Text className="text-gray-600 text-sm mb-2">Number of Passengers</Text>
                <View className="flex-row flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPassengers(p)}
                      className={`w-10 h-10 mr-2 mb-2 rounded-lg items-center justify-center ${
                        passengers === p ? 'bg-emerald-600' : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          passengers === p ? 'text-white' : 'text-gray-600'
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
                disabled={createRequest.isPending}
                className="bg-emerald-600 rounded-lg p-4"
              >
                {createRequest.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">Request Ride</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* My Requests */}
          <View className="px-4 pb-8">
            <Text className="text-lg font-bold text-gray-800 mb-4">My Requests</Text>

            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#059669" />
              </View>
            ) : !requests || requests.length === 0 ? (
              <View className="bg-white rounded-lg p-8 items-center">
                <Car size={48} color="#D1D5DB" />
                <Text className="text-gray-500 mt-4 text-center">No transportation requests yet</Text>
                <Text className="text-gray-400 text-sm mt-1 text-center">
                  Submit a request above to arrange transportation
                </Text>
              </View>
            ) : (
              requests.map((request: TransportRequest) => (
                <TransportRequestCard
                  key={request.id}
                  request={request}
                  onCancel={() => handleCancel(request.id)}
                  isCancelling={cancellingId === request.id}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
        title="Select Pickup Time"
        options={TIME_SLOTS.map((t) => ({ value: t, label: t }))}
        selectedValue={pickupTime}
        onSelect={(value) => setPickupTime(String(value))}
      />
    </SafeAreaView>
  );
}
