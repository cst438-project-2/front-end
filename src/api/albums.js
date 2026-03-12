import client from './client';

export const getAlbums = () => client.get('/api/albums');
export const getAlbum = (id) => client.get(`/api/albums/${id}`);
export const createAlbum = (data) => client.post('/api/albums', data);
export const updateAlbum = (id, data) => client.put(`/api/albums/${id}`, data);
export const patchAlbum = (id, data) => client.patch(`/api/albums/${id}`, data);
export const deleteAlbum = (id) => client.delete(`/api/albums/${id}`);
