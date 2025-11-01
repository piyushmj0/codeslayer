"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getUserLocationHistory, getUserBlockchainLog, getUserDetails } from "@/services/adminService";
import PathMap from "@/components/map/PathMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AdminUserDetails, BlockchainLogEntry, LocationLog } from "@/types";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function UserLogPage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<AdminUserDetails | null>(null);
  const [history, setHistory] = useState<LocationLog[]>([]);
  const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Create a Set of verified hashes from the blockchain for quick lookup
  const verifiedHashes = new Set(blockchainLogs.map(log => log.hash));

  useEffect(() => {
    if (userId) {
      Promise.all([
        getUserDetails(userId),
        getUserLocationHistory(userId),
        getUserBlockchainLog(userId),
      ])
      .then(([userRes, historyRes, blockchainRes]) => {
        setUser(userRes.data);
        setHistory(historyRes.data);
        setBlockchainLogs(blockchainRes.data);
      })
      .catch(() => toast.error("Failed to load user activity log."))
      .finally(() => setLoading(false));
    }
  }, [userId]);
  
  const mapPath = history
    .filter(log => log.latitude != null && log.longitude != null)
    .map(log => ({ 
      latitude: log.latitude, 
      longitude: log.longitude 
    }));

  if (loading) {
    return <Skeleton className="h-[80vh] w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Activity Log</h1>
        <p className="text-muted-foreground">Viewing verified location history for {user?.name || 'user'}.</p>
      </div>
      
      <div className="h-[400px] w-full rounded-lg overflow-hidden border">
        <PathMap
          path={mapPath}
          initialCenter={mapPath.length > 0 ? { lat: mapPath[0].latitude, lng: mapPath[0].longitude } : undefined}
        />
      </div>

      <Card>
        <CardHeader><CardTitle>Detailed Log</CardTitle><CardDescription>Each entry is verified against the blockchain record.</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Coordinates</TableHead>
                <TableHead>Blockchain Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length > 0 ? (
                history.map((log) => {
                  // The verification check
                  const isVerified = verifiedHashes.has(log.blockchainHash || "");
                  return (
                    <TableRow key={log.id} className={!isVerified ? "bg-red-500/10" : ""}>
                      <TableCell>
                        {isVerified ? (
                          <span className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" /> Tampered
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(log.createdAt), "Pp")}</TableCell>
                      <TableCell>{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</TableCell>
                      <TableCell className="font-mono text-xs">{log.blockchainHash || 'N/A'}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No location history found for this user.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}