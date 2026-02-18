import { View, Text, TouchableOpacity } from 'react-native';
import { auth } from '../../firebaseConfig';
import { useRouter } from 'expo-router';

export default function Profile() {
    const router = useRouter();
    const user = auth.currentUser;

    const handleLogout = async () => {
        await auth.signOut();
        router.replace('/');
    };

    return (
        <View className="flex-1 bg-white p-4 pt-10">
            <Text className="text-2xl font-bold mb-6">My Profile</Text>

            <View className="items-center mb-8">
                <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-2">
                    <Text className="text-3xl font-bold text-blue-600">{user?.email?.[0]?.toUpperCase()}</Text>
                </View>
                <Text className="text-xl font-semibold">{user?.email}</Text>
            </View>

            <TouchableOpacity
                className="bg-red-50 p-4 rounded-lg items-center border border-red-200"
                onPress={handleLogout}
            >
                <Text className="text-red-600 font-bold">Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}
