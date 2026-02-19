import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function StudentTabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563eb' }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Student Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Find Tutor',
                    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="sessions"
                options={{
                    title: 'Sessions',
                    tabBarIcon: ({ color }) => <Ionicons name="videocam" size={24} color={color} />,
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
