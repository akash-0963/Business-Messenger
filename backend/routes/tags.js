import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tags - Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { contacts: true } } },
    });

    res.json({
      success: true,
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        contactCount: tag._count?.contacts || 0,
        createdAt: tag.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tags', error: error.message });
  }
});

// POST /api/tags - Create new tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Tag name is required' });
    }

    const existing = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Tag already exists', tag: existing });
    }

    const tag = await prisma.tag.create({
      data: { name: name.trim() },
    });

    res.status(201).json({ success: true, tag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ success: false, message: 'Failed to create tag', error: error.message });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tag.delete({ where: { id } });

    res.json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tag', error: error.message });
  }
});

export default router;
