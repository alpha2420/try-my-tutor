const supabase = require('../config/supabaseClient');

const placeBid = async (req, res) => {
    const userId = req.user.uid;
    const { requirement_id, amount, message } = req.body;

    try {
        // Check if user is a tutor
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('firebase_uid', userId)
            .single();

        if (userError || !user) throw new Error('User not found');
        if (user.role !== 'tutor') return res.status(403).json({ error: 'Only tutors can place bids' });

        // Check if requirement exists and is open
        const { data: requirement, error: reqError } = await supabase
            .from('requirements')
            .select('status')
            .eq('id', requirement_id)
            .single();

        if (reqError || !requirement) return res.status(404).json({ error: 'Requirement not found' });
        if (requirement.status !== 'open') return res.status(400).json({ error: 'Requirement is closed' });

        // Check if already bid? (Optional, but good practice)

        const { data, error } = await supabase
            .from('bids')
            .insert([
                {
                    requirement_id,
                    tutor_id: user.id,
                    amount,
                    message,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'Bid placed successfully', bid: data });

    } catch (error) {
        console.error('Error placing bid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getBidsForRequirement = async (req, res) => {
    const { requirementId } = req.params;
    const userId = req.user.uid;

    try {
        // Verify user owns the requirement OR is the tutor who made the bid (but here acts as list for student)
        // Usually only the student owner should see all bids.
        const { data: user } = await supabase.from('users').select('id, role').eq('firebase_uid', userId).single();
        const { data: requirement } = await supabase.from('requirements').select('student_id').eq('id', requirementId).single();

        if (!requirement) return res.status(404).json({ error: 'Requirement not found' });

        // Strict check: Only owner
        if (user.id !== requirement.student_id) {
            return res.status(403).json({ error: 'Unauthorized to view bids for this requirement' });
        }

        const { data, error } = await supabase
            .from('bids')
            .select('*, tutors(user_id, rating, experience_years, users(full_name))')
            .eq('requirement_id', requirementId);

        if (error) throw error;
        res.json({ bids: data });

    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getMyBids = async (req, res) => {
    const userId = req.user.uid;
    try {
        const { data: user } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('bids')
            .select('*, requirements(title, status)')
            .eq('tutor_id', user.id);

        if (error) throw error;
        res.json({ bids: data });

    } catch (error) {
        console.error('Error fetching my bids:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateBidStatus = async (req, res) => {
    const { bidId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = req.user.uid;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // 1. Get bid to find requirement
        const { data: bid, error: bidError } = await supabase.from('bids').select('requirement_id').eq('id', bidId).single();
        if (bidError || !bid) return res.status(404).json({ error: 'Bid not found' });

        // 2. Verify user owns the requirement
        const { data: reqData, error: reqError } = await supabase
            .from('requirements')
            .select('student_id')
            .eq('id', bid.requirement_id)
            .single();

        if (reqError) throw reqError;

        const { data: user } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
        if (user.id !== reqData.student_id) return res.status(403).json({ error: 'Unauthorized' });

        // 3. Update bid status
        const { error: updateError } = await supabase
            .from('bids')
            .update({ status })
            .eq('id', bidId);

        if (updateError) throw updateError;

        // 4. If accepted, close requirement? Create session?
        if (status === 'accepted') {
            await supabase.from('requirements').update({ status: 'fulfilled' }).eq('id', bid.requirement_id);
            // TODO: Create Session automatically?
        }

        res.json({ message: `Bid ${status}` });

    } catch (error) {
        console.error('Error updating bid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { placeBid, getBidsForRequirement, getMyBids, updateBidStatus };
