"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { getMyBusinesses } from "@/services/businessService";
import { Business } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building, PlusCircle } from "lucide-react";

export default function BusinessDashboardPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = () => {
    setLoading(true);
    getMyBusinesses()
      .then((res) => setBusinesses(res.data))
      .catch(() => toast.error("Could not fetch your business profiles."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ">My Businesses</h1>
          <p className="text-muted-foreground">
            Manage your business applications and profiles.
          </p>
        </div>
        <Button asChild>
            <Link href="/business/apply">
                <PlusCircle className="mr-2 h-4 w-4" /> Apply for New Business
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle >Your Registered Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : businesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building className="mx-auto h-12 w-12 mb-4" />
              <p>You have not registered any businesses yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {businesses.map((business) => (
                <Card key={business.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{business.name}</CardTitle>
                    <Badge
                      variant={
                        business.status === "APPROVED" ? "default" : "secondary"
                      }
                    >
                      {business.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{business.category}</p>
                    <p>{business.address}</p>
                    <p>{business.phone}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}