import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { StatusBar } from 'expo-status-bar';

export default function StudentHome() {
    const user = auth.currentUser;
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const token = await user.getIdToken();
            const [sessionsRes, tutorsRes] = await Promise.all([
                axios.get(`${API_URL}/api/sessions`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/users/tutors?limit=5`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const upcoming = sessionsRes.data.sessions
                .filter(s => new Date(s.start_time) > new Date())
                .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                .slice(0, 2); // Show top 2

            setSessions(upcoming);
            setTutors(tutorsRes.data.tutors);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-48 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mb-16 opacity-50" />
                <View className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-16 -mt-16 opacity-50" />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Content */}
                    <View className="px-6 pt-2 pb-6 mb-2">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-blue-100 text-sm font-medium mb-1">Welcome back,</Text>
                                <Text className="text-3xl font-bold text-white shadow-sm">
                                    {user?.displayName ? user.displayName.split(' ')[0] : 'Student'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/student/(tabs)/profile')}
                                className="bg-white/20 p-1 rounded-full backdrop-blur-md border border-white/30 shadow-sm"
                            >
                                <Avatar className="h-12 w-12 border-2 border-white">
                                    <AvatarImage src={user?.photoURL} />
                                    <AvatarFallback className="bg-blue-800 text-white font-bold">{user?.displayName?.[0] || 'S'}</AvatarFallback>
                                </Avatar>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View className="bg-white rounded-2xl shadow-lg shadow-blue-900/10 flex-row items-center h-14 px-4">
                            <Ionicons name="search" size={22} color="#94a3b8" className="mr-3" />
                            <TextInput
                                placeholder="What do you want to learn today?"
                                className="flex-1 bg-transparent border-0 h-full text-slate-700 text-base font-medium"
                                placeholderTextColor="#94a3b8"
                                showSoftInputOnFocus={false}
                                onPressIn={() => router.push('/student/(tabs)/search')}
                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                            />
                        </View>
                    </View>

                    {/* Quick Actions / Categories */}
                    <View className="mb-8">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10 }}
                            className="flex-row"
                        >
                            {subjects.map((subject, index) => (
                                <TouchableOpacity
                                    key={subject}
                                    className={`px-5 py-2.5 rounded-full mr-3 shadow-sm ${index === 0 ? 'bg-blue-600 shadow-blue-200' : 'bg-white border border-slate-100'}`}
                                >
                                    <Text className={`font-bold ${index === 0 ? 'text-white' : 'text-slate-600'}`}>
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Post Requirement (Hero Card) */}
                    <View className="px-6 mb-8">
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push('/student/post-requirement')}
                            className="bg-indigo-600 rounded-[28px] p-6 shadow-xl shadow-indigo-200 relative overflow-hidden h-48 justify-center"
                        >
                            {/* Decorative Circles */}
                            <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
                            <View className="absolute -right-4 bottom-0 w-24 h-24 bg-white/10 rounded-full" />

                            <View className="items-start relative z-10">
                                <View className="bg-white/20 px-3 py-1 rounded-full mb-3 backdrop-blur-sm border border-white/10">
                                    <Text className="text-white text-xs font-bold uppercase tracking-wider">Fast Track</Text>
                                </View>
                                <Text className="text-white font-bold text-2xl mb-2 leading-tight">Find your perfect{'\n'}tutor today</Text>
                                <View className="bg-white px-5 py-2.5 rounded-xl shadow-sm mt-2">
                                    <Text className="text-indigo-600 font-bold text-sm">Post a Requirement</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Requirements Status */}
                    <View className="px-6 mb-8">
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push('/student/requirements')}
                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <View className="h-12 w-12 bg-amber-50 rounded-2xl items-center justify-center mr-4">
                                    <Ionicons name="list" size={24} color="#d97706" />
                                </View>
                                <View>
                                    <Text className="font-bold text-slate-900 text-base">My Requirements</Text>
                                    <Text className="text-slate-500 text-xs mt-1 font-medium">Check status & bids</Text>
                                </View>
                            </View>
                            <View className="bg-slate-50 w-10 h-10 rounded-full items-center justify-center">
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Upcoming Sessions */}
                    <View className="px-6 mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-slate-900">Upcoming Sessions</Text>
                            {sessions.length > 0 && (
                                <TouchableOpacity onPress={() => router.push('/student/(tabs)/sessions')}>
                                    <Text className="text-blue-600 font-bold text-sm">See All</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {sessions.length === 0 ? (
                            <View className="bg-white rounded-3xl p-8 border border-slate-100 items-center justify-center shadow-sm">
                                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="calendar-clear-outline" size={32} color="#94a3b8" />
                                </View>
                                <Text className="text-slate-500 font-semibold text-base mb-1">No sessions scheduled</Text>
                                <Text className="text-slate-400 text-sm text-center">Book a tutor to start learning!</Text>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {sessions.map((session) => (
                                    <TouchableOpacity
                                        key={session.id}
                                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 flex-row items-center"
                                        onPress={() => router.push('/student/(tabs)/sessions')}
                                    >
                                        <View className="h-14 w-14 rounded-2xl bg-blue-50 items-center justify-center mr-4 border border-blue-100">
                                            <Text className="text-blue-600 font-bold text-lg">
                                                {new Date(session.start_time).getDate()}
                                            </Text>
                                            <Text className="text-blue-500 text-[10px] font-bold uppercase tracking-wide">
                                                {new Date(session.start_time).toLocaleString('default', { month: 'short' })}
                                            </Text>
                                        </View>
                                        <View className="flex-1 mr-2">
                                            <Text className="font-bold text-slate-900 text-base mb-1" numberOfLines={1}>
                                                {session.tutors?.users?.full_name || 'Tutor Session'}
                                            </Text>
                                            <View className="flex-row items-center">
                                                <Ionicons name="time-outline" size={14} color="#64748b" className="mr-1" />
                                                <Text className="text-slate-500 text-xs font-medium">
                                                    {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="bg-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-200">
                                            <Ionicons name="videocam" size={18} color="white" />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Featured Tutors (Horizontal) */}
                    <View className="mb-4">
                        <View className="flex-row justify-between items-center mb-4 px-6">
                            <Text className="text-xl font-bold text-slate-900">Top Rated Tutors</Text>
                            <TouchableOpacity onPress={() => router.push('/student/(tabs)/search')}>
                                <Text className="text-blue-600 font-bold text-sm">View All</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
                            {tutors.length === 0 ? (
                                <Text className="text-slate-500 italic ml-1">No tutors featured yet.</Text>
                            ) : (
                                tutors.map((tutor) => (
                                    <TouchableOpacity
                                        key={tutor.id}
                                        className="bg-white w-64 p-4 rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50 pb-5"
                                        onPress={() => router.push({ pathname: '/student/chat/[id]', params: { id: tutor.user_id, name: tutor.name } })}
                                    >
                                        <View className="flex-row items-center mb-3">
                                            <Avatar className="h-12 w-12 mr-3 border border-slate-100">
                                                <AvatarFallback className="bg-orange-50 text-orange-600 font-bold text-lg">{tutor.name?.[0] || 'T'}</AvatarFallback>
                                            </Avatar>
                                            <View className="flex-1">
                                                <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>{tutor.name}</Text>
                                                <Text className="text-blue-600 font-bold text-xs">
                                                    {tutor.hourly_rate ? `$${tutor.hourly_rate}/hr` : 'Rate TBD'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center space-x-2 mb-3">
                                            <View className="flex-row items-center bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100/50">
                                                <Ionicons name="star" size={14} color="#eab308" className="mr-1" />
                                                <Text className="text-yellow-700 font-bold text-xs">{tutor.rating || '5.0'}</Text>
                                            </View>
                                            <View className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                <Text className="text-slate-600 text-xs font-semibold" numberOfLines={1}>{tutor.subjects?.[0] || 'Tutor'}</Text>
                                            </View>
                                        </View>

                                        <Text className="text-slate-500 text-sm leading-5 mb-0 line-clamp-2 h-10" numberOfLines={2}>
                                            {tutor.bio || 'Experienced tutor ready to help you learn and achieve your goals.'}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
