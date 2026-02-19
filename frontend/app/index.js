import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LandingPage() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-blue-600">
            <StatusBar style="light" />

            {/* Background Decoration */}
            <View className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-50" />
            <View className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full -ml-32 -mb-32 opacity-50" />

            <SafeAreaView className="flex-1 justify-between p-6">
                <View className="items-center mt-10">
                    <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center backdrop-blur-md mb-6 border border-white/30">
                        <Ionicons name="school" size={48} color="white" />
                    </View>
                    <Text className="text-4xl font-bold text-white text-center">TryMyTutor</Text>
                    <Text className="text-blue-100 text-lg text-center mt-2 font-medium">
                        Master any subject with expert tutors
                    </Text>
                </View>

                <View className="space-y-4 mb-8">
                    <View className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm mb-4">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-green-400 rounded-full items-center justify-center mr-3 shadow-lg">
                                <Ionicons name="checkmark" size={24} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold flex-1">Verified Tutors</Text>
                        </View>
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 bg-orange-400 rounded-full items-center justify-center mr-3 shadow-lg">
                                <Ionicons name="flash" size={24} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold flex-1">Instant Connections</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-purple-400 rounded-full items-center justify-center mr-3 shadow-lg">
                                <Ionicons name="star" size={24} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold flex-1">Top Rated Learning</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-white py-4 rounded-2xl items-center shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text className="text-blue-600 font-bold text-lg">Log In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-blue-700/50 py-4 rounded-2xl items-center border border-blue-400 active:bg-blue-700/70"
                        onPress={() => router.push('/auth/signup')}
                    >
                        <Text className="text-white font-bold text-lg">Create Account</Text>
                    </TouchableOpacity>

                    <Text className="text-blue-200 text-xs text-center mt-4">
                        By continuing, you agree to our Terms & Privacy Policy
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
