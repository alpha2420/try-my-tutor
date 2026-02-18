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
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../../config';

export default function TutorProfile() {
    const user = auth.currentUser;
    const router = useRouter();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
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
            setBio(p?.bio || '');
            setHourlyRate(p?.hourly_rate?.toString() || '');
            setExperience(p?.experience_years?.toString() || '');
            setQualifications(p?.qualifications || '');
            // Availability: check if it's object or string. Backend schema says JSONB but userController handles pass through.
            // If it's a string in DB/Controller, fine. If JSON, we might need to stringify/parse.
            // Let's treat as string for MVP "Monday 10-5"
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
            <Text>Loading Profile...</Text>
        </SafeAreaView>
    );

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
                        {profile?.is_verified ? (
                            <Badge className="mr-2 bg-green-600">Verified Tutor</Badge>
                        ) : (
                            <Badge variant="outline" className="mr-2 text-slate-500">Unverified</Badge>
                        )}
                    </View>
                </View>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                        <CardDescription>Update your qualifications and expertise</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Bio</Text>
                            <Input
                                placeholder="Tell students about yourself..."
                                multiline
                                numberOfLines={3}
                                className="h-20 bg-slate-50"
                                value={bio}
                                onChangeText={setBio}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Subjects (Comma separated)</Text>
                            <Input
                                placeholder="Math, Physics, Chemistry"
                                className="bg-slate-50"
                                value={subjects}
                                onChangeText={setSubjects}
                            />
                        </View>
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</Text>
                                <Input
                                    placeholder="20"
                                    keyboardType="numeric"
                                    className="bg-slate-50"
                                    value={hourlyRate}
                                    onChangeText={setHourlyRate}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-slate-700 mb-1">Experience (Years)</Text>
                                <Input
                                    placeholder="5"
                                    keyboardType="numeric"
                                    className="bg-slate-50"
                                    value={experience}
                                    onChangeText={setExperience}
                                />
                            </View>
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Qualifications</Text>
                            <Input
                                placeholder="M.Sc in Physics, B.Ed..."
                                className="bg-slate-50"
                                value={qualifications}
                                onChangeText={setQualifications}
                            />
                        </View>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Availability & Verification</CardTitle>
                        <CardDescription>Set your schedule and upload proofs</CardDescription>
                    </CardHeader>
                    <CardContent className="gap-4">
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Availability (e.g. Mon-Fri: 10am-5pm)</Text>
                            <Input
                                placeholder="Weekdays 4 PM - 8 PM"
                                className="bg-slate-50"
                                value={availability}
                                onChangeText={setAvailability}
                            />
                        </View>
                        <View>
                            <Text className="text-sm font-medium text-slate-700 mb-1">Verification Documents (Link)</Text>
                            <Input
                                placeholder="https://drive.google.com/..."
                                className="bg-slate-50"
                                value={documents}
                                onChangeText={setDocuments}
                            />
                            <Text className="text-xs text-slate-400 mt-1">Provide a link to your resume/certificates.</Text>
                        </View>
                    </CardContent>
                    <View className="p-6 pt-0">
                        <Button onPress={saveProfile} loading={saving}>
                            Save Changes
                        </Button>
                    </View>
                </Card>

                <Button variant="destructive" onPress={handleLogout} className="mb-8">
                    Log Out
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
