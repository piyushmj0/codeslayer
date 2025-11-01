import api from './api';
import { LineString } from 'geojson';
import { ItineraryPlace } from '@/types';

export interface RouteResponse {
  safestRoute: {
    geometry: LineString;
    duration: number;
    distance: number;
    risk: number;
  };
  fastestRoute: {
    geometry: LineString;
    duration: number;
    distance: number;
    risk: number;
  };
  waypoints: number[][];
}

export interface ItineraryRoute {
  geometry: LineString;
  duration: number;
  distance: number;
  risk: number;
}

interface Coordinates {
  longitude: number;
  latitude: number;
}


export const calculateSafeRoute = (start: Coordinates, end: Coordinates) => {
  const startPoint = { type: 'Point', coordinates: [start.longitude, start.latitude] };
  const endPoint = { type: 'Point', coordinates: [end.longitude, end.latitude] };
  
  return api.post<RouteResponse>('/routes/calculate', { start: startPoint, end: endPoint });
};


export const getRoutesForItinerary = (places: ItineraryPlace[]) => {
  // We only need latitude and longitude
  const placeCoords = places.map(p => ({ latitude: p.latitude, longitude: p.longitude }));
  return api.post<ItineraryRoute[]>('/routes/calculate-itinerary', { places: placeCoords });
};