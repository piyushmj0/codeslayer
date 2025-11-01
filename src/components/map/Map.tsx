"use client";

import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  LayerProps,
  MapRef,
  MarkerDragEvent,
  MapMouseEvent,
  MapProvider,
} from "react-map-gl/mapbox";
import { useState, useEffect, useCallback, useRef } from "react";
import { ItineraryPlace } from "@/types";
import { toast } from "sonner";
import { Phone, Shield, User, MapPin } from "lucide-react";
import { Feature, Point, LineString } from "geojson";
import { DirectionsWidget } from "@/components/dashboard/widgets/DirectionsWidget";
import { calculateSafeRoute, RouteResponse, ItineraryRoute } from "@/services/routeService";
import { useDataStore } from "@/store/dataStore";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// --- Layer Styles ---
const zoneLayerStyle: LayerProps = {
  id: "safety-zones-fill",
  type: "fill",
  paint: {
    "fill-color": [
      "case",
      ["<", ["get", "safetyScore"], 30],
      "#c0392b",
      ["<", ["get", "safetyScore"], 60],
      "#f39c12",
      "#27ae60",
    ],
    "fill-opacity": 0.2,
  },
};

const spotLayerStyle: LayerProps = {
  id: "safe-spots-points",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-color": "#27ae60",
    "circle-stroke-color": "white",
    "circle-stroke-width": 2,
  },
};

const memberLayerStyle: LayerProps = {
  id: "group-members-points",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-color": "#8b5cf6",
    "circle-stroke-color": "white",
    "circle-stroke-width": 2,
  },
};

const touristLayerStyle: LayerProps = {
  id: "nearby-tourists-points",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": "#64748b",
    "circle-opacity": 0.8,
  },
};

const safestRouteStyle: LayerProps = {
  id: "safest-route-line",
  type: "line",
  paint: { "line-color": "#0ea5e9", "line-width": 6, "line-opacity": 0.8 },
  layout: { "line-cap": "round", "line-join": "round" },
};

const fastestRouteStyle: LayerProps = {
  id: "fastest-route-line",
  type: "line",
  paint: {
    "line-color": "#64748b",
    "line-width": 4,
    "line-opacity": 0.6,
    "line-dasharray": [2, 2],
  },
  layout: { "line-cap": "round", "line-join": "round" },
};

// --- Component Props & Types ---
interface PopupInfo {
  longitude: number;
  latitude: number;
  name: string;
  type: string;
  phone?: string;
  safetyScore?: number;
}

// We accept the ItineraryPlace shape for the 'path' prop
interface MapProps {
  onMapClickCoords?: (coords: { lat: number; lng: number }) => void;
  pickerMode?: boolean;
  onMarkerDragEnd?: (coords: { lat: number; lng: number }) => void;
  path?: (ItineraryPlace & { latitude: number | null; longitude: number | null })[];
  initialCenter?: { lat: number; lng: number };
  routes?: (ItineraryRoute | null)[];
}

const MapComponent = ({
  onMapClickCoords,
  pickerMode = false,
  onMarkerDragEnd,
  path = [],
  initialCenter,
  routes = [],
}: MapProps) => {
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState({
    longitude: initialCenter?.lng || 77.209,
    latitude: initialCenter?.lat || 28.6139,
    zoom: initialCenter ? 13 : 11,
  });

  const zones = useDataStore((state) => state.safetyZones);
  const safeSpots = useDataStore((state) => state.safeSpots);
  const groupMembers = useDataStore((state) => state.groupMemberLocations);
  const nearbyTourists = useDataStore((state) => state.nearbyTourists);



  // --- State for map layers ---
  const [userLocation, setUserLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  const [hoverInfo, setHoverInfo] = useState<PopupInfo | null>(null);

  // --- Picker marker state ---
  const [pickerMarker, setPickerMarker] = useState({
    latitude: viewState.latitude,
    longitude: viewState.longitude,
  });

  // --- Ad-hoc route state (for Dashboard search) ---
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [destination, setDestination] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  // --- 1. Fetch user location ---
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        setUserLocation(newLocation);

        if (pickerMode) {
          setPickerMarker(newLocation);
          setViewState((prev) => ({ ...prev, ...newLocation, zoom: 13 }));
          if (onMarkerDragEnd) {
            onMarkerDragEnd({ lat: newLocation.latitude, lng: newLocation.longitude });
          }
        } else if (path.length === 0 && !initialCenter) {
          // Only auto-center if it's the main dashboard map
          setViewState((prev) => ({ ...prev, ...newLocation, zoom: 13 }));
        }
      },
      () => {
        if (!pickerMode) toast.warning("Could not get your location.");
      }
    );
  }, [pickerMode, onMarkerDragEnd, initialCenter]);


  const onMapClickHandler = useCallback(
    (event: MapMouseEvent) => {
      // If an onMapClickCoords function was passed (Itinerary Page)
      // AND the user clicked on an empty part of the map (no features)
      if (onMapClickCoords && (!event.features || event.features.length === 0)) {
        onMapClickCoords(event.lngLat);
        return;
      }
      
      // If in picker mode, update the marker
      if (pickerMode) {
        const { lat, lng } = event.lngLat;
        setPickerMarker({ latitude: lat, longitude: lng });
        if (onMarkerDragEnd) {
            onMarkerDragEnd({ lat, lng });
        }
      }
    },
    [onMapClickCoords, pickerMode, onMarkerDragEnd]
  );

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    setPickerMarker({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  }, []);

  const onMarkerDragFinal = useCallback(
    (event: MarkerDragEvent) => {
      if (onMarkerDragEnd) onMarkerDragEnd(event.lngLat);
    },
    [onMarkerDragEnd]
  );

  const onMapHover = useCallback(
    (event: MapMouseEvent) => {
      if (pickerMode) return;

      if (event.features && event.features.length > 0) {
        const feature = event.features[0];
        const props = feature.properties;
        
        if (!props) {
          setHoverInfo(null);
          return;
        }

        event.target.getCanvas().style.cursor = "pointer";
        
        let info: PopupInfo | null = null;

        // Check if it's a zone (polygon)
        if (feature.layer?.id === "safety-zones-fill") {
          info = {
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat,
            name: props.name,
            type: "Safety Zone",
            safetyScore: props.safetyScore,
          };
        } 
        // Check if it's a point
        else if (feature.geometry.type === "Point") {
          const coords = (feature.geometry as Point).coordinates;
          info = {
            longitude: coords[0],
            latitude: coords[1],
            name: props.name,
            type: props.type,
            phone: props.phone,
          };
        }
        
        setHoverInfo(info);

      } else {
        event.target.getCanvas().style.cursor = "";
        setHoverInfo(null);
      }
    },
    [pickerMode]
  );

  useEffect(() => {
    if (destination && userLocation) {
      toast.promise(calculateSafeRoute(userLocation, destination), {
        loading: "Calculating safest route...",
        success: (res) => {
          setRouteData(res.data);
          return "Routes found!";
        },
        error: "Could not find a route.",
      });
    }
  }, [destination, userLocation]);

  const onMapLeave = useCallback(() => setHoverInfo(null), []);

  if (!MAPBOX_TOKEN)
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <p>Map API token is missing.</p>
      </div>
    );

  // Filter out nulls and create valid coordinate pairs
  const validPathPoints = path
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ 
      longitude: p.longitude!, 
      latitude: p.latitude!, 
      name: p.name // Pass name for marker
    }));
    
  const interactiveLayerIds = pickerMode
    ? []
    : [
        "safe-spots-points",
        "group-members-points",
        "nearby-tourists-points",
        "safety-zones-fill",
      ];

  const createRouteFeature = (geometry: LineString): Feature => ({
    type: "Feature",
    properties: {},
    geometry: geometry,
  });

  return (
    <MapProvider>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={onMapClickHandler}
        onMouseMove={onMapHover}
        onMouseLeave={onMapLeave}
        interactiveLayerIds={interactiveLayerIds}
      >

        {validPathPoints.map((point, index) => (
            <Marker key={`path-marker-${index}`} longitude={point.longitude} latitude={point.latitude}>
                <div className="flex flex-col items-center">
                    <span className="bg-background text-foreground text-xs font-bold px-2 py-1 rounded-md shadow-lg -translate-y-1">{point.name}</span>
                    <MapPin className="h-6 w-6 text-blue-500 -translate-y-2" fill="#0ea5e9"/>
                </div>
            </Marker>
        ))}

        {/* --- Render Itinerary Routes --- */}
        {routes.length > 0 && routes.map((route, index) => (
          route && (
            <Source
              key={`itinerary-route-${index}`}
              id={`itinerary-route-${index}`}
              type="geojson"
              data={createRouteFeature(route.geometry)}
            >
              {/* We'll just draw the safest route for the itinerary */}
              <Layer {...safestRouteStyle} />
            </Source>
          )
        ))}

        {/* --- Picker marker --- */}
        {pickerMode && (
          <Marker
            longitude={pickerMarker.longitude}
            latitude={pickerMarker.latitude}
            draggable
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragFinal}
          >
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          </Marker>
        )}

        {/* --- Data layers (Hide if in pickerMode) --- */}
        {!pickerMode && (
          <>
            {/* Show search bar ONLY if not viewing a path */}
            {path.length === 0 && <DirectionsWidget onResult={(coords) => setDestination(coords)} />}
            
            {userLocation && (
              <Marker
                longitude={userLocation.longitude}
                latitude={userLocation.latitude}
              >
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md" />
              </Marker>
            )}

            {zones && (
              <Source id="safety-zone-data" type="geojson" data={zones}>
                <Layer {...zoneLayerStyle} />
              </Source>
            )}
            {safeSpots && (
              <Source id="safe-spot-data" type="geojson" data={safeSpots}>
                <Layer {...spotLayerStyle} />
              </Source>
            )}
            {groupMembers && (
              <Source id="group-member-data" type="geojson" data={groupMembers}>
                <Layer {...memberLayerStyle} />
              </Source>
            )}
            {/* Only show nearby tourists if not on itinerary/path page */}
            {path.length === 0 && nearbyTourists && (
              <Source
                id="nearby-tourist-data"
                type="geojson"
                data={nearbyTourists}
              >
                <Layer {...touristLayerStyle} />
              </Source>
            )}

            {/* --- Universal Hover Popup --- */}
            {hoverInfo && (
              <Popup
                longitude={hoverInfo.longitude}
                latitude={hoverInfo.latitude}
                onClose={() => setHoverInfo(null)}
                closeOnClick={false}
                closeButton={false}
                className="z-10"
              >
                <div className="p-1">
                  <h4 className="font-semibold text-sm text-foreground">
                    {hoverInfo.name}
                  </h4>
                  {/* Show score for zones */}
                  {hoverInfo.safetyScore && (
                    <p className="text-xs text-muted-foreground">
                      Safety Score: {hoverInfo.safetyScore} / 100
                    </p>
                  )}
                  {/* Show type/phone for points */}
                  {!hoverInfo.safetyScore && (
                    <>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {hoverInfo.type === "Safe Spot" && <Shield className="h-3 w-3" />}
                        {hoverInfo.type === "Group Member" && <User className="h-3 w-3" />}
                        {hoverInfo.type === "Nearby Tourist" && <User className="h-3 w-3" />}
                        {hoverInfo.type}
                      </p>
                      {hoverInfo.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {hoverInfo.phone}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </Popup>
            )}

            {/* --- Ad-hoc Searched Routes (Dashboard) --- */}
            {routeData && (
              <>
                <Source
                  id="fastest-route"
                  type="geojson"
                  data={createRouteFeature(routeData.fastestRoute.geometry)}
                >
                  <Layer {...fastestRouteStyle} />
                </Source>
                <Source
                  id="safest-route"
                  type="geojson"
                  data={createRouteFeature(routeData.safestRoute.geometry)}
                >
                  <Layer {...safestRouteStyle} />
                </Source>
              </>
            )}
          </>
        )}
      </Map>
    </MapProvider>
  );
};

export default MapComponent;