import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';
import { useTutorGuard } from '../../../hooks/useTutorGuard';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { StatusBar } from 'expo-status-bar';

export default function TutorChat() {
    const { loading: guardLoading, isComplete } = useTutorGuard();
    const user = auth.currentUser;
    const router = useRouter();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchChats = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(response.data.conversations);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isComplete) fetchChats();
    }, [isComplete]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats();
    }, []);

    const filteredChats = chats.filter(chat =>
        chat.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (guardLoading || !isComplete) return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text className="text-blue-600 font-bold">Checking Profile...</Text>
        </SafeAreaView>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-40 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500 rounded-full -mr-10 -mb-10 opacity-50" />
                <View className="absolute top-0 left-0 w-24 h-24 bg-blue-500 rounded-full -ml-10 -mt-10 opacity-50" />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pt-2 pb-6">
                    <Text className="text-3xl font-bold text-white mb-4">Messages</Text>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-white/20 border border-white/30 rounded-2xl px-4 h-12">
                        <Ionicons name="search" size={20} color="white" className="mr-3" />
                        <TextInput
                            placeholder="Search students..."
                            value={search}
                            onChangeText={setSearch}
                            className="flex-1 bg-transparent border-0 h-full text-white text-base font-medium"
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                            selectionColor="white"
                        />
                    </View>
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredChats.length === 0 && !loading ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="chatbubbles-outline" size={50} color="#cbd5e1" />
                            <Text className="text-slate-500 font-medium mt-4">No conversations yet.</Text>
                        </View>
                    ) : (
                        filteredChats.map((chat) => (
                            <TouchableOpacity
                                key={chat.id}
                                onPress={() => router.push(`/tutor/chat/${chat.id}?name=${encodeURIComponent(chat.name)}`)}
                                activeOpacity={0.7}
                            >
                                <Card className="mb-4 border-0 shadow-sm shadow-blue-900/5 bg-white rounded-3xl overflow-hidden">
                                    <CardContent className="flex-row items-center p-4">
                                        <View className="relative">
                                            <Avatar className="h-14 w-14 mr-4 border-2 border-slate-100">
                                                <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
                                                    {chat.name?.[0] || 'S'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <View className="absolute bottom-0 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row justify-between mb-1">
                                                <Text className="font-bold text-slate-900 text-lg">{chat.name || 'Student'}</Text>
                                                <Text className="text-xs text-slate-400 font-medium">
                                                    {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                            <View className="flex-row justify-between items-center">
                                                <Text className={`text-base flex-1 mr-2 ${chat.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500'}`} numberOfLines={1}>
                                                    {chat.lastMessage}
                                                </Text>
                                                {chat.unread > 0 && (
                                                    <View className="bg-blue-600 h-6 min-w-[24px] rounded-full items-center justify-center px-1.5">
                                                        <Text className="text-white text-xs font-bold">{chat.unread}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </CardContent>
                                </Card>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
