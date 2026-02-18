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
            // Extract subjects from updates if present
            const { subjects, ...profileUpdates } = updates;

            if (Object.keys(profileUpdates).length > 0) {
                const { error } = await supabase
                    .from('tutors')
                    .update(profileUpdates)
                    .eq('user_id', user.id);
                if (error) throw error;
            }

            if (subjects && Array.isArray(subjects)) {
                // Handle subjects update
                // 1. Get Subject IDs
                const subjectIds = [];
                for (const subjectName of subjects) {
                    let { data: subject } = await supabase.from('subjects').select('id').eq('name', subjectName).single();
                    if (!subject) {
                        const { data: newSubject } = await supabase.from('subjects').insert([{ name: subjectName }]).select().single();
                        subject = newSubject;
                    }
                    if (subject) subjectIds.push(subject.id);
                }

                // 2. Delete existing tutor_subjects
                await supabase.from('tutor_subjects').delete().eq('tutor_id', user.id);

                // 3. Insert new tutor_subjects
                if (subjectIds.length > 0) {
                    const tutorSubjects = subjectIds.map(sid => ({ tutor_id: user.id, subject_id: sid }));
                    const { error: subError } = await supabase.from('tutor_subjects').insert(tutorSubjects);
                    if (subError) throw subError;
                }
            }
        }

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getProfile, updateProfile };
