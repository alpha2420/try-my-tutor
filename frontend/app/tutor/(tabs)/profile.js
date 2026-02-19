import { View, Text, ScrollView, Alert, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';
import { StatusBar } from 'expo-status-bar';

export default function TutorProfile() {
    const user = auth.currentUser;
    const router = useRouter();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [subjects, setSubjects] = useState(''); // Comma separated for now
    const [experience, setExperience] = useState('');
    const [qualifications, setQualifications] = useState('');
    const [availability, setAvailability] = useState('');
    const [documents, setDocuments] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const p = response.data.profile;
            setProfile(p);

            // Populate form
            setFullName(response.data.user?.full_name || user?.displayName || '');
            setBio(p?.bio || '');
            setHourlyRate(p?.hourly_rate?.toString() || '');
            setExperience(p?.experience_years?.toString() || '');
            setQualifications(p?.qualifications || '');

            setAvailability(typeof p?.availability === 'string' ? p.availability : JSON.stringify(p?.availability || '').replace(/^"|"$/g, ''));

            // Documents: Array of strings. Join for input.
            if (Array.isArray(p?.verification_documents)) {
                setDocuments(p.verification_documents.join(', '));
            } else {
                setDocuments(p?.verification_documents || '');
            }

            // Parse subjects if available
            if (p?.tutor_subjects && Array.isArray(p.tutor_subjects)) {
                const subNames = p.tutor_subjects.map(ts => ts.subjects.name).join(', ');
                setSubjects(subNames);
            }

        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const token = await user.getIdToken();

            // Process subjects
            const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s);

            await axios.put(`${API_URL}/api/users/profile`, {
                full_name: fullName,
                bio,
                hourly_rate: parseFloat(hourlyRate) || 0,
                subjects: subjectList,
                experience_years: parseInt(experience) || 0,
                qualifications,
                availability,
                verification_documents: documents.split(',').map(d => d.trim()).filter(d => d)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Profile updated!');
            fetchProfile(); // Refresh
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update profile');
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

    if (loading) return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text className="text-blue-600 font-bold">Loading Profile...</Text>
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
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                    {/* Header Title */}
                    <View className="items-center mt-2 mb-4">
                        <Text className="text-white font-bold text-lg opacity-90">Edit Profile</Text>
                    </View>

                    {/* Profile Header Card */}
                    <View className="px-6 mb-6">
                        <View className="bg-white rounded-[24px] p-6 shadow-lg shadow-blue-900/20 items-center -mt-2">
                            <View className="p-1.5 bg-white rounded-full shadow-md -mt-16 mb-3 relative">
                                <Avatar className="h-24 w-24 border-4 border-slate-50">
                                    <AvatarImage src={user?.photoURL} />
                                    <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 font-bold">
                                        {user?.displayName?.[0] || 'T'}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Verification Checkmark */}
                                {profile?.is_verified && (
                                    <View className="absolute bottom-1 right-1 bg-white p-0.5 rounded-full">
                                        <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
                                    </View>
                                )}
                            </View>

                            <Text className="text-2xl font-bold text-slate-900 text-center">
                                {user?.displayName || 'Tutor Name'}
                            </Text>
                            <Text className="text-slate-500 text-sm font-medium mb-3">{user?.email}</Text>

                            <View className="flex-row items-center space-x-2">
                                <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                    <Text className="text-blue-600 text-xs font-bold uppercase tracking-wider">Tutor</Text>
                                </View>
                                {!profile?.is_verified && (
                                    <View className="bg-amber-50 px-3 py-1 rounded-full border border-amber-100 flex-row items-center">
                                        <Ionicons name="alert-circle" size={12} color="#d97706" className="mr-1" />
                                        <Text className="text-amber-600 text-xs font-bold uppercase tracking-wider">Pending Verification</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Forms Container */}
                    <View className="px-5 space-y-5">

                        {/* Personal & Professional Section */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-blue-900/5 border border-slate-100">
                            <View className="flex-row items-center mb-6 pb-4 border-b border-slate-100 justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="briefcase-outline" size={20} color="#2563eb" />
                                    </View>

                                    <View>
                                        <Text className="text-lg font-bold text-slate-800">Review Details</Text>
                                        <Text className="text-xs text-slate-400 font-medium">Public Information</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-5">
                                {/* Name Input */}
                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Display Name</Text>
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

                                {/* Bio Input */}
                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Bio / Introduction</Text>
                                    <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:bg-white transition-colors">
                                        <TextInput
                                            placeholder="Tell students about your teaching style, experience, and passion..."
                                            multiline
                                            numberOfLines={4}
                                            className="bg-transparent border-0 text-slate-900 min-h-[80px] text-base font-medium w-full"
                                            value={bio}
                                            onChangeText={setBio}
                                            textAlignVertical="top"
                                            style={{ includeFontPadding: false }}
                                        />
                                    </View>
                                </View>

                                {/* Subjects Input */}
                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Subjects (Comma Separated)</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="book-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="Math, Physics, Chemistry"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 font-medium text-base"
                                            value={subjects}
                                            onChangeText={setSubjects}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                {/* Rate & Exp Row */}
                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Hourly Rate ($)</Text>
                                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14">
                                            <Text className="text-slate-500 font-bold mr-2">$</Text>
                                            <TextInput
                                                placeholder="25"
                                                keyboardType="numeric"
                                                className="flex-1 bg-transparent border-0 h-full text-slate-900 font-bold text-lg"
                                                value={hourlyRate}
                                                onChangeText={setHourlyRate}
                                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Experience (Yrs)</Text>
                                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14">
                                            <Ionicons name="time-outline" size={20} color="#64748b" className="mr-2" />
                                            <TextInput
                                                placeholder="2"
                                                keyboardType="numeric"
                                                className="flex-1 bg-transparent border-0 h-full text-slate-900 font-bold text-lg"
                                                value={experience}
                                                onChangeText={setExperience}
                                                style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Qualifications Input */}
                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Qualifications</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="school-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="Degrees, Certifications..."
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 font-medium text-base"
                                            value={qualifications}
                                            onChangeText={setQualifications}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Logistics Section */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-blue-900/5 border border-slate-100">
                            <View className="flex-row items-center mb-6 pb-4 border-b border-slate-100 justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="calendar-outline" size={20} color="#7c3aed" />
                                    </View>

                                    <View>
                                        <Text className="text-lg font-bold text-slate-800">Logistics</Text>
                                        <Text className="text-xs text-slate-400 font-medium">Availability & Docs</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="space-y-5">
                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Availability</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="calendar-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="e.g. Mon-Fri: 4 PM - 8 PM"
                                            className="flex-1 bg-transparent border-0 h-full text-slate-900 font-medium text-base"
                                            value={availability}
                                            onChangeText={setAvailability}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Document Link</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 focus:border-blue-500 focus:bg-white transition-colors">
                                        <Ionicons name="link-outline" size={20} color="#64748b" className="mr-3" />
                                        <TextInput
                                            placeholder="https://drive.google.com/..."
                                            className="flex-1 bg-transparent border-0 h-full text-blue-600 font-medium text-base"
                                            value={documents}
                                            onChangeText={setDocuments}
                                            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                                        />
                                    </View>
                                    <Text className="text-[11px] text-slate-400 mt-1.5 ml-1 font-medium">
                                        Link to resume/certifications for verification.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Save Button */}
                        <Button
                            onPress={saveProfile}
                            loading={saving}
                            className="bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 h-16 mb-2"
                            textClassName="text-xl font-bold"
                        >
                            Save Profile Changes
                        </Button>

                        {/* Logout */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="flex-row items-center justify-center py-4 rounded-2xl bg-slate-100"
                        >
                            <Ionicons name="log-out-outline" size={20} color="#64748b" className="mr-2" />
                            <Text className="text-slate-500 font-bold text-base">Log Out</Text>
                        </TouchableOpacity>

                        <View className="h-6" />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
