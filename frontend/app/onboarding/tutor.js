import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';

export default function TutorOnboarding() {
    const [bio, setBio] = useState('');
    const [experience, setExperience] = useState('');
    const [rate, setRate] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!bio || !experience || !rate || !qualifications) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Backend call placeholder
            setTimeout(() => {
                Alert.alert('Success', 'Profile updated!');
                router.replace('/tutor/(tabs)/dashboard');
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
                                <Ionicons name="briefcase" size={40} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-white text-center">Tutor Profile</Text>
                            <Text className="text-blue-100 text-center mt-2 font-medium">Build your professional profile</Text>
                        </View>

                        <View className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/10 mb-6">
                            <View className="space-y-4">

                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Professional Bio</Text>
                                    <View className="flex-row items-start bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="person-outline" size={20} color="#64748b" className="mr-3 mt-1" />
                                        <TextInput
                                            placeholder="Tell students about yourself..."
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 bg-transparent border-0 min-h-[80px] text-slate-900 text-base font-medium"
                                            value={bio}
                                            onChangeText={setBio}
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                            style={{ includeFontPadding: false }}
                                        />
                                    </View>
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Experience (Yrs)</Text>
                                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                            <Ionicons name="time-outline" size={20} color="#64748b" className="mr-3" />
                                            <TextInput
                                                placeholder="e.g. 5"
                                                placeholderTextColor="#94a3b8"
                                                className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                                value={experience}
                                                onChangeText={setExperience}
                                                keyboardType="numeric"
                                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Hourly Rate (₹)</Text>
                                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                            <Ionicons name="cash-outline" size={20} color="#64748b" className="mr-3" />
                                            <TextInput
                                                placeholder="e.g. 500"
                                                placeholderTextColor="#94a3b8"
                                                className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                                value={rate}
                                                onChangeText={setRate}
                                                keyboardType="numeric"
                                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Qualifications</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="school-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="e.g. B.Tech, M.Sc Physics"
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                            value={qualifications}
                                            onChangeText={setQualifications}
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
