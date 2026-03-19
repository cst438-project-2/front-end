import axios from 'axios';

import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach Firebase ID token automatically
client.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  // ensure headers object exists
  config.headers = config.headers || {};

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// debug log (temporary)
console.log('API BASE URL:', API_BASE_URL);

export default client;