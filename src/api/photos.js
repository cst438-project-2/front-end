import client from './client';

export const getPhotos = (albumId) => client.get(`/albums/${albumId}/photos`);
export const addPhoto = (albumId, data) => client.post(`/albums/${albumId}/photos`, data);
export const deletePhoto = (albumId, photoId) => client.delete(`/albums/${albumId}/photos/${photoId}`);
