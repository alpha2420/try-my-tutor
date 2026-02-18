import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRequirement } from '../../../context/RequirementContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useState } from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BudgetScreen() {
    const router = useRouter();
    const { requirementData, updateRequirement } = useRequirement();

    const [budget, setBudget] = useState(requirementData.budget);
    const [selectedDays, setSelectedDays] = useState(requirementData.days || []);
    const [duration, setDuration] = useState(requirementData.duration || '1 Hour');

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleNext = () => {
        updateRequirement('budget', budget);
        updateRequirement('days', selectedDays);
        updateRequirement('duration', duration);
        router.push('/student/post-requirement/preferences');
    };

    return (
        <View className="flex-1 bg-white p-4">
            <ScrollView className="flex-1">
                <Text className="text-xl font-bold text-slate-900 mb-2">Budget & Timing</Text>
                <Text className="text-slate-500 mb-6">Set your budget and preferred schedule.</Text>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 mb-2">Budget (Per Hour / Month)</Text>
                    <Input
                        placeholder="e.g. 500/hr or 5000/month"
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="numeric" // Or default if they want to add text like "500 USD"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 mb-2">Preferred Days</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {DAYS.map(day => (
                            <TouchableOpacity
                                key={day}
                                onPress={() => toggleDay(day)}
                                className={`w-12 h-12 rounded-full items-center justify-center border ${selectedDays.includes(day) ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={selectedDays.includes(day) ? 'text-white font-medium' : 'text-slate-600'}>
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 mb-2">Session Duration</Text>
                    <View className="flex-row gap-3">
                        {['1 Hour', '1.5 Hours', '2 Hours'].map(d => (
                            <TouchableOpacity
                                key={d}
                                onPress={() => setDuration(d)}
                                className={`px-4 py-2 rounded-md border ${duration === d ? 'bg-slate-100 border-slate-900' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={duration === d ? 'text-slate-900 font-medium' : 'text-slate-600'}>{d}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View className="py-4">
                <Button onPress={handleNext} disabled={!budget || selectedDays.length === 0}>
                    Next Step
                </Button>
            </View>
        </View>
    );
}
