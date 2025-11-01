import api from './api';
import { SafetyZone } from '@/types';
import { AxiosResponse } from 'axios';
import { Feature, FeatureCollection, Geometry } from 'geojson';

interface ZonePayload {
  name: string;
  safetyScore: number;
  type: string;
  description: string;
  geometry: Geometry;
}

interface SpotPayload {
  name: string;
  type: string;
  description:string;
  latitude: number;
  longitude: number;
}

export const getSafetyZones = (): Promise<AxiosResponse<SafetyZone[]>> => {
  return api.get('/safety-zones');
};

export const createZone = (data: ZonePayload) => {
  return api.post('/safety-zones', data);
};

export const updateZone = (id: string, data: Partial<ZonePayload>) => {
  return api.put(`/safety-zones/${id}`, data);
};

export const deleteZone = (id: string | number | undefined) => {
  return api.delete(`/safety-zones/${id}`);
};


export const getSafeSpots = (): Promise<AxiosResponse<FeatureCollection>> => {
  return api.get('/safe-spots');
};
export const createSpot = (data: SpotPayload) => {
  return api.post('/safe-spots', data);
};
export const updateSpot = (id: string, data: Partial<SpotPayload>) => {
  return api.put(`/safe-spots/${id}`, data);
};
export const deleteSpot = (id: string) => {
  return api.delete(`/safe-spots/${id}`);
}

export const createZoneBatch = (features: Feature[]) => {
  return api.post('/safety-zones/batch', { features });
};

export const createSpotBatch = (features: Feature[]) => {
  return api.post('/safe-spots/batch', { features });
};