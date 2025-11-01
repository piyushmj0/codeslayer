import pointInPolygon from 'point-in-polygon';
import { Feature, FeatureCollection, Polygon } from 'geojson';

// Define the structure of the GeoJSON features our map uses
interface ZoneFeature extends Feature {
  geometry: Polygon;
  properties: {
    safetyScore: number;
    name: string;
    type: string;
  };
}

/**
 * Finds the safety score for a user's current location.
 * @param location The user's [lng, lat] coordinates.
 * @param zones A FeatureCollection of all safety zones.
 * @returns The safety score (1-100) or 50 (neutral) if not in a zone.
 */
export const getScoreForLocation = (
  location: [number, number],
  zones: FeatureCollection
): number => {
  
  // Find the first zone that the user is inside
  const currentZone = (zones.features as ZoneFeature[]).find(feature =>
    pointInPolygon(location, feature.geometry.coordinates[0])
  );

  if (currentZone) {
    return currentZone.properties.safetyScore;
  }
  
  // If no zone is found, return a neutral score
  return 50;
};