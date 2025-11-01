"use client";

import Map, { Source, Layer, LayerProps, MapRef } from "react-map-gl/mapbox";
import { useState, useRef } from "react";
import type { Feature, Geometry } from "geojson";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Props for the path map
interface PathMapProps {
  path: { latitude: number; longitude: number }[];
  initialCenter?: { lat: number; lng: number };
}

// Style for the path
const pathLayerStyle: LayerProps = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": "#0ea5e9", // A bright blue color
    "line-width": 4,
    "line-opacity": 0.8,
  },
};

const PathMap = ({ path, initialCenter }: PathMapProps) => {
  const mapRef = useRef<MapRef | null>(null);

  // Set the initial view. Use the first point of the path, or a default.
  const [viewState, setViewState] = useState({
    longitude: initialCenter?.lng || (path.length > 0 ? path[0].longitude : 77.2090),
    latitude: initialCenter?.lat || (path.length > 0 ? path[0].latitude : 28.6139),
    zoom: 12,
  });

  if (!MAPBOX_TOKEN) {
    return <div className="flex items-center justify-center h-full bg-muted rounded-lg"><p>Map API token is missing.</p></div>;
  }

  // Convert our path array into a GeoJSON LineString
  const pathGeoJSON: Feature<Geometry> = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: path.map(p => [p.longitude, p.latitude]),
    },
  };

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      {/* Render the path if it has points */}
      {path.length > 0 && (
        <Source id="route" type="geojson" data={pathGeoJSON}>
          <Layer {...pathLayerStyle} />
        </Source>
      )}
    </Map>
  );
};

export default PathMap;