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
 * @param {string[]} phones - Array of phone numbers
 * @returns {Promise} - Validation response
 */
export const validatePhones = async (phones) => {
  const response = await api.post('/validate', { phones });
  return response.data;
};

/**
 * Send broadcast message
 * @param {string[]} recipients - Array of recipient phone numbers
 * @param {string} message - Message to send
 * @returns {Promise} - Send response
 */
export const sendBroadcast = async (recipients, message) => {
  const response = await api.post('/send', { recipients, message });
  return response.data;
};

/**
 * Get all campaigns
 * @returns {Promise} - Campaigns list
 */
export const getCampaigns = async () => {
  const response = await api.get('/campaigns');
  return response.data;
};

/**
 * Get campaign by ID
 * @param {number} id - Campaign ID
 * @returns {Promise} - Campaign details
 */
export const getCampaign = async (id) => {
  const response = await api.get(`/campaigns/${id}`);
  return response.data;
};

/**
 * Get all contacts
 * @returns {Promise} - Contacts list
 */
export const getContacts = async () => {
  const response = await api.get('/contacts');
  return response.data;
};

export default api;
