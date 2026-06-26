import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

const validatePhone = (phone) => {
  const cleaned = phone.toString().replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

// GET /api/contacts - List contacts with search, tag filter, pagination
router.get('/', async (req, res) => {
  console.log('GET /api/contacts called');
  try {
    const { search = '', tag = '', page = '1', limit = '25' } = req.query;
    console.log('Query params:', { search, tag, page, limit });

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(search && {
        OR: [
          { phone: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(tag && { tags: { some: { tag: { name: tag } } } }),
    };

    console.log('Fetching contacts with where clause:', JSON.stringify(where));

    const contacts = await prisma.contact.findMany({
      where,
      include: { tags: { include: { tag: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    console.log('Raw contacts from DB:', JSON.stringify(contacts.slice(0, 1)));

    const total = await prisma.contact.count({ where });

    const formattedContacts = contacts.map(c => ({
      ...c,
      tags: c.tags.map(t => t.tag),
    }));

    console.log('Formatted contacts:', JSON.stringify(formattedContacts.slice(0, 1)));

    res.json({
      success: true,
      contacts: formattedContacts,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('ERROR fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts', error: error.message });
  }
});

// POST /api/contacts - Create single contact
router.post('/', async (req, res) => {
  try {
    const { phone, name, tagIds = [] } = req.body;

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');
    const existing = await prisma.contact.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Contact already exists' });
    }

    const contact = await prisma.contact.create({
      data: {
        phone: cleanPhone,
        name: name || '',
        tags: {
          create: tagIds.map(id => ({ tagId: id })),
        },
      },
      include: { tags: { include: { tag: { select: { id: true, name: true } } } } },
    });

    res.status(201).json({
      success: true,
      contact: { ...contact, tags: contact.tags.map(t => t.tag) },
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to create contact', error: error.message });
  }
});

// PUT /api/contacts/:id - Update contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, name, tagIds = [] } = req.body;

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    await prisma.contactTag.deleteMany({ where: { contactId: id } });

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...(phone && { phone: phone.toString().replace(/\D/g, '') }),
        ...(name !== undefined && { name }),
        tags: {
          create: tagIds.map(tagId => ({ tagId })),
        },
      },
      include: { tags: { include: { tag: { select: { id: true, name: true } } } } },
    });

    res.json({
      success: true,
      contact: { ...contact, tags: contact.tags.map(t => t.tag) },
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact', error: error.message });
  }
});

// DELETE /api/contacts/:id - Delete single contact
router.delete('/:id', async (req, res) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact', error: error.message });
  }
});

// DELETE /api/contacts - Bulk delete
router.delete('/', async (req, res) => {
  try {
    const { ids = [] } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No contact IDs provided' });
    }

    const result = await prisma.contact.deleteMany({ where: { id: { in: ids } } });
    res.json({ success: true, message: `${result.count} contacts deleted` });
  } catch (error) {
    console.error('Error bulk deleting contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contacts', error: error.message });
  }
});

// PATCH /api/contacts/bulk-tags - Add tag to multiple contacts
router.patch('/bulk-tags', async (req, res) => {
  try {
    const { contactIds = [], tagId } = req.body;
    if (!Array.isArray(contactIds) || !tagId) {
      return res.status(400).json({ success: false, message: 'Invalid contactIds or tagId' });
    }

    await Promise.all(
      contactIds.map(contactId =>
        prisma.contactTag.upsert({
          where: { contactId_tagId: { contactId, tagId } },
          update: {},
          create: { contactId, tagId },
        })
      )
    );

    res.json({ success: true, message: `Tag added to ${contactIds.length} contacts` });
  } catch (error) {
    console.error('Error adding tag to contacts:', error);
    res.status(500).json({ success: false, message: 'Failed to add tag', error: error.message });
  }
});

// POST /api/contacts/upload - CSV bulk upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true });

    const { bulkTag = '' } = req.body;
    let bulkTagId = null;

    if (bulkTag) {
      const tag = await prisma.tag.upsert({
        where: { name: bulkTag },
        update: {},
        create: { name: bulkTag },
      });
      bulkTagId = tag.id;
    }

    const results = { success: 0, skipped: 0, failed: 0, errors: [] };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const phone = record.phone?.toString().replace(/\D/g, '');
      const name = record.name || '';
      const tagsStr = record.tags || '';

      if (!phone || !validatePhone(phone)) {
        results.failed++;
        results.errors.push({ row: i + 2, reason: 'Invalid phone number', phone });
        continue;
      }

      const existing = await prisma.contact.findUnique({ where: { phone } });
      if (existing) {
        results.skipped++;
        continue;
      }

      const tagNames = tagsStr
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      const tags = await Promise.all(
        tagNames.map(tagName =>
          prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          })
        )
      );

      const allTagIds = [
        ...tags.map(t => t.id),
        ...(bulkTagId ? [bulkTagId] : []),
      ];

      try {
        await prisma.contact.create({
          data: {
            phone,
            name,
            tags: {
              create: allTagIds.map(tagId => ({ tagId })),
            },
          },
        });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ row: i + 2, reason: err.message, phone });
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      results,
      message: `Imported: ${results.success}, Skipped: ${results.skipped}, Failed: ${results.failed}`,
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Failed to upload CSV', error: error.message });
  }
});

export default router;
