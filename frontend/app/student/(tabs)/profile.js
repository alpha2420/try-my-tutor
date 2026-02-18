import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Input } from '../../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';

export default function StudentProfile() {
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
                        <AvatarFallback className="text-2xl">{user?.displayName?.[0] || 'S'}</AvatarFallback>
                    </Avatar>
                    <Text className="text-2xl font-bold text-slate-900">{user?.displayName || 'Student Name'}</Text>
                    <Text className="text-slate-500">{user?.email}</Text>
                </View>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Full Name</Text>
                            <Input value={user?.displayName || ''} editable={false} className="bg-slate-50" />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Email</Text>
                            <Input value={user?.email || ''} editable={false} className="bg-slate-50" />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Phone</Text>
                            <Input value={user?.phoneNumber || 'Not connected'} editable={false} className="bg-slate-50" />
                        </View>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="gap-2">
                        <Button variant="outline" className="justify-start pl-0 border-0">
                            <Ionicons name="notifications-outline" size={20} color="#0f172a" className="mr-2" />
                            <Text className="text-slate-900 font-medium text-sm">Notifications</Text>
                        </Button>
                        <Button variant="outline" className="justify-start pl-0 border-0">
                            <Ionicons name="lock-closed-outline" size={20} color="#0f172a" className="mr-2" />
                            <Text className="text-slate-900 font-medium text-sm">Privacy & Security</Text>
                        </Button>
                        <Button variant="outline" className="justify-start pl-0 border-0">
                            <Ionicons name="help-circle-outline" size={20} color="#0f172a" className="mr-2" />
                            <Text className="text-slate-900 font-medium text-sm">Help & Support</Text>
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
