import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function StudentHome() {
    const user = auth.currentUser;
    const router = useRouter();

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
                            <CardDescription>You have no upcoming sessions.</CardDescription>
                        </CardHeader>
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
