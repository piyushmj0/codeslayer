"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Group,
  CreateGroupFormData,
  createGroupSchema,
  AddMemberFormData,
  addMemberSchema,
} from "@/types";
import {
  createGroup,
  addMember,
  getGroupDetails,
  acceptInvite,
  rejectInvite,
} from "@/services/groupService";
import { useDataStore } from "@/store/dataStore";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  UserPlus,
  Users,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sub-component for Pending Invites ---
const PendingInvites = ({
  onInviteHandled,
}: {
  onInviteHandled: () => void;
}) => {
  const invites = useDataStore((state) => state.invites);

  const handleAccept = (groupId: string) => {
    toast.promise(acceptInvite(groupId), {
      loading: "Accepting invite...",
      success: () => {
        onInviteHandled();
        return "You've joined the group!";
      },
      error: "Failed to accept invite.",
    });
  };

  const handleReject = (groupId: string) => {
    toast.promise(rejectInvite(groupId), {
      loading: "Rejecting invite...",
      success: () => {
        onInviteHandled();
        return "Invite rejected.";
      },
      error: "Failed to reject invite.",
    });
  };

  if (!invites || invites.length === 0) return null;

  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle>Pending Group Invitations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invites.map((invite) => (
          <div
            key={invite.groupId}
            className="flex items-center justify-between p-3 rounded-lg bg-white border"
          >
            <div>
              <p className="font-semibold">{invite.group.name}</p>
              <p className="text-sm text-muted-foreground">
                {invite.group.description ||
                  "You have been invited to join this group."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                className="text-green-600 hover:bg-green-100"
                onClick={() => handleAccept(invite.groupId)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="text-red-600 hover:bg-red-100"
                onClick={() => handleReject(invite.groupId)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// --- Sub-component for Create Group Dialog ---
const CreateGroupDialog = ({
  onGroupCreated,
}: {
  onGroupCreated: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const form = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (data: CreateGroupFormData) => {
    toast.promise(createGroup(data), {
      loading: "Creating group...",
      success: () => {
        onGroupCreated(); // Calls the store's fetch action
        setOpen(false);
        form.reset();
        return "Group created!";
      },
      error: "Failed to create group.",
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Create
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Himalayan Trekkers" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A group for our upcoming trek"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// --- Sub-component for Add Member Dialog ---
const AddMemberDialog = ({
  group,
  onMemberAdded,
}: {
  group: Group;
  onMemberAdded: (groupId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const form = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { phoneNumber: "" },
  });

  const onSubmit = (data: AddMemberFormData) => {
    toast.promise(addMember(group.id, data), {
      loading: "Adding member...",
      success: () => {
        onMemberAdded(group.id);
        setOpen(false);
        form.reset();
        return "Member invited!";
      },
      error: (err) => err.response?.data?.message || "Failed to add member.",
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member to {group.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="phoneNumber"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User&apos;s Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Send Invite</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Groups Page Component ---
export default function GroupsPage() {
  const groups = useDataStore((state) => state.groups);
  const fetchGroupsAndInvites = useDataStore(
    (state) => state.fetchGroupsAndInvites
  );
  const isLoading = useDataStore((state) => state.isLoading);

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const user = useAuthStore((state) => state.user);

  const fetchGroupDetails = useCallback(async (groupId: string) => {
    setLoadingDetails(true);
    try {
      const res = await getGroupDetails(groupId);
      setSelectedGroup(res.data);
    } catch (error) {
      toast.error("Failed to fetch group details.");
      setSelectedGroup(null);
      console.log(error);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && groups.length > 0 && !selectedGroup) {
      fetchGroupDetails(groups[0].id);
    }
  }, [isLoading, groups, selectedGroup, fetchGroupDetails]);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <Skeleton className="h-screen" />
        <Skeleton className="h-screen" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PendingInvites onInviteHandled={fetchGroupsAndInvites} />

      <div className="grid md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-12rem)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Groups</CardTitle>
            <CreateGroupDialog onGroupCreated={fetchGroupsAndInvites} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={
                    selectedGroup?.id === group.id ? "secondary" : "ghost"
                  }
                  className="justify-start"
                  onClick={() => fetchGroupDetails(group.id)}
                >
                  <Users className="mr-2 h-4 w-4" /> {group.name}
                </Button>
              ))}
              {groups.length === 0 && (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  You aren&apos;t in any groups yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-white/20 backdrop-blur-md  bg-transparent">
          {loadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedGroup ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedGroup.name}</CardTitle>
                  <CardDescription>
                    {selectedGroup.description || "No description"}
                  </CardDescription>
                </div>
                {/* Re-fetch details for this specific group after adding a member */}
                {selectedGroup.members.find(
                  (m) => m.user.id === user?.id && m.role === "ADMIN"
                ) && (
                  <AddMemberDialog
                    group={selectedGroup}
                    onMemberAdded={() => fetchGroupDetails(selectedGroup.id)}
                  />
                )}
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-4">
                  Members ({selectedGroup.members.length})
                </h3>
                <div className="space-y-4">
                  {selectedGroup.members.map((member) => (
                    <div
                      key={member.user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {member.user.name || "Unnamed User"}
                        </span>
                      </div>
                      <Badge
                        variant={
                          member.role === "ADMIN" ? "default" : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/40">
                Select a group or create a new one.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}