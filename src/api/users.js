import client from './client';

export const getCurrentUser = () => client.get('/users/me');
export const updateCurrentUser = (data) => client.patch('/users/me', data);
export const deleteCurrentUser = () => client.delete('/users/me');

// Admin endpoints
export const getAllUsers = () => client.get('/users');
export const getUser = (id) => client.get(`/users/${id}`);
export const patchUser = (id, data) => client.patch(`/users/${id}`, data);
export const deleteUser = (id) => client.delete(`/users/${id}`);
