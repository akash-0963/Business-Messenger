import express from 'express';
import { PrismaClient } from '@prisma/client';
import WhatsAppService from '../services/whatsappService.js';

const router = express.Router();
const prisma = new PrismaClient();
const whatsappService = new WhatsAppService();

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    // Use Prisma's count first to see if there's data
    const count = await prisma.campaign.count();
    console.log(`Total campaigns in DB: ${count}`);

    let campaigns = [];
    try {
      campaigns = await prisma.campaign.findMany({
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log(`Successfully fetched ${campaigns.length} campaigns`);
    } catch (dbError) {
      console.error('Prisma error:', dbError.message);
      // If we get validation error, it means there's corrupt data
      // We'll return empty and the admin should manually clean the DB
      campaigns = [];
    }

    // Format response
    const formattedCampaigns = campaigns
      .filter(campaign => campaign.name) // Filter out any campaigns with null name
      .map(campaign => ({
        ...campaign,
        tags: campaign.tags.map(ct => ct.tag),
        recipientCount: campaign.totalRecipients,
        stats: {
          sent: campaign.successCount,
          failed: campaign.failureCount,
          pending: campaign.pendingCount
        }
      }));

    res.json(formattedCampaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.json([]); // Return empty array on any error
  }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        CampaignRecipient: true
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({
      ...campaign,
      tags: campaign.tags.map(ct => ct.tag),
      recipientCount: campaign.totalRecipients,
      stats: {
        sent: campaign.successCount,
        failed: campaign.failureCount,
        pending: campaign.pendingCount
      }
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Failed to fetch campaign', error: error.message });
  }
});

// Create campaign
router.post('/', async (req, res) => {
  try {
    const { name, description, tags, dateFrom, dateTo, message, sendImmediate, scheduledDate, scheduledTime, status } = req.body;

    console.log('Creating campaign:', { name, status, sendImmediate });

    if (!name || !message) {
      return res.status(400).json({ message: 'Name and message are required' });
    }

    // Calculate recipients based on tags and date filters
    let recipientQuery = {};

    if (tags && tags.length > 0) {
      recipientQuery = {
        tags: {
          some: {
            tagId: {
              in: tags
            }
          }
        }
      };
    }

    if (dateFrom || dateTo) {
      recipientQuery.createdAt = {};
      if (dateFrom) {
        recipientQuery.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        recipientQuery.createdAt.lte = new Date(dateTo);
      }
    }

    const recipients = await prisma.contact.findMany({
      where: Object.keys(recipientQuery).length > 0 ? recipientQuery : undefined
    });

    console.log(`Found ${recipients.length} recipients`);

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        message,
        status: status || 'draft',
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        sendImmediate,
        scheduledDate: !sendImmediate ? new Date(scheduledDate + 'T' + scheduledTime) : null,
        totalRecipients: recipients.length,
        tags: {
          create: tags.map(tagId => ({
            tagId
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    console.log('Campaign created:', { id: campaign.id, status: campaign.status });

    // If send immediately, send the campaign
    if (sendImmediate && status !== 'draft') {
      console.log('Sending campaign immediately...');
      await sendCampaignToRecipients(campaign.id, recipients.map(r => r.phone), message);
    }

    res.status(201).json({
      ...campaign,
      tags: campaign.tags.map(ct => ct.tag),
      recipientCount: campaign.totalRecipients,
      stats: {
        sent: campaign.successCount,
        failed: campaign.failureCount,
        pending: campaign.pendingCount
      }
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Failed to create campaign', error: error.message });
  }
});

// Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { name, description, tags, dateFrom, dateTo, message, sendImmediate, scheduledDate, scheduledTime, status } = req.body;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: req.params.id }
    });

    if (!existingCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only draft campaigns can be updated
    if (existingCampaign.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft campaigns can be updated' });
    }

    // Calculate recipients
    let recipientQuery = {};

    if (tags && tags.length > 0) {
      recipientQuery = {
        tags: {
          some: {
            tagId: {
              in: tags
            }
          }
        }
      };
    }

    if (dateFrom || dateTo) {
      recipientQuery.createdAt = {};
      if (dateFrom) {
        recipientQuery.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        recipientQuery.createdAt.lte = new Date(dateTo);
      }
    }

    const recipients = await prisma.contact.findMany({
      where: Object.keys(recipientQuery).length > 0 ? recipientQuery : undefined
    });

    // Delete existing tags
    await prisma.campaignTag.deleteMany({
      where: { campaignId: req.params.id }
    });

    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        message,
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        sendImmediate,
        scheduledDate: !sendImmediate ? new Date(scheduledDate + 'T' + scheduledTime) : null,
        totalRecipients: recipients.length,
        tags: {
          create: tags.map(tagId => ({
            tagId
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.json({
      ...campaign,
      tags: campaign.tags.map(ct => ct.tag),
      recipientCount: campaign.totalRecipients,
      stats: {
        sent: campaign.successCount,
        failed: campaign.failureCount,
        pending: campaign.pendingCount
      }
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Failed to update campaign', error: error.message });
  }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only draft campaigns can be deleted
    if (campaign.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft campaigns can be deleted' });
    }

    await prisma.campaign.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Failed to delete campaign', error: error.message });
  }
});

// Send campaign now
router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ message: 'Campaign already sent' });
    }

    // Get recipients based on tags and date filters
    let recipientQuery = {};

    if (campaign.tags && campaign.tags.length > 0) {
      recipientQuery = {
        tags: {
          some: {
            tagId: {
              in: campaign.tags.map(ct => ct.tagId)
            }
          }
        }
      };
    }

    if (campaign.dateFrom || campaign.dateTo) {
      recipientQuery.createdAt = {};
      if (campaign.dateFrom) {
        recipientQuery.createdAt.gte = campaign.dateFrom;
      }
      if (campaign.dateTo) {
        recipientQuery.createdAt.lte = campaign.dateTo;
      }
    }

    const recipients = await prisma.contact.findMany({
      where: Object.keys(recipientQuery).length > 0 ? recipientQuery : undefined
    });

    // Send to all recipients
    const results = await sendCampaignToRecipients(campaign.id, recipients.map(r => r.phone), campaign.message);

    // Update campaign stats
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const updatedCampaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        successCount: sent,
        failureCount: failed,
        pendingCount: 0
      }
    });

    res.json({
      message: 'Campaign sent successfully',
      campaign: updatedCampaign,
      results: { sent, failed }
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ message: 'Failed to send campaign', error: error.message });
  }
});

// Duplicate campaign
router.post('/:id/duplicate', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        name: `${campaign.name} (Copy)`,
        description: campaign.description,
        message: campaign.message,
        status: 'draft',
        dateFrom: campaign.dateFrom,
        dateTo: campaign.dateTo,
        sendImmediate: true,
        totalRecipients: campaign.totalRecipients,
        tags: {
          create: campaign.tags.map(ct => ({
            tagId: ct.tagId
          }))
        }
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    res.status(201).json({
      ...newCampaign,
      tags: newCampaign.tags.map(ct => ct.tag),
      recipientCount: newCampaign.totalRecipients,
      stats: {
        sent: newCampaign.successCount,
        failed: newCampaign.failureCount,
        pending: newCampaign.pendingCount
      }
    });
  } catch (error) {
    console.error('Error duplicating campaign:', error);
    res.status(500).json({ message: 'Failed to duplicate campaign', error: error.message });
  }
});

// Preview recipients count
router.post('/preview-recipients', async (req, res) => {
  try {
    const { tagIds, dateFrom, dateTo } = req.body;

    let recipientQuery = {};

    if (tagIds && tagIds.length > 0) {
      recipientQuery = {
        tags: {
          some: {
            tagId: {
              in: tagIds
            }
          }
        }
      };
    }

    if (dateFrom || dateTo) {
      recipientQuery.createdAt = {};
      if (dateFrom) {
        recipientQuery.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        recipientQuery.createdAt.lte = new Date(dateTo);
      }
    }

    const count = await prisma.contact.count({
      where: Object.keys(recipientQuery).length > 0 ? recipientQuery : undefined
    });

    res.json({ count });
  } catch (error) {
    console.error('Error previewing recipients:', error);
    res.status(500).json({ message: 'Failed to preview recipients', error: error.message });
  }
});

// Helper function to send campaign to recipients
async function sendCampaignToRecipients(campaignId, phoneNumbers, message) {
  const results = [];

  for (const phone of phoneNumbers) {
    try {
      const result = await whatsappService.sendMessage(phone, message);

      await prisma.campaignRecipient.create({
        data: {
          campaignId,
          phone,
          status: result.success ? 'sent' : 'failed',
          error: result.error
        }
      });

      results.push({
        phone,
        success: result.success,
        error: result.error
      });
    } catch (error) {
      console.error(`Error sending to ${phone}:`, error);
      results.push({
        phone,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

export default router;
