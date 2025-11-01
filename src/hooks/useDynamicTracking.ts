import { useState, useEffect, useRef } from 'react';
import { getSafetyZones } from '@/services/zonesService';
import { updateTripLocation, resumeTracking } from '@/services/tripService';
import { getScoreForLocation } from '@/lib/location-helpers';
import useAuthStore from '@/store/authStore';
import { FeatureCollection } from 'geojson';
import { toast } from 'sonner';
import { Trip, User } from '@/types';

const INTERVALS = {
  LOW_POWER: 300_000, // 5 min
  CAUTION: 60_000,    // 1 min
  HIGH_ALERT: 15_000, // 15 sec
};

export const useDynamicTracking = (isHydrated: boolean) => {
  const user = useAuthStore((state) => state.user);
  const tripId = useAuthStore((state) => state.tripId);
  const setUser = useAuthStore((state) => state.setUser);

  const [zones, setZones] = useState<FeatureCollection | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const currentInterval = useRef<number>(INTERVALS.CAUTION);

  useEffect(() => {
    console.log('[DynamicTracking] Fetching safety zones...');
    getSafetyZones()
      .then(res => {
        const featureCollection: FeatureCollection = {
          type: 'FeatureCollection',
          features: res.data.map(zone => ({
            type: 'Feature',
            id: zone.id,
            geometry: zone.geometry,
            properties: { safetyScore: zone.safetyScore, name: zone.name, type: zone.type },
          })),
        };
        setZones(featureCollection);
        console.log('[DynamicTracking] Safety zones loaded.');
      })
      .catch(err => console.error('[DynamicTracking] Failed to fetch zones:', err));
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      console.log('[DynamicTracking] Waiting for client hydration...');
      return;
    }
    if (!user || !user.trips) {
      console.log('[DynamicTracking] Aborted: User not loaded or is stale.');
      return;
    }
    if (!tripId) {
      console.log('[DynamicTracking] Aborted: tripId is null.');
      return;
    }
    if (!zones) {
      console.log('[DynamicTracking] Aborted: Zones not loaded yet.');
      return;
    }

    const activeTrip = user.trips.find(t => t.id === tripId);
    if (!activeTrip) {
      console.error('[DynamicTracking] Active trip not found for tripId:', tripId);
      return;
    }

    if (activeTrip.status === 'PAUSED') {
      const pauseEndTime = new Date(activeTrip.pausedUntil!);
      if (new Date() > pauseEndTime) {
        console.log('[DynamicTracking] Pause expired. Resuming trip...');
        toast.info('Resuming live tracking...');
        resumeTracking()
          .then(() => {
            const updatedTrip: Trip = { ...activeTrip, status: 'ACTIVE', pausedUntil: null };
            const updatedUser: User = {
              ...user,
              trips: user.trips.map(t => t.id === tripId ? updatedTrip : t),
            };
            setUser(updatedUser);
          })
          .catch(err => {
            console.error('[DynamicTracking] Failed to resume trip:', err);
          });
      } else {
        console.log('[DynamicTracking] Still in paused period. Waiting...');
      }
      return;
    }

    const track = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log('[DynamicTracking] Got location:', latitude, longitude);
          const userLocation: [number, number] = [longitude, latitude];

          const score = getScoreForLocation(userLocation, zones);
          console.log('[DynamicTracking] Location risk score:', score);

          let newInterval: number;
          if (score < 40) newInterval = INTERVALS.HIGH_ALERT;
          else if (score < 70) newInterval = INTERVALS.CAUTION;
          else newInterval = INTERVALS.LOW_POWER;

          updateTripLocation(latitude, longitude)
            .then(() => console.log('[DynamicTracking] Location updated on server'))
            .catch(err => console.error('[DynamicTracking] Failed to send location:', err));

          if (currentInterval.current !== newInterval) {
            console.log(`[DynamicTracking] Changing interval to ${newInterval}ms (score: ${score})`);
            currentInterval.current = newInterval;
            if (intervalId.current) clearInterval(intervalId.current);
            intervalId.current = setInterval(track, newInterval);
          }
        },
        (err) => console.error('[DynamicTracking] Geolocation error:', err.message),
        { enableHighAccuracy: true }
      );
    };

    console.log('[DynamicTracking] Starting tracker...');
    track();
    intervalId.current = setInterval(track, currentInterval.current);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        console.log('[DynamicTracking] Tracker cleared.');
      }
    };
  }, [isHydrated, user, tripId, zones, setUser]);
};