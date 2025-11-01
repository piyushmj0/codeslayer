"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listAllIncidents, resolveIncident } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Alert {
  id: string;
  status: 'ACTIVE' | 'RESOLVED';
  latitude: number;
  longitude: number;
  createdAt: string;
  triggeredInTrip: {
    user: {
      name: string | null;
    }
  }
}

export default function IncidentManagementPage() {
  const [incidents, setIncidents] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = () => {
    setLoading(true);
    listAllIncidents()
      .then(res => setIncidents(res.data))
      .catch(() => toast.error("Failed to fetch incidents."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolve = (alertId: string) => {
    toast.promise(resolveIncident(alertId), {
        loading: 'Resolving incident...',
        success: () => {
            fetchIncidents(); // Refresh the list
            return `Incident marked as resolved.`;
        },
        error: "Failed to resolve incident."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#4a0e0e]">Incident Management</h1>
        <p className="text-muted-foreground">
          Monitor and respond to all SOS alerts from tourists.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">All SOS Incidents</CardTitle>
          <CardDescription>A log of all active and resolved SOS alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Location (Lat, Lng)</TableHead>
                <TableHead>Time Reported</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : incidents.length > 0 ? (
                incidents.map((incident) => (
                  <TableRow key={incident.id} className={incident.status === 'ACTIVE' ? 'bg-red-50' : ''}>
                    <TableCell>
                        <Badge variant={incident.status === 'ACTIVE' ? 'destructive' : 'secondary'}>
                            {incident.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{incident.triggeredInTrip.user.name || 'Unknown User'}</TableCell>
                    <TableCell>{incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</TableCell>
                    <TableCell>{format(new Date(incident.createdAt), "PPP p")}</TableCell>
                    <TableCell className="text-right">
                        {incident.status === 'ACTIVE' && (
                            <Button variant="outline" size="sm" onClick={() => handleResolve(incident.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4"/> Mark as Resolved
                            </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No incidents found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}