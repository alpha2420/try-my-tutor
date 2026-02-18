import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';
import PhoneSignIn from '../../components/PhoneSignIn';
import axios from 'axios';
import { API_URL } from '../../config';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';

export default function Signup() {
    const [method, setMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('student'); // 'student' or 'tutor'
    const [phoneUser, setPhoneUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async () => {
        setLoading(true);
        try {
            let user;

            if (method === 'email') {
                if (!email || !password || !fullName) {
                    Alert.alert('Error', 'Please fill in all fields');
                    setLoading(false);
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
            } else {
                // Phone Auth: User already signed in via OTP
                user = phoneUser;
            }

            if (!user) {
                setLoading(false);
                return;
            }

            const token = await user.getIdToken();

            // Sync with Backend
            await axios.post(`${API_URL}/api/auth/sync`, {
                uid: user.uid,
                email: user.email || '',
                phone: user.phoneNumber,
                name: fullName,
                role: role
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Account created!');

            if (role === 'student') {
                router.replace('/student/(tabs)/home');
            } else {
                router.replace('/tutor/(tabs)/dashboard');
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message || 'Signup failed');
        } finally {
            setLoading(false);
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
                        <CardTitle className="text-center">Create an Account</CardTitle>
                        <CardDescription className="text-center">
                            Join TryMyTutor as a student or tutor
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

                        {method === 'email' || phoneUser ? (
                            <View>
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChangeText={setFullName}
                                />

                                {method === 'email' && (
                                    <>
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
                                    </>
                                )}

                                <View className="mb-6">
                                    <Text className="text-sm font-medium text-slate-700 mb-2">I am a...</Text>
                                    <View className="flex-row gap-3">
                                        <Button
                                            variant={role === 'student' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onPress={() => setRole('student')}
                                        >
                                            Student
                                        </Button>
                                        <Button
                                            variant={role === 'tutor' ? 'default' : 'outline'}
                                            className="flex-1"
                                            onPress={() => setRole('tutor')}
                                        >
                                            Tutor
                                        </Button>
                                    </View>
                                </View>

                                <Button
                                    onPress={handleSignup}
                                    loading={loading}
                                >
                                    {method === 'email' ? 'Sign Up' : 'Complete Profile'}
                                </Button>
                            </View>
                        ) : (
                            <PhoneSignIn
                                onSignInSuccess={(user) => setPhoneUser(user)}
                                onSignInError={(err) => console.log(err)}
                            />
                        )}
                    </CardContent>
                    <CardFooter className="justify-center">
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text className="text-sm text-slate-500">
                                Already have an account? <Text className="text-slate-900 font-medium underline">Login</Text>
                            </Text>
                        </TouchableOpacity>
                    </CardFooter>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
