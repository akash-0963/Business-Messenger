import express from 'express';
import { PrismaClient } from '@prisma/client';
import WhatsAppService from '../services/whatsappService.js';

const router = express.Router();
const prisma = new PrismaClient();
const whatsappService = new WhatsAppService();

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      include: {
        buttons: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Failed to fetch templates', error: error.message });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: {
        buttons: true
      }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Failed to fetch template', error: error.message });
  }
});

// Create template
router.post('/', async (req, res) => {
  try {
    const { name, category, content, header, footer, buttons } = req.body;

    if (!name || !category || !content) {
      return res.status(400).json({ message: 'Name, category, and content are required' });
    }

    // Validate category
    const validCategories = ['marketing', 'utility', 'authentication'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category. Must be marketing, utility, or authentication' });
    }

    // Check if name already exists
    const existing = await prisma.template.findUnique({
      where: { name }
    });

    if (existing) {
      return res.status(400).json({ message: 'Template name already exists' });
    }

    const template = await prisma.template.create({
      data: {
        name,
        category,
        content,
        header: header || null,
        footer: footer || null,
        status: 'draft',
        buttons: {
          create: buttons ? buttons.map(btn => ({
            buttonType: btn.buttonType,
            title: btn.title,
            url: btn.url || null,
            phone: btn.phone || null,
            text: btn.text || null
          })) : []
        }
      },
      include: {
        buttons: true
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Failed to create template', error: error.message });
  }
});

// Update template (only draft and rejected templates)
router.put('/:id', async (req, res) => {
  try {
    const { name, category, content, header, footer, buttons } = req.body;

    const template = await prisma.template.findUnique({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Only allow editing draft and rejected templates
    if (template.status !== 'draft' && template.status !== 'rejected') {
      return res.status(400).json({ message: 'Only draft and rejected templates can be edited' });
    }

    // If name is changing, check if new name exists
    if (name && name !== template.name) {
      const existing = await prisma.template.findUnique({
        where: { name }
      });
      if (existing) {
        return res.status(400).json({ message: 'Template name already exists' });
      }
    }

    // Delete existing buttons
    await prisma.templateButton.deleteMany({
      where: { templateId: req.params.id }
    });

    const updatedTemplate = await prisma.template.update({
      where: { id: req.params.id },
      data: {
        name: name || template.name,
        category: category || template.category,
        content: content || template.content,
        header: header !== undefined ? header : template.header,
        footer: footer !== undefined ? footer : template.footer,
        buttons: {
          create: buttons ? buttons.map(btn => ({
            buttonType: btn.buttonType,
            title: btn.title,
            url: btn.url || null,
            phone: btn.phone || null,
            text: btn.text || null
          })) : []
        }
      },
      include: {
        buttons: true
      }
    });

    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Failed to update template', error: error.message });
  }
});

// Delete template (only draft templates)
router.delete('/:id', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Only allow deleting draft templates
    if (template.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft templates can be deleted' });
    }

    await prisma.template.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Failed to delete template', error: error.message });
  }
});

// Submit template to Meta for approval
router.post('/:id/submit', async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id },
      include: { buttons: true }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Only allow submitting draft and rejected templates
    if (template.status !== 'draft' && template.status !== 'rejected') {
      return res.status(400).json({ message: 'Only draft and rejected templates can be submitted' });
    }

    // Build template object for Meta API
    const metaTemplate = {
      name: template.name,
      category: template.category,
      components: [
        {
          type: 'BODY',
          text: template.content
        }
      ]
    };

    // Add header if present
    if (template.header) {
      metaTemplate.components.unshift({
        type: 'HEADER',
        text: template.header
      });
    }

    // Add footer if present
    if (template.footer) {
      metaTemplate.components.push({
        type: 'FOOTER',
        text: template.footer
      });
    }

    // Add buttons if present
    if (template.buttons && template.buttons.length > 0) {
      const buttonComponent = {
        type: 'BUTTONS',
        buttons: template.buttons.map(btn => {
          const buttonObj = {
            type: btn.buttonType,
            text: btn.title
          };

          if (btn.buttonType === 'URL') {
            buttonObj.url = btn.url;
          } else if (btn.buttonType === 'PHONE') {
            buttonObj.phone_number = btn.phone;
          } else if (btn.buttonType === 'QUICK_REPLY') {
            buttonObj.id = btn.text;
          }

          return buttonObj;
        })
      };
      metaTemplate.components.push(buttonComponent);
    }

    // TODO: Integrate with actual Meta API when credentials are available
    // For now, simulate submission
    console.log('Submitting template to Meta:', metaTemplate);

    const updatedTemplate = await prisma.template.update({
      where: { id: req.params.id },
      data: {
        status: 'pending',
        submittedAt: new Date(),
        // metaTemplateId would be set by Meta API response
      },
      include: { buttons: true }
    });

    res.json({
      message: 'Template submitted for approval',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error submitting template:', error);
    res.status(500).json({ message: 'Failed to submit template', error: error.message });
  }
});

// Approve template (admin only - would be called by webhook from Meta)
router.post('/:id/approve', async (req, res) => {
  try {
    const { metaTemplateId } = req.body;

    const template = await prisma.template.findUnique({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const approvedTemplate = await prisma.template.update({
      where: { id: req.params.id },
      data: {
        status: 'approved',
        metaTemplateId: metaTemplateId || null,
        approvedAt: new Date()
      },
      include: { buttons: true }
    });

    res.json({
      message: 'Template approved',
      template: approvedTemplate
    });
  } catch (error) {
    console.error('Error approving template:', error);
    res.status(500).json({ message: 'Failed to approve template', error: error.message });
  }
});

// Reject template (admin only - would be called by webhook from Meta)
router.post('/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const template = await prisma.template.findUnique({
      where: { id: req.params.id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const rejectedTemplate = await prisma.template.update({
      where: { id: req.params.id },
      data: {
        status: 'rejected',
        rejectionReason
      },
      include: { buttons: true }
    });

    res.json({
      message: 'Template rejected',
      template: rejectedTemplate
    });
  } catch (error) {
    console.error('Error rejecting template:', error);
    res.status(500).json({ message: 'Failed to reject template', error: error.message });
  }
});

export default router;
