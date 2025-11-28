import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/campaigns
 * Retrieves all campaigns with their statistics
 */
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 campaigns
    });

    res.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message,
    });
  }
});

/**
 * GET /api/campaigns/:id
 * Retrieves a specific campaign with all recipients
 */
router.get('/campaigns/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(id) },
      include: {
        CampaignRecipient: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message,
    });
  }
});

/**
 * GET /api/contacts
 * Retrieves all contacts
 */
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      contacts,
      total: contacts.length,
      valid: contacts.filter(c => c.isValid).length,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message,
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
