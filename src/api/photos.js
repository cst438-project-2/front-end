import client from './client';

export const getPhotos = async (albumId) => {
  try {
    const res = await client.get(`/api/albums/${albumId}/photos`);
    return res.data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};
export const addPhoto = async (albumId, data) => {
  try {
    const res = await client.post(`/api/albums/${albumId}/photos`, data);
    return res.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
export const deletePhoto = async (albumId, photoId) => {
  try {
    const res = await client.delete(`/api/albums/${albumId}/photos/${photoId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};
