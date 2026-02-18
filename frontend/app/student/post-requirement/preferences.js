import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRequirement } from '../../../context/RequirementContext';
import { Button } from '../../../components/ui/Button';
import { useState } from 'react';

export default function PreferencesScreen() {
    const router = useRouter();
    const { requirementData, updateRequirement } = useRequirement();

    const [gender, setGender] = useState(requirementData.genderPreference || 'Any');
    const [experience, setExperience] = useState(requirementData.experience || 'Any');

    const handleNext = () => {
        updateRequirement('genderPreference', gender);
        updateRequirement('experience', experience);
        router.push('/student/post-requirement/review');
    };

    const SelectionChip = ({ label, selected, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full border mr-2 mb-2 ${selected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
        >
            <Text className={selected ? 'text-white' : 'text-slate-600'}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white p-4">
            <ScrollView className="flex-1">
                <Text className="text-xl font-bold text-slate-900 mb-2">Tutor Preferences</Text>
                <Text className="text-slate-500 mb-6">Help us find the perfect match for you.</Text>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 mb-3">Tutor Gender</Text>
                    <View className="flex-row flex-wrap">
                        {['Any', 'Male', 'Female'].map(opt => (
                            <SelectionChip
                                key={opt}
                                label={opt}
                                selected={gender === opt}
                                onPress={() => setGender(opt)}
                            />
                        ))}
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-medium text-slate-700 mb-3">Tutor Experience</Text>
                    <View className="flex-row flex-wrap">
                        {['Any', '1-3 Years', '3-5 Years', '5+ Years'].map(opt => (
                            <SelectionChip
                                key={opt}
                                label={opt}
                                selected={experience === opt}
                                onPress={() => setExperience(opt)}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <View className="py-4">
                <Button onPress={handleNext}>
                    Review & Post
                </Button>
            </View>
        </View>
    );
}
