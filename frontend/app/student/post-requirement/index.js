import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRequirement } from '../../../context/RequirementContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as Location from 'expo-location';

export default function LocationScreen() {
    const router = useRouter();
    const { requirementData, updateRequirement } = useRequirement();
    const [location, setLocation] = useState(requirementData.location);
    const [detecting, setDetecting] = useState(false);

    const handleNext = () => {
        if (!location.trim()) {
            Alert.alert('Required', 'Please enter a location');
            return;
        }
        updateRequirement('location', location);
        router.push('/student/post-requirement/subject');
    };

    const handleAutoDetect = async () => {
        setDetecting(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address && address.length > 0) {
                const place = address[0];
                const formattedLocation = `${place.city || place.subregion}, ${place.region || place.country}`;
                setLocation(formattedLocation);
            } else {
                Alert.alert('Error', 'Could not fetch address from coordinates');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to detect location');
        } finally {
            setDetecting(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-4">
            <View className="flex-1">
                <Text className="text-xl font-bold text-slate-900 mb-2">Where do you need the tutor?</Text>
                <Text className="text-slate-500 mb-6">Enter your area or city to find tutors nearby.</Text>

                <View className="gap-4">
                    <Button variant="outline" onPress={handleAutoDetect} loading={detecting} className="flex-row gap-2">
                        <Ionicons name="location-outline" size={20} color="black" />
                        <Text className="ml-2 font-medium">Use my current location</Text>
                    </Button>

                    <View className="flex-row items-center my-2">
                        <View className="flex-1 h-px bg-slate-200" />
                        <Text className="mx-4 text-slate-400">OR</Text>
                        <View className="flex-1 h-px bg-slate-200" />
                    </View>

                    <Input
                        label="Manual Entry"
                        placeholder="e.g. Downtown, New York"
                        value={location}
                        onChangeText={setLocation}
                    />
                </View>
            </View>

            <View className="py-4">
                <Button onPress={handleNext}>
                    Next Step
                </Button>
            </View>
        </View>
    );
}
