import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { auth } from '../../firebaseConfig';

export default function StudentOnboarding() {
    const [grade, setGrade] = useState('');
    const [board, setBoard] = useState('');
    const [address, setAddress] = useState('');
    const router = useRouter();

    const handleSubmit = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const token = await user.getIdToken();

            // Update profile backend
            // await axios.put('http://localhost:5000/api/users', {
            //   grade_level: grade,
            //   board: board,
            //   address: address
            // }, { headers: { Authorization: `Bearer ${token}` } });

            Alert.alert('Success', 'Profile updated!');
            router.replace('/(tabs)/home');

        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View className="flex-1 p-6 bg-white justify-center">
            <Text className="text-2xl font-bold mb-6">Student Profile</Text>

            <TextInput
                placeholder="Grade/Class (e.g. 10th)"
                className="border border-gray-300 rounded-lg p-3 mb-4"
                value={grade}
                onChangeText={setGrade}
            />
            <TextInput
                placeholder="Board (e.g. CBSE, ICSE)"
                className="border border-gray-300 rounded-lg p-3 mb-4"
                value={board}
                onChangeText={setBoard}
            />
            <TextInput
                placeholder="Location/City"
                className="border border-gray-300 rounded-lg p-3 mb-6"
                value={address}
                onChangeText={setAddress}
            />

            <TouchableOpacity
                className="bg-blue-600 py-3 rounded-lg items-center"
                onPress={handleSubmit}
            >
                <Text className="text-white font-bold">Complete Profile</Text>
            </TouchableOpacity>
        </View>
    );
}
