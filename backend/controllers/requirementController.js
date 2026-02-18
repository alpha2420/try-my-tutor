const supabase = require('../config/supabaseClient');

const createRequirement = async (req, res) => {
    const userId = req.user.uid;
    const {
        location,
        subject,
        grade,
        board,
        budget,
        days,
        duration,
        genderPreference,
        experience
    } = req.body;

    try {
        // Get student ID from user ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('firebase_uid', userId)
            .single();

        if (userError || !user) throw new Error('User not found');
        if (user.role !== 'student') return res.status(403).json({ error: 'Only students can post requirements' });

        // Get or Create Subject ID
        let subjectId;
        const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id')
            .eq('name', subject)
            .single();

        if (subjectData) {
            subjectId = subjectData.id;
        } else {
            // Create new subject if not exists (optional, or just error out)
            const { data: newSubject, error: newSubjectError } = await supabase
                .from('subjects')
                .insert([{ name: subject }])
                .select()
                .single();
            if (newSubjectError) throw newSubjectError;
            subjectId = newSubject.id;
        }

        // Parse Budget
        const budgetValue = parseFloat(budget) || 0;

        const { data, error } = await supabase
            .from('requirements')
            .insert([
                {
                    student_id: user.id,
                    subject_id: subjectId,
                    title: `${subject} Tutor for ${grade}`,
                    description: `Looking for ${subject} tutor for ${grade} (${board}).\nDays: ${days?.join(', ')}\nDuration: ${duration}\nLocation: ${location}`,
                    budget_min: budgetValue,
                    budget_max: budgetValue,
                    location_preference: 'offline', // Defaulting to offline as location is provided
                    location: location,
                    grade: grade,
                    board: board,
                    days: days,
                    duration: duration,
                    gender_preference: genderPreference,
                    experience_preference: experience,
                    status: 'open'
                },
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Requirement posted', requirement: data });

    } catch (error) {
        console.error('Error creating requirement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getRequirements = async (req, res) => {
    try {
        // Optional: Filter by subject, location, etc.
        const { subject_id, location_preference } = req.query;
        let query = supabase.from('requirements').select(`
            *,
            subjects (name),
            students (user_id, grade_level, location)
        `).eq('status', 'open');

        if (subject_id) query = query.eq('subject_id', subject_id);
        if (location_preference) query = query.eq('location_preference', location_preference);

        const { data, error } = await query;
        if (error) throw error;

        res.json({ requirements: data });
    } catch (error) {
        console.error('Error fetching requirements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMyRequirements = async (req, res) => {
    const userId = req.user.uid;
    try {
        const { data: user } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('requirements')
            .select('*')
            .eq('student_id', user.id);

        if (error) throw error;
        res.json({ requirements: data });
    } catch (error) {
        console.error('Error fetching my requirements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { createRequirement, getRequirements, getMyRequirements };
