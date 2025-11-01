import api from './api';
import { ReportFormData } from '@/types';

export const submitReport = (data: ReportFormData) => {
  return api.post('/reports', data);
};