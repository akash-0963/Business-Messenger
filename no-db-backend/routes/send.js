import express from 'express';
import PQueue from 'p-queue';
import WhatsAppService from '../services/whatsappService.js';

const router = express.Router();
const whatsappService = new WhatsAppService();
const MAX_RECIPIENTS = 250;

/**
 * Rate-limited queue for sending messages
 * Prevents hitting WhatsApp API rate limits
 */
const queue = new PQueue({
  concurrency: parseInt(process.env.RATE_LIMIT_CONCURRENCY) || 5,
  interval: parseInt(process.env.RATE_LIMIT_INTERVAL) || 1000,
  intervalCap: parseInt(process.env.RATE_LIMIT_CONCURRENCY) || 5,
});

/**
 * POST /api/send
 * Sends broadcast messages to recipients (max 250)
 * Supports both text messages and template messages
 * 
 * Request body:
 * {
 *   "recipients": ["+911234567890", ...],
 *   "message": "Hello {{name}}, welcome to our service!",
 *   "isTemplate": false,  // Optional: use template message
 *   "templateName": "hello_world",  // Required if isTemplate=true
 *   "languageCode": "en"  // Optional, default: "en"
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
 *   "details": [...]
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { recipients, message, isTemplate, templateName, languageCode } = req.body;

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of recipient phone numbers',
      });
    }

    // Enforce 250 recipient limit
    if (recipients.length > MAX_RECIPIENTS) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_RECIPIENTS} recipients allowed. You provided ${recipients.length} numbers.`,
      });
    }

    // Validate message or template
    if (isTemplate) {
      if (!templateName || templateName.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Template name is required when using template messages',
        });
      }
    } else {
      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Please provide a message to send',
        });
      }
    }

    console.log(`Starting broadcast to ${recipients.length} recipients...`);

    // Results tracking
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
    };
    const details = [];

    // Process each recipient
    const sendPromises = recipients.map((recipient) =>
      queue.add(async () => {
        try {
          // Send message via WhatsApp API with retry logic
          let result;
          let retries = 3;
          
          while (retries > 0) {
            try {
              // Use template or text message
              if (isTemplate) {
                result = await whatsappService.sendTemplateMessage(
                  recipient,
                  templateName,
                  languageCode || 'en'
                );
              } else {
                result = await whatsappService.sendMessage(recipient, message);
              }
              break; // Success, exit retry loop
            } catch (error) {
              retries--;
              if (retries === 0) throw error;
              
              // Exponential backoff for rate limiting
              const delay = (4 - retries) * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }

          results.sent++;
          details.push({
            recipient,
            status: 'sent',
            messageId: result.messageId,
            timestamp: new Date().toISOString(),
          });

          console.log(`✓ Message sent to ${recipient}`);
        } catch (error) {
          results.failed++;
          details.push({
            recipient,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString(),
          });

          console.error(`✗ Failed to send to ${recipient}:`, error.message);
        }
      })
    );

    // Wait for all messages to be processed
    await Promise.all(sendPromises);

    console.log(`Campaign completed: ${results.sent} sent, ${results.failed} failed`);

    res.json({
      success: true,
      results,
      details,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send broadcast messages',
      error: error.message,
    });
  }
});

export default router;
