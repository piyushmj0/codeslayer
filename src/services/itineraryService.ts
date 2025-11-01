import api from './api';
import { Itinerary, PlaceFormData } from '@/types';
import { AxiosResponse } from 'axios';

export const getItinerary = (): Promise<AxiosResponse<Itinerary>> => {
  return api.get('/itineraries');
};

export const createItinerary = (data: { name: string }): Promise<AxiosResponse<Itinerary>> => {
  return api.post('/itineraries', data);
};

export const addPlace = (data: PlaceFormData) => {
  return api.post('/itineraries/places', data);
};

export const deletePlace = (placeId: string) => {
  return api.delete(`/itineraries/places/${placeId}`);
};