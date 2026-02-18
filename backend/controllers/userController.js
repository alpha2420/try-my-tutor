const supabase = require('../config/supabaseClient');

const getProfile = async (req, res) => {
    const userId = req.user.uid; // Firebase UID from token

    try {
        // 1. Get user basic info to check role
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', userId)
            .single();

        if (userError) throw userError;
        if (!user) return res.status(404).json({ error: 'User not found' });

        let profileData = null;

        if (user.role === 'student') {
            const { data: student, error: studentError } = await supabase
                .from('students')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (studentError && studentError.code !== 'PGRST116') throw studentError;
            profileData = student;
        } else if (user.role === 'tutor') {
            const { data: tutor, error: tutorError } = await supabase
                .from('tutors')
                .select('*, tutor_subjects(subjects(name))') // Join to get subjects
                .eq('user_id', user.id)
                .single();
            if (tutorError && tutorError.code !== 'PGRST116') throw tutorError;
            profileData = tutor;
        }

        res.json({ user, profile: profileData });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    const userId = req.user.uid;
    const updates = req.body;

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('firebase_uid', userId)
            .single();

        if (userError) throw userError;

        if (user.role === 'student') {
            const { error } = await supabase
                .from('students')
                .update(updates)
                .eq('user_id', user.id);
            if (error) throw error;
        } else if (user.role === 'tutor') {
            const { error } = await supabase
                .from('tutors')
                .update(updates)
                .eq('user_id', user.id);
            if (error) throw error;
        }

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getProfile, updateProfile };
