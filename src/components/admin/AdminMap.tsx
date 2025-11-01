"use client";

import Map, { Popup, Source, Layer, LayerProps } from "react-map-gl/mapbox";
import { useState, useEffect, useCallback } from "react";
import { AdminAlert } from "@/types";
import { toast } from "sonner";
import { Phone, User } from "lucide-react";
import { FeatureCollection, Feature, Point } from "geojson";

import { getActiveTouristsLocations, getActiveAlerts } from "@/services/adminService";
import { getSocket } from "@/services/socketService";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface AdminTouristLocation {
  id: string;
  latitude: number;
  longitude: number;
  user: { id: string; name: string | null; phoneNumber: string };
}

interface PopupInfo {
  longitude: number;
  latitude: number;
  title: string;
  type: string;
  phone?: string;
}

export const AdminMap = () => {
  const [viewState, setViewState] = useState({
    longitude: 77.209,
    latitude: 28.6139,
    zoom: 11,
  });

  const [adminTourists, setAdminTourists] = useState<FeatureCollection | null>(null);
  const [sosAlerts, setSosAlerts] = useState<Set<string>>(new Set());
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [pulseRadius, setPulseRadius] = useState(6); // <-- animation state

  // --- Pulse animation loop ---
  useEffect(() => {
    let direction = 1;
    const interval = setInterval(() => {
      setPulseRadius((prev) => {
        if (prev >= 12) direction = -1;
        if (prev <= 6) direction = 1;
        return prev + direction * 0.4;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // --- Data Fetching & Socket Listeners ---
  useEffect(() => {
    // 1. Fetch initial SOS alerts
    getActiveAlerts().then((res) => {
      const activeAlertUserIds = new Set(
        res.data.map((alert: AdminAlert) => alert.triggeredInTrip.user.id)
      );
      setSosAlerts(activeAlertUserIds);
    });

    // 2. Fetch active tourists
    getActiveTouristsLocations().then((res) => {
      const features: Feature[] = res.data.map((tourist: AdminTouristLocation) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [tourist.longitude, tourist.latitude] },
        properties: {
          id: tourist.user.id,
          title: tourist.user.name || `User ${tourist.user.id.substring(0, 5)}`,
          phone: tourist.user.phoneNumber,
          type: "Active Tourist",
        },
      }));
      setAdminTourists({ type: "FeatureCollection", features });
    });

    // 3. Setup socket listeners
    const socket = getSocket();

    socket.on("newSosAlert", (alertData: { user: { id: string; name: string } }) => {
      toast.error(`🚨 URGENT: SOS from ${alertData.user.name}`);
      setSosAlerts((prev) => new Set(prev).add(alertData.user.id));
    });

    socket.on(
      "touristLocationUpdate",
      (updateData: { userId: string; longitude: number; latitude: number }) => {
        setAdminTourists((prevTourists) => {
          if (!prevTourists) return null;

          const updatedFeatures = prevTourists.features.map((f: Feature) => {
            if (f.properties && f.properties.id === updateData.userId) {
              const newGeometry: Point = {
                type: "Point",
                coordinates: [updateData.longitude, updateData.latitude],
              };
              return { ...f, geometry: newGeometry };
            }
            return f;
          });

          return { type: "FeatureCollection", features: updatedFeatures };
        });
      }
    );

    return () => {
      socket.off("newSosAlert");
      socket.off("touristLocationUpdate");
    };
  }, []);

  // --- Handle map click for popups ---
  const onMapClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature || feature.geometry.type !== "Point" || !feature.properties) {
      setPopupInfo(null);
      return;
    }

    const props = feature.properties as {
      title?: string;
      type?: string;
      phone?: string;
    };

    const coords = (feature.geometry as Point).coordinates;

    setPopupInfo({
      longitude: coords[0],
      latitude: coords[1],
      title: props.title ?? "Unknown",
      type: props.type ?? "Unknown",
      phone: props.phone,
    });
  }, []);

  // --- Handle missing token ---
  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p>Map API token is missing.</p>
      </div>
    );
  }

  // --- Map Layer Styling ---
  const adminTouristLayerStyle: LayerProps = {
    id: "admin-tourist-points",
    type: "circle",
    paint: {
      "circle-radius": [
        "case",
        ["in", ["get", "id"], ["literal", Array.from(sosAlerts)]],
        pulseRadius, // <-- animated radius for SOS
        6,
      ],
      "circle-color": [
        "case",
        ["in", ["get", "id"], ["literal", Array.from(sosAlerts)]],
        "#e74c3c", // red for SOS
        "#3b82f6", // blue for normal
      ],
      "circle-stroke-color": "white",
      "circle-stroke-width": 2,
    },
  };

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={onMapClick}
      interactiveLayerIds={["admin-tourist-points"]}
    >
      {adminTourists && (
        <Source id="admin-tourist-data" type="geojson" data={adminTourists}>
          <Layer {...adminTouristLayerStyle} />
        </Source>
      )}

      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => setPopupInfo(null)}
          closeOnClick={false}
          className="z-10"
        >
          <div className="p-1">
            <h4 className="font-semibold text-sm text-foreground">{popupInfo.title}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {popupInfo.type}
            </p>
            {popupInfo.phone && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {popupInfo.phone}
              </p>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
};
