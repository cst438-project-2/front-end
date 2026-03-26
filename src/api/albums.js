import client from './client';

export const getAlbums = async () => {
  try {
    const res = await client.get('/api/albums');
    return res.data;
  } catch (error) {
    console.error('Error loading albums:', error);
    throw error;
  }
};
export const getAlbum = async (id) => {
  try {
    const res = await client.get(`/api/albums/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching album:', error);
    throw error;
  }
};

export const createAlbum = async (data) => {
  try {
    const res = await client.post('/api/albums', data);
    return res.data;
  } catch (error) {
    console.error('Error creating album:', error);
    throw error;
  }
};

export const updateAlbum = (id, data) => client.patch(`/api/albums/${id}`, data);
export const patchAlbum = (id, data) => client.patch(`/api/albums/${id}`, data);
export const deleteAlbum = async (id) => {
  try {
    const res = await client.delete(`/api/albums/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting album:', error);
    throw error;
  }
};