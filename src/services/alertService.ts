import api from './api';

export const triggerSos = (latitude: number, longitude: number) => {
  return api.post('/alerts/sos', { latitude, longitude });
};

export const getMyDashboardAlerts = () => {
  return api.get('/users/alerts')
}