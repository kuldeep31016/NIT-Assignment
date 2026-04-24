import axiosInstance from './axiosInstance';

export const registerApi = (payload) => axiosInstance.post('/auth/register', payload);
export const loginApi = (payload) => axiosInstance.post('/auth/login', payload);
export const meApi = () => axiosInstance.get('/auth/me');
export const inviteApi = (payload) => axiosInstance.post('/auth/invite', payload);
export const googleAuthApi = (payload) => axiosInstance.post('/auth/google', payload);
