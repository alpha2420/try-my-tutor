const supabase = require('../config/supabaseClient');

const getMessages = async (req, res) => {
    const userId = req.user.uid;
    const { otherUserId } = req.params;

    try {
        const { data: currentUser } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const { data: otherUser } = await supabase.from('users').select('id').eq('id', otherUserId).single();
        if (!otherUser) return res.status(404).json({ error: 'Other user not found' });

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ messages: data });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getMessages };
