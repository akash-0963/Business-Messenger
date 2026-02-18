/**
 * Advanced Phone Number Normalizer
 * Supports global phone numbers from 200+ countries
 */

/**
 * Normalize phone number to international format
 * @param {string} phone - Raw phone number input
 * @param {string} defaultCountryCode - Default country code to apply (e.g., "+91")
 * @param {boolean} applyDefaultCC - Whether to auto-apply default CC to numbers without one
 * @returns {string} - Normalized phone number
 */
export function normalizePhoneNumber(phone, defaultCountryCode = '', applyDefaultCC = false) {
  if (!phone) return '';

  // Remove all whitespace, dashes, parentheses, dots
  let cleaned = phone.replace(/[\s\-\(\)\.\[\]]/g, '');

  // Check if number already has a country code (starts with +)
  const hasCountryCode = cleaned.startsWith('+');

  if (hasCountryCode) {
    // Already has CC - just clean and return
    return cleaned;
  }

  // No country code - apply default if enabled
  if (applyDefaultCC && defaultCountryCode) {
    // Remove any leading zeros (common in local formats)
    cleaned = cleaned.replace(/^0+/, '');
    
    // Ensure default CC starts with +
    const cc = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    
    return `${cc}${cleaned}`;
  }

  // Return as-is (user didn't want auto CC)
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidPhoneFormat(phone) {
  if (!phone) return false;

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d\+]/g, '');

  // Must start with + and have 10-15 digits
  if (!cleaned.startsWith('+')) return false;

  const digitsOnly = cleaned.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

/**
 * Extract phone numbers from text (CSV, manual input, etc.)
 * @param {string} text - Text containing phone numbers
 * @param {string} defaultCountryCode - Default country code
 * @param {boolean} applyDefaultCC - Whether to apply default CC
 * @returns {string[]} - Array of normalized phone numbers
 */
export function extractPhoneNumbers(text, defaultCountryCode = '', applyDefaultCC = false) {
  if (!text) return [];

  // Split by newlines, commas, semicolons, pipes
  const lines = text.split(/[\n\r,;|]+/).map(line => line.trim()).filter(line => line);

  const phones = [];

  lines.forEach(line => {
    // Try to extract phone number from line
    const extracted = extractPhoneFromLine(line);
    if (extracted) {
      const normalized = normalizePhoneNumber(extracted, defaultCountryCode, applyDefaultCC);
      if (normalized) {
        phones.push(normalized);
      }
    }
  });

  // Remove duplicates
  return [...new Set(phones)];
}

/**
 * Extract phone number from a single line of text
 * Handles formats like: "Name, 9876543210, Email" or "+91-9876543210" or "9876543210"
 * @param {string} line - Single line of text
 * @returns {string|null} - Extracted phone number or null
 */
function extractPhoneFromLine(line) {
  if (!line) return null;

  // If line contains comma, it might be CSV - try each field
  if (line.includes(',')) {
    const fields = line.split(',').map(f => f.trim());
    for (const field of fields) {
      const phone = extractPhoneFromField(field);
      if (phone) return phone;
    }
    return null;
  }

  // Single field - extract phone
  return extractPhoneFromField(line);
}

/**
 * Extract phone number from a single field
 * @param {string} field - Text field
 * @returns {string|null} - Phone number or null
 */
function extractPhoneFromField(field) {
  if (!field) return null;

  // Remove common non-digit characters but keep +
  const cleaned = field.replace(/[^\d\+]/g, '');

  // Phone number patterns
  // International: +CountryCode + 10-14 digits
  // Local: 10-15 digits
  const patterns = [
    /\+\d{10,15}/,  // International with +
    /\d{10,15}/     // Local or international without +
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const number = match[0];
      const digitsOnly = number.replace(/\D/g, '');
      
      // Validate length
      if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
        return number;
      }
    }
  }

  return null;
}

/**
 * Parse CSV/TXT file content and extract phone numbers
 * @param {string} content - File content
 * @param {string} defaultCountryCode - Default country code
 * @param {boolean} applyDefaultCC - Whether to apply default CC
 * @returns {string[]} - Array of normalized phone numbers
 */
export function parseFileContent(content, defaultCountryCode = '', applyDefaultCC = false) {
  return extractPhoneNumbers(content, defaultCountryCode, applyDefaultCC);
}

/**
 * Remove duplicates from phone number array
 * @param {string[]} phones - Array of phone numbers
 * @returns {string[]} - Deduplicated array
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

export default {
  normalizePhoneNumber,
  isValidPhoneFormat,
  extractPhoneNumbers,
  parseFileContent,
  removeDuplicates,
  chunkArray
};
