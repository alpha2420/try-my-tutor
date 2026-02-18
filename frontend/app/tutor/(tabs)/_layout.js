import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TutorTabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563eb' }}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'My Sessions',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'My Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
