import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Webhook verification token (generate a random string)
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'your_webhook_verify_token_12345';

/**
 * GET /webhook
 * WhatsApp uses this to verify your webhook endpoint during setup
 */
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify the token matches
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed - invalid token');
    res.status(403).json({ error: 'Forbidden' });
  }
});

/**
 * POST /webhook
 * Receives incoming messages and status updates from WhatsApp
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });

    // Process webhook payload
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle incoming messages
      if (changes?.field === 'messages') {
        const messages = value?.messages || [];
        const contacts = value?.contacts || [];

        for (const message of messages) {
          console.log('\n📬 Incoming Message:');
          console.log(`From: ${message.from}`);
          console.log(`Type: ${message.type}`);
          console.log(`Timestamp: ${new Date(message.timestamp * 1000).toISOString()}`);

          if (message.type === 'text') {
            console.log(`Text: ${message.text?.body}`);
          }

          // Store incoming message in database (optional)
          const senderName = contacts[0]?.profile?.name || 'Unknown';
          console.log(`Sender Name: ${senderName}`);
        }
      }

      // Handle message status updates (delivery, read, failed)
      if (changes?.field === 'message_status') {
        const statuses = value?.statuses || [];

        for (const status of statuses) {
          console.log('\n📊 Message Status Update:');
          console.log(`Message ID: ${status.id}`);
          console.log(`Status: ${status.status}`);
          console.log(`Timestamp: ${new Date(status.timestamp * 1000).toISOString()}`);

          if (status.status === 'delivered') {
            console.log('✅ Message delivered');

            // Update in database
            await updateMessageStatus(status.id, 'delivered');
          } else if (status.status === 'read') {
            console.log('👁️ Message read');

            // Update in database
            await updateMessageStatus(status.id, 'read');
          } else if (status.status === 'failed') {
            console.log('❌ Message failed');
            console.log(`Error: ${status.errors?.[0]?.message}`);

            // Update in database
            await updateMessageStatus(status.id, 'failed', status.errors?.[0]?.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function to update message status in database
 */
async function updateMessageStatus(messageId, status, error = null) {
  try {
    // You can store webhook data in a separate table if needed
    console.log(`[DB] Updating message ${messageId} status to ${status}`);

    // Optional: Store webhook data
    // await prisma.webhookLog.create({
    //   data: { messageId, status, error, receivedAt: new Date() }
    // });
  } catch (err) {
    console.error('Error updating message status:', err);
  }
}

export default router;
