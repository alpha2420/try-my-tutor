const supabase = require('../config/supabaseClient');

const syncUser = async (req, res) => {
    const { uid, email, p_email, phone, name, role } = req.body;

    if (!uid) {
        return res.status(400).json({ error: 'Missing UID' });
    }

    // Handle Phone Auth users (who might not have an email)
    // If email is missing, use a placeholder or p_email (provider email)
    const validEmail = email || p_email || `${uid}@privaterelay.trymytutor.app`;

    try {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', uid)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (existingUser) {
            // Optional: Update user details if provided (e.g. name, phone)
            // But usually sync is just for creation or ensuring existence.
            return res.status(200).json({ message: 'User already exists', user: existingUser });
        }

        // Create new user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    firebase_uid: uid,
                    email: validEmail,
                    full_name: name || 'Anonymous',
                    role: role || 'student', // Default to student
                    // phone: phone // Add phone to schema if not present, or store in profile
                },
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        // Initialize profile based on role
        if (newUser.role === 'student') {
            const { error: profileError } = await supabase.from('students').insert([{ user_id: newUser.id }]);
            if (profileError) console.error('Error creating student profile:', profileError);
        } else if (newUser.role === 'tutor') {
            const { error: profileError } = await supabase.from('tutors').insert([{ user_id: newUser.id }]);
            if (profileError) console.error('Error creating tutor profile:', profileError);
        }

        return res.status(201).json({ message: 'User created', user: newUser });

    } catch (error) {
        console.error('Error syncing user:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', firebaseUid)
            .single();

        if (error) throw error;
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { syncUser, getMe };
