"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Siren, Building, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthStore from "@/store/authStore";
import { AdminMap } from "@/components/admin/AdminMap"; 
import { DashboardStats } from "@/types";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight ">
          Admin Control Panel
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user?.name || "Admin"}. Here is a summary of the platform
          activity.
        </p>
      </div>

      {/* Statistic Cards Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium ">
                  Active SOS Alerts
                </CardTitle>
                <Siren className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {stats.activeAlerts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium ">
                  Pending Businesses
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.pendingBusinesses}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Groups
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGroups}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight ">
          Live Operations Map
        </h2>
        <p className="text-muted-foreground">
          Real-time overview of all active tourists and incoming SOS alerts.
        </p>
      </div>
      <div className="w-full h-[80vh] rounded-lg border">
        <AdminMap/>
      </div>
    </div>
  );
}