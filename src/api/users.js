import client from './client';

export const getCurrentUser = async () => {
  const res = await client.get('/api/users/me');
  return res.data;
};

export const updateCurrentUser = async (data) => {
  const res = await client.patch('/api/users/me', data);
  return res.data;
};

export const deleteCurrentUser = async () => {
  const res = await client.delete('/api/users/me');
  return res.data;
};

export const getAllUserAlbums = async () => {
  const res = await client.get(`/api/users/albums`);
  return res.data;
};

// Admin endpoints
export const getAllUsers = async () => {
  const res = await client.get('/api/users');
  return res.data;
};

export const getUser = async (id) => {
  const res = await client.get(`/api/users/${id}`);
  return res.data;
};

export const patchUser = async (id, data) => {
  const res = await client.patch(`/api/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await client.delete(`/api/users/${id}`);
  return res.data;
};
