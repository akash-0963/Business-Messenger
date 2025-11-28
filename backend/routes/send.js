import express from 'express';
import { PrismaClient } from '@prisma/client';
import PQueue from 'p-queue';
import WhatsAppService from '../services/whatsappService.js';
import { personalizeMessage } from '../utils/helpers.js';

const router = express.Router();
const prisma = new PrismaClient();
const whatsappService = new WhatsAppService();

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
 * Sends broadcast messages to recipients
 * 
 * Request body:
 * {
 *   "recipients": ["+911234567890", ...],
 *   "message": "Hello {{name}}, welcome to our service!"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "campaignId": 123,
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

    console.log(`Starting broadcast campaign to ${recipients.length} recipients...`);

    // Create campaign record
    const campaign = await prisma.campaign.create({
      data: {
        message,
        totalRecipients: recipients.length,
      },
    });

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
          // Fetch contact data for personalization
          const contact = await prisma.contact.findUnique({
            where: { phone: recipient },
          });

          // Personalize message if contact data exists
          const personalizedMessage = contact
            ? personalizeMessage(contact, message)
            : message;

          // Send message via WhatsApp API with retry logic
          let result;
          let retries = 3;
          
          while (retries > 0) {
            result = await whatsappService.sendMessage(recipient, personalizedMessage);
            
            // If successful, break the retry loop
            if (result.success) {
              break;
            }
            
            // If rate limited, wait and retry
            if (result.error && result.error.includes('rate limit')) {
              retries--;
              if (retries > 0) {
                console.log(`Rate limited, retrying for ${recipient}... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            } else {
              // For other errors, don't retry
              break;
            }
          }

          // Update results
          if (result.success) {
            results.sent++;
          } else {
            results.failed++;
          }

          details.push(result);

          // Log to database
          await prisma.campaignRecipient.create({
            data: {
              campaignId: campaign.id,
              phone: recipient,
              status: result.success ? 'sent' : 'failed',
              error: result.error || null,
            },
          });

          return result;
        } catch (error) {
          console.error(`Error processing recipient ${recipient}:`, error);
          results.failed++;
          
          const errorResult = {
            success: false,
            to: recipient,
            error: error.message,
          };
          
          details.push(errorResult);

          // Log failure to database
          await prisma.campaignRecipient.create({
            data: {
              campaignId: campaign.id,
              phone: recipient,
              status: 'failed',
              error: error.message,
            },
          });

          return errorResult;
        }
      })
    );

    // Wait for all messages to be processed
    await Promise.all(sendPromises);

    // Update campaign with final counts
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        successCount: results.sent,
        failureCount: results.failed,
      },
    });

    console.log(`Campaign ${campaign.id} completed: ${results.sent} sent, ${results.failed} failed`);

    res.json({
      success: true,
      campaignId: campaign.id,
      results,
      details,
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

export default router;
