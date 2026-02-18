import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useTutorGuard } from '../../../hooks/useTutorGuard';

export default function TutorSessions() {
    const { loading: guardLoading, isComplete } = useTutorGuard();

    const sessions = [
        { id: 1, student: 'Alice Student', subject: 'Math', date: 'Today, 5:00 PM', status: 'Upcoming' },
        { id: 2, student: 'Bob Learner', subject: 'Physics', date: 'Tomorrow, 2:00 PM', status: 'Confirmed' },
    ];

    if (guardLoading || !isComplete) return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text>Checking Profile...</Text>
        </SafeAreaView>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 bg-white border-b border-slate-200">
                <Text className="text-2xl font-bold text-slate-900">My Sessions</Text>
                <Text className="text-slate-500">Upcoming and past classes</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className="text-lg font-semibold text-slate-900 mb-3">Upcoming</Text>
                {sessions.map((session) => (
                    <Card key={session.id} className="mb-4">
                        <CardHeader className="p-4 pb-2 flex-row justify-between items-start">
                            <View>
                                <CardTitle className="text-lg">{session.subject}</CardTitle>
                                <CardDescription>with {session.student}</CardDescription>
                            </View>
                            <Badge variant={session.status === 'Upcoming' ? 'default' : 'secondary'}>
                                {session.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <View className="flex-row items-center mb-4 mt-2">
                                <Ionicons name="time-outline" size={16} color="#64748b" className="mr-1" />
                                <Text className="text-slate-600">{session.date}</Text>
                            </View>
                            <View className="flex-row gap-2">
                                <Button size="sm" className="flex-1">Join Call</Button>
                                <Button size="sm" variant="outline" className="flex-1">Reschedule</Button>
                            </View>
                        </CardContent>
                    </Card>
                ))}

                <Text className="text-lg font-semibold text-slate-900 mb-3 mt-4">Past Sessions</Text>
                <Card className="mb-4 opacity-70">
                    <CardHeader className="p-4 pb-2 flex-row justify-between items-start">
                        <View>
                            <CardTitle className="text-lg">Chemistry</CardTitle>
                            <CardDescription>with Charlie</CardDescription>
                        </View>
                        <Badge variant="outline">Completed</Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <View className="flex-row items-center mb-2 mt-2">
                            <Ionicons name="time-outline" size={16} color="#64748b" className="mr-1" />
                            <Text className="text-slate-600">Yesterday, 10:00 AM</Text>
                        </View>
                    </CardContent>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
