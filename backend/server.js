require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
// const admin = require('firebase-admin'); // Uncomment when service account is ready

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all for dev, restrict in prod
        methods: ['GET', 'POST']
    }
});

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Inject Socket.IO into request
app.use((req, res, next) => {
    req.io = io;
    next();
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const bidRoutes = require('./routes/bidRoutes');
const coreRoutes = require('./routes/coreRoutes');
const aiRoutes = require('./routes/aiRoutes');
const messageRoutes = require('./routes/messageRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/core', coreRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sessions', sessionRoutes);

const supabase = require('./config/supabaseClient');

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('send_message', async (data) => {
        // data: { sender_id, receiver_id, content }
        const { sender_id, receiver_id, content } = data;

        // Save to DB
        if (supabase) {
            const { data: insertedMsg, error } = await supabase.from('messages').insert([{ sender_id, receiver_id, content }]).select().single();
            if (error) {
                console.error('Error saving message:', error);
                // Notify sender of failure
                io.to(sender_id).emit('message_error', { content, error: 'Failed to save message' });
            } else {
                // Notify sender of success (optional, or rely on optimistic)
                // io.to(sender_id).emit('message_sent', insertedMsg);
            }
        }

        // Emit to receiver
        io.to(receiver_id).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('TryMyTutor Backend is running!');
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
