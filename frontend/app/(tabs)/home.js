import { View, Text } from 'react-native';

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-2xl font-bold">Dashboard</Text>
            <Text className="text-gray-500 mt-2">Welcome to TryMyTutor!</Text>
        </View>
    );
}
