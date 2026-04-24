import axiosInstance from './axiosInstance';

export const fetchTasksApi = (params = {}) => axiosInstance.get('/tasks', { params });
export const fetchTaskApi = (id) => axiosInstance.get(`/tasks/${id}`);
export const createTaskApi = (payload) => axiosInstance.post('/tasks', payload);
export const updateTaskApi = (id, payload) => axiosInstance.put(`/tasks/${id}`, payload);
export const deleteTaskApi = (id) => axiosInstance.delete(`/tasks/${id}`);
export const fetchTaskAuditApi = (id) => axiosInstance.get(`/tasks/${id}/audit`);
