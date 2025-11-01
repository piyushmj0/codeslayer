"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPendingReports, updateReportStatus } from "@/services/adminService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface SafetyReport {
  id: string;
  createdAt: string;
  reportType: 'SAFE' | 'UNSAFE';
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: {
    id: string;
    name: string | null;
    phoneNumber: string;
  };
}

export default function ReportModerationPage() {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    setLoading(true);
    getPendingReports()
      .then(res => setReports(res.data))
      .catch(() => toast.error("Failed to fetch pending reports."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = (reportId: string, status: 'APPROVED' | 'REJECTED') => {
    toast.promise(updateReportStatus(reportId, status), {
      loading: `Setting status to ${status}...`,
      success: () => {
        fetchReports(); 
        return `Report has been ${status.toLowerCase()}.`;
      },
      error: "Failed to update report.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#4a0e0e]">Manage Reports</h1>
        <p className="text-muted-foreground">
          Review and approve or reject community-submitted safety reports.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">Pending Reports Queue</CardTitle>
          <CardDescription>
            {reports.length} reports awaiting moderation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No pending reports.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{format(new Date(report.createdAt), "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant={report.reportType === 'UNSAFE' ? 'destructive' : 'default'}>
                        {report.reportType === 'UNSAFE' ? 
                          <AlertTriangle className="mr-2 h-4 w-4" /> : 
                          <CheckCircle className="mr-2 h-4 w-4" />}
                        {report.reportType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{report.submittedBy.name || 'N/A'}</TableCell>
                    <TableCell className="text-xs">{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-green-600 hover:bg-green-100"
                        onClick={() => handleUpdateStatus(report.id, 'APPROVED')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:bg-red-100"
                        onClick={() => handleUpdateStatus(report.id, 'REJECTED')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}