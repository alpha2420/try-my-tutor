import { Stack } from 'expo-router';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/signup" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="student" options={{ headerShown: false }} />
                <Stack.Screen name="tutor" options={{ headerShown: false }} />
            </Stack>
        </SafeAreaProvider>
    );
}
