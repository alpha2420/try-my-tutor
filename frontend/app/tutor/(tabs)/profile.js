import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';

export default function TutorProfile() {
    const user = auth.currentUser;
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.replace('/');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="items-center mb-8 pt-4">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback className="text-2xl">{user?.displayName?.[0] || 'T'}</AvatarFallback>
                    </Avatar>
                    <Text className="text-2xl font-bold text-slate-900">{user?.displayName || 'Tutor Name'}</Text>
                    <Text className="text-slate-500">{user?.email}</Text>
                    <View className="flex-row mt-2">
                        <Badge className="mr-2">Verified Tutor</Badge>
                        <Badge variant="secondary">Mathematics</Badge>
                    </View>
                </View>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                        <CardDescription>Update your qualifications and bio</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Bio</Text>
                            <Input placeholder="Tell students about yourself..." multiline numberOfLines={3} className="h-20 bg-slate-50" />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</Text>
                            <Input placeholder="20" keyboardType="numeric" className="bg-slate-50" />
                        </View>
                    </CardContent>
                    <View className="p-6 pt-0">
                        <Button variant="outline">Save Changes</Button>
                    </View>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-2">
                        <Button variant="outline" className="justify-start pl-0 border-0">
                            <Ionicons name="card-outline" size={20} color="#0f172a" className="mr-2" />
                            Payment Methods
                        </Button>
                        <Button variant="outline" className="justify-start pl-0 border-0">
                            <Ionicons name="notifications-outline" size={20} color="#0f172a" className="mr-2" />
                            Notifications
                        </Button>
                        <Button variant="outline" className="justify-start pl-0 border-0">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#0f172a" className="mr-2" />
                            Verification Status
                        </Button>
                    </CardContent>
                </Card>

                <Button variant="destructive" onPress={handleLogout} className="mb-8">
                    Log Out
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
