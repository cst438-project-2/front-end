import client from './client';

export const getPhotos = (albumId) => client.get(`/api/albums/${albumId}/photos`);
export const addPhoto = (albumId, data) => client.post(`/api/albums/${albumId}/photos`, data);
export const deletePhoto = (albumId, photoId) => client.delete(`/api/albums/${albumId}/photos/${photoId}`);
