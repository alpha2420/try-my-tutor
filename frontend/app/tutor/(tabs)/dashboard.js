import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { useTutorGuard } from '../../../hooks/useTutorGuard';
import { StatusBar } from 'expo-status-bar';

export default function TutorDashboard() {
    const { loading: guardLoading, isComplete } = useTutorGuard();
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

    if (guardLoading || !isComplete) return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white">
            <Text className="text-blue-600 font-bold text-lg">Checking Profile...</Text>
        </SafeAreaView>
    );

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
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-8 mt-2">
                        <View>
                            <Text className="text-3xl font-bold text-white">
                                Hello, {user?.displayName?.split(' ')[0] || 'Tutor'}!
                            </Text>
                            <Text className="text-blue-100 font-medium">Ready to teach today?</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/tutor/(tabs)/profile')}
                            className="bg-white/20 p-1 rounded-full border border-white/30"
                        >
                            <Avatar className="h-12 w-12 border-2 border-white">
                                <AvatarImage src={user?.photoURL} />
                                <AvatarFallback className="bg-blue-700 text-white">{user?.displayName?.[0] || 'T'}</AvatarFallback>
                            </Avatar>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap gap-4 mb-8">
                        <Card className="flex-1 min-w-[45%] bg-white border-0 shadow-sm shadow-blue-900/5 rounded-3xl">
                            <CardHeader className="p-4 pb-2">
                                <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="wallet-outline" size={20} color="#2563eb" />
                                </View>
                                <CardTitle className="text-sm font-bold text-slate-500 uppercase">Earnings</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <Text className="text-2xl font-bold text-slate-900">$0</Text>
                                <Text className="text-xs text-slate-400 font-medium mt-1">This Month</Text>
                            </CardContent>
                        </Card>
                        <Card className="flex-1 min-w-[45%] bg-white border-0 shadow-sm shadow-blue-900/5 rounded-3xl">
                            <CardHeader className="p-4 pb-2">
                                <View className="bg-purple-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="eye-outline" size={20} color="#7c3aed" />
                                </View>
                                <CardTitle className="text-sm font-bold text-slate-500 uppercase">Views</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <Text className="text-2xl font-bold text-slate-900">0</Text>
                                <Text className="text-xs text-slate-400 font-medium mt-1">Profile Visits</Text>
                            </CardContent>
                        </Card>
                    </View>

                    {/* New Leads */}
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-bold text-slate-800">New Leads</Text>
                            <TouchableOpacity onPress={fetchRequirements} className="flex-row items-center">
                                <Text className="text-blue-600 font-bold text-sm mr-1">Refresh</Text>
                                <Ionicons name="refresh" size={16} color="#2563eb" />
                            </TouchableOpacity>
                        </View>

                        {loading ? (
                            <View className="items-center py-10">
                                <Text className="text-slate-400">Finding new students...</Text>
                            </View>
                        ) : requirements.length === 0 ? (
                            <View className="bg-white p-8 rounded-3xl items-center border border-slate-100">
                                <Ionicons name="school-outline" size={48} color="#cbd5e1" />
                                <Text className="text-slate-500 font-medium mt-4 text-center">No new requirements posted yet.</Text>
                                <Text className="text-slate-400 text-sm text-center mt-1">Check back later!</Text>
                            </View>
                        ) : (
                            requirements.map((req) => (
                                <Card key={req.id} className="mb-4 border-0 shadow-sm shadow-blue-900/5 bg-white rounded-3xl overflow-hidden">
                                    <View className="h-2 bg-blue-500/10 w-full" />
                                    <CardHeader className="p-5 pb-2">
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-1 mr-3">
                                                <Text className="font-bold text-xl text-slate-800 leading-tight mb-1">{req.title}</Text>
                                                <View className="flex-row items-center">
                                                    <Ionicons name="location-outline" size={14} color="#64748b" className="mr-1" />
                                                    <Text className="text-slate-500 text-sm font-medium">{req.location || 'Online'}</Text>
                                                </View>
                                            </View>
                                            <View className="bg-green-100 px-3 py-1.5 rounded-xl">
                                                <Text className="text-green-700 text-xs font-bold">
                                                    ${req.budget_min} - ${req.budget_max}
                                                </Text>
                                            </View>
                                        </View>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-2">
                                        <View className="flex-row flex-wrap gap-2 mb-3">
                                            <View className="bg-slate-100 px-2 py-1 rounded-md">
                                                <Text className="text-xs text-slate-600 font-medium">{req.grade}</Text>
                                            </View>
                                            {req.subjects?.name && (
                                                <View className="bg-blue-50 px-2 py-1 rounded-md">
                                                    <Text className="text-xs text-blue-600 font-medium">{req.subjects.name}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-slate-600 mb-4 leading-relaxed" numberOfLines={3}>
                                            {req.description}
                                        </Text>
                                        <Button
                                            onPress={() => openBidModal(req)}
                                            className="w-full bg-slate-900 rounded-2xl h-12 shadow-none active:scale-[0.98]"
                                        >
                                            <Text className="text-white font-bold">Apply Now</Text>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </View>

                    {/* Quick Actions */}
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-800 mb-4">Quick Actions</Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 items-center justify-center shadow-sm">
                                <View className="bg-orange-100 p-3 rounded-full mb-2">
                                    <Ionicons name="time" size={24} color="#ea580c" />
                                </View>
                                <Text className="font-bold text-slate-700 text-center">Update Availability</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={fetchRequirements} className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 items-center justify-center shadow-sm">
                                <View className="bg-blue-100 p-3 rounded-full mb-2">
                                    <Ionicons name="search" size={24} color="#2563eb" />
                                </View>
                                <Text className="font-bold text-slate-700 text-center">Find Students</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Bid Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white rounded-t-[40px] p-8 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-slate-900">Place a Bid</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-500 font-medium mb-6">
                            For: <Text className="text-slate-900 font-bold">{selectedRequirement?.title}</Text>
                        </Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Your Rate per Hour ($)</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="cash-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="e.g. 25"
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 text-base font-medium"
                                            value={bidAmount}
                                            onChangeText={setBidAmount}
                                            keyboardType="numeric"
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-sm font-bold text-slate-500 uppercase mb-2 ml-1">Message to Student</Text>
                                    <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:bg-white transition-colors">
                                        <TextInput
                                            placeholder="Introduce yourself & explain why you're a good fit..."
                                            placeholderTextColor="#94a3b8"
                                            className="bg-transparent border-0 text-slate-900 text-base font-medium min-h-[120px]"
                                            value={bidMessage}
                                            onChangeText={setBidMessage}
                                            multiline
                                            textAlignVertical="top"
                                            style={{ includeFontPadding: false }}
                                        />
                                    </View>
                                </View>

                                <Button
                                    onPress={submitBid}
                                    loading={submitting}
                                    className="h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mt-4"
                                    textClassName="text-lg font-bold"
                                >
                                    Submit Bid
                                </Button>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
