import express from 'express';
import WhatsAppService from '../services/whatsappService.js';
import { normalizePhoneNumber, removeDuplicates, chunkArray } from '../utils/normalizer.js';

const router = express.Router();
const whatsappService = new WhatsAppService();
const MAX_RECIPIENTS = 250;

/**
 * POST /api/validate
 * Validates phone numbers against WhatsApp API
 * Enforces 250 recipient limit
 * 
 * Request body:
 * {
 *   "phones": ["1234567890", "9876543210", ...]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "validNumbers": ["+911234567890", ...],
 *   "invalidNumbers": ["+919876543210", ...],
 *   "total": 10,
 *   "valid": 8,
 *   "invalid": 2
 * }
 */
router.post('/validate', async (req, res) => {
  try {
    const { phones } = req.body;

    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of phone numbers',
      });
    }

    // Enforce 250 recipient limit
    if (phones.length > MAX_RECIPIENTS) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_RECIPIENTS} recipients allowed. You provided ${phones.length} numbers.`,
      });
    }

    // Normalize and remove duplicates
    const normalizedPhones = phones.map(phone => normalizePhoneNumber(phone));
    const uniquePhones = removeDuplicates(normalizedPhones);

    console.log(`Validating ${uniquePhones.length} unique phone numbers...`);

    // WhatsApp API allows max 50 contacts per request, so chunk them
    const chunks = chunkArray(uniquePhones, 50);
    const allValidNumbers = [];

    // Validate each chunk
    for (const chunk of chunks) {
      try {
        const validNumbers = await whatsappService.validatePhoneNumbers(chunk);
        allValidNumbers.push(...validNumbers);
        
        // Small delay between chunks to avoid rate limiting
        if (chunks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Error validating chunk:', error.message);
        // Continue with other chunks even if one fails
      }
    }

    const invalidNumbers = uniquePhones.filter(phone => !allValidNumbers.includes(phone));

    res.json({
      success: true,
      validNumbers: allValidNumbers,
      invalidNumbers,
      total: uniquePhones.length,
      valid: allValidNumbers.length,
      invalid: invalidNumbers.length,
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate phone numbers',
      error: error.message,
    });
  }
});

export default router;
