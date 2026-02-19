import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useTutorGuard } from '../../../hooks/useTutorGuard';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { StatusBar } from 'expo-status-bar';

export default function TutorSessions() {
    const { loading: guardLoading, isComplete } = useTutorGuard();
    const user = auth.currentUser;
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchSessions = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isComplete) {
            fetchSessions();
        } else {
            setLoading(false);
        }
    }, [isComplete]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSessions();
    }, []);

    const handleJoinCall = (link) => {
        if (link) {
            Linking.openURL(link).catch(err => console.error("Couldn't load page", err));
        } else {
            alert('Meeting link not available yet.');
        }
    };

    if (guardLoading || !isComplete) return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text className="text-blue-600 font-bold">Checking Profile...</Text>
        </SafeAreaView>
    );

    // Group sessions
    const upcoming = sessions.filter(s => s.status === 'scheduled' || s.status === 'confirmed');
    const past = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-40 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500 rounded-full -mr-10 -mb-10 opacity-50" />
                <View className="absolute top-0 left-0 w-24 h-24 bg-blue-500 rounded-full -ml-10 -mt-10 opacity-50" />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pb-6 pt-2">
                    <Text className="text-3xl font-bold text-white">My Sessions</Text>
                    <Text className="text-blue-100 font-medium opacity-90">Manage your classes</Text>
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Upcoming */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-4">
                            <View className="w-1 h-6 bg-blue-600 rounded-full mr-2" />
                            <Text className="text-lg font-bold text-slate-800">Upcoming Classes</Text>
                        </View>

                        {upcoming.length === 0 && !loading ? (
                            <View className="bg-white p-6 rounded-3xl items-center border border-slate-100 border-dashed">
                                <Ionicons name="calendar-outline" size={40} color="#cbd5e1" />
                                <Text className="text-slate-500 font-medium mt-3">No upcoming sessions.</Text>
                            </View>
                        ) : (
                            upcoming.map((session) => (
                                <Card key={session.id} className="mb-4 border-0 shadow-sm shadow-blue-900/5 bg-white rounded-3xl overflow-hidden">
                                    <View className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                                    <CardHeader className="p-5 pb-2 flex-row justify-between items-start pl-6">
                                        <View className="flex-1">
                                            <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                                                {session.requirements?.title || session.requirement_title || 'Session'}
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 font-medium">
                                                with <Text className="text-blue-600">{session.students?.users?.full_name || 'Student'}</Text>
                                            </CardDescription>
                                        </View>
                                        <Badge className={`ml-2 ${session.status === 'scheduled' ? 'bg-green-100' : 'bg-slate-100'}`}>
                                            <Text className={`${session.status === 'scheduled' ? 'text-green-700' : 'text-slate-600'} text-xs font-bold capitalize`}>
                                                {session.status}
                                            </Text>
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0 pl-6">
                                        <View className="flex-row items-center mb-4 mt-3 bg-slate-50 self-start px-3 py-1.5 rounded-lg">
                                            <Ionicons name="time" size={16} color="#475569" className="mr-2" />
                                            <Text className="text-slate-700 font-semibold">
                                                {new Date(session.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                            </Text>
                                        </View>
                                        <View className="flex-row gap-3">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-blue-600 rounded-xl"
                                                onPress={() => handleJoinCall(session.meeting_link)}
                                            >
                                                Join Call
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 rounded-xl border-slate-200">
                                                Reschedule
                                            </Button>
                                        </View>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </View>

                    {/* Past */}
                    {past.length > 0 && (
                        <View>
                            <View className="flex-row items-center mb-4">
                                <View className="w-1 h-6 bg-slate-400 rounded-full mr-2" />
                                <Text className="text-lg font-bold text-slate-800">Past Sessions</Text>
                            </View>
                            {past.map((session) => (
                                <Card key={session.id} className="mb-4 border-0 shadow-sm bg-slate-50 rounded-2xl opacity-80">
                                    <CardHeader className="p-4 pb-2 flex-row justify-between items-start">
                                        <View>
                                            <CardTitle className="text-base font-bold text-slate-700">
                                                {session.requirements?.title || 'Session'}
                                            </CardTitle>
                                            <CardDescription className="text-xs text-slate-500">
                                                {new Date(session.start_time).toLocaleDateString()}
                                            </CardDescription>
                                        </View>
                                        <Badge variant="outline" className="border-slate-300">
                                            <Text className="text-slate-500 text-[10px] uppercase font-bold">{session.status}</Text>
                                        </Badge>
                                    </CardHeader>
                                </Card>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
