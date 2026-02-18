import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';

export default function StudentChat() {
    const router = useRouter();
    const user = auth.currentUser;
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchConversations = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConversations();
    }, []);

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

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <Text className="text-center mt-10">Loading...</Text>
                ) : conversations.length === 0 ? (
                    <Text className="text-center mt-10 text-slate-500">No conversations yet.</Text>
                ) : (
                    conversations.map((chat) => (
                        <TouchableOpacity
                            key={chat.id}
                            onPress={() => router.push({
                                pathname: `/student/chat/${chat.id}`,
                                params: { name: chat.name, role: chat.role }
                            })}
                        >
                            <Card className="mb-3 hover:bg-slate-50 active:bg-slate-50">
                                <CardContent className="flex-row items-center p-4">
                                    <Avatar className="h-12 w-12 mr-4">
                                        <AvatarFallback>{chat.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <View className="flex-1">
                                        <View className="flex-row justify-between mb-1">
                                            <Text className="font-bold text-slate-900">{chat.name}</Text>
                                            <Text className="text-xs text-slate-500">
                                                {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
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
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
