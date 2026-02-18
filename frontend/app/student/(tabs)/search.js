import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function StudentSearch() {
    const [activeFilter, setActiveFilter] = useState('All');

    // Mock data
    const filters = ['All', 'Math', 'Physics', 'English', 'Chemistry', 'Coding'];
    const tutors = [
        { id: 1, name: 'John Doe', subject: 'Mathematics', rating: 5.0, price: '$20/hr' },
        { id: 2, name: 'Jane Smith', subject: 'Physics', rating: 4.8, price: '$25/hr' },
        { id: 3, name: 'Robert Johnson', subject: 'English', rating: 4.9, price: '$18/hr' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 bg-white border-b border-slate-200">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Find Tutors</Text>

                <View className="relative mb-4">
                    <Input
                        placeholder="Search by name or subject..."
                        className="pl-10 bg-slate-50 border-slate-200"
                    />
                    <Ionicons name="search" size={20} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                    {filters.map((filter) => (
                        <TouchableOpacity key={filter} onPress={() => setActiveFilter(filter)}>
                            <Badge
                                variant={activeFilter === filter ? 'default' : 'secondary'}
                                className="px-4 py-1.5"
                            >
                                {filter}
                            </Badge>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {tutors.map((tutor) => (
                    <Card key={tutor.id} className="mb-4">
                        <CardContent className="flex-row items-center p-4">
                            <Avatar className="h-14 w-14 mr-4">
                                <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <View className="flex-1 gap-1">
                                <View className="flex-row justify-between items-start">
                                    <View>
                                        <Text className="font-bold text-lg text-slate-900">{tutor.name}</Text>
                                        <Text className="text-slate-500">{tutor.subject}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="star" size={14} color="#eab308" />
                                        <Text className="text-slate-700 font-medium ml-1">{tutor.rating}</Text>
                                    </View>
                                </View>
                                <Text className="text-slate-900 font-semibold">{tutor.price}</Text>
                            </View>
                        </CardContent>
                        <View className="px-4 pb-4">
                            <Button variant="outline" className="w-full">View Profile</Button>
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
