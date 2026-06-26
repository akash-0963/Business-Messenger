/**
 * Utility Functions for WA Messenger
 */

/**
 * Normalize phone number to international format
 * - Strips all non-digit characters
 * - Adds +91 prefix for 10-digit Indian numbers
 * @param {string} phone - Raw phone number
 * @returns {string} - Normalized phone number with country code
 */
export function normalizePhoneNumber(phone) {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // If it's a 10-digit number, assume it's Indian and add +91
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  // If it already has country code, ensure it starts with +
  if (digitsOnly.length > 10) {
    return `+${digitsOnly}`;
  }

  // Return as-is if it doesn't match expected patterns
  return digitsOnly;
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
