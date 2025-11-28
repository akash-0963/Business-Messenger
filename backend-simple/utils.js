/**
 * Utility Functions - NO DATABASE
 * All functions are pure and stateless
 */

/**
 * Normalize phone number to international format
 * - Removes all non-digit characters except leading +
 * - Preserves + at the start if present
 * - Does NOT auto-add country codes
 * 
 * @param {string} phone - Raw phone number input
 * @returns {string} - Normalized phone number
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  
  const trimmed = phone.trim();
  
  // Check if starts with +
  const hasPlus = trimmed.startsWith('+');
  
  // Remove all non-digit characters
  const digitsOnly = trimmed.replace(/\D/g, '');
  
  // Return with + if it was there originally
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Validate if a phone number has a country code
 * Phone numbers without + prefix and less than 11 digits likely missing country code
 * 
 * @param {string} phone - Normalized phone number
 * @returns {boolean} - True if appears to have country code
 */
export function hasCountryCode(phone) {
  // If starts with +, assume it has country code
  if (phone.startsWith('+')) return true;
  
  // If 11+ digits without +, likely has country code
  // (Most country codes are 1-3 digits, local numbers are typically 7-10 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 11;
}

/**
 * Add country code to phone number
 * Only use this when user explicitly selects a default country
 * 
 * @param {string} phone - Phone number
 * @param {string} countryCode - Country code (e.g., '1', '91', '44')
 * @returns {string} - Phone with country code
 */
export function addCountryCode(phone, countryCode) {
  const normalized = normalizePhoneNumber(phone);
  
  // If already has +, return as is
  if (normalized.startsWith('+')) return normalized;
  
  // Remove country code prefix if accidentally included
  const digitsOnly = normalized.replace(/\D/g, '');
  
  return `+${countryCode}${digitsOnly}`;
}

/**
 * Remove duplicate phone numbers from array
 * 
 * @param {string[]} phones - Array of phone numbers
 * @returns {string[]} - Array with duplicates removed
 */
export function removeDuplicates(phones) {
  return [...new Set(phones)];
}

/**
 * Chunk array into smaller batches
 * Used for batching WhatsApp API calls (max 50 contacts per validation request)
 * 
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array[]} - Array of chunks
 */
export function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Validate if string is a valid phone number format
 * Basic validation - checks if contains enough digits
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidPhoneFormat(phone) {
  if (!phone) return false;
  
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Phone numbers should have at least 7 digits and at most 15
  // (ITU-T E.164 standard: max 15 digits)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Parse phone numbers from text (for paste functionality)
 * Extracts numbers line by line or comma-separated
 * 
 * @param {string} text - Raw text with phone numbers
 * @returns {string[]} - Array of extracted phone numbers
 */
export function parsePhoneNumbers(text) {
  if (!text) return [];
  
  // Split by newlines and commas
  const lines = text.split(/[\n,]/).map(line => line.trim()).filter(line => line);
  
  // Extract phone numbers from each line
  return lines.map(line => {
    // Try to extract a phone number (allowing + and digits)
    const match = line.match(/[\+\d\s\-\(\)]+/);
    return match ? match[0].trim() : line;
  }).filter(phone => phone);
}

/**
 * Exponential backoff delay calculator
 * Used for retrying failed requests
 * 
 * @param {number} attempt - Attempt number (0-based)
 * @param {number} baseDelay - Base delay in ms (default 1000)
 * @returns {number} - Delay in milliseconds
 */
export function calculateBackoff(attempt, baseDelay = 1000) {
  // Exponential: 1s, 2s, 4s, 8s, ...
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
}
