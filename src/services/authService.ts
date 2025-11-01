import api from './api';
import { AuthResponse, LoginFormData, RegisterFormData, AdminLoginFormData, BusinessRegisterFormData } from '@/types';
import { AxiosResponse } from 'axios';

export const registerAndCreateTrip = (data: RegisterFormData): Promise<AxiosResponse<{ uniqueDigitalId: string }>> => {
  return api.post('/auth/register', data);
};

export const loginWithDigitalId = (data: LoginFormData): Promise<AxiosResponse<AuthResponse>> => {
  return api.post('/auth/login', data);
};

export const loginAdmin = (data: AdminLoginFormData): Promise<AxiosResponse<AuthResponse>> => {
  return api.post<AuthResponse>('/auth/login/admin', data);
};

export const registerBusiness = (data: BusinessRegisterFormData) => {
  return api.post('/auth/register/business', data);
};