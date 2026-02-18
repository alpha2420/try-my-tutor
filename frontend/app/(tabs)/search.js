import { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = () => {
        // Mock results
        setResults([
            { id: '1', name: 'John Doe', subject: 'Math', rate: '₹500/hr', rating: 4.8 },
            { id: '2', name: 'Jane Smith', subject: 'Science', rate: '₹600/hr', rating: 4.9 },
        ]);
    };

    return (
        <View className="flex-1 bg-white p-4 pt-10">
            <Text className="text-2xl font-bold mb-4">Find Tutors</Text>

            <View className="flex-row items-center border border-gray-300 rounded-lg p-2 mb-4">
                <Ionicons name="search" size={20} color="gray" />
                <TextInput
                    placeholder="Search by subject or name"
                    className="flex-1 ml-2"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />
            </View>

            <FlatList
                data={results}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View className="bg-gray-50 p-4 rounded-lg mb-3 flex-row justify-between items-center">
                        <View>
                            <Text className="text-lg font-bold">{item.name}</Text>
                            <Text className="text-gray-600">{item.subject}</Text>
                            <Text className="text-blue-600 font-semibold">{item.rate}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-amber-500 font-bold">★ {item.rating}</Text>
                            <TouchableOpacity className="bg-blue-600 px-3 py-1 rounded mt-2">
                                <Text className="text-white text-xs">View</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
