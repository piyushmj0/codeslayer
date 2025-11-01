"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { getSocket } from "@/services/socketService";
import { listChatUsers } from "@/services/adminService";
import { getChatHistoryForUser } from "@/services/chatService";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";

interface ChatUser {
  id: string;
  name: string | null;
  chatRoom: {
    id : string;
    messages: { content: string, createdAt: string }[];
  } | null;
}

export default function AdminChatPage() {
  const adminUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ message: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all chat users on load
  useEffect(() => {
    setLoadingUsers(true);
    listChatUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingUsers(false));
  }, []);

  // Set up socket listeners
  useEffect(() => {
    const socket = getSocket();
    const handleNewMessage = (newMessage: ChatMessage) => {
      if (
        selectedUser &&
        newMessage.senderId !== adminUser?.id &&
        newMessage.chatRoomId === (selectedUser.chatRoom?.id || newMessage.chatRoomId)
      ) {
        setMessages(prev => [...prev, newMessage]);
      }
    };
    socket.on('newMessage', handleNewMessage);
    return () => { socket.off('newMessage', handleNewMessage); };
  }, [selectedUser, adminUser]);

  const selectUser = async (user: ChatUser) => {
    setSelectedUser(user);
    if (user.chatRoom) {
      setLoadingMessages(true);
      try {
        const historyRes = await getChatHistoryForUser(user.id);
        setMessages(historyRes.data);
      } catch (error) {
        setMessages([]);
        console.error(error);
      } finally {
        setLoadingMessages(false);
      }
    } else {
      setMessages([]);
    }
  };

  const onSendMessage = (data: { message: string }) => {
    if (!data.message.trim() || !selectedUser) return;
    const socket = getSocket();
    socket.emit('adminReply', {
      targetUserId: selectedUser.id,
      message: data.message,
    });

    const optimisticMessage: ChatMessage = {
      id: Math.random().toString(),
      content: data.message,
      senderId: adminUser!.id,
      chatRoomId: selectedUser.chatRoom?.id || 'temp-room-id',
      sender: { id: adminUser!.id, name: adminUser!.name },
    };
    setMessages(prev => [...prev, optimisticMessage]);
    reset();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-8rem)] border rounded-lg bg-white">
      {/* Left Column: User List */}
      <div className="flex flex-col border-r bg-slate-50/50">
        <div className="p-3.5 border-b"><h2 className="font-semibold text-lg text-[#4a0e0e]">Active Tourists</h2></div>
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="p-4 text-center text-muted-foreground">Loading users...</div>
          ) : (
            users.map(user => (
              <button key={user.id} onClick={() => selectUser(user)} className={cn("w-full text-left p-4 border-b hover:bg-slate-100", selectedUser?.id === user.id && "bg-blue-50")}>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback><UserIcon className="h-4 w-4"/></AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name || 'Unnamed User'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.chatRoom?.messages[0]?.content || 'Click to start conversation.'}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b"><h2 className="font-semibold">{selectedUser.name || 'Unnamed User'}</h2></div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50">
              {loadingMessages ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === adminUser?.id ? "justify-end" : "justify-start")}>
                    {msg.senderId !== adminUser?.id && <Avatar className="h-8 w-8"><AvatarFallback>{msg.sender.name?.charAt(0) || 'U'}</AvatarFallback></Avatar>}
                    <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg shadow-sm", msg.senderId === adminUser?.id ? "bg-primary text-primary-foreground" : "bg-white")}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit(onSendMessage)} className="flex gap-2">
                <Input {...register("message")} placeholder={`Reply to ${selectedUser.name || 'user'}...`} autoComplete="off" disabled={loadingMessages} />
                <Button type="submit" size="icon" disabled={loadingMessages}><SendHorizontal className="h-4 w-4" /></Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <h3 className="text-lg font-semibold text-[#4a0e0e]">Select a Conversation</h3>
              <p className="text-muted-foreground">Choose a tourist from the list to view their messages or start a new chat.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}