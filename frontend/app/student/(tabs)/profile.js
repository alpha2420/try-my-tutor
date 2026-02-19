import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { StatusBar } from 'expo-status-bar';

export default function StudentProfile() {
    const user = auth.currentUser;
    const router = useRouter();

    const [fullName, setFullName] = useState(user?.displayName || '');
    const [saving, setSaving] = useState(false);

    const updateName = async () => {
        if (!fullName.trim()) return;
        setSaving(true);
        try {
            const token = await user.getIdToken();
            await axios.put(`${API_URL}/api/users/profile`, {
                full_name: fullName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Success', 'Name updated successfully.');
        } catch (error) {
            console.error('Error updating name:', error);
            Alert.alert('Error', 'Failed to update name.');
        } finally {
            setSaving(false);
        }
    };

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
        <View className="flex-1 bg-slate-50">
            <StatusBar style="light" />

            {/* Header Decoration */}
            <View className="h-48 bg-blue-600 rounded-b-[40px] shadow-lg absolute top-0 w-full z-0">
                <View className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mb-16 opacity-50" />
                <View className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full -ml-16 -mt-16 opacity-50" />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Header Title */}
                    <View className="items-center mt-2 mb-4">
                        <Text className="text-white font-bold text-lg opacity-90">My Profile</Text>
                    </View>

                    {/* Profile Header Card */}
                    <View className="px-6 mb-6">
                        <View className="bg-white rounded-[24px] p-6 shadow-lg shadow-blue-900/20 items-center -mt-2">
                            <View className="p-1.5 bg-white rounded-full shadow-md -mt-16 mb-3 relative">
                                <Avatar className="h-24 w-24 border-4 border-slate-50">
                                    <AvatarImage src={user?.photoURL} />
                                    <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 font-bold">
                                        {user?.displayName?.[0] || 'S'}
                                    </AvatarFallback>
                                </Avatar>
                            </View>

                            <Text className="text-2xl font-bold text-slate-900 text-center">
                                {user?.displayName || 'Student'}
                            </Text>
                            <Text className="text-slate-500 text-sm font-medium mb-3">{user?.email}</Text>

                            <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                <Text className="text-blue-600 text-xs font-bold uppercase tracking-wider">Student Account</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View className="px-5 space-y-5">

                        {/* Editable Info Card */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-blue-900/5 border border-slate-100">
                            <View className="flex-row items-center mb-6 pb-4 border-b border-slate-100 justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="person-circle-outline" size={20} color="#2563eb" />
                                    </View>

                                    <View>
                                        <Text className="text-lg font-bold text-slate-800">Personal Details</Text>
                                        <Text className="text-xs text-slate-400 font-medium">Update Information</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-5">
                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Full Name</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="person-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            value={fullName}
                                            onChangeText={setFullName}
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 font-medium text-base"
                                            placeholder="Your full name"
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</Text>
                                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 h-14 opacity-80">
                                        <Ionicons name="mail-outline" size={20} color="#94a3b8" className="mr-3" />
                                        <TextInput
                                            value={user?.email || ''}
                                            editable={false}
                                            className="flex-1 bg-transparent border-0 h-full text-slate-500 text-base font-medium"
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Phone Number</Text>
                                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 h-14 opacity-80">
                                        <Ionicons name="call-outline" size={20} color="#94a3b8" className="mr-3" />
                                        <TextInput
                                            value={user?.phoneNumber || 'Not linked'}
                                            editable={false}
                                            className="flex-1 bg-transparent border-0 h-full text-slate-500 text-base font-medium"
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <Button
                                    onPress={updateName}
                                    loading={saving}
                                    className="mt-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 h-14"
                                    textClassName="text-base font-bold"
                                >
                                    Save Changes
                                </Button>
                            </View>
                        </View>

                        {/* Settings & Support Card */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-blue-900/5 border border-slate-100">
                            <View className="flex-row items-center mb-6 pb-4 border-b border-slate-100 justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="settings-outline" size={20} color="#475569" />
                                    </View>

                                    <View>
                                        <Text className="text-lg font-bold text-slate-800">Preferences</Text>
                                        <Text className="text-xs text-slate-400 font-medium">App Settings</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-1">
                                <TouchableOpacity className="flex-row items-center py-4 border-b border-slate-50 active:bg-slate-50 -mx-3 px-3 rounded-xl">
                                    <View className="h-9 w-9 rounded-full bg-blue-50 items-center justify-center mr-4">
                                        <Ionicons name="notifications-outline" size={18} color="#2563eb" />
                                    </View>
                                    <Text className="flex-1 text-slate-700 font-semibold text-base">Notifications</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                                </TouchableOpacity>

                                <TouchableOpacity className="flex-row items-center py-4 border-b border-slate-50 active:bg-slate-50 -mx-3 px-3 rounded-xl">
                                    <View className="h-9 w-9 rounded-full bg-indigo-50 items-center justify-center mr-4">
                                        <Ionicons name="shield-checkmark-outline" size={18} color="#4f46e5" />
                                    </View>
                                    <Text className="flex-1 text-slate-700 font-semibold text-base">Privacy & Security</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                                </TouchableOpacity>

                                <TouchableOpacity className="flex-row items-center py-4 active:bg-slate-50 -mx-3 px-3 rounded-xl">
                                    <View className="h-9 w-9 rounded-full bg-emerald-50 items-center justify-center mr-4">
                                        <Ionicons name="help-buoy-outline" size={18} color="#059669" />
                                    </View>
                                    <Text className="flex-1 text-slate-700 font-semibold text-base">Help & Support</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="flex-row items-center justify-center bg-slate-100 py-4 rounded-2xl mb-2"
                        >
                            <Ionicons name="log-out-outline" size={20} color="#64748b" className="mr-2" />
                            <Text className="text-slate-600 font-bold text-base">Sign Out</Text>
                        </TouchableOpacity>

                        <Text className="text-center text-slate-400 text-xs mt-2 font-medium">TryMyTutor v1.2.0 • Made with ❤️</Text>
                        <View className="h-6" />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
