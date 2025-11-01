import api from './api';


export const getNearbyTourists = (latitude: number, longitude: number) => {
  return api.get(`/location/nearby?latitude=${latitude}&longitude=${longitude}`);
};