"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Header from "@/components/dashboard/Header";
import { useHydration } from "@/hooks/useHydration";
import { useDynamicTracking } from "@/hooks/useDynamicTracking";
import { NotificationHandler } from "@/components/dashboard/NotificationHandler";
import { getSocket } from "@/services/socketService";
import useAlertStore from "@/store/alertStore";
import { CheckInModal } from "@/components/dashboard/CheckInModal";
import { toast } from "sonner";
import { useDataStore } from "@/store/dataStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const tripId = useAuthStore((state) => state.tripId);

  const isHydrated = useHydration();
  const showCheckIn = useAlertStore((state) => state.showCheckIn);
  const { fetchInitialData, isLoading } = useDataStore();
  const [locationLoaded, setLocationLoaded] = useState(false);

  useDynamicTracking(isHydrated);

  useEffect(() => {
    if (isHydrated && token) {
      const socket = getSocket();
      
      socket.on('ARE_YOU_OKAY', (data) => {
        console.log("Check-in ping received:", data.message);
        showCheckIn();
      });

      return () => {
        socket.off('ARE_YOU_OKAY');
      };
    }
  }, [isHydrated, token, showCheckIn]);

  useEffect(() => {
    if (isHydrated) {
      if (!token || !user) {
        router.replace("/login");
        return;
      }
      if (user.role === 'ADMIN') {
        toast.error("Access Denied", { description: "Redirecting to Admin Panel." });
        router.replace("/admin/dashboard");
      } else if (user.role === 'BUSINESS') {
        toast.error("Access Denied", { description: "Redirecting to Business Portal." });
        router.replace("/business/dashboard");
      }

      const activeTrip = user.trips.find(t => t.id === tripId);
      
      if (activeTrip?.status === 'CHECK_IN') {
        console.log("Reload Trigger: User is in CHECKING_IN state. Showing modal.");
        showCheckIn();
      }
    }
  }, [user, token, tripId, isHydrated, router, showCheckIn]);

  useEffect(() => {
    if (isHydrated && user && token && !locationLoaded) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            latitude : pos.coords.latitude,
            longitude : pos.coords.longitude
          };

          fetchInitialData(location); 
          setLocationLoaded(true);
        },
        (err) => {
          toast.error("Location Error", { description: "Please enable location to use the map." });
          fetchInitialData({ latitude: 28.6139, longitude: 77.2090 });
          setLocationLoaded(true);
          console.log(err);
        }
      )
    }
  }, [isHydrated, user, token, fetchInitialData, locationLoaded]);

  if (!isHydrated || !token || !user || user.role !== 'TOURIST' || isLoading || !locationLoaded) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-amber-200/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-orange-200/20 blur-3xl animate-pulse" 
               style={{ animationDelay: '1s' }} />
        </div>

        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Animated logo/icon area */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0" style={{ animation: 'spin 3s linear infinite' }}>
              <div className="h-24 w-24 rounded-full border-4 border-transparent border-t-amber-500 border-r-orange-500" />
            </div>
            
            {/* Inner pulsing circle */}
            <div className="flex h-24 w-24 items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse shadow-lg shadow-amber-500/50" />
            </div>
          </div>

          {/* Loading text */}
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
              Preparing Your Dashboard
            </h2>
            <p className="text-slate-500 text-sm animate-pulse">
              {!locationLoaded ? "Getting your location..." : "Loading your data..."}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-orange-600 animate-bounce" 
                 style={{ animationDelay: '0.1s' }} />
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" 
                 style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex min-h-screen w-full flex-col relative"
      style={{
        backgroundImage: 'url("https://i.postimg.cc/HnFNjzdZ/particle-burst-golden-sparkle-shimmer-background-illustration.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-2xl" /> {/* Overlay for better contrast */}
      <div className="relative z-10 flex flex-1 flex-col"> {/* Content wrapper */}
        <NotificationHandler />
        <Header />
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 mt-2 mx-2 rounded-xl shadow-xl bg-white/10 backdrop-blur-lg border border-white">
          {children}
        </main>
        <CheckInModal/>
      </div>
    </div>
  );
}
