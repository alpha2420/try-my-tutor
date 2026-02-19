import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, firebaseConfig } from '../firebaseConfig';

export default function PhoneSignIn({ onSignInSuccess, onSignInError }) {
    const recaptchaVerifier = useRef(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);

    const sendVerification = async () => {
        if (!phoneNumber) {
            Alert.alert('Error', 'Please enter a phone number');
            return;
        }
        setLoading(true);
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(
                phoneNumber,
                recaptchaVerifier.current
            );
            setVerificationId(verificationId);
            Alert.alert('Success', 'Verification code has been sent to your phone.');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', `Failed to send verification code: ${err.message}`);
            if (onSignInError) onSignInError(err);
        } finally {
            setLoading(false);
        }
    };

    const confirmCode = async () => {
        if (!verificationCode) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }
        setLoading(true);
        try {
            const credential = PhoneAuthProvider.credential(
                verificationId,
                verificationCode
            );
            const userCredential = await signInWithCredential(auth, credential);
            if (onSignInSuccess) onSignInSuccess(userCredential.user);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', `Invalid code: ${err.message}`);
            if (onSignInError) onSignInError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="w-full">
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebaseConfig}
                title="Prove you are human!"
                cancelLabel="Close"
            />

            {!verificationId ? (
                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Mobile Number</Text>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14">
                            <Ionicons name="call" size={20} color="#64748b" className="mr-3" />
                            <TextInput
                                placeholder="+1 555 555 5555"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 bg-transparent border-0 h-full text-slate-900 text-lg font-medium"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                autoComplete="tel"
                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform mt-2"
                        onPress={sendVerification}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Code</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-slate-500 text-center mb-4">
                            Enter the 6-digit code sent to <Text className="font-bold text-slate-900">{phoneNumber}</Text>
                        </Text>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14">
                            <Ionicons name="key" size={20} color="#64748b" className="mr-3" />
                            <TextInput
                                placeholder="123456"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 bg-transparent border-0 h-full text-slate-900 text-xl font-bold text-center tracking-widest"
                                value={verificationCode}
                                onChangeText={setVerificationCode}
                                keyboardType="number-pad"
                                maxLength={6}
                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-green-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-green-200 active:scale-95 transition-transform"
                        onPress={confirmCode}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Verify & Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="py-3 items-center"
                        onPress={() => {
                            setVerificationId('');
                            setVerificationCode('');
                        }}
                    >
                        <Text className="text-blue-600 font-medium">Change Phone Number</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View className="mt-4 opacity-0 h-0">
                <FirebaseRecaptchaBanner />
            </View>
        </View>
    );
}
