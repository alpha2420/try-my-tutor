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
            // Ensure safe comparison
            const currentIdStr = String(currentUser.id);
            const senderIdStr = String(msg.sender_id);
            const receiverIdStr = String(msg.receiver_id);

            let otherUser = null;

            if (senderIdStr === currentIdStr && receiverIdStr === currentIdStr) {
                // Self-message
                otherUser = msg.sender; // Or receiver, same person
                otherUser.full_name = `${otherUser.full_name} (You)`;
            } else if (senderIdStr === currentIdStr) {
                // I sent it, so other is receiver
                otherUser = msg.receiver;
            } else {
                // I received it, so other is sender
                otherUser = msg.sender;
            }

            // Skip if user data missing (deleted user?)
            if (!otherUser) {
                console.warn(`Missing user data for msg ${msg.id}. Sender: ${senderIdStr}, Receiver: ${receiverIdStr}`);
                return;
            }

            const otherUserId = otherUser.id;

            // Debug logs
            // console.log(`Msg: ${msg.content}, Me: ${currentIdStr}, Sender: ${senderIdStr}, Receiver: ${receiverIdStr}, Other: ${otherUser.full_name}`);

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    id: otherUserId,
                    name: otherUser.full_name || 'Unknown User',
                    role: otherUser.role,
                    lastMessage: msg.content,
                    time: msg.created_at,
                    unread: 0,
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

const sendMessage = async (req, res) => {
    const senderId = req.user.uid; // Firebase UID
    const { receiver_id, content } = req.body;

    try {
        const { data: currentUser } = await supabase.from('users').select('id').eq('firebase_uid', senderId).single();
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const senderDbId = currentUser.id;

        const { data: message, error } = await supabase
            .from('messages')
            .insert([{ sender_id: senderDbId, receiver_id, content }])
            .select()
            .single();

        if (error) throw error;

        // Emit to receiver via Socket.IO if available attached to req
        if (req.io) {
            req.io.to(receiver_id).emit('receive_message', message);
        }

        res.status(201).json({ message });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}

module.exports = { getMessages, getConversations, sendMessage };
