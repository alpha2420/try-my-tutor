import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { auth } from '../../../firebaseConfig';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function ScheduleSession() {
    const { tutorId, name } = useLocalSearchParams();
    const router = useRouter();
    const user = auth.currentUser;

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const [duration, setDuration] = useState('60'); // Minutes
    const [loading, setLoading] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const handleSchedule = async () => {
        setLoading(true);
        try {
            const token = await user.getIdToken();
            const start_time = date.toISOString();
            // Calculate end time
            const end_time = new Date(date.getTime() + parseInt(duration) * 60000).toISOString();

            await axios.post(`${API_URL}/api/sessions`, {
                tutor_id: tutorId,
                start_time,
                end_time,
                // requirement_id: optional,
                meeting_link: 'https://meet.google.com/abc-defg-hij' // Mock link for now
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Session scheduled successfully!', [
                { text: 'OK', onPress: () => router.push('/student/(tabs)/home') }
            ]);

        } catch (error) {
            console.error('Error scheduling session:', error);
            Alert.alert('Error', 'Failed to schedule session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4 border-b border-slate-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Schedule Session</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text className="text-lg mb-6">Book a session with <Text className="font-bold">{name}</Text></Text>

                <View className="mb-6">
                    <Text className="text-slate-700 font-medium mb-2">Date & Time</Text>
                    <View className="flex-row gap-4">
                        <Button variant="outline" onPress={() => showMode('date')} className="flex-1">
                            {date.toLocaleDateString()}
                        </Button>
                        <Button variant="outline" onPress={() => showMode('time')} className="flex-1">
                            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Button>
                    </View>
                    {show && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode={mode}
                            is24Hour={true}
                            display="default"
                            onChange={onChange}
                        />
                    )}
                </View>

                <View className="mb-8">
                    <Input
                        label="Duration (minutes)"
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                    />
                </View>

                <Button onPress={handleSchedule} loading={loading} size="lg">
                    Confirm & Schedule
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
