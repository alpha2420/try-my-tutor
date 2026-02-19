import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';

export default function StudentOnboarding() {
    const [grade, setGrade] = useState('');
    const [board, setBoard] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!grade || !board || !address) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) return;
            // const token = await user.getIdToken();

            // Update profile backend logic here
            // await axios.put('...', { ... }, { headers: { Authorization: `Bearer ${token}` } });

            // Simulating API call
            setTimeout(() => {
                Alert.alert('Success', 'Profile updated!');
                router.replace('/student/(tabs)/home');
                setLoading(false);
            }, 1000);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message);
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-48 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mb-16 opacity-50" />
                <View className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-16 -mt-16 opacity-50" />
            </View>

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>

                        <View className="mt-6 mb-8 items-center">
                            <View className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-4 border border-white/30 shadow-lg">
                                <Ionicons name="school" size={40} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-white text-center">Student Profile</Text>
                            <Text className="text-blue-100 text-center mt-2 font-medium">Tell us about your studies</Text>
                        </View>

                        <View className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/10 mb-6">
                            <View className="space-y-4">
                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Grade / Class</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="ribbon-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="e.g. 10th Grade"
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                            value={grade}
                                            onChangeText={setGrade}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Board / Curriculum</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="book-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="e.g. CBSE, ICSE, State Board"
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                            value={board}
                                            onChangeText={setBoard}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">City / Location</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="location-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="e.g. Mumbai"
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                            value={address}
                                            onChangeText={setAddress}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <Button
                                    onPress={handleSubmit}
                                    loading={loading}
                                    className="h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mt-4"
                                    textClassName="text-lg font-bold"
                                >
                                    Complete Profile
                                </Button>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
