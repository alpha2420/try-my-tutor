import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_URL } from '../config';
import { auth } from '../firebaseConfig';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Listen to Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const initSocket = async () => {
            if (currentUser) {
                try {
                    // Fetch DB ID
                    const token = await currentUser.getIdToken();
                    const response = await fetch(`${API_URL}/api/users/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await response.json();
                    const dbId = data.user?.id;

                    if (!dbId) {
                        console.error("Could not fetch DB ID for socket");
                        return;
                    }

                    setUserId(dbId);

                    // Initialize socket
                    const newSocket = io(API_URL, {
                        transports: ['websocket'],
                        autoConnect: true,
                    });

                    setSocket(newSocket);

                    newSocket.on('connect', () => {
                        console.log('Socket connected:', newSocket.id);
                        setIsConnected(true);
                        // Join user room with DB ID
                        newSocket.emit('join_room', dbId);
                        console.log(`Joined room with DB ID: ${dbId}`);
                    });

                    newSocket.on('disconnect', () => {
                        console.log('Socket disconnected');
                        setIsConnected(false);
                    });

                    return newSocket;

                } catch (err) {
                    console.error("Error initializing socket:", err);
                }
            } else {
                // User logged out
                if (socket) {
                    socket.disconnect();
                    setSocket(null);
                    setIsConnected(false);
                    setUserId(null);
                }
            }
        };

        const socketPromise = initSocket();

        return () => {
            socketPromise.then(s => s?.disconnect());
        };
    }, [currentUser]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, userId }}>
            {children}
        </SocketContext.Provider>
    );
};
