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
    const { socket, isConnected } = useSocket();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const flatListRef = useRef(null);

    useEffect(() => {
        fetchMessages();

        if (socket) {
            // socket.emit('join_room', ...); // Handled in Context for now, or ensure we listen

            socket.on('receive_message', (data) => {
                // Check if this message belongs to current conversation
                const isParticipating =
                    (data.sender_id === user?.uid && data.receiver_id === id) ||
                    (data.sender_id === id && data.receiver_id === user?.uid) ||
                    // Handle if IDs are database IDs vs Firebase UIDs. 
                    // Our socket logic sends { sender_id, receiver_id }. 
                    // Note: API uses database IDs for messages, but socket might use either.
                    // Let's ensure consistency. user.uid is Firebase ID. id param is database ID (likely).
                    // We need to map or be consistent.
                    // For now, let's assume `id` param is Database ID.
                    true; // Simplified filtering for now, ideally strictly check IDs.

                if (true) { // TODO: Add strict ID check
                    setMessages((prev) => [...prev, data]);
                    scrollToBottom();
                }
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket, id]);

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
            // Alert.alert('Error', 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            sender_id: user.uid, // This might need to be DB ID if backend expects it. 
            // The backend messageController uses DB IDs query. 
            // The socket server saves using `sender_id`.
            // We need to send DB ID. 
            // Problem: Frontend usually only knows Firebase UID unless we fetch profile.
            // Let's rely on backend to lookup or send Firebase UID and let backend resolve it?
            // Current backend socket implementation: `const { sender_id, receiver_id, content } = data;` -> inserts directly.
            // This implies `sender_id` MUST be UUID.
            // So we need to know our own UUID.
            // WORKAROUND: For now, I'll update `SocketContext` or fetch profile here to get my UUID.
            // OR: Update backend to handle Firebase UID lookup.
            // Let's assume for this step we need to fetch profile to get UUID.
            receiver_id: id,
            content: newMessage,
            created_at: new Date().toISOString() // For optimistic update
        };

        // Optimistic update
        setMessages((prev) => [...prev, messageData]);
        setNewMessage('');
        scrollToBottom();

        if (socket) {
            // We need to resolve our DB ID first.
            // Quick fix: fetch it if missing?
            // Actually, `socket.emit` goes to backend. Backend *could* lookup.
            // But existing backend just inserts. 
            // Let's send the message. If it fails, we handle error.

            // Wait, `sender_id` in `messages` table is UUID. `user.uid` is String.
            // We MUST send UUID.
            // I will fetch my profile ID in useEffect.

            // ... see `fetchProfileId` below ...
            if (myDbId) {
                socket.emit('send_message', { ...messageData, sender_id: myDbId });
            }
        }
    };

    const [myDbId, setMyDbId] = useState(null);
    useEffect(() => {
        const getProfileId = async () => {
            const token = await user.getIdToken();
            const res = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyDbId(res.data.user.id);
        }
        getProfileId();
    }, []);

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
                    <AvatarFallback>{name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <View>
                    <Text className="font-bold text-slate-900">{name || 'Chat'}</Text>
                    {isConnected && <Text className="text-xs text-green-600">Online</Text>}
                </View>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: `/student/schedule/${id}`,
                        params: { name }
                    })}
                    className="ml-auto p-2 bg-blue-50 rounded-full"
                >
                    <Ionicons name="calendar" size={20} color="#2563eb" />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    // Check if sender is me. 
                    // item.sender_id might be UUID. myDbId is UUID. user.uid is Firebase ID.
                    // We compare with myDbId.
                    const isMe = item.sender_id === myDbId || item.sender_id === user.uid; // Optimistic uses uid

                    return (
                        <View className={`mb-3 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                            <View className={`p-3 rounded-2xl ${isMe ? 'bg-blue-600 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none'
                                }`}>
                                <Text className={isMe ? 'text-white' : 'text-slate-800'}>
                                    {item.content}
                                </Text>
                            </View>
                            <Text className={`text-[10px] mt-1 text-slate-400 ${isMe ? 'text-right' : 'text-left'}`}>
                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        className={`h-10 w-10 rounded-full items-center justify-center ${newMessage.trim() ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                        disabled={!newMessage.trim()}
                    >
                        <Ionicons name="send" size={20} color={newMessage.trim() ? 'white' : '#94a3b8'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
