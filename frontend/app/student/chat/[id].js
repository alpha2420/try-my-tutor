import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../../context/SocketContext';
import { auth } from '../../../firebaseConfig';
import axios from 'axios';
import { API_URL } from '../../../config';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';

export default function ChatRoom() {
    const { id, name, role } = useLocalSearchParams(); // id is the OTHER user's ID
    const router = useRouter();
    const user = auth.currentUser;
    const { socket, isConnected, userId } = useSocket();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const flatListRef = useRef(null);

    useEffect(() => {
        fetchMessages();

        if (socket) {
            socket.on('receive_message', (data) => {
                // Check participation: sender or receiver must be this chat's counterpart OR me
                // data.sender_id === id (other) AND data.receiver_id === userId (me)
                // OR data.sender_id === userId (me) AND data.receiver_id === id (other) (handled by optimistic, but safe to ignore or dedupe)

                // Simple logic: If message involves 'id' (partner), add it.
                // Assuming 'id' is distinct.
                if (relevant) {
                    setMessages((prev) => {
                        return [...prev, data];
                    });
                    scrollToBottom();
                }
            });

            socket.on('message_error', (data) => {
                Alert.alert("Delivery Failed", "Message could not be sent. Please check your network or try again.");
                // Optionally remove the optimistic message
            });

            return () => {
                socket.off('receive_message');
                socket.off('message_error');
            };

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket, id, userId]); // added userId dependency

    const fetchMessages = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data.messages);
            setLoading(false);
            scrollToBottom();
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const [localUserId, setLocalUserId] = useState(null);
    const effectiveUserId = userId || localUserId;

    useEffect(() => {
        // Fallback: If context didn't get userId, try fetching it here
        if (!userId && user) {
            const fetchId = async () => {
                try {
                    const token = await user.getIdToken();
                    const res = await axios.get(`${API_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.user?.id) {
                        console.log("Fetched local user ID:", res.data.user.id);
                        setLocalUserId(res.data.user.id);
                    }
                } catch (e) {
                    console.error("Failed to fetch local ID", e);
                }
            };
            fetchId();
        }
    }, [userId, user]);

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        if (!effectiveUserId) {
            Alert.alert("Error", "User ID not found. Re-fetching...");
            // Trigger re-fetch logic or just hope the effect runs
            return;
        }

        const messageData = {
            sender_id: effectiveUserId,
            receiver_id: id,
            content: newMessage,
            created_at: new Date().toISOString()
        };

        // Optimistic update
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
        scrollToBottom();

        if (socket && isConnected) {
            socket.emit('send_message', messageData);
        } else {
            // HTTP Fallback
            try {
                const token = await user.getIdToken();
                await axios.post(`${API_URL}/api/messages`, {
                    receiver_id: id,
                    content: messageData.content
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error("Failed to send message via HTTP:", error);
                Alert.alert("Delivery Failed", "Could not send message. " + (error.response?.data?.error || error.message));
            }
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-100" edges={['top']}>
            {/* Premium Header */}
            <View className="bg-blue-600 px-4 py-3 flex-row items-center shadow-md z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3 bg-white/20 p-2 rounded-full backdrop-blur-sm"
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <View className="relative">
                    <Avatar className="h-10 w-10 border-2 border-white/30">
                        <AvatarFallback className="bg-blue-800 text-white font-bold">{name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    {isConnected && <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-600" />}
                </View>
                <View className="ml-3 flex-1">
                    <Text className="font-bold text-white text-lg">{name || 'Chat'}</Text>
                    <Text className="text-blue-200 text-xs font-medium">
                        {isConnected ? 'Online' : 'Offline'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: `/student/schedule/${id}`,
                        params: { name }
                    })}
                    className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
                >
                    <Ionicons name="calendar" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id?.toString() || index.toString() + Math.random()}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => {
                    const isMe = item.sender_id === effectiveUserId;
                    // Check if previous message was from same sender to group them (future enhancement)

                    return (
                        <View className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                            <View
                                className={`px-4 py-3 shadow-sm ${isMe
                                    ? 'bg-blue-600 rounded-2xl rounded-tr-sm'
                                    : 'bg-white border border-slate-100 rounded-2xl rounded-tl-sm'
                                    }`}
                            >
                                <Text className={`text-base leading-[22px] ${isMe ? 'text-white' : 'text-slate-800'}`}>
                                    {item.content}
                                </Text>
                            </View>
                            <View className={`flex-row items-center mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <Text className="text-[10px] text-slate-400 font-medium">
                                    {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                </Text>
                                {isMe && (
                                    <Ionicons name="checkmark-done" size={12} color="#94a3b8" className="ml-1" />
                                    // Blue checkmarks if seen? (future)
                                )}
                            </View>
                        </View>
                    );
                }}
            />

            {/* Premium Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View className="px-4 py-3 bg-white border-t border-slate-100 shadow-lg shadow-slate-200">
                    <View className="flex-row items-end bg-slate-100 rounded-[24px] px-2 py-2 border border-slate-200">
                        <TouchableOpacity className="p-2 rounded-full bg-slate-200 mr-1 self-end mb-0.5">
                            <Ionicons name="add" size={20} color="#64748b" />
                        </TouchableOpacity>

                        <TextInput
                            className="flex-1 bg-transparent px-2 py-2.5 max-h-32 text-slate-900 text-base"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChangeText={setNewMessage}
                            onSubmitEditing={sendMessage}
                            multiline
                            textAlignVertical="center"
                            placeholderTextColor="#94a3b8"
                            style={{ includeFontPadding: false }}
                        />

                        {newMessage.trim() ? (
                            <TouchableOpacity
                                onPress={sendMessage}
                                className="h-10 w-10 rounded-full items-center justify-center bg-blue-600 shadow-sm shadow-blue-300 ml-1 self-end mb-0.5 scale-100 active:scale-95 transition-transform"
                                disabled={!effectiveUserId}
                            >
                                <Ionicons name="send" size={18} color="white" style={{ marginLeft: 2 }} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity className="h-10 w-10 rounded-full items-center justify-center bg-transparent ml-1 self-end mb-0.5">
                                <Ionicons name="mic-outline" size={24} color="#64748b" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
