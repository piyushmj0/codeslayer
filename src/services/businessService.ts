import api from './api';
import { BusinessApplyFormData } from '@/types';
import { AxiosResponse } from 'axios';
import { Business } from '@/types';

export const applyForBusiness = (data: BusinessApplyFormData) => {
    return api.post('/businesses/apply', data);
};

export const getMyBusinesses = (): Promise<AxiosResponse<Business[]>> => {
    return api.get('/businesses/my-businesses');
};