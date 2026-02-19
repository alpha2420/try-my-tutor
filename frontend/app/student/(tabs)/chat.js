import { View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function StudentChat() {
    const router = useRouter();
    const user = auth.currentUser;
    const [conversations, setConversations] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchConversations = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data.conversations);
            setFilteredChats(response.data.conversations);
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

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredChats(conversations);
        } else {
            const filtered = conversations.filter(chat =>
                chat.name.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredChats(filtered);
        }
    }, [search, conversations]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchConversations();
    }, []);

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-40 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mb-16 opacity-50" />
                <View className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-16 -mt-16 opacity-50" />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header Content */}
                <View className="px-6 pt-2 pb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-3xl font-bold text-white shadow-sm">Messages</Text>
                        <TouchableOpacity onPress={() => router.push('/student/(tabs)/search')}>
                            <View className="bg-white/20 p-2.5 rounded-full backdrop-blur-md border border-white/30 shadow-sm">
                                <Ionicons name="add" size={24} color="white" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-white/20 border border-white/30 rounded-2xl px-4 h-12 mb-2">
                        <Ionicons name="search" size={20} color="white" className="mr-3" />
                        <TextInput
                            placeholder="Search tutors..."
                            value={search}
                            onChangeText={setSearch}
                            className="flex-1 bg-transparent border-0 h-full text-white text-base font-medium"
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                            selectionColor="white"
                        />
                    </View>
                </View>

                <View className="flex-1 px-5 mt-2">
                    {loading ? (
                        <View className="mt-20 items-center">
                            <Text className="text-slate-400 font-medium">Loading conversations...</Text>
                        </View>
                    ) : filteredChats.length === 0 ? (
                        <View className="flex-1 items-center justify-center -mt-20">
                            <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm shadow-slate-200">
                                <Ionicons name="chatbubbles-outline" size={40} color="#cbd5e1" />
                            </View>
                            <Text className="text-slate-900 font-bold text-xl mb-2">No messages yet</Text>
                            <Text className="text-slate-500 text-sm text-center max-w-[250px] leading-relaxed">
                                Connect with a tutor to start a conversation and ask about their sessions.
                            </Text>
                            <TouchableOpacity
                                className="mt-8 bg-blue-600 px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                                onPress={() => router.push('/student/(tabs)/search')}
                            >
                                <Text className="text-white font-bold text-base">Find Tutors</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredChats}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => router.push({
                                        pathname: '/student/chat/[id]',
                                        params: { id: item.id, name: item.name }
                                    })}
                                >
                                    <View className="flex-row items-center bg-white p-4 mb-3 rounded-[20px] border border-slate-100 shadow-sm shadow-slate-200/50">
                                        <View className="relative">
                                            <Avatar className="h-14 w-14 border-2 border-slate-50 shadow-sm">
                                                <AvatarImage src={null} />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 font-bold text-lg">
                                                    {item.name?.[0] || 'T'}
                                                </AvatarFallback>
                                            </Avatar>
                                            {item.unread > 0 && (
                                                <View className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                                            )}
                                        </View>

                                        <View className="flex-1 ml-4 justify-center">
                                            <View className="flex-row justify-between items-center mb-1">
                                                <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                <Text className={`text-xs ${item.unread > 0 ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'}`}>
                                                    {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </Text>
                                            </View>
                                            <View className="flex-row justify-between items-center">
                                                <Text
                                                    className={`text-sm leading-5 flex-1 mr-4 ${item.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'}`}
                                                    numberOfLines={1}
                                                >
                                                    {item.lastMessage || 'Start chatting...'}
                                                </Text>
                                                {item.unread > 0 && (
                                                    <View className="bg-blue-600 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 shadow-sm shadow-blue-200">
                                                        <Text className="text-white text-[10px] font-bold">{item.unread}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>

                                        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" className="ml-1" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
