const supabase = require('../config/supabaseClient');

const getConversations = async (req, res) => {
    const userId = req.user.uid;

    try {
        const { data: currentUser } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        // Get all messages where user is sender or receiver
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users!sender_id(id, full_name, role),
                receiver:users!receiver_id(id, full_name, role)
            `)
            .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by conversation partner
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const isSender = msg.sender_id === currentUser.id;
            const otherUser = isSender ? msg.receiver : msg.sender;
            const otherUserId = otherUser.id;

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    id: otherUserId,
                    name: otherUser.full_name,
                    role: otherUser.role,
                    lastMessage: msg.content,
                    time: msg.created_at,
                    unread: 0, // TODO: Implement unread count logic
                    avatar: otherUser.full_name ? otherUser.full_name[0] : 'U'
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());
        res.json({ conversations });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getMessages = async (req, res) => {
    const userId = req.user.uid;
    const { otherUserId } = req.params;

    try {
        const { data: currentUser } = await supabase.from('users').select('id').eq('firebase_uid', userId).single();
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        // Check if otherUserId is UUID or Firebase UID? Assuming UUID from frontend context
        // But if passed from URL, verify.

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json({ messages: data });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getMessages, getConversations };
