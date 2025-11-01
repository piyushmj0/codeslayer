"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listPendingBusinesses, approveBusiness, rejectBusiness } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessApplication {
  id: string;
  name: string;
  category: string;
  address: string;
  status: string;
  owner: {
    name: string | null;
    email: string | null;
  }
}

export default function BusinessApprovalsPage() {
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = () => {
    setLoading(true);
    listPendingBusinesses()
      .then(res => setApplications(res.data))
      .catch(() => toast.error("Failed to fetch pending applications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = (businessId: string) => {
    toast.promise(approveBusiness(businessId), {
        loading: 'Approving application...',
        success: () => {
            fetchApplications(); // Refresh the list
            return `Application approved.`;
        },
        error: "Failed to approve application."
    });
  };

  const handleReject = (businessId: string) => {
    toast.promise(rejectBusiness(businessId), {
        loading: 'Rejecting application...',
        success: () => {
            fetchApplications(); // Refresh the list
            return `Application rejected.`;
        },
        error: "Failed to reject application."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#4a0e0e]">Business Approvals</h1>
        <p className="text-muted-foreground">
          Review and manage pending business verification requests.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">Pending Applications</CardTitle>
          <CardDescription>The following businesses are awaiting verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell><Badge variant="secondary">{app.category}</Badge></TableCell>
                    <TableCell>{app.address}</TableCell>
                    <TableCell>{app.owner?.name || app.owner?.email}</TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleApprove(app.id)}>
                            <Check className="mr-2 h-4 w-4"/> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleReject(app.id)}>
                            <X className="mr-2 h-4 w-4"/> Reject
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="text-center h-24">No pending applications.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}