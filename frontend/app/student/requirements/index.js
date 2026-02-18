import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export default function MyRequirementsScreen() {
    const router = useRouter();
    const user = auth.currentUser;
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyRequirements = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/requirements/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequirements(response.data.requirements);
        } catch (error) {
            console.error('Error fetching my requirements:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyRequirements();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMyRequirements();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-slate-100 text-slate-800';
            case 'fulfilled': return 'bg-blue-100 text-blue-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 border-b border-slate-200 bg-white flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">My Requirements</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <Text className="text-center text-slate-500 mt-10">Loading...</Text>
                ) : requirements.length === 0 ? (
                    <View className="items-center mt-20">
                        <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                        <Text className="text-lg font-semibold text-slate-900 mt-4">No Requirements Posted</Text>
                        <Text className="text-slate-500 text-center mt-2 px-8">
                            You haven't posted any tutor requirements yet.
                        </Text>
                    </View>
                ) : (
                    requirements.map((req) => (
                        <TouchableOpacity
                            key={req.id}
                            onPress={() => router.push(`/student/requirements/${req.id}`)}
                            activeOpacity={0.8}
                        >
                            <Card className="mb-4">
                                <CardHeader className="p-4 pb-2 flex-row justify-between items-start">
                                    <View className="flex-1 mr-2">
                                        <CardTitle className="text-lg">{req.title}</CardTitle>
                                        <Text className="text-slate-500 text-xs mt-1">
                                            Posted on {new Date(req.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className={`px-2 py-1 rounded ${getStatusColor(req.status)}`}>
                                        <Text className="text-xs font-bold capitalize">
                                            {req.status}
                                        </Text>
                                    </View>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <Text className="text-slate-600 mb-3" numberOfLines={2}>
                                        {req.description}
                                    </Text>
                                    <View className="flex-row justify-between items-center border-t border-slate-100 pt-3">
                                        <Text className="text-slate-500 text-sm">
                                            {req.bids?.length || 0} Bids Received (Simulated)
                                        </Text>
                                        <View className="flex-row items-center text-blue-600">
                                            <Text className="text-blue-600 font-medium text-sm mr-1">View Bids</Text>
                                            <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                                        </View>
                                    </View>
                                </CardContent>
                            </Card>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
