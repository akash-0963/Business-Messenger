import express from 'express';
import { PrismaClient } from '@prisma/client';
import WhatsAppService from '../services/whatsappService.js';
import { normalizePhoneNumber, removeDuplicates, chunkArray } from '../utils/helpers.js';

const router = express.Router();
const prisma = new PrismaClient();
const whatsappService = new WhatsAppService();

/**
 * POST /api/validate
 * Validates phone numbers against WhatsApp API
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

    // Normalize and remove duplicates
    const normalizedPhones = phones.map(normalizePhoneNumber);
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

    // Store valid contacts in database
    for (const phone of allValidNumbers) {
      try {
        await prisma.contact.upsert({
          where: { phone },
          update: { isValid: true },
          create: { phone, isValid: true },
        });
      } catch (dbError) {
        console.error(`Error storing contact ${phone}:`, dbError.message);
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
