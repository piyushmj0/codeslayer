import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, BellRing } from "lucide-react";
import { GroupInvite } from "@/types";

export const InvitationsWidget = ({ invites, onAccept, onReject }: { invites: GroupInvite[], onAccept: (groupId: string) => void, onReject: (groupId: string) => void }) => (
    <Card className="h-full backdrop-blur-lg bg-transparent border border-white/20">
        <CardHeader>
            <CardTitle className="text-white">Group Invitations</CardTitle>
            <CardDescription className="text-white/40">Respond to pending invites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {invites.length > 0 ? (
                invites.slice(0, 2).map(invite => (
                    <div key={invite.groupId} className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">{invite.group.name}</p>
                            <p className="text-sm text-white/40">You&apos;ve been invited to join.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="icon" variant="outline" onClick={() => onAccept(invite.groupId)}><ThumbsUp className="h-4 w-4 text-green-600" /></Button>
                            <Button size="icon" variant="outline" onClick={() => onReject(invite.groupId)}><ThumbsDown className="h-4 w-4 text-red-600" /></Button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground pt-4">
                    <BellRing className="h-8 w-8 mx-auto mb text-white/40"/>
                    <p className="text-sm text-white/40">No new invitations.</p>
                </div>
            )}
        </CardContent>
    </Card>
);