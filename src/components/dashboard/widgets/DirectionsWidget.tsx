"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useMap } from "react-map-gl/mapbox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface DirectionsWidgetProps {
  onResult: (coords: { longitude: number; latitude: number }) => void;
}

export const DirectionsWidget = ({ onResult }: DirectionsWidgetProps) => {
  const geocoderRef = useRef<HTMLDivElement | null>(null);
  const { current: map } = useMap();

  useEffect(() => {
    if (!map || !geocoderRef.current) return;

    const mapInstance = map.getMap(); 

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as unknown as typeof import("mapbox-gl"),
      marker: false,
      placeholder: "Where to?",
    });

    geocoderRef.current.appendChild(geocoder.onAdd(mapInstance));

    geocoder.on("result", (e) => {
      const [longitude, latitude] = e.result.center as [number, number];
      onResult({ longitude, latitude });
    });

    return () => {
      geocoder.onRemove();
    };
  }, [map, onResult]);

  return (
    <div
      ref={geocoderRef}
      className="absolute top-4 left-4 z-10 w-full max-w-sm"
    />
  );
};
