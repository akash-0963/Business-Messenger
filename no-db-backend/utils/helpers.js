/**
 * Utility Functions for WhatsApp Broadcast Portal
 */

/**
 * Normalize phone number to international format
 * - Strips all non-digit characters
 * - Returns phone number with + prefix
 * @param {string} phone - Raw phone number
 * @returns {string} - Normalized phone number with country code
 */
export function normalizePhoneNumber(phone) {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d\+]/g, '');

  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Remove duplicate phone numbers from array
 * @param {string[]} phones - Array of phone numbers
 * @returns {string[]} - Array with duplicates removed
 */
export function removeDuplicates(phones) {
  return [...new Set(phones)];
}

/**
 * Chunk array into smaller batches
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
 * Personalize message by replacing placeholders with contact data
 * Supports placeholders like {{name}}, {{email}}, {{city}}, etc.
 * @param {Object} contact - Contact object with data fields
 * @param {string} message - Message template with placeholders
 * @returns {string} - Personalized message
 */
export function personalizeMessage(contact, message) {
  let personalizedMessage = message;

  // Replace {{name}} placeholder
  if (contact.name) {
    personalizedMessage = personalizedMessage.replace(/\{\{name\}\}/gi, contact.name);
  }

  // Replace {{email}} placeholder
  if (contact.email) {
    personalizedMessage = personalizedMessage.replace(/\{\{email\}\}/gi, contact.email);
  }

  // Replace {{phone}} placeholder
  if (contact.phone) {
    personalizedMessage = personalizedMessage.replace(/\{\{phone\}\}/gi, contact.phone);
  }

  // Replace {{city}} placeholder
  if (contact.city) {
    personalizedMessage = personalizedMessage.replace(/\{\{city\}\}/gi, contact.city);
  }

  // You can add more placeholder replacements as needed

  return personalizedMessage;
}

/**
 * Validate if string is a valid phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidPhoneFormat(phone) {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}
