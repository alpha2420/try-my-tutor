import { View, Text, FlatList, TouchableOpacity } from 'react-native';

export default function ChatList() {
    const chats = [
        { id: '1', name: 'John Doe', lastMessage: 'See you tomorrow at 5!', time: '10:30 AM' },
        // Mock data
    ];

    return (
        <View className="flex-1 bg-white p-4 pt-10">
            <Text className="text-2xl font-bold mb-4">Messages</Text>
            <FlatList
                data={chats}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity className="flex-row items-center p-3 border-b border-gray-100">
                        <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center mr-3">
                            <Text className="text-xl font-bold text-gray-600">{item.name[0]}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold">{item.name}</Text>
                            <Text className="text-gray-500" numberOfLines={1}>{item.lastMessage}</Text>
                        </View>
                        <Text className="text-xs text-gray-400">{item.time}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
