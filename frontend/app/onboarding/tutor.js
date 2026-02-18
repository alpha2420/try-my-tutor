import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';

export default function TutorOnboarding() {
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');
    const [rate, setRate] = useState('');
    const [qualifications, setQualifications] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            // Backend call placeholder
            Alert.alert('Success', 'Profile updated!');
            router.replace('/(tabs)/home');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-white p-6">
            <Text className="text-2xl font-bold mb-6">Tutor Profile</Text>

            <TextInput
                placeholder="Bio (Short description)"
                className="border border-gray-300 rounded-lg p-3 mb-4"
                value={bio}
                onChangeText={setBio}
                multiline
            />
            <TextInput
                placeholder="Experience (Years)"
                className="border border-gray-300 rounded-lg p-3 mb-4"
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
            />
            <TextInput
                placeholder="Hourly Rate (₹)"
                className="border border-gray-300 rounded-lg p-3 mb-4"
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
            />
            <TextInput
                placeholder="Qualifications"
                className="border border-gray-300 rounded-lg p-3 mb-6"
                value={qualifications}
                onChangeText={setQualifications}
            />

            <TouchableOpacity
                className="bg-blue-600 py-3 rounded-lg items-center"
                onPress={handleSubmit}
            >
                <Text className="text-white font-bold">Complete Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
