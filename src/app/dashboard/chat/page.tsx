"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getSocket } from "@/services/socketService";
import { getMyChatRooms, getMessagesForRoom } from "@/services/chatService";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, Users, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatRoom } from "@/types"; 

export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setLoadingRooms(true);
    getMyChatRooms()
      .then(res => setRooms(res.data))
      .catch(err => {
        toast.error("Failed to load chat rooms.");
        console.error(err);
      })
      .finally(() => setLoadingRooms(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleNewMessage = (newMessage: ChatMessage) => {
      if (selectedRoom && newMessage.senderId !== user?.id && newMessage.chatRoomId === selectedRoom.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => { socket.off('newMessage', handleNewMessage); };
  }, [selectedRoom, user]);

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setLoadingMessages(true);
    try {
      const res = await getMessagesForRoom(room.id);
      setMessages(res.data);
    } catch (error) {
      toast.error("Could not load messages for this room.");
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const onSendMessage = (data: { message: string }) => {
    if (!data.message.trim() || !selectedRoom) return;
    const socket = getSocket();
    socket.emit('sendMessage', {
      chatRoomId: selectedRoom.id,
      content: data.message,
    });

    const optimisticMessage: ChatMessage = {
      id: Math.random().toString(),
      content: data.message,
      senderId: user!.id,
      chatRoomId: selectedRoom.id,
      sender: { id: user!.id, name: user!.name },
    };
    setMessages(prev => [...prev, optimisticMessage]);

    reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-8rem)] border rounded-lg bg-white overflow-hidden">
      <div className="flex flex-col border-r bg-slate-50/50">
        <div className="p-4 border-b"><h2 className="font-semibold text-lg">Conversations</h2></div>
        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="p-4 text-center text-muted-foreground">Loading chat rooms...</div>
          ) : (
            rooms.map(room => (
              <button key={room.id} onClick={() => selectRoom(room)} className={cn("w-full text-left p-4 border-b hover:bg-slate-100", selectedRoom?.id === room.id && "bg-blue-50")}>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>
                      {room.type === 'SUPPORT' ? <Shield className="h-4 w-4"/> : <Users className="h-4 w-4"/>}
                  </AvatarFallback></Avatar>
                  <div className="flex-1">
                      <p className="font-medium">{room.name || (room.participants.find((p) => p.id !== user?.id)?.name || "Support")}</p>
                      <p className="text-sm text-muted-foreground truncate">{room.messages[0]?.content || 'No messages yet.'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4.5 border-b"><h2 className="font-semibold">{selectedRoom.name || (selectedRoom.participants.find((p) => p.id !== user?.id)?.name || "Support")}</h2></div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50">
              {loadingMessages ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.id ? "justify-end" : "justify-start")}>
                    {msg.senderId !== user?.id && <Avatar className="h-8 w-8"><AvatarFallback>{msg.sender.name?.charAt(0) || 'U'}</AvatarFallback></Avatar>}
                    <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg shadow-sm", msg.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-white")}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit(onSendMessage)} className="flex gap-2">
                <Input {...register("message")} placeholder="Type a message..." autoComplete="off"/>
                <Button type="submit" size="icon"><SendHorizontal className="h-4 w-4" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h3 className="text-lg font-semibold">Select a Conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the list to see messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}