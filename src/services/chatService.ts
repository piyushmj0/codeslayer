import api from './api';

export const getMyChatRooms = () => {
  return api.get('/chat/my-rooms');
};

export const getChatHistoryForUser = (userId: string) => {
  return api.get(`/chat/admin/history/${userId}`);
};

export const getMessagesForRoom = (roomId: string) => {
  return api.get(`/chat/rooms/${roomId}/messages`);
};