import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import PhoneSignIn from '../../components/PhoneSignIn';
import axios from 'axios';
import { API_URL } from '../../config';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50 justify-center p-4"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <Card className="w-full max-w-md self-center">
                    <CardHeader>
                        <CardTitle className="text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <View className="flex-row mb-6 bg-slate-100 p-1 rounded-lg">
                            <TouchableOpacity
                                className={`flex-1 items-center py-2 rounded-md ${method === 'email' ? 'bg-white shadow-sm' : ''}`}
                                onPress={() => setMethod('email')}
                            >
                                <Text className={`font-medium text-sm ${method === 'email' ? 'text-slate-900' : 'text-slate-500'}`}>Email</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`flex-1 items-center py-2 rounded-md ${method === 'phone' ? 'bg-white shadow-sm' : ''}`}
                                onPress={() => setMethod('phone')}
                            >
                                <Text className={`font-medium text-sm ${method === 'phone' ? 'text-slate-900' : 'text-slate-500'}`}>Phone</Text>
                            </TouchableOpacity>
                        </View>

                        {method === 'email' ? (
                            <View>
                                <Input
                                    label="Email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <Input
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <Button
                                    onPress={handleLogin}
                                    loading={loading}
                                    className="mt-2"
                                >
                                    Login
                                </Button>
                            </View>
                        ) : (
                            <PhoneSignIn
                                onSignInSuccess={handlePhoneLoginSuccess}
                                onSignInError={(err) => console.log(err)}
                            />
                        )}
                    </CardContent>
                    <CardFooter className="justify-center">
                        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                            <Text className="text-sm text-slate-500">
                                Don't have an account? <Text className="text-slate-900 font-medium underline">Sign up</Text>
                            </Text>
                        </TouchableOpacity>
                    </CardFooter>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
