import api from './api';
import { AxiosResponse } from 'axios';
import { AdminAlert } from '@/types';

export const getDashboardStats = () => {
  return api.get('/admin/stats');
};

export const listUsers = (page = 1, filters: { role?: string; status?: string; search?: string }) => {
  const params = new URLSearchParams({ page: page.toString() });
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search); 

  return api.get(`/admin/users?${params.toString()}`);
};

export const getUserDetails = (userId: string) => {
  return api.get(`/admin/users/${userId}`);
};

export const updateUserStatus = (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
  return api.put(`/admin/users/${userId}/status`, { status });
};

export const listPendingBusinesses = () => {
  return api.get('/admin/businesses/pending');
};

export const approveBusiness = (businessId: string) => {
  return api.put(`/admin/businesses/${businessId}/approve`);
};

export const rejectBusiness = (businessId: string) => {
  return api.put(`/admin/businesses/${businessId}/reject`);
};

export const listAllIncidents = () => {
  return api.get('/admin/incidents');
};

export const resolveIncident = (alertId: string) => {
  return api.put(`/alerts/${alertId}/resolve`);
};


export const listChatUsers = () => {
  return api.get('/chat/admin/rooms');
}

export const getChatHistoryForUser = (userId: string) => {
  return api.get(`/chat/admin/history/${userId}`);
};

export const getActiveTouristsLocations = () => {
  return api.get('/admin/locations/active-tourists');
};

export const getActiveAlerts = (): Promise<AxiosResponse<AdminAlert[]>> => {
  return api.get('/alerts');
};


export const getUserLocationHistory = (userId: string) => {
  return api.get(`/admin/users/${userId}/location-history`);
};

export const getUserBlockchainLog = (userId: string) => {
  return api.get(`/admin/users/${userId}/blockchain-log`);
};

export const getPendingReports = () => {
  return api.get('/reports/pending');
};

export const updateReportStatus = (reportId: string, status: 'APPROVED' | 'REJECTED') => {
  return api.put(`/reports/${reportId}/status`, { status });
};