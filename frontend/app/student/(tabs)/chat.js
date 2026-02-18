import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

export default function StudentChat() {
    // Mock conversations
    const chats = [
        { id: 1, name: 'John Doe', lastMessage: 'Sure, see you at 5 PM!', time: '2m ago', unread: 2, avatar: 'JD' },
        { id: 2, name: 'Jane Smith', lastMessage: 'Can you send me the syllabus?', time: '1h ago', unread: 0, avatar: 'JS' },
        { id: 3, name: 'Support Team', lastMessage: 'Your payment has been valued.', time: '1d ago', unread: 0, avatar: 'ST' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 bg-white border-b border-slate-200">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Messages</Text>
                <View className="relative">
                    <Input
                        placeholder="Search conversations..."
                        className="pl-10 bg-slate-50 border-slate-200"
                    />
                    <Ionicons name="search" size={20} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {chats.map((chat) => (
                    <TouchableOpacity key={chat.id}>
                        <Card className="mb-3 hover:bg-slate-50">
                            <CardContent className="flex-row items-center p-4">
                                <Avatar className="h-12 w-12 mr-4">
                                    <AvatarFallback>{chat.avatar}</AvatarFallback>
                                </Avatar>
                                <View className="flex-1">
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="font-bold text-slate-900">{chat.name}</Text>
                                        <Text className="text-xs text-slate-500">{chat.time}</Text>
                                    </View>
                                    <Text className="text-slate-600 text-sm" numberOfLines={1}>
                                        {chat.lastMessage}
                                    </Text>
                                </View>
                                {chat.unread > 0 && (
                                    <Badge className="ml-2 h-6 w-6 rounded-full items-center justify-center p-0">
                                        {chat.unread}
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
