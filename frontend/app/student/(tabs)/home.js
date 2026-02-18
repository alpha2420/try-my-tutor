import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function StudentHome() {
    const user = auth.currentUser;
    const router = useRouter();
    const [sessions, setSessions] = useState([]);

    const fetchSessions = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter for upcoming sessions logic if backend returns all
            // For now, assume backend returns all, we can filter or just show.
            // Let's simplified show all or filter future.
            const upcoming = response.data.sessions.filter(s => new Date(s.start_time) > new Date()).slice(0, 3);
            setSessions(upcoming);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchSessions();
        }, [])
    );

    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">
                            Hello, {user?.displayName || 'Student'}
                        </Text>
                        <Text className="text-slate-500">Find the perfect tutor for you</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/student/(tabs)/profile')}>
                        <Avatar>
                            <AvatarImage src={user?.photoURL} />
                            <AvatarFallback>{user?.displayName?.[0] || 'S'}</AvatarFallback>
                        </Avatar>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View className="mb-6 relative">
                    <Input
                        placeholder="What do you want to learn?"
                        className="pl-10 bg-white"
                        onFocus={() => router.push('/student/(tabs)/search')}
                    />
                    <Ionicons name="search" size={20} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                </View>

                {/* Popular Subjects */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold text-slate-900 mb-3">Popular Subjects</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                        {subjects.map((subject) => (
                            <Badge key={subject} variant="secondary" className="mr-2 px-3 py-1">
                                {subject}
                            </Badge>
                        ))}
                    </ScrollView>
                </View>

                {/* Main Actions */}
                <View className="gap-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post a Requirement</CardTitle>
                            <CardDescription>Tell us what you need and let tutors contact you.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onPress={() => router.push('/student/post-requirement')}>Post Requirement</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Sessions</CardTitle>
                            {sessions.length === 0 ? (
                                <CardDescription>You have no upcoming sessions.</CardDescription>
                            ) : null}
                        </CardHeader>
                        {sessions.length > 0 && (
                            <CardContent className="pt-0">
                                {sessions.map((session) => (
                                    <View key={session.id} className="mb-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                                        <Text className="font-bold text-slate-900">
                                            {session.tutors?.users?.full_name || 'Tutor'}
                                        </Text>
                                        <Text className="text-slate-500 text-sm">
                                            {new Date(session.start_time).toLocaleDateString()} at {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        {session.meeting_link && (
                                            <TouchableOpacity onPress={() => {/* Open Link */ }}>
                                                <Text className="text-blue-600 text-xs mt-1">Join Meeting</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </CardContent>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>My Requirements</CardTitle>
                            <CardDescription>View your posted jobs and received bids.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onPress={() => router.push('/student/requirements')}>View All</Button>
                        </CardContent>
                    </Card>
                </View>

                {/* Recommended Tutors (Placeholder) */}
                <View>
                    <Text className="text-lg font-semibold text-slate-900 mb-3">Recommended Tutors</Text>
                    <Card className="mb-3">
                        <CardContent className="flex-row items-center p-4">
                            <Avatar className="h-12 w-12 mr-4">
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900">John Doe</Text>
                                <Text className="text-slate-500 text-xs">Mathematics • 5.0 ★</Text>
                            </View>
                            <Button size="sm" variant="outline">View</Button>
                        </CardContent>
                    </Card>
                    <Card className="mb-3">
                        <CardContent className="flex-row items-center p-4">
                            <Avatar className="h-12 w-12 mr-4">
                                <AvatarFallback>JS</AvatarFallback>
                            </Avatar>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900">Jane Smith</Text>
                                <Text className="text-slate-500 text-xs">Physics • 4.8 ★</Text>
                            </View>
                            <Button size="sm" variant="outline">View</Button>
                        </CardContent>
                    </Card>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
