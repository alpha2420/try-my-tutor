import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSegments, useFocusEffect } from 'expo-router';
import { auth } from '../firebaseConfig';
import axios from 'axios';
import { API_URL } from '../config';

export function useTutorGuard() {
    const user = auth.currentUser;
    const router = useRouter();
    const segments = useSegments();
    const [isComplete, setIsComplete] = useState(null); // null = loading
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            checkProfile();
        }, [])
    );

    const checkProfile = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const profile = response.data.profile;

            // If checking specifically for tutor role (optional but safer)
            if (response.data.user.role !== 'tutor') {
                setIsComplete(true); // Don't block if not tutor (or handle differently)
                setLoading(false);
                return;
            }

            if (profile?.is_profile_complete) {
                setIsComplete(true);
            } else {
                setIsComplete(false);
            }
        } catch (error) {
            console.error('Guard Check Failed:', error);
            // Default to allow or block? Block is safer, but if error, maybe allow to avoid lock out?
            // Let's assume incomplete to force retry or profile check.
            setIsComplete(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && isComplete === false && segments.length > 0) {
            // If in tutor tabs but NOT on profile, redirect
            const inTutorTabs = segments[0] === 'tutor';
            const isProfile = segments.includes('profile');

            if (inTutorTabs && !isProfile) {
                // Use push/navigate instead of replace for Tabs
                router.push('/tutor/profile');
            }
        }
    }, [loading, isComplete, segments]);

    return { loading, isComplete };
}
