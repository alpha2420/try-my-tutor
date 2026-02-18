import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TutorDashboard() {
    const user = auth.currentUser;
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
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
                    <Card className="flex-1 min-w-[45%]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Earnings</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-2xl font-bold text-slate-900">$1,234</Text>
                            <Text className="text-xs text-green-600">+12% from last month</Text>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active Students</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-2xl font-bold text-slate-900">12</Text>
                            <Text className="text-xs text-slate-500">+2 new this week</Text>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Profile Views</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-2xl font-bold text-slate-900">543</Text>
                            <Text className="text-xs text-green-600">+8% from last week</Text>
                        </CardContent>
                    </Card>
                    <Card className="flex-1 min-w-[45%]">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Rating</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <View className="flex-row items-center">
                                <Text className="text-2xl font-bold text-slate-900 mr-2">4.9</Text>
                                <Ionicons name="star" size={16} color="#eab308" />
                            </View>
                            <Text className="text-xs text-slate-500">150 reviews</Text>
                        </CardContent>
                    </Card>
                </View>

                {/* New Leads */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-semibold text-slate-900">New Leads</Text>
                        <Text className="text-blue-600 text-sm">View All</Text>
                    </View>

                    <Card className="mb-3">
                        <CardHeader className="p-4">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="font-bold text-lg text-slate-900">Physics Tutor Needed</Text>
                                    <Text className="text-slate-500 text-sm">Grade 10 • Online</Text>
                                </View>
                                <View className="bg-green-100 px-2 py-1 rounded">
                                    <Text className="text-green-800 text-xs font-bold">$25/hr</Text>
                                </View>
                            </View>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-slate-600 mb-3" numberOfLines={2}>
                                Looking for an experienced Physics tutor to help with mechanics and thermodynamics.
                            </Text>
                            <Button size="sm">Apply Now</Button>
                        </CardContent>
                    </Card>

                    <Card className="mb-3">
                        <CardHeader className="p-4">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="font-bold text-lg text-slate-900">Calculus Help</Text>
                                    <Text className="text-slate-500 text-sm">College • In-Person</Text>
                                </View>
                                <View className="bg-green-100 px-2 py-1 rounded">
                                    <Text className="text-green-800 text-xs font-bold">$30/hr</Text>
                                </View>
                            </View>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Text className="text-slate-600 mb-3" numberOfLines={2}>
                                Need help understanding limits and derivatives for my upcoming exam.
                            </Text>
                            <Button size="sm">Apply Now</Button>
                        </CardContent>
                    </Card>
                </View>

                {/* Quick Actions */}
                <View>
                    <Text className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</Text>
                    <View className="flex-row gap-3">
                        <Button variant="outline" className="flex-1">Update Availability</Button>
                        <Button variant="outline" className="flex-1">Boost Profile</Button>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
