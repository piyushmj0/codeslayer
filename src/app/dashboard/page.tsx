"use client";

import { useState, useEffect } from "react";
import { acceptInvite, rejectInvite } from "@/services/groupService";
import { toast } from "sonner";
import LoadingScreen from "@/components/ui/loading-screen";

import { ProfileWidget } from "@/components/dashboard/widgets/ProfileWidget";
import { ItineraryWidget } from "@/components/dashboard/widgets/ItineraryWidget";
import { SosWidget } from "@/components/dashboard/widgets/SosWidget";
import { GroupsWidget } from "@/components/dashboard/widgets/GroupsWidget";
import { AlertsWidget } from "@/components/dashboard/widgets/AlertsWidget";
import { InvitationsWidget } from "@/components/dashboard/widgets/InvitationsWidget";
import Map from "@/components/map/Map";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flag, Hotel } from "lucide-react";
import { CheckInDialog } from "@/components/map/CheckInDialog";
import { useDataStore } from "@/store/dataStore";

export default function DashboardPage() {
  const itinerary = useDataStore((s) => s.itinerary);
  const groups = useDataStore((s) => s.groups);
  const alerts = useDataStore((s) => s.alerts);
  const invites = useDataStore((s) => s.invites);
  const isLoading = useDataStore((s) => s.isLoading);
  const fetchGroupsAndInvites = useDataStore((s) => s.fetchGroupsAndInvites);

  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);

  const handleAccept = (groupId: string) => {
    toast.promise(acceptInvite(groupId), {
      loading: "Accepting invite...",
      success: () => {
        fetchGroupsAndInvites();
        return "You've joined the group!";
      },
      error: "Failed to accept invite.",
    });
  };

  const handleReject = (groupId: string) => {
    toast.promise(rejectInvite(groupId), {
      loading: "Rejecting invite...",
      success: () => {
        fetchGroupsAndInvites();
        return "Invite rejected.";
      },
      error: "Failed to reject invite.",
    });
  };

  // Add initial loading state
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // If the data is not loading anymore, set initial loading to false
    if (!isLoading) {
      setInitialLoading(false);
    }
  }, [isLoading]);

  if (initialLoading || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
    
      <div className="grid gap-6 auto-rows-auto lg:grid-cols-4">
        <div className="lg:col-span-3">
          <ProfileWidget />
        </div>
        <div className="lg:col-span-1">
          <SosWidget />
        </div>
        <div className="lg:col-span-2 lg:row-span-2 min-h-[400px] border border-black rounded-lg relative">
          <div className="w-full h-full rounded-lg overflow-hidden border">
            <Map />
          </div>

          {/* 2. FIX: Correct the button layout */}
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <Button
              onClick={() => setCheckInDialogOpen(true)}
              className="shadow-lg"
            >
              <Hotel className="mr-2 h-4 w-4" />
              Safe Check-in
            </Button>
            <Button asChild className="shadow-lg" variant="secondary">
              <Link href="/dashboard/report">
                <Flag className="mr-2 h-4 w-4" />
                Report an Issue
              </Link>
            </Button>
          </div>
        </div>
        <div className="lg:col-span-1">
          <GroupsWidget count={groups.length} />
        </div>
        <div className="lg:col-span-1">
          <InvitationsWidget
            invites={invites}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>
        <div className="lg:col-span-2">
          <AlertsWidget alerts={alerts} />
        </div>
        <div className="lg:col-span-4">
          <ItineraryWidget places={itinerary?.places || []} />
        </div>
      </div>

      {/* Render the dialog at the page level */}
      <CheckInDialog
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
      />
    </>
  );
}
