"use client";

import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import useAlertStore from '@/store/alertStore';
import { snoozeAnomalyDetection } from '@/services/tripService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Trip } from '@/types';

const CHECK_IN_DURATION = 60; // 60 seconds for the user to respond

export const CheckInModal = () => {
  const { isCheckInVisible, hideCheckIn } = useAlertStore();
  const [countdown, setCountdown] = useState(CHECK_IN_DURATION);
  
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const tripId = useAuthStore((state) => state.tripId);

  // Handle the countdown timer
  useEffect(() => {
    if (!isCheckInVisible) {
      setCountdown(CHECK_IN_DURATION); // Reset timer when hidden
      return;
    }
    const timerId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          hideCheckIn(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isCheckInVisible, hideCheckIn]);

  const handleConfirmSafe = async () => {
    try {
      await snoozeAnomalyDetection();
      
      if (user && tripId) {
        const activeTrip = user.trips.find(t => t.id === tripId);
        
        if (activeTrip) {
          const updatedTrip: Trip = {
            ...activeTrip,
            status: 'SNOOZED',
            checkInStartedAt: null,
            snoozedUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          };
          
          const updatedUser: User = {
            ...user,
            trips: user.trips.map(t => (t.id === tripId ? updatedTrip : t))
          };
          
          setUser(updatedUser);
        }
      }

      hideCheckIn();
      toast.success("Safety confirmed. Thank you!");

    } catch (err) {
      toast.error("Failed to confirm safety. Please try again.");
      console.log(err);
    }
  };

  return (
    <Dialog open={isCheckInVisible} onOpenChange={hideCheckIn}>
      <DialogContent 
        className="sm:max-w-md" 
        onOpenAutoFocus={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Are you okay?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            We&apos;ve detected unusual activity on your account. Please confirm your safety.
            <br />
            An alert will be sent to your emergency contacts if you don&apos;t respond.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center py-4">
          <div className="text-6xl font-bold text-primary">{countdown}</div>
        </div>
        <Button 
          size="lg" 
          className="w-full h-12 text-lg" 
          onClick={handleConfirmSafe}
        >
          I Am Safe
        </Button>
      </DialogContent>
    </Dialog>
  );
};