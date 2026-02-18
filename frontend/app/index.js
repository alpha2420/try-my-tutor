import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LandingPage() {
    const router = useRouter();

    return (
        <View className="flex-1 items-center justify-center bg-white p-4">
            <StatusBar style="auto" />
            <Text className="text-4xl font-bold text-blue-600 mb-2">TryMyTutor</Text>
            <Text className="text-gray-500 mb-10 text-center">Find your perfect tutor or student today!</Text>

            <View className="w-full space-y-4">
                <TouchableOpacity
                    className="bg-blue-600 py-3 rounded-lg items-center"
                    onPress={() => router.push('/auth/login')}
                >
                    <Text className="text-white font-semibold text-lg">Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-gray-100 py-3 rounded-lg items-center mt-4"
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text className="text-gray-800 font-semibold text-lg">Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
