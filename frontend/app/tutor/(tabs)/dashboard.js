import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function TutorDashboard() {
    const user = auth.currentUser;
    const router = useRouter();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Bidding State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [bidMessage, setBidMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequirements = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/requirements`);
            setRequirements(response.data.requirements);
        } catch (error) {
            console.error('Error fetching requirements:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRequirements();
    }, []);

    const openBidModal = (req) => {
        setSelectedRequirement(req);
        setBidAmount('');
        setBidMessage(`I can help you with ${req.subjects?.name || 'this subject'}. I have experience teaching this level.`);
        setModalVisible(true);
    };

    const submitBid = async () => {
        if (!bidAmount || !bidMessage) {
            Alert.alert('Error', 'Please enter amount and message');
            return;
        }

        setSubmitting(true);
        try {
            const token = await user.getIdToken();
            await axios.post(`${API_URL}/api/bids`, {
                requirement_id: selectedRequirement.id,
                amount: parseFloat(bidAmount),
                message: bidMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Bid placed successfully!');
            setModalVisible(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to place bid. ' + (error.response?.data?.error || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">
                            Welcome, {user?.displayName || 'Tutor'}
                        </Text>
                        <Text className="text-slate-500">Manage your students and earnings</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/tutor/(tabs)/profile')}>
                        <Avatar>
                            <AvatarImage src={user?.photoURL} />
                            <AvatarFallback>{user?.displayName?.[0] || 'T'}</AvatarFallback>
                        </Avatar>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {/* ... stats cards ... (Keeping static for now or can fetch later) */}
                    <Card className="flex-1 min-w-[45%]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-2xl font-bold text-slate-900">$0</Text>
                            <Text className="text-xs text-slate-500">Start tutoring to earn!</Text>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Profile Views</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-2xl font-bold text-slate-900">0</Text>
                        </CardContent>
                    </Card>
                </View>

                {/* New Leads */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-semibold text-slate-900">New Leads</Text>
                        <TouchableOpacity onPress={fetchRequirements}>
                            <Ionicons name="refresh" size={20} color="#2563eb" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text>Loading leads...</Text>
                    ) : requirements.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 items-center">
                                <Text className="text-slate-500">No new requirements posted yet.</Text>
                            </CardContent>
                        </Card>
                    ) : (
                        requirements.map((req) => (
                            <Card key={req.id} className="mb-3">
                                <CardHeader className="p-4">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 mr-2">
                                            <Text className="font-bold text-lg text-slate-900">{req.title}</Text>
                                            <Text className="text-slate-500 text-sm">{req.grade} • {req.location || 'Online'}</Text>
                                        </View>
                                        <View className="bg-green-100 px-2 py-1 rounded">
                                            <Text className="text-green-800 text-xs font-bold">
                                                ${req.budget_min}
                                            </Text>
                                        </View>
                                    </View>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <Text className="text-slate-600 mb-3" numberOfLines={3}>
                                        {req.description}
                                    </Text>
                                    <Button size="sm" onPress={() => openBidModal(req)}>Apply Now</Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </View>

                {/* Quick Actions */}
                <View>
                    <Text className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</Text>
                    <View className="flex-row gap-3">
                        <Button variant="outline" className="flex-1">Update Availability</Button>
                    </View>
                </View>
            </ScrollView>

            {/* Bid Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold">Place a Bid</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm text-slate-500 mb-4">
                            For: {selectedRequirement?.title}
                        </Text>

                        <View className="mb-4">
                            <Text className="text-sm font-medium mb-1">Your Rate per Hour/Session ($)</Text>
                            <TextInput
                                className="border border-slate-300 rounded-md p-3"
                                placeholder="e.g. 25"
                                keyboardType="numeric"
                                value={bidAmount}
                                onChangeText={setBidAmount}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-medium mb-1">Message to Student</Text>
                            <TextInput
                                className="border border-slate-300 rounded-md p-3 h-24"
                                placeholder="Introduce yourself..."
                                multiline
                                textAlignVertical="top"
                                value={bidMessage}
                                onChangeText={setBidMessage}
                            />
                        </View>

                        <Button onPress={submitBid} loading={submitting}>
                            Submit Bid
                        </Button>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
