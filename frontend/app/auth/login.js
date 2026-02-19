import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import PhoneSignIn from '../../components/PhoneSignIn';
import axios from 'axios';
import { API_URL } from '../../config';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const [method, setMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await navigateBasedOnRole(user);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneLoginSuccess = async (user) => {
        try {
            await navigateBasedOnRole(user);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to complete login.');
        }
    };

    const navigateBasedOnRole = async (user) => {
        const token = await user.getIdToken();

        try {
            const response = await axios.get(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const userData = response.data.user;
            if (userData && userData.role === 'tutor') {
                router.replace('/tutor/(tabs)/dashboard');
            } else {
                router.replace('/student/(tabs)/home');
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
            Alert.alert('Error', 'Could not verify user role. Please try again.');
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

                        {/* Title Section */}
                        <View className="mt-10 mb-8 items-center">
                            <View className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-4 border border-white/30 shadow-lg">
                                <Ionicons name="log-in" size={40} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-white text-center">Welcome Back</Text>
                            <Text className="text-blue-100 text-center mt-2 font-medium">Sign in to continue learning</Text>
                        </View>

                        {/* Login Card */}
                        <View className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/10 mb-6">

                            {/* Toggle */}
                            <View className="flex-row mb-8 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                <TouchableOpacity
                                    className={`flex-1 items-center py-3 rounded-xl transition-all ${method === 'email' ? 'bg-white shadow-sm' : ''}`}
                                    onPress={() => setMethod('email')}
                                >
                                    <View className="flex-row items-center space-x-2">
                                        <Ionicons name="mail" size={16} color={method === 'email' ? '#2563eb' : '#64748b'} style={{ marginRight: 6 }} />
                                        <Text className={`font-bold text-sm ${method === 'email' ? 'text-slate-900' : 'text-slate-500'}`}>Email</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`flex-1 items-center py-3 rounded-xl transition-all ${method === 'phone' ? 'bg-white shadow-sm' : ''}`}
                                    onPress={() => setMethod('phone')}
                                >
                                    <View className="flex-row items-center space-x-2">
                                        <Ionicons name="call" size={16} color={method === 'phone' ? '#2563eb' : '#64748b'} style={{ marginRight: 6 }} />
                                        <Text className={`font-bold text-sm ${method === 'phone' ? 'text-slate-900' : 'text-slate-500'}`}>Phone</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {method === 'email' ? (
                                <View className="space-y-4">
                                    <View>
                                        <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</Text>
                                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                            <Ionicons name="mail-outline" size={20} color="#64748b" className="mr-3" />
                                            <TextInput
                                                placeholder="m@example.com"
                                                placeholderTextColor="#94a3b8"
                                                className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                                value={email}
                                                onChangeText={setEmail}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Password</Text>
                                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                            <Ionicons name="lock-closed-outline" size={20} color="#64748b" className="mr-3" />
                                            <TextInput
                                                placeholder="••••••••"
                                                placeholderTextColor="#94a3b8"
                                                className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry
                                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                            />
                                        </View>
                                    </View>

                                    <Button
                                        onPress={handleLogin}
                                        loading={loading}
                                        className="h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mt-2"
                                        textClassName="text-lg font-bold"
                                    >
                                        Sign In
                                    </Button>
                                </View>
                            ) : (
                                <PhoneSignIn
                                    onSignInSuccess={handlePhoneLoginSuccess}
                                    onSignInError={(err) => console.log(err)}
                                />
                            )}
                        </View>

                        {/* Footer */}
                        <View className="flex-row justify-center items-center mt-4">
                            <Text className="text-slate-500 font-medium">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                <Text className="text-blue-600 font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
