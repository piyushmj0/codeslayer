import api from './api';
import { CreateGroupFormData, AddMemberFormData, Group } from '@/types';
import { AxiosResponse } from 'axios';

export const getMyGroups = (): Promise<AxiosResponse<Group[]>> => {
  return api.get('/groups');
};

export const getGroupDetails = (groupId: string): Promise<AxiosResponse<Group>> => {
  return api.get(`/groups/${groupId}`);
};

export const createGroup = (data: CreateGroupFormData) => {
  return api.post('/groups', data);
};

export const addMember = (groupId: string, data: AddMemberFormData) => {
  return api.post(`/groups/${groupId}/members`, data);
};

export const getPendingInvites = () => {
  return api.get('/invites');
};

export const acceptInvite = (groupId: string) => {
  return api.put(`/invites/${groupId}/accept`);
};

export const rejectInvite = (groupId: string) => {
  return api.delete(`/invites/${groupId}/reject`);
};

export const getGroupMemberLocations = (groupId: string) => {
  return api.get(`/groups/${groupId}/locations`);
};