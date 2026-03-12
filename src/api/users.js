import client from './client';

export const getCurrentUser = () => client.get('/api/users/me');
export const updateCurrentUser = (data) => client.patch('/api/users/me', data);
export const deleteCurrentUser = () => client.delete('/api/users/me');

// Admin endpoints
export const getAllUsers = () => client.get('/api/users');
export const getUser = (id) => client.get(`/api/users/${id}`);
export const patchUser = (id, data) => client.patch(`/api/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/api/users/${id}`);
