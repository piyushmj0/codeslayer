import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users } from "lucide-react";

export const GroupsWidget = ({ count }: { count: number }) => (
    <Link href="/dashboard/groups">
        <Card className="backdrop-blur-lg bg-transparent border border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Active Groups</CardTitle>
                <Users className="h-4 w-4 text-white/40" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white/40">{count}</div>
                <p className="text-xs text-white/40">
                    groups you are a member of
                </p>
                 <div className="flex items-center justify-end text-sm font-semibold text-white/40 mt-2">
                    Manage Groups <ArrowRight className="h-4 w-4 ml-2" />
                </div>
            </CardContent>
        </Card>
    </Link>
);