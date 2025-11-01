"use client";

import Map, { MapRef } from "react-map-gl/mapbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useState, useCallback, useRef } from "react";
import type { MapEvent } from "mapbox-gl";
import type { FeatureCollection, Feature } from "geojson";
import { toast } from "sonner";
import {
  getSafetyZones,
  createZone,
  updateZone,
  deleteZone,
  getSafeSpots,
  createSpot,
  updateSpot,
  deleteSpot,
  createZoneBatch,
  createSpotBatch,
} from "@/services/zonesService";
import { SafetyZone } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface DrawEvent {
  features: Feature[];
  type: string;
}

interface ZoneProperties {
  name: string;
  safetyScore: number;
  type: string;
  description?: string;
}

interface SpotPayload {
  id?: string;
  name: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
}

const drawStyles = [
  {
    id: "gl-draw-polygon-fill-inactive",
    type: "fill",
    filter: ["all", ["==", "active", "false"], ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": [
        "case",
        ["<", ["coalesce", ["get", "safetyScore"], 50], 40],
        "#c0392b",
        ["<", ["coalesce", ["get", "safetyScore"], 50], 70],
        "#f39c12",
        "#27ae60",
      ],
      "fill-opacity": 0.3,
    },
  },
  {
    id: "gl-draw-polygon-fill-active",
    type: "fill",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": "#f39c12",
      "fill-opacity": 0.1,
    },
  },
  {
    id: "gl-draw-polygon-stroke-active",
    type: "line",
    filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": "#f39c12",
      "line-dasharray": [0.2, 2],
      "line-width": 2,
    },
  },
  {
    id: "gl-draw-line",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"]],
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": "#f39c12", "line-width": 2 },
  },
  {
    id: "gl-draw-point",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"]],
    paint: { "circle-radius": 6, "circle-color": "#2980b9" },
  },
];

export default function ZoneEditorPage() {
  const [viewState, setViewState] = useState({
    longitude: 77.209,
    latitude: 28.6139,
    zoom: 11,
  });
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // Zone state
  const [selectedZone, setSelectedZone] = useState<Feature | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zoneType, setZoneType] = useState("GENERAL");
  const [safetyScore, setSafetyScore] = useState(50);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Spot state
  const [selectedSpot, setSelectedSpot] = useState<SpotPayload | null>(null);
  const [spotName, setSpotName] = useState("");
  const [spotType, setSpotType] = useState("GENERAL");
  const [spotDescription, setSpotDescription] = useState("");
  const [spotLoading, setSpotLoading] = useState(false);

  const fetchZones = useCallback(async () => {
    try {
      const zonesRes = await getSafetyZones();
      const spotsRes = await getSafeSpots();

      const zoneFeatures: Feature[] = zonesRes.data.map((zone: SafetyZone) => ({
        type: "Feature",
        id: zone.id,
        geometry: zone.geometry,
        properties: { ...zone },
      }));

      const spotFeatures: Feature[] = spotsRes.data.features.map((f) => f);

      const featureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: [...zoneFeatures, ...spotFeatures],
      };

      if (drawRef.current) drawRef.current.set(featureCollection);
    } catch (error) {
      toast.error("Failed to load zones or spots.");
      console.log(error);
    }
  }, []);

  const onDrawUpdate = useCallback((e: DrawEvent) => {
    if (!e.features.length) {
      setSelectedZone(null);
      setSelectedSpot(null);
      return;
    }

    const feature = e.features[0];
    if (feature.geometry.type === "Polygon") {
      setSelectedSpot(null);
      setSelectedZone(feature);
      const props = feature.properties as ZoneProperties;
      setZoneName(props?.name || "");
      setZoneType(props?.type || "");
      setSafetyScore(props?.safetyScore || 50);
      setDescription(props?.description || "");
    } else if (feature.geometry.type === "Point") {
      setSelectedZone(null);
      const [longitude, latitude] = feature.geometry.coordinates;
      const props = feature.properties || {};
      const spot: SpotPayload = {
        id: feature.id as string,
        name: props.name || "Spot",
        type: props.type || "",
        description: props.description || "",
        latitude,
        longitude,
      };
      setSelectedSpot(spot);
      setSpotName(spot.name);
      setSpotType(spot.type);
      setSpotDescription(spot.description);
    }
  }, []);

  const onDrawCreate = useCallback((e: DrawEvent) => {
    const feature = e.features[0];
    if (feature.geometry.type === "Polygon") {
      feature.id = undefined;
      feature.properties = {
        name: "New Zone",
        safetyScore: 50,
        type: "",
        description: "",
      };
      setSelectedZone(feature);
      setZoneName("New Zone");
      setZoneType("");
      setSafetyScore(50);
      setDescription("");
    } else if (feature.geometry.type === "Point") {
      const [longitude, latitude] = feature.geometry.coordinates;
      const spot: SpotPayload = {
        name: "New Spot",
        type: "",
        description: "",
        latitude,
        longitude,
      };
      setSelectedSpot(spot);
      setSpotName(spot.name);
      setSpotType("");
      setSpotDescription("");
    }
  }, []);

  const onDrawDelete = useCallback(
    async (e: DrawEvent) => {
      if (!e.features.length) return;
      const feature = e.features[0];

      if (feature.geometry.type === "Polygon" && feature.id) {
        setLoading(true);
        try {
          await deleteZone(feature.id as string);
          toast.success("Zone deleted successfully.");
        } catch (error) {
          toast.error("Failed to delete zone.");
          fetchZones();
          console.log(error);
        }
        setLoading(false);
        setSelectedZone(null);
      }

      if (feature.geometry.type === "Point" && feature.id) {
        setSpotLoading(true);
        try {
          await deleteSpot(feature.id as string);
          toast.success("Spot deleted successfully.");
        } catch (error) {
          toast.error("Failed to delete spot.");
          fetchZones();
          console.log(error);
        }
        setSpotLoading(false);
        setSelectedSpot(null);
      }
    },
    [fetchZones]
  );

  const handleZoneSave = async () => {
    if (!selectedZone) return;
    setLoading(true);

    const data = {
      name: zoneName,
      type: zoneType,
      safetyScore,
      description,
      geometry: selectedZone.geometry,
    };

    try {
      if (selectedZone.id) await updateZone(selectedZone.id as string, data);
      else await createZone(data);

      toast.success("Safety zone saved!");
      fetchZones();
      setSelectedZone(null);
    } catch (error) {
      toast.error("Failed to save zone.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotSave = async () => {
    if (!selectedSpot) return;
    setSpotLoading(true);

    try {
      if (selectedSpot.id) await updateSpot(selectedSpot.id, selectedSpot);
      else await createSpot(selectedSpot);

      toast.success("Safe spot saved!");
      fetchZones();
      setSelectedSpot(null);
    } catch (error) {
      toast.error("Failed to save spot.");
      console.log(error);
    } finally {
      setSpotLoading(false);
    }
  };

  const onMapLoad = useCallback(
    (evt: MapEvent) => {
      const map = evt.target as unknown as MapRef;
      const draw = new MapboxDraw({
        controls: { polygon: true, point: true, trash: true },
        styles: drawStyles,
      });
      mapRef.current = map;
      drawRef.current = draw;

      map.addControl(draw);
      map.on("draw.create", onDrawCreate);
      map.on("draw.update", onDrawUpdate);
      map.on("draw.delete", onDrawDelete);

      fetchZones();
    },
    [fetchZones, onDrawCreate, onDrawUpdate, onDrawDelete]
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const geojson = JSON.parse(content) as FeatureCollection;

        const polygons = geojson.features.filter(
          (f) => f.geometry.type === "Polygon"
        );
        const points = geojson.features.filter(
          (f) => f.geometry.type === "Point"
        );

        await Promise.all([createZoneBatch(polygons), createSpotBatch(points)]);

        toast.success("File imported successfully!", {
          description: `Added ${polygons.length} zones and ${points.length} spots.`,
        });
        fetchZones();
      } catch (error) {
        toast.error("Failed to read or import file.", {
          description: "Please ensure it's a valid GeoJSON file.",
        });
        console.log(error);
      } finally {
        setUploading(false);
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid md:grid-cols-[1fr_400px] gap-6 h-[calc(100vh-8rem)]">
      <Card className="h-full">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onLoad={onMapLoad}
          style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#4a0e0e]">Editor</CardTitle>
          <CardDescription>
            {selectedZone
              ? "Edit the selected zone."
              : selectedSpot
              ? "Edit the selected spot."
              : "Draw a zone or point to edit."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone Form */}
          {selectedZone && (
            <>
              <div className="space-y-2">
                <Label htmlFor="zoneName">Zone Name</Label>
                <Input
                  id="zoneName"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneType">Zone Type</Label>
                <Input
                  id="zoneType"
                  value={zoneType}
                  placeholder="Enter zone type"
                  onChange={(e) => setZoneType(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyScore">Safety Score</Label>
                <Input
                  id="safetyScore"
                  type="number"
                  min={1}
                  max={100}
                  value={safetyScore}
                  onChange={(e) =>
                    setSafetyScore(parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoneDescription">Description</Label>
                <Input
                  id="zoneDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button
                onClick={handleZoneSave}
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save Zone"
                )}
              </Button>
            </>
          )}

          {/* Spot Form */}
          {selectedSpot && (
            <>
              <div className="space-y-2">
                <Label htmlFor="spotName">Spot Name</Label>
                <Input
                  id="spotName"
                  value={spotName}
                  onChange={(e) => {
                    setSpotName(e.target.value);
                    setSelectedSpot(
                      (prev) => prev && { ...prev, name: e.target.value }
                    );
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spotType">Spot Type</Label>
                <Input
                  id="spotType"
                  value={spotType}
                  placeholder="Enter spot type"
                  onChange={(e) => {
                    setSpotType(e.target.value);
                    setSelectedSpot(
                      (prev) => prev && { ...prev, type: e.target.value }
                    );
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spotDescription">Description</Label>
                <Input
                  id="spotDescription"
                  value={spotDescription}
                  onChange={(e) => {
                    setSpotDescription(e.target.value);
                    setSelectedSpot(
                      (prev) => prev && { ...prev, description: e.target.value }
                    );
                  }}
                />
              </div>

              <Button
                onClick={handleSpotSave}
                className="w-full"
                disabled={spotLoading}
              >
                {spotLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save Spot"
                )}
              </Button>
            </>
          )}

          {!selectedZone && !selectedSpot && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                Select a feature or use the drawing tools to create a new one.
              </p>
              <div className="space-y-2 border-t pt-4">
                <Label className="font-semibold flex items-center">
                  Bulk Upload
                </Label>
                <p className="text-sm text-muted-foreground">
                  Upload a GeoJSON file to import zones and spots at once.
                </p>

                <Input
                  id="file-upload"
                  type="file"
                  accept=".json, .geojson"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Processing..." : "Upload File"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
