const supabase = require('../config/supabaseClient');

const createSession = async (req, res) => {
    const { student_id, tutor_id, requirement_id, start_time, end_time, meeting_link } = req.body;

    // Validate users (skipped for brevity, but should verify they exist)

    try {
        const { data, error } = await supabase
            .from('sessions')
            .insert([{
                student_id,
                tutor_id,
                requirement_id, // Optional if direct booking
                start_time,
                end_time,
                meeting_link,
                status: 'scheduled'
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ session: data });

    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getMySessions = async (req, res) => {
    const userId = req.user.uid;
    try {
        const { data: user } = await supabase.from('users').select('id, role').eq('firebase_uid', userId).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        let query = supabase.from('sessions').select(`
            *,
            students (users(full_name)),
            tutors (users(full_name))
        `);

        if (user.role === 'student') {
            query = query.eq('student_id', user.id);
        } else if (user.role === 'tutor') {
            query = query.eq('tutor_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({ sessions: data });

    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { createSession, getMySessions };
