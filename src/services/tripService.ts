import api from './api';

export const pauseTracking = (durationInHours: number) => {
  return api.post('/trips/pause', { durationInHours });
};

export const updateTripLocation = (latitude: number, longitude: number) => {
  return api.post('/trips/location', { latitude, longitude });
};

export const resumeTracking = () => {
  return api.post('/trips/resume');
};

export const confirmSafe = () => {
  return api.post('/trips/confirm-safe');
}

export const snoozeAnomalyDetection = () => {
  return api.post('/trips/snooze');
};