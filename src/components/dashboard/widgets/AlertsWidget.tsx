import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Siren } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DashboardAlert } from "@/types";

export const AlertsWidget = ({ alerts }: { alerts: DashboardAlert[] }) => (
    <Link href="/dashboard/notifications">
        <Card className="backdrop-blur-lg bg-transparent border border-white/20">
            <CardHeader>
                <CardTitle className="text-white ">Active Alerts</CardTitle>
                <CardDescription className="text-white/40">Recent safety events from your network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 ">
                {alerts.length > 0 ? (
                    alerts.slice(0, 2).map(alert => (
                        <div key={alert.id} className="flex items-start gap-3">
                            <Siren className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-sm text-white/40">SOS from {alert.triggeredInTrip.user.name}</p>
                                <p className="text-xs text-white/40">
                                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-white/40 pt-4">
                        <ShieldAlert className="h-8 w-8 mx-auto mb-2"/>
                        <p className="text-sm text-white/40">No recent alerts.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </Link>
);