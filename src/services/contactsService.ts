import { ContactFormData } from '@/types';
import api from './api';

export const getMyContacts = () => { return api.get('/contacts'); };
export const addContact = (data: ContactFormData) => { return api.post('/contacts', data); };
export const deleteContact = (contactId: string) => { return api.delete(`/contacts/${contactId}`); };