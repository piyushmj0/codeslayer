import { io, Socket } from 'socket.io-client';
import useAuthStore from '@/store/authStore';

let socket: Socket;

const socketURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getSocket = (): Socket => {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("Cannot connect socket without an auth token.");
  }

  if (!socket || !socket.connected) {
    if(socket) {
      socket.disconnect();
    }
    
    socket = io(socketURL, {
      auth: {
        token: token,
      },
      reconnection: true, 
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => console.log('Socket connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err.message));
  }
  
  return socket;
};

export const disconnectSocket = () => {
  if(socket && socket.connected) {
    socket.disconnect();
  }
};