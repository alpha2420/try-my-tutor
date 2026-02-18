import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';

export default function RequirementDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const user = auth.currentUser;

    const [requirement, setRequirement] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingBid, setProcessingBid] = useState(null);

    const fetchData = async () => {
        try {
            const token = await user.getIdToken();

            // 1. Fetch Requirement Details (Re-using getRequirements endpoints or need specific? 
            // Actually getMyRequirements returned all, but we might want a specific single fetch.
            // For now, let's assume we can fetch bids which checks ownership)

            // Fetch Bids (which validates ownership)
            const bidsResponse = await axios.get(`${API_URL}/api/bids/requirement/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBids(bidsResponse.data.bids);

            // If we need requirement details, we might need an endpoint or pass params.
            // But let's fetch it if possible. The bids response doesn't give full req details.
            // TODO: Ideally we should have GET /api/requirements/:id
            // For now, let's simulate or fetch all and find? No that's inefficient.
            // Let's implement GET /api/requirements/:id in backend if needed, or rely on previous screen passing data?
            // Better to fetch. I'll add a quick fetch to the existing list endpoint with a filter if possible, 
            // OR just use what we have. 
            // Wait, `getBidsForRequirement` checks ownership. 
            // Let's rely on basic display for now or just fetch all 'my' and filter (cleanest for MVP without new backend).

            const reqResponse = await axios.get(`${API_URL}/api/requirements/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const foundReq = reqResponse.data.requirements.find(r => r.id === id);
            if (foundReq) setRequirement(foundReq);

        } catch (error) {
            console.error('Error fetching details:', error);
            Alert.alert('Error', 'Failed to load details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleBidAction = async (bidId, status) => {
        setProcessingBid(bidId);
        try {
            const token = await user.getIdToken();
            await axios.put(`${API_URL}/api/bids/${bidId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', `Bid ${status} successfully!`);
            fetchData(); // Refresh
        } catch (error) {
            console.error(error);
            Alert.alert('Error', `Failed to ${status} bid`);
        } finally {
            setProcessingBid(null);
        }
    };

    if (loading) return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text>Loading...</Text>
        </SafeAreaView>
    );

    if (!requirement) return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text>Requirement not found.</Text>
            <Button variant="link" onPress={() => router.back()}>Go Back</Button>
        </SafeAreaView>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 border-b border-slate-200 bg-white flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Requirement Details</Text>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Requirement Info */}
                <Card className="mb-6 border-blue-100 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="text-xl">{requirement.title}</CardTitle>
                        <Text className="text-slate-500 text-sm mt-1">
                            Status: <Text className="font-bold capitalize text-blue-700">{requirement.status}</Text>
                        </Text>
                    </CardHeader>
                    <CardContent>
                        <Text className="text-slate-700 mb-2">{requirement.description}</Text>
                        <View className="flex-row flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{requirement.grade}</Badge>
                            <Badge variant="outline">{requirement.subject?.name || 'Subject'}</Badge>
                            <Badge variant="outline">${requirement.budget_min} - ${requirement.budget_max}</Badge>
                        </View>
                    </CardContent>
                </Card>

                {/* Bids List */}
                <Text className="text-lg font-bold text-slate-900 mb-3">
                    Received Bids ({bids.length})
                </Text>

                {bids.length === 0 ? (
                    <View className="p-8 items-center bg-white rounded-xl border border-dashed border-slate-300">
                        <Text className="text-slate-500">No bids received yet.</Text>
                    </View>
                ) : (
                    bids.map((bid) => (
                        <Card key={bid.id} className="mb-4">
                            <CardHeader className="p-4 flex-row items-center space-y-0">
                                <Avatar className="h-10 w-10 mr-3">
                                    <AvatarFallback>{bid.tutors?.users?.full_name?.[0] || 'T'}</AvatarFallback>
                                </Avatar>
                                <View className="flex-1">
                                    <CardTitle className="text-base">{bid.tutors?.users?.full_name || 'Tutor'}</CardTitle>
                                    <Text className="text-xs text-slate-500">
                                        {bid.tutors?.experience_years} years exp • {bid.tutors?.rating} ★
                                    </Text>
                                </View>
                                <View className="bg-green-100 px-2 py-1 rounded">
                                    <Text className="text-green-800 font-bold">${bid.amount}</Text>
                                </View>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <Text className="text-slate-600 mb-3 italic">"{bid.message}"</Text>

                                {bid.status === 'pending' && (
                                    <View className="flex-row gap-3">
                                        <Button
                                            className="flex-1 bg-green-600"
                                            size="sm"
                                            onPress={() => handleBidAction(bid.id, 'accepted')}
                                            loading={processingBid === bid.id}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            variant="outline"
                                            size="sm"
                                            onPress={() => router.push({
                                                pathname: `/student/chat/${bid.tutors.user_id}`,
                                                params: {
                                                    name: bid.tutors.users.full_name,
                                                    role: 'tutor'
                                                }
                                            })}
                                        >
                                            <Text className="text-slate-900 font-medium">Chat</Text>
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => handleBidAction(bid.id, 'rejected')}
                                            loading={processingBid === bid.id}
                                        >
                                            Reject
                                        </Button>
                                    </View>
                                )}

                                {bid.status !== 'pending' && (
                                    <View className="flex-row justify-between items-center mt-2">
                                        <View className={`px-2 py-1 rounded inline-flex ${bid.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            <Text className={`font-bold text-xs capitalize ${bid.status === 'accepted' ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                {bid.status}
                                            </Text>
                                        </View>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onPress={() => router.push({
                                                pathname: `/student/chat/${bid.tutors.user_id}`,
                                                params: {
                                                    name: bid.tutors.users.full_name,
                                                    role: 'tutor'
                                                }
                                            })}
                                        >
                                            <Ionicons name="chatbubble-outline" size={16} color="#475569" className="mr-1" />
                                            <Text className="text-slate-900 font-medium ml-1">Chat</Text>
                                        </Button>
                                        {bid.status === 'accepted' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="ml-2"
                                                onPress={() => router.push({
                                                    pathname: `/student/schedule/${bid.tutors.user_id}`,
                                                    params: {
                                                        name: bid.tutors.users.full_name
                                                    }
                                                })}
                                            >
                                                <Ionicons name="calendar-outline" size={16} color="#0f172a" className="mr-1" />
                                                <Text className="text-slate-900 font-medium ml-1">Schedule</Text>
                                            </Button>
                                        )}
                                    </View>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
