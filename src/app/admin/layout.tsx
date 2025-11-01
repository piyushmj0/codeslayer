"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { useHydration } from "@/hooks/useHydration";
import Header from "@/components/dashboard/Header"; 
import { toast } from "sonner";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      if (!token) {
        router.replace("/login");
      } else if (user?.role !== 'ADMIN') {
        toast.error("Access Denied", { description: "You do not have permission to access this page." });
        router.replace("/dashboard");
      }
    }
  }, [user, token, isHydrated, router]);
  
  if (!isHydrated || user?.role !== 'ADMIN') {
    return <div className="h-screen w-full flex items-center justify-center"><p>Verifying permissions...</p></div>;
  }

  // The new layout is simpler: just a header and the main content.
  return (
    <div className="flex min-h-screen w-full flex-col bg-amber-200">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
        </main>
    </div>
  );
}