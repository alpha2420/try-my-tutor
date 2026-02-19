import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';

export default function StudentSearch() {
    const user = auth.currentUser;
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Coding'];

    const fetchTutors = async () => {
        try {
            setLoading(true);
            const token = await user.getIdToken();
            const params = {};
            if (search) params.search = search;
            if (activeFilter !== 'All') params.subject = activeFilter;

            const response = await axios.get(`${API_URL}/api/users/tutors`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setTutors(response.data.tutors);
        } catch (error) {
            console.error('Error fetching tutors:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTutors();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, activeFilter]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTutors();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-6 pt-4 pb-4 bg-white border-b border-slate-100 shadow-sm z-10">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Find Tutors</Text>

                <View className="flex-row items-center bg-slate-100 rounded-2xl h-12 px-4 mb-4 border border-slate-200">
                    <Ionicons name="search" size={20} color="#94a3b8" className="mr-3" />
                    <TextInput
                        placeholder="Search by name, subject, or skill..."
                        className="flex-1 bg-transparent border-0 h-full text-slate-700 text-base pl-2"
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#94a3b8"
                        style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 -mx-2 px-2">
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl transition-all ${activeFilter === filter
                                ? 'bg-blue-600 shadow-md shadow-blue-200'
                                : 'bg-white border border-slate-200'
                                }`}
                        >
                            <Text className={`font-medium ${activeFilter === filter ? 'text-white' : 'text-slate-600'
                                }`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {tutors.length === 0 && !loading ? (
                    <View className="items-center justify-center mt-20 opacity-70">
                        <Ionicons name="school-outline" size={64} color="#cbd5e1" className="mb-4" />
                        <Text className="text-center text-slate-500 font-medium">No tutors found.</Text>
                        <Text className="text-center text-slate-400 text-xs mt-1">Try adjusting your filters.</Text>
                    </View>
                ) : (
                    <View className="gap-4">
                        {tutors.map((tutor) => (
                            <View key={tutor.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                                <View className="flex-row gap-4 mb-4">
                                    <View className="relative">
                                        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-bold text-xl">
                                                {tutor.name?.[0] || 'T'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {/* Verify Badge simulation */}
                                        <View className="absolute -bottom-1 -right-1 bg-white p-[2px] rounded-full">
                                            <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                                        </View>
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start">
                                            <View>
                                                <Text className="font-bold text-lg text-slate-900">{tutor.name}</Text>
                                                <Text className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                                    {tutor.subjects?.[0] || 'General Tutor'}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                <Ionicons name="star" size={12} color="#eab308" className="mr-1" />
                                                <Text className="text-yellow-700 font-bold text-xs">{tutor.rating || 'New'}</Text>
                                            </View>
                                        </View>

                                        <Text className="text-slate-600 text-sm mt-3 leading-5" numberOfLines={2}>
                                            {tutor.bio || 'Passionate educator ready to elevate your learning experience.'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Stats & Action */}
                                <View className="flex-row items-center justify-between pt-4 border-t border-slate-50">
                                    <View>
                                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Hourly Rate</Text>
                                        <View className="flex-row items-baseline">
                                            <Text className="text-slate-900 font-bold text-lg">${tutor.hourly_rate || '25'}</Text>
                                            <Text className="text-slate-500 text-xs">/hr</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        className="bg-blue-600 px-6 py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                                        onPress={() => router.push({
                                            pathname: '/student/chat/[id]',
                                            params: { id: tutor.user_id, name: tutor.name, role: 'tutor' }
                                        })}
                                    >
                                        <Text className="text-white font-bold text-sm">Connect</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
