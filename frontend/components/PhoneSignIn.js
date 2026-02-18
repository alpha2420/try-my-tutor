import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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
        <View className="mb-4">
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebaseConfig}
                title="Prove you are human!"
                cancelLabel="Close"
            />

            {!verificationId ? (
                <>
                    <TextInput
                        placeholder="+1 555-555-5555"
                        placeholderTextColor="#9ca3af"
                        className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-900"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                    />
                    <TouchableOpacity
                        className="bg-blue-600 py-3 rounded-lg items-center"
                        onPress={sendVerification}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Verification Code</Text>
                        )}
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text className="mb-2 text-gray-600">Enter code sent to {phoneNumber}</Text>
                    <TextInput
                        placeholder="123456"
                        placeholderTextColor="#9ca3af"
                        className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-900 text-center tracking-widest text-lg"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                    <TouchableOpacity
                        className="bg-green-600 py-3 rounded-lg items-center mb-2"
                        onPress={confirmCode}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Confirm Code</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="py-2 items-center"
                        onPress={() => {
                            setVerificationId('');
                            setVerificationCode('');
                        }}
                    >
                        <Text className="text-blue-600">Change Phone Number</Text>
                    </TouchableOpacity>
                </>
            )}

            <View className="mt-4">
                <FirebaseRecaptchaBanner />
            </View>
        </View>
    );
}
