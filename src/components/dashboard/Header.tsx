"use client";

import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Home,
  Map,
  Users as GroupsIcon,
  Bell,
  Building,
  Siren,
  MessageSquare,
  PlusCircle,
  Briefcase,
  Edit,
  CheckCheck,
} from "lucide-react";
import { Logo } from "../Logo";
import { disconnectSocket } from "@/services/socketService";

const touristNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/itinerary", label: "Itinerary", icon: Map },
  { href: "/dashboard/groups", label: "Groups", icon: GroupsIcon },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
];

const adminNavLinks = [
  { href: "/admin/", label: "Dashboard", icon: Home },
  { href: "/admin/zone-editor", label: "Zone Editor", icon: Edit },
  { href: "/admin/users", label: "User Management", icon: GroupsIcon },
  { href: "/admin/reports", label: "Manage Reports", icon: CheckCheck },
  { href: "/admin/businesses", label: "Business Approvals", icon: Building },
  { href: "/admin/incidents", label: "Incident Management", icon: Siren },
  { href: "/admin/chat", label: "Live Chat", icon: MessageSquare },
];

const businessNavLinks = [
  { href: "/business/", label: "My Businesses", icon: Briefcase },
  { href: "/business/apply", label: "Apply for New Business", icon: PlusCircle },
];

const UserNav = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    disconnectSocket();
    router.push("/login");
  };

  const navLinks = user?.role === "ADMIN" ? adminNavLinks : user?.role === "BUSINESS" ? businessNavLinks : touristNavLinks;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 border border-black  rounded-full">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src="" alt="User Avatar" />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.phoneNumber || user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {navLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {user?.role === "TOURIST" && (
        <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile & Settings</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        {user?.role === "BUSINESS" && (
          <DropdownMenuItem asChild>
            <Link href="/business/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const homeLink =
    user?.role === "ADMIN" ? "/admin/" : user?.role === "BUSINESS" ? "/business/" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4  bg-white px-6">
      <Link href={homeLink}>
        <Logo size="sm" />
      </Link>
      <UserNav />
    </header>
  );
};

export default Header;
