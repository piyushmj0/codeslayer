"use client";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const ProfileWidget = () => {
    const user = useAuthStore((state) => state.user);
    return (
        <Card className="bg-transparent backdrop-blur-lg bordrer border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Welcome back,</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 bg-white ">
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xl font-bold text-white">{user?.name}</p>
                    <p className="text-sm  text-white">{user?.phoneNumber}</p>
                </div>
            </CardContent>
        </Card>
    );
};