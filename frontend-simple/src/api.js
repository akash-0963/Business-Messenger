import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Validate phone numbers
 */
export const validatePhones = async (phones) => {
  const response = await api.post('/validate', { phones });
  return response.data;
};

/**
 * Send broadcast message
 */
export const sendBroadcast = async (recipients, message) => {
  const response = await api.post('/send', { recipients, message });
  return response.data;
};

export default api;
