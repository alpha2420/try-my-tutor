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

            // Calculate Profile Completeness
            if (profileData) {
                const hasBio = !!profileData.bio;
                const hasSubjects = profileData.tutor_subjects && profileData.tutor_subjects.length > 0;
                const hasRate = profileData.hourly_rate > 0;
                const hasExp = profileData.experience_years > 0;
                const hasQual = !!profileData.qualifications;
                const hasDocs = profileData.verification_documents && profileData.verification_documents.length > 0;
                const hasAvailability = !!profileData.availability;

                profileData.is_profile_complete = hasBio && hasSubjects && hasRate && hasExp && hasQual && hasDocs && hasAvailability;
            }
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
            // Extract subjects and other specific fields
            const { subjects, experience_years, qualifications, verification_documents, availability, ...otherUpdates } = updates;

            const tutorUpdates = { ...otherUpdates };

            if (experience_years) tutorUpdates.experience_years = parseInt(experience_years);
            if (qualifications) tutorUpdates.qualifications = qualifications;
            if (availability) tutorUpdates.availability = availability; // Assuming JSON or string

            // Handle documents (if sent as comma separated string or array)
            if (verification_documents) {
                tutorUpdates.verification_documents = Array.isArray(verification_documents)
                    ? verification_documents
                    : verification_documents.split(',').map(d => d.trim()).filter(d => d);
            }

            if (Object.keys(tutorUpdates).length > 0) {
                const { error } = await supabase
                    .from('tutors')
                    .update(tutorUpdates)
                    .eq('user_id', user.id);
                if (error) throw error;
            }

            if (subjects && Array.isArray(subjects)) {
                // Handle subjects update
                // 1. Get Subject IDs
                const subjectIds = [];
                for (const subjectName of subjects) {
                    // Check if subject exists (case insensitive?) - For now exact match or create
                    // Let's sanitize
                    const cleanName = subjectName.trim();
                    if (!cleanName) continue;

                    let { data: subject } = await supabase.from('subjects').select('id').ilike('name', cleanName).single();
                    if (!subject) {
                        const { data: newSubject } = await supabase.from('subjects').insert([{ name: cleanName }]).select().single();
                        subject = newSubject;
                    }
                    if (subject) subjectIds.push(subject.id);
                }

                // 2. Delete existing tutor_subjects
                await supabase.from('tutor_subjects').delete().eq('tutor_id', user.id);

                // 3. Insert new tutor_subjects
                // Use a Set to avoid duplicates
                const uniqueSubjectIds = [...new Set(subjectIds)];
                if (uniqueSubjectIds.length > 0) {
                    const tutorSubjects = uniqueSubjectIds.map(sid => ({ tutor_id: user.id, subject_id: sid }));
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
