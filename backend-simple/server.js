import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import PQueue from 'p-queue';
import WhatsAppService from './whatsappService.js';
import {
  normalizePhoneNumber,
  removeDuplicates,
  chunkArray,
  isValidPhoneFormat,
  calculateBackoff,
} from './utils.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const whatsappService = new WhatsAppService();

// Configuration
const PORT = process.env.PORT || 5000;
const MAX_RECIPIENTS = 250; // Hard limit per broadcast

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS - Allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser - Parse JSON requests
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// =====================================================
// API ROUTES
// =====================================================

/**
 * GET / - API Info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'WhatsApp Broadcast Portal API',
    version: '1.0.0',
    status: 'running',
    maxRecipients: MAX_RECIPIENTS,
    endpoints: {
      validate: 'POST /api/validate',
      send: 'POST /api/send',
      health: 'GET /api/health',
    },
  });
});

/**
 * POST /api/validate
 * Validates phone numbers against WhatsApp API
 * 
 * Request body:
 * {
 *   "phones": ["1234567890", "+919876543210", ...]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "valid": ["+919876543210", ...],
 *   "invalid": ["1234567890", ...],
 *   "total": 10,
 *   "validCount": 8,
 *   "invalidCount": 2,
 *   "missingCountryCode": ["1234567890"]  // Numbers that might be missing country code
 * }
 */
app.post('/api/validate', async (req, res) => {
  try {
    const { phones } = req.body;

    // Validation
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of phone numbers',
      });
    }

    // Normalize phone numbers (remove spaces, dashes, etc.)
    const normalizedPhones = phones
      .map(normalizePhoneNumber)
      .filter(phone => phone && isValidPhoneFormat(phone));

    // Remove duplicates
    const uniquePhones = removeDuplicates(normalizedPhones);

    // Check for numbers that might be missing country codes
    const missingCountryCode = uniquePhones.filter(phone => {
      const digitsOnly = phone.replace(/\D/g, '');
      return !phone.startsWith('+') && digitsOnly.length <= 10;
    });

    if (missingCountryCode.length > 0) {
      console.warn(`⚠️  ${missingCountryCode.length} numbers may be missing country code`);
    }

    console.log(`Validating ${uniquePhones.length} unique phone numbers...`);

    // WhatsApp API allows max 50 contacts per request, so chunk them
    const chunks = chunkArray(uniquePhones, 50);
    const allValidNumbers = [];
    const errors = [];

    // Validate each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        console.log(`Validating chunk ${i + 1}/${chunks.length} (${chunk.length} numbers)...`);
        
        const validNumbers = await whatsappService.validatePhoneNumbers(chunk);
        allValidNumbers.push(...validNumbers);
        
        // Small delay between chunks to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error validating chunk ${i + 1}:`, error.message);
        errors.push({
          chunk: i + 1,
          error: error.message,
        });
        
        // If rate limited, wait longer before next chunk
        if (error.message.includes('rate limit')) {
          console.log('Rate limited, waiting 5 seconds before continuing...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // Calculate invalid numbers
    const invalidNumbers = uniquePhones.filter(phone => !allValidNumbers.includes(phone));

    console.log(`✓ Validation complete: ${allValidNumbers.length} valid, ${invalidNumbers.length} invalid`);

    res.json({
      success: true,
      valid: allValidNumbers,
      invalid: invalidNumbers,
      total: uniquePhones.length,
      validCount: allValidNumbers.length,
      invalidCount: invalidNumbers.length,
      missingCountryCode: missingCountryCode,
      errors: errors.length > 0 ? errors : undefined,
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

/**
 * POST /api/send
 * Sends broadcast messages to recipients
 * ENFORCES 250 RECIPIENT LIMIT
 * 
 * Request body:
 * {
 *   "recipients": ["+919876543210", ...],
 *   "message": "Hello, this is a broadcast message!"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "results": {
 *     "total": 10,
 *     "sent": 8,
 *     "failed": 2
 *   },
 *   "details": [
 *     { "success": true, "to": "+919876543210", "messageId": "wamid.xxx" },
 *     { "success": false, "to": "+911234567890", "error": "Rate limit exceeded" }
 *   ]
 * }
 */
app.post('/api/send', async (req, res) => {
  try {
    const { recipients, message } = req.body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of recipient phone numbers',
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message to send',
      });
    }

    // ENFORCE 250 RECIPIENT LIMIT
    if (recipients.length > MAX_RECIPIENTS) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_RECIPIENTS} recipients allowed per broadcast. You provided ${recipients.length}. Please reduce the number or split into multiple sends.`,
        recipientCount: recipients.length,
        maxAllowed: MAX_RECIPIENTS,
      });
    }

    console.log(`Starting broadcast to ${recipients.length} recipients...`);

    // Rate-limited queue for sending messages
    // Prevents hitting WhatsApp API rate limits
    const queue = new PQueue({
      concurrency: parseInt(process.env.RATE_LIMIT_CONCURRENCY) || 5,
      interval: parseInt(process.env.RATE_LIMIT_INTERVAL) || 1000,
      intervalCap: parseInt(process.env.RATE_LIMIT_CONCURRENCY) || 5,
    });

    // Results tracking (in-memory, returned to client)
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
    };
    const details = [];

    // Process each recipient with rate limiting and retry logic
    const sendPromises = recipients.map((recipient) =>
      queue.add(async () => {
        let result;
        let retries = 3;
        let attempt = 0;

        while (attempt < retries) {
          result = await whatsappService.sendMessage(recipient, message);

          // If successful, break
          if (result.success) {
            break;
          }

          // If pair rate limit (130429), don't retry - mark as failed immediately
          if (result.errorCode === 130429) {
            console.log(`Pair rate limit for ${recipient}, skipping retries`);
            break;
          }

          // If general rate limit (429), retry with exponential backoff
          if (result.errorCode === 429 && attempt < retries - 1) {
            const delay = calculateBackoff(attempt);
            console.log(`Rate limited for ${recipient}, retrying in ${delay}ms... (attempt ${attempt + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
          } else {
            // For other errors, don't retry
            break;
          }
        }

        // Update results
        if (result.success) {
          results.sent++;
          console.log(`✓ Sent to ${recipient}`);
        } else {
          results.failed++;
          console.log(`✗ Failed to send to ${recipient}: ${result.error}`);
        }

        details.push(result);
        return result;
      })
    );

    // Wait for all messages to be processed
    await Promise.all(sendPromises);

    console.log(`Broadcast complete: ${results.sent} sent, ${results.failed} failed`);

    res.json({
      success: true,
      results,
      details,
      message: `Broadcast completed: ${results.sent} sent, ${results.failed} failed`,
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast',
      error: error.message,
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    maxRecipients: MAX_RECIPIENTS,
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// =====================================================
// SERVER STARTUP
// =====================================================

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 WhatsApp Broadcast Portal - Backend Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 API: http://localhost:${PORT}`);
  console.log(`⚠️  Max recipients per broadcast: ${MAX_RECIPIENTS}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════');
  
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID || !process.env.WHATSAPP_TOKEN) {
    console.log('');
    console.log('⚠️  WARNING: WhatsApp credentials not configured!');
    console.log('   Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_TOKEN in .env file');
    console.log('   Copy .env.example to .env and add your credentials from Meta Developer Console');
    console.log('');
  }
  
  console.log('✅ Server is ready to accept requests\n');
});

export default app;
