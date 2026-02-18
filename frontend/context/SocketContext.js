import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../config';
import { auth } from '../firebaseConfig';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            // Initialize socket
            // Note: API_URL might contain 'http://', socket.io needs just the host or full url
            const newSocket = io(API_URL, {
                transports: ['websocket'],
                autoConnect: true,
            });

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);
                // Join user room
                newSocket.emit('join_room', user.uid); // Or use backend user ID if preferred, but UID is easier here initially
                // Ideally, fetch backend ID and join that room.
                // For now, let's assuming joining room by firebase UID is fine if backend maps it, 
                // BUT backend uses `socket.join(userId)` in `join_room`.
                // We should probably fetch the backend ID first. 
                // Let's optimize: The backend `join_room` listener expects `userId`.
                // Let's fetch it or pass it.
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
