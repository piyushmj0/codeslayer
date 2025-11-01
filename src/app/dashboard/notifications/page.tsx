"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPendingInvites, acceptInvite, rejectInvite } from "@/services/groupService";
import { getMyDashboardAlerts } from "@/services/alertService"; // Import new function
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, BellRing, Siren, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { DashboardAlert, GroupInvite } from "@/types";

export default function NotificationsPage() {
  const [invites, setInvites] = useState<GroupInvite[]>([]);
const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.allSettled([
      getPendingInvites(),
      getMyDashboardAlerts(),
    ]).then(([invitesResult, alertsResult]) => {
      if (invitesResult.status === 'fulfilled') setInvites(invitesResult.value.data);
      if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value.data);
    }).catch(() => {
      toast.error("Failed to fetch notifications.");
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = (groupId: string) => {
    toast.promise(acceptInvite(groupId), {
      loading: 'Accepting invite...',
      success: () => { fetchData(); return "You've joined the group!"; },
      error: "Failed to accept invite."
    });
  };

  const handleReject = (groupId: string) => {
    toast.promise(rejectInvite(groupId), {
      loading: 'Rejecting invite...',
      success: () => { fetchData(); return "Invite rejected."; },
      error: "Failed to reject invite."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Notifications</h1>
        <p className="text-white/40">Here are your pending group invitations and recent safety alerts.</p>
      </div>

      {/* Group Invitations Card */}
      <Card>
        <CardHeader><CardTitle>Group Invitations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {loading && <Skeleton className="h-20 w-full" />}
          {!loading && invites.length > 0 ? (
            invites.map(invite => (
              <div key={invite.groupId} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                <div>
                  <p className="font-semibold">{invite.group.name}</p>
                  <p className="text-sm text-muted-foreground">{invite.group.description || 'You have been invited to join this group.'}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleAccept(invite.groupId)}><ThumbsUp className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => handleReject(invite.groupId)}><ThumbsDown className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="text-center p-8 text-muted-foreground"><BellRing className="mx-auto h-12 w-12 mb-4"/><p>No new group invitations</p></div>
          )}
        </CardContent>
      </Card>
      
      {/* Safety Alerts Card */}
      <Card>
        <CardHeader><CardTitle>Recent Safety Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {loading && <Skeleton className="h-20 w-full" />}
          {!loading && alerts.length > 0 ? (
            alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg border bg-red-50 border-red-200">
                <div className="flex items-center gap-4">
                    <Siren className="h-6 w-6 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-red-700">SOS from {alert.triggeredInTrip.user.name}</p>
                        <p className="text-sm text-red-600">
                            Triggered {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <Button variant="destructive" size="sm">View Details</Button>
              </div>
            ))
          ) : !loading && (
            <div className="text-center p-8 text-muted-foreground"><ShieldCheck className="mx-auto h-12 w-12 mb-4"/><p>No recent alerts from your groups.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}