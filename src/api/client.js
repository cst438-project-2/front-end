import axios from 'axios';

import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://memory-bank-back-end.onrender.com';

const client = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach Firebase ID token automatically
client.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  console.log('API request user:', user?.email || null);

  // ensure headers object exists
  config.headers = config.headers || {};

  if (user) {
    const token = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Attaching Firebase token');
  }

  if (!user) {
    console.log('No Firebase user, no token attached');
  }

  return config;
});

// debug log (temporary)
console.log('API BASE URL:', API_BASE_URL);

export default client;