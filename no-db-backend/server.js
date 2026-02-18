/**
 * WhatsApp Broadcast Portal - Backend Server (No Database)
 * 
 * This server handles WhatsApp broadcast operations without persistent storage.
 * All data is ephemeral and exists only during request processing.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import validateRouter from './routes/validate.js';
import sendRouter from './routes/send.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api', validateRouter);
app.use('/api', sendRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 WhatsApp Broadcast Portal - Backend Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('⚠️  IMPORTANT: This server uses NO DATABASE.');
  console.log('   All data is ephemeral (in-memory only).');
  console.log('');
  console.log('✅ Server is ready to accept requests');
  console.log('');
});
