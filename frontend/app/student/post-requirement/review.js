import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRequirement } from '../../../context/RequirementContext';
import { Button } from '../../../components/ui/Button';
import axios from 'axios';
import { API_URL } from '../../../config';
import { auth } from '../../../firebaseConfig';
import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';

export default function ReviewScreen() {
    const router = useRouter();
    const { requirementData } = useRequirement();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'You must be logged in to post a requirement.');
                return;
            }

            const token = await user.getIdToken();

            await axios.post(`${API_URL}/api/requirements`, {
                ...requirementData,
                studentId: user.uid // Backend should ideally verify this from token
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('Success', 'Your requirement has been posted!', [
                { text: 'OK', onPress: () => router.replace('/student/(tabs)/home') }
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to post requirement. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const DetailRow = ({ label, value }) => (
        <View className="flex-row justify-between py-2 border-b border-slate-100">
            <Text className="text-slate-500">{label}</Text>
            <Text className="text-slate-900 font-medium text-right flex-1 ml-4">{value}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50 p-4">
            <ScrollView className="flex-1">
                <Text className="text-xl font-bold text-slate-900 mb-2">Review Requirement</Text>
                <Text className="text-slate-500 mb-6">Please review details before posting.</Text>

                <Card className="mb-4">
                    <CardContent className="pt-6">
                        <DetailRow label="Subject" value={requirementData.subject} />
                        <DetailRow label="Class" value={requirementData.grade} />
                        <DetailRow label="Board" value={requirementData.board} />
                        <DetailRow label="Location" value={requirementData.location} />
                        <DetailRow label="Budget" value={requirementData.budget} />
                        <DetailRow label="Duration" value={requirementData.duration} />
                        <DetailRow label="Days" value={requirementData.days?.join(', ')} />
                        <DetailRow label="Gender Pref." value={requirementData.genderPreference} />
                        <DetailRow label="Experience" value={requirementData.experience} />
                    </CardContent>
                </Card>
            </ScrollView>

            <View className="py-4">
                <Button onPress={handleSubmit} loading={loading}>
                    Post Requirement
                </Button>
            </View>
        </View>
    );
}
