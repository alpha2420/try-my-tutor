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

export default function TutorChatRoom() {
    const { id, name } = useLocalSearchParams(); // id is the OTHER user's ID
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
                const relevant = (data.sender_id === id || data.receiver_id === id);

                if (relevant) {
                    setMessages((prev) => [...prev, data]);
                    scrollToBottom();
                }
            });

            socket.on('message_error', (data) => {
                Alert.alert("Delivery Failed", "Message could not be sent. Please check your network or try again.");
            });

            return () => {
                socket.off('receive_message');
                socket.off('message_error');
            };
        }
    }, [socket, id, userId]);

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
        if (!userId && user) {
            const fetchId = async () => {
                try {
                    const token = await user.getIdToken();
                    const res = await axios.get(`${API_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.data.user?.id) {
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
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white p-4 border-b border-slate-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Avatar className="h-8 w-8 mr-3">
                    <AvatarFallback>{name?.[0] || 'S'}</AvatarFallback>
                </Avatar>
                <View>
                    <Text className="font-bold text-slate-900">{name || 'Chat'}</Text>
                    {isConnected ? <Text className="text-xs text-green-600">Online</Text> : <Text className="text-xs text-red-400">Offline</Text>}
                </View>
                {/* Tutor specific actions could go here, e.g. View Student Profile? Leaving empty for now */}
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id?.toString() || index.toString() + Math.random()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const isMe = item.sender_id === effectiveUserId;

                    return (
                        <View className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                            <View className={`p-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'
                                }`}>
                                <Text className={isMe ? 'text-white' : 'text-slate-800'}>
                                    {item.content}
                                </Text>
                            </View>
                            <Text className={`text-[10px] mt-1 text-slate-400 ${isMe ? 'text-right' : 'text-left'}`}>
                                {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </Text>
                        </View>
                    );
                }}
            />

            {/* Input */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View className="p-4 bg-white border-t border-slate-200 flex-row items-center">
                    <TextInput
                        className="flex-1 bg-slate-100 rounded-full px-4 py-2 mr-3 border border-transparent focus:border-blue-500"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        onSubmitEditing={sendMessage}
                        editable={true}
                        multiline
                        textAlignVertical="center"
                        style={{ includeFontPadding: false }}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        className={`h-10 w-10 rounded-full items-center justify-center ${newMessage.trim() && effectiveUserId ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                        disabled={!newMessage.trim() || !effectiveUserId}
                    >
                        <Ionicons name="send" size={20} color={newMessage.trim() && effectiveUserId ? 'white' : '#94a3b8'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
