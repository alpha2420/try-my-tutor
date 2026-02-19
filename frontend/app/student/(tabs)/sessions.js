import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function StudentSessions() {
    const user = auth.currentUser;
    const [upcoming, setUpcoming] = useState([]);
    const [past, setPast] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allSessions = response.data.sessions;
            const now = new Date();

            const up = allSessions.filter(s => new Date(s.start_time) > now).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            const pa = allSessions.filter(s => new Date(s.start_time) <= now).sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

            setUpcoming(up);
            setPast(pa);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSessions();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSessions();
        setRefreshing(false);
    };

    const joinCall = (link) => {
        if (!link) {
            Alert.alert('No Link', 'The meeting link is not available yet.');
            return;
        }
        Linking.openURL(link).catch(err => {
            console.error('Failed to open link:', err);
            Alert.alert('Error', 'Could not open the meeting link.');
        });
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-40 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mb-16 opacity-50" />
                <View className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-16 -mt-16 opacity-50" />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pb-6 pt-2">
                    <Text className="text-3xl font-bold text-white shadow-sm">My Sessions</Text>
                    <Text className="text-blue-100 font-medium opacity-90">Track your learning journey</Text>
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Upcoming Sessions */}
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-blue-100 p-2 rounded-xl mr-3">
                                <Ionicons name="calendar" size={20} color="#2563eb" />
                            </View>
                            <Text className="text-lg font-bold text-slate-900">Upcoming</Text>
                            <View className="bg-blue-100 px-2 py-0.5 rounded-full ml-3">
                                <Text className="text-blue-700 font-bold text-xs">{upcoming.length}</Text>
                            </View>
                        </View>

                        {loading ? (
                            <Text className="text-slate-400 text-center py-4">Loading sessions...</Text>
                        ) : upcoming.length === 0 ? (
                            <View className="items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 border-dashed">
                                <Text className="text-slate-400 font-medium">No upcoming sessions</Text>
                            </View>
                        ) : (
                            upcoming.map((session) => (
                                <View key={session.id} className="bg-white p-5 mb-4 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-row items-center flex-1">
                                            <View className="h-12 w-12 bg-blue-50 rounded-2xl items-center justify-center mr-3 border border-blue-100">
                                                <Text className="text-blue-700 font-bold text-lg">
                                                    {new Date(session.start_time).getDate()}
                                                </Text>
                                                <Text className="text-blue-500 text-[10px] font-bold uppercase">
                                                    {new Date(session.start_time).toLocaleString('default', { month: 'short' })}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-bold text-slate-900 text-lg mb-0.5">
                                                    {session.tutors?.users?.full_name || 'Tutor'}
                                                </Text>
                                                <Text className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                                    Video Call
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                            <Text className="text-green-700 text-xs font-bold">Confirmed</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center mb-5 bg-slate-50 p-3 rounded-xl">
                                        <Ionicons name="time-outline" size={18} color="#64748b" className="mr-2" />
                                        <Text className="text-slate-600 font-medium">
                                            {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {' - '}
                                            {new Date(new Date(session.start_time).getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            className="flex-1 bg-blue-600 py-3 rounded-xl items-center shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                                            onPress={() => joinCall(session.meeting_link)}
                                        >
                                            <Text className="text-white font-bold">Join Call</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="px-4 py-3 rounded-xl bg-slate-100 items-center justify-center">
                                            <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Past Sessions */}
                    {past.length > 0 && (
                        <View>
                            <View className="flex-row items-center mb-4 mt-2">
                                <View className="bg-slate-100 p-2 rounded-xl mr-3">
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
                                </View>
                                <Text className="text-lg font-bold text-slate-700">Completed Sessions</Text>
                            </View>

                            {past.map((session) => (
                                <View key={session.id} className="bg-white p-4 mb-3 rounded-2xl border border-slate-100 opacity-80">
                                    <View className="flex-row items-center">
                                        <View className="h-10 w-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                                            <Ionicons name="videocam-off-outline" size={18} color="#94a3b8" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-bold text-slate-700">
                                                {session.tutors?.users?.full_name || 'Tutor'}
                                            </Text>
                                            <Text className="text-slate-500 text-xs">
                                                {new Date(session.start_time).toLocaleDateString()} • {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <View className="bg-slate-50 px-3 py-1 rounded-full text-xs">
                                            <Text className="text-slate-400 text-xs font-semibold">Completed</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
