import client from './client';

export const getAlbums = () => client.get('/albums');
export const getAlbum = (id) => client.get(`/albums/${id}`);
export const createAlbum = (data) => client.post('/albums', data);
export const updateAlbum = (id, data) => client.put(`/albums/${id}`, data);
export const patchAlbum = (id, data) => client.patch(`/albums/${id}`, data);
export const deleteAlbum = (id) => client.delete(`/albums/${id}`);
