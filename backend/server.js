import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import validateRoutes from './routes/validate.js';
import sendRoutes from './routes/send.js';
import dataRoutes from './routes/data.js';
import webhookRoutes from './routes/webhook.js';
import contactRoutes from './routes/contacts.js';
import tagRoutes from './routes/tags.js';
import campaignRoutes from './routes/campaigns.js';
import templateRoutes from './routes/templates.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const prisma = new PrismaClient();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS - Allow cross-origin requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser - Parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// =====================================================
// ROUTES
// =====================================================

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'WA Messenger API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      validate: 'POST /api/validate',
      send: 'POST /api/send',
      campaigns: 'GET /api/campaigns',
      contacts: 'GET /api/contacts',
      health: 'GET /api/health',
    },
  });
});

// API Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', validateRoutes);
app.use('/api', sendRoutes);
app.use('/api', dataRoutes);

// Webhook Routes (WhatsApp notifications)
app.use('/', webhookRoutes);

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
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// =====================================================
// SERVER STARTUP
// =====================================================

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Shutting down gracefully...');
  
  // Close database connection
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  
  // Exit process
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 WA Messenger - Backend Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('\n✅ Server is ready to accept requests\n');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
