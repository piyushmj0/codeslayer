import api from "./api";

export const updateMyProfile = (data: { name: string }) => {
  return api.put('/users/me', data); 
};