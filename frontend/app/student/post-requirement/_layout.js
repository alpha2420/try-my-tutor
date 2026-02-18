import { Stack } from 'expo-router';
import { RequirementProvider } from '../../../context/RequirementContext';

export default function PostRequirementLayout() {
    return (
        <RequirementProvider>
            <Stack screenOptions={{
                headerShown: true,
                headerBackTitle: 'Back',
                headerTintColor: '#0f172a', // slate-900
            }}>
                <Stack.Screen name="index" options={{ title: 'Location' }} />
                <Stack.Screen name="subject" options={{ title: 'Subject & Class' }} />
                <Stack.Screen name="budget" options={{ title: 'Budget & Timing' }} />
                <Stack.Screen name="preferences" options={{ title: 'Preferences' }} />
                <Stack.Screen name="review" options={{ title: 'Review' }} />
            </Stack>
        </RequirementProvider>
    );
}
