"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { listUsers, updateUserStatus } from "@/services/adminService";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, UserX, UserCheck, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface UserWithStatus extends User {
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
    phoneNumber: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ role?: string; status?: string }>({});
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback((currentSearchTerm = '') => {
    setLoading(true);
    listUsers(1, { ...filters, search: currentSearchTerm })
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error("Failed to fetch users."))
      .finally(() => setLoading(false));
  }, [filters]); 

  // Debouncing: Wait for the user to stop typing before searching
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchUsers]); 

  const handleStatusChange = (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
    toast.promise(updateUserStatus(userId, status), {
        loading: `Setting status to ${status}...`,
        success: () => {
            fetchUsers(searchTerm); 
            return `User status updated successfully.`;
        },
        error: "Failed to update status."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#4a0e0e]">User Management</h1>
        <p className="text-muted-foreground">
          View, filter, and manage all users on the platform.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">All Users</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-8"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, role: value === 'ALL' ? undefined : value }))}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="TOURIST">Tourist</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'ALL' ? undefined : value }))}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                    <TableCell>
                        <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(user.createdAt), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Full Details</DropdownMenuItem>
                          {user.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'SUSPENDED')} className="text-red-500 focus:bg-red-50 focus:text-red-600">
                                <UserX className="mr-2 h-4 w-4" /> Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'ACTIVE')} className="text-green-600 focus:bg-green-50 focus:text-green-700">
                                <UserCheck className="mr-2 h-4 w-4" /> Re-activate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}/log`}>
                                <Eye className="mr-2 h-4 w-4" /> View Activity Log
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No users found for the selected criteria.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}