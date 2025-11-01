"use client";

import { useEffect } from 'react';
import { getSocket } from '@/services/socketService';
import { toast } from 'sonner';

export const NotificationHandler = () => {
  useEffect(() => {
    const socket = getSocket();

    socket.on('newSosAlert', (data) => {
      console.log('New SOS Alert Received:', data);
      toast.error(' New SOS Alert', {
        description: `${data.user.name} has triggered an SOS near you. Please be vigilant.`,
        duration: 10000,
        action: {
          label: 'View Details',
          onClick: () => console.log('Navigate to alert details page'), // Future: router.push(`/alerts/${data.alertId}`)
        },
      });
    });

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('newSosAlert');
    };
  }, []);

  return null; // This component renders nothing in the UI
};