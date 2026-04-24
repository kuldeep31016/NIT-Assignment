import axiosInstance from './axiosInstance';

export const fetchUsersApi = () => axiosInstance.get('/users');
export const updateUserRoleApi = (id, payload) => axiosInstance.patch(`/users/${id}/role`, payload);
export const updateProfileApi = (payload) => axiosInstance.patch('/users/profile', payload);
