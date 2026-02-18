import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useRequirement } from '../../../context/RequirementContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];
const CLASSES = ['Class 1-5', 'Class 6-8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Bachelors', 'Masters'];
const BOARDS = ['CBSE', 'ICSE', 'IGCSE', 'IB', 'State Board', 'University'];

export default function SubjectScreen() {
    const router = useRouter();
    const { requirementData, updateRequirement } = useRequirement();

    const [subject, setSubject] = useState(requirementData.subject);
    const [grade, setGrade] = useState(requirementData.grade);
    const [board, setBoard] = useState(requirementData.board);

    const [modalVisible, setModalVisible] = useState(false);
    const [currentField, setCurrentField] = useState(null); // 'subject', 'grade', 'board'

    const getOptions = () => {
        if (currentField === 'subject') return SUBJECTS;
        if (currentField === 'grade') return CLASSES;
        if (currentField === 'board') return BOARDS;
        return [];
    };

    const handleSelect = (item) => {
        if (currentField === 'subject') setSubject(item);
        if (currentField === 'grade') setGrade(item);
        if (currentField === 'board') setBoard(item);
        setModalVisible(false);
    };

    const openModal = (field) => {
        setCurrentField(field);
        setModalVisible(true);
    };

    const handleNext = () => {
        if (!subject || !grade || !board) {
            // Simple validation
            // alert('Please fill all fields'); 
            // Using alert for now, better to use a custom Alert or Toast if available
        }
        updateRequirement('subject', subject);
        updateRequirement('grade', grade);
        updateRequirement('board', board);
        router.push('/student/post-requirement/budget');
    };

    const SelectionButton = ({ label, value, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-between border border-slate-200 rounded-md p-3 bg-white mb-4"
        >
            <Text className={value ? "text-slate-900" : "text-slate-400"}>
                {value || label}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white p-4">
            <View className="flex-1">
                <Text className="text-xl font-bold text-slate-900 mb-2">What do you want to learn?</Text>
                <Text className="text-slate-500 mb-6">Select the subject and academic details.</Text>

                <View>
                    <Text className="text-sm font-medium text-slate-700 mb-1">Subject</Text>
                    <SelectionButton
                        label="Select Subject"
                        value={subject}
                        onPress={() => openModal('subject')}
                    />

                    <Text className="text-sm font-medium text-slate-700 mb-1">Class / Grade</Text>
                    <SelectionButton
                        label="Select Class"
                        value={grade}
                        onPress={() => openModal('grade')}
                    />

                    <Text className="text-sm font-medium text-slate-700 mb-1">Board / University</Text>
                    <SelectionButton
                        label="Select Board"
                        value={board}
                        onPress={() => openModal('board')}
                    />
                </View>
            </View>

            <View className="py-4">
                <Button onPress={handleNext} disabled={!subject || !grade || !board}>
                    Next Step
                </Button>
            </View>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-xl max-h-[50%]">
                        <View className="flex-row justify-between items-center p-4 border-b border-slate-100">
                            <Text className="text-lg font-bold capitalize">{currentField}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={getOptions()}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-slate-50"
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text className="text-slate-900 text-base">{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
