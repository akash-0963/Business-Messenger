# 📱 WA Messenger

A production-ready full-stack application for sending bulk WhatsApp messages using the Meta WhatsApp Cloud API. Built with React, Node.js, Express, MongoDB, and Prisma ORM.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [WhatsApp Cloud API Setup](#whatsapp-cloud-api-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Rate Limiting & Best Practices](#rate-limiting--best-practices)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

WA Messenger is a comprehensive solution for businesses and organizations to send bulk WhatsApp messages efficiently. It provides a user-friendly web interface for managing contacts, validating WhatsApp numbers, composing messages with personalization, and tracking campaign results.

### Key Capabilities

- **Contact Management**: Upload and manage contact lists via CSV/TXT files
- **WhatsApp Validation**: Verify which contacts are registered on WhatsApp
- **Message Personalization**: Use dynamic placeholders like {{name}}, {{email}}, etc.
- **Broadcast Campaigns**: Send bulk messages with rate limiting and retry logic
- **Campaign Tracking**: Monitor delivery status and detailed analytics
- **Template Support**: Support for WhatsApp template messages (for 24-hour window compliance)

---

## ✨ Features

### Frontend (React + Tailwind CSS)

✅ **Modern UI/UX**
- Clean, responsive dashboard design
- Drag-and-drop file upload
- Real-time status updates
- Activity timeline log

✅ **Contact Management**
- CSV/TXT file upload support
- Automatic phone number normalization
- Duplicate detection and removal
- Contact preview with scrollable list

✅ **Validation System**
- Batch validation of WhatsApp numbers
- Visual status indicators (Valid/Invalid)
- Validation statistics display

✅ **Message Composer**
- Multi-line text editor
- Template placeholder support ({{name}}, {{email}}, etc.)
- Character counter
- Recipient count display

✅ **Broadcast Status**
- Real-time sending progress
- Success/failure tracking
- Detailed error logs
- Campaign result summary

### Backend (Node.js + Express)

✅ **RESTful API**
- `/api/validate` - Validate phone numbers
- `/api/send` - Send broadcast messages
- `/api/campaigns` - Campaign history
- `/api/contacts` - Contact management

✅ **WhatsApp Integration**
- Meta WhatsApp Cloud API integration
- Contact validation endpoint
- Message sending with retry logic
- Template message support

✅ **Rate Limiting**
- p-queue for controlled sending
- Configurable concurrency limits
- Automatic retry on rate limit errors
- Batch processing (50 contacts per validation)

✅ **Database Layer**
- Prisma ORM for type-safe queries
- Contact storage and management
- Campaign tracking and analytics
- Delivery status logging

✅ **Error Handling**
- Comprehensive error logging
- Graceful failure handling
- Retry mechanisms
- Detailed error responses

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                          │
│                   (React + Tailwind)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Validate   │  │     Send     │  │     Data     │      │
│  │    Routes    │  │    Routes    │  │   Routes     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────┐        │
│  │         WhatsApp Service Layer                  │        │
│  │  (API calls, validation, message sending)       │        │
│  └─────────────────┬───────────────────────────────┘        │
│                    │                                         │
│         ┌──────────┴──────────┐                             │
│         ▼                     ▼                              │
│  ┌─────────────┐      ┌──────────────┐                      │
│  │   Prisma    │      │  WhatsApp    │                      │
│  │     ORM     │      │  Cloud API   │                      │
│  └──────┬──────┘      └──────────────┘                      │
└─────────┼──────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   PostgreSQL DB     │
│  ┌──────────────┐   │
│  │   Contacts   │   │
│  │  Campaigns   │   │
│  │  Recipients  │   │
│  └──────────────┘   │
└─────────────────────┘
```

### Data Flow

1. **Upload**: User uploads CSV/TXT → Frontend extracts & normalizes → Display preview
2. **Validate**: User clicks validate → API sends batch requests to WhatsApp → Store results in DB
3. **Compose**: User writes message with placeholders → Preview with personalization
4. **Send**: User confirms → Queue processes with rate limiting → WhatsApp API → Log results to DB

---

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18** - Web framework
- **Prisma 5.7** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **p-queue 8.0** - Rate limiting queue
- **Axios** - HTTP client for WhatsApp API
- **dotenv** - Environment variable management

### External Services
- **Meta WhatsApp Cloud API** - Message delivery

---

## 📁 Project Structure

```
whatsapp-campain/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── routes/
│   │   ├── validate.js            # Contact validation endpoint
│   │   ├── send.js                # Broadcast sending endpoint
│   │   └── data.js                # Data retrieval endpoints
│   ├── services/
│   │   └── whatsappService.js     # WhatsApp API integration
│   ├── utils/
│   │   └── helpers.js             # Utility functions
│   ├── server.js                  # Express server entry point
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js             # API client
│   │   ├── components/
│   │   │   ├── Header.jsx         # App header
│   │   │   ├── FileUpload.jsx     # File upload component
│   │   │   ├── ContactList.jsx    # Contact list display
│   │   │   ├── ActionButtons.jsx  # Action buttons
│   │   │   ├── MessageComposer.jsx # Message editor
│   │   │   └── StatusLog.jsx      # Activity log
│   │   ├── pages/
│   │   │   └── BroadcastPage.jsx  # Main page
│   │   ├── App.jsx                # Root component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14.0 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager
- **Meta WhatsApp Business Account** with Cloud API access

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd whatsapp-campain
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔧 WhatsApp Cloud API Setup

Follow these steps to set up WhatsApp Cloud API access:

### Step 1: Create Meta Business Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add **WhatsApp** product to your app

### Step 2: Get API Credentials

1. Navigate to **WhatsApp > Getting Started**
2. Note down:
   - **Phone Number ID** (Test number provided by Meta)
   - **Access Token** (Temporary token for testing)
   - **Business Account ID**

### Step 3: Add Recipient Numbers (Testing)

1. Go to **WhatsApp > API Setup**
2. Add test recipient phone numbers
3. Verify the numbers via SMS/call

### Step 4: Production Setup (Optional)

For production use:
1. Verify your business
2. Add a payment method
3. Get a permanent access token
4. Register your phone number
5. Create and submit message templates

### Step 5: Webhook Configuration (Optional)

To receive message status updates:
1. Set up a webhook URL
2. Subscribe to message events
3. Implement webhook handler in backend

**Important Notes:**
- Test mode allows messaging only to pre-approved numbers
- Production mode requires business verification
- Template messages are required for messages outside 24-hour window
- Check [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)

---

## ⚙️ Configuration

### Backend Configuration

1. **Create `.env` file** in `backend/` directory:

```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` file** with your credentials:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_TOKEN=your_access_token_here
GRAPH_API_VERSION=v17.0

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_portal"

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting Configuration
RATE_LIMIT_CONCURRENCY=5
RATE_LIMIT_INTERVAL=1000
```

### Frontend Configuration

1. **Create `.env` file** in `frontend/` directory:

```bash
cd frontend
cp .env.example .env
```

2. **Edit `.env` file**:

```env
VITE_API_URL=http://localhost:5000/api
```

### Database Setup

1. **Create PostgreSQL Database**:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE whatsapp_portal;

# Exit
\q
```

2. **Run Prisma Migrations**:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

3. **Verify Database** (optional):

```bash
npx prisma studio
```

This opens a GUI to view your database.

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Build

**Build Frontend:**

```bash
cd frontend
npm run build
```

**Start Backend:**

```bash
cd backend
npm start
```

Serve the frontend build folder using a web server (nginx, Apache, etc.)

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Validate Phone Numbers

**POST** `/api/validate`

Validates phone numbers against WhatsApp API.

**Request Body:**
```json
{
  "phones": [
    "1234567890",
    "9876543210",
    "+919999888877"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "validNumbers": ["+911234567890", "+919876543210"],
  "invalidNumbers": ["+919999888877"],
  "total": 3,
  "valid": 2,
  "invalid": 1
}
```

---

#### 2. Send Broadcast

**POST** `/api/send`

Sends broadcast messages to recipients.

**Request Body:**
```json
{
  "recipients": ["+911234567890", "+919876543210"],
  "message": "Hello {{name}}, welcome to our service!"
}
```

**Response:**
```json
{
  "success": true,
  "campaignId": 123,
  "results": {
    "total": 2,
    "sent": 2,
    "failed": 0
  },
  "details": [
    {
      "success": true,
      "messageId": "wamid.xxx",
      "to": "+911234567890"
    },
    {
      "success": true,
      "messageId": "wamid.yyy",
      "to": "+919876543210"
    }
  ]
}
```

---

#### 3. Get Campaigns

**GET** `/api/campaigns`

Retrieves all campaigns.

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "message": "Hello {{name}}",
      "totalRecipients": 10,
      "successCount": 8,
      "failureCount": 2,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 4. Get Campaign Details

**GET** `/api/campaigns/:id`

Retrieves specific campaign with all recipients.

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": 1,
    "message": "Hello {{name}}",
    "totalRecipients": 10,
    "successCount": 8,
    "failureCount": 2,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "CampaignRecipient": [...]
  }
}
```

---

#### 5. Get Contacts

**GET** `/api/contacts`

Retrieves all contacts.

**Response:**
```json
{
  "success": true,
  "contacts": [
    {
      "id": 1,
      "phone": "+911234567890",
      "name": "John Doe",
      "isValid": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "valid": 1
}
```

---

#### 6. Health Check

**GET** `/api/health`

Server health check.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📖 Usage Guide

### Step 1: Prepare Your Contact List

Create a CSV or TXT file with phone numbers:

**contacts.csv:**
```
9876543210
9999888877
+919888777666
1234567890
```

or

**contacts.txt:**
```
9876543210
9999888877
+919888777666
1234567890
```

### Step 2: Upload Contacts

1. Open the application in your browser (`http://localhost:5173`)
2. Drag and drop your CSV/TXT file or click to browse
3. The system will:
   - Extract phone numbers
   - Normalize them (add +91 for Indian 10-digit numbers)
   - Remove duplicates
   - Display preview

### Step 3: Validate Contacts

1. Click **"Validate Contacts"** button
2. The system will:
   - Send contacts to WhatsApp API in batches of 50
   - Check which numbers are registered on WhatsApp
   - Mark valid/invalid numbers
   - Store results in database

### Step 4: Compose Message

1. Write your message in the composer
2. Use placeholders for personalization:
   - `{{name}}` - Contact's name
   - `{{phone}}` - Contact's phone
   - `{{email}}` - Contact's email
   - `{{city}}` - Contact's city

**Example:**
```
Hello {{name}},

Thank you for joining our service! 
Your registered phone is {{phone}}.

Best regards,
Team
```

### Step 5: Send Broadcast

1. Click **"Send Broadcast"** button
2. Confirm the action
3. Monitor progress in the Activity Log
4. View final results with success/failure counts

### Step 6: Review Results

- Check Activity Log for detailed status
- Review campaign statistics
- Check failed deliveries and error messages

---

## ⚡ Rate Limiting & Best Practices

### WhatsApp API Rate Limits

Meta enforces the following limits:

- **Cloud API**: ~80 messages per second per phone number
- **Business API**: Higher limits based on tier

### Application Rate Limiting

This portal implements:

- **Queue-based sending**: Uses `p-queue` to control concurrency
- **Configurable limits**: Set via environment variables
- **Retry logic**: Automatic retry on rate limit errors
- **Batch processing**: Validates 50 contacts at a time

### Configuration

In `backend/.env`:

```env
RATE_LIMIT_CONCURRENCY=5     # Max concurrent requests
RATE_LIMIT_INTERVAL=1000     # Interval in milliseconds
```

**Recommended Settings:**

- For testing: `RATE_LIMIT_CONCURRENCY=5`
- For production: `RATE_LIMIT_CONCURRENCY=10-20` (monitor and adjust)

### Best Practices

1. **Start Small**: Test with 10-20 contacts first
2. **Monitor Errors**: Check Activity Log for rate limit errors
3. **Use Templates**: For messages outside 24-hour window
4. **Respect Opt-outs**: Maintain a do-not-contact list
5. **Quality Over Quantity**: Send relevant, valuable content
6. **Timing**: Send during business hours in recipient's timezone
7. **Compliance**: Follow WhatsApp Business Policy

### 24-Hour Session Window

WhatsApp allows free-form messages only within 24 hours of user interaction. Outside this window:

- Use approved template messages
- Submit templates for Meta approval
- Templates take 24-48 hours for review

---

## 💾 Database Schema

### Contact Table

Stores contact information and validation status.

```sql
CREATE TABLE "Contact" (
  "id" SERIAL PRIMARY KEY,
  "phone" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "isValid" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Campaign Table

Stores broadcast campaign metadata.

```sql
CREATE TABLE "Campaign" (
  "id" SERIAL PRIMARY KEY,
  "message" TEXT NOT NULL,
  "totalRecipients" INTEGER DEFAULT 0,
  "successCount" INTEGER DEFAULT 0,
  "failureCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### CampaignRecipient Table

Logs individual message delivery status.

```sql
CREATE TABLE "CampaignRecipient" (
  "id" SERIAL PRIMARY KEY,
  "campaignId" INTEGER REFERENCES "Campaign"("id") ON DELETE CASCADE,
  "phone" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "error" TEXT,
  "sentAt" TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

#### 2. WhatsApp API Error: Invalid Phone Number ID

**Error:** `(#100) Invalid phone number ID`

**Solution:**
- Verify `WHATSAPP_PHONE_NUMBER_ID` in `.env`
- Check if phone number is active in Meta dashboard

#### 3. WhatsApp API Error: Invalid Access Token

**Error:** `Invalid OAuth access token`

**Solution:**
- Regenerate access token in Meta dashboard
- Update `WHATSAPP_TOKEN` in `.env`
- For production, use permanent token

#### 4. Rate Limit Exceeded

**Error:** `Rate limit exceeded`

**Solution:**
- Reduce `RATE_LIMIT_CONCURRENCY` in `.env`
- Increase `RATE_LIMIT_INTERVAL`
- Wait before retrying

#### 5. Message Not Delivered

**Possible Causes:**
- Recipient not in test numbers (test mode)
- Recipient blocked your number
- Template required (outside 24-hour window)
- Invalid phone number format

**Solution:**
- Add recipient to test numbers in Meta dashboard
- Use approved template messages
- Verify phone number format

#### 6. Frontend Can't Connect to Backend

**Error:** `Network Error` or `404`

**Solution:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS settings in `server.js`

---

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Access Tokens**: Use permanent tokens in production, rotate regularly
3. **Database**: Use strong passwords, enable SSL
4. **API Security**: Implement authentication/authorization
5. **Input Validation**: Sanitize all user inputs
6. **Rate Limiting**: Prevent abuse with API rate limits
7. **HTTPS**: Use HTTPS in production
8. **Webhook Verification**: Verify webhook signatures

---

## 📸 Screenshots

> **Note**: Add screenshots of your application here

- Dashboard Overview
- File Upload Interface
- Contact List with Validation
- Message Composer
- Activity Log
- Campaign Results

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Prisma ORM](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
- [Express](https://expressjs.com/)

---

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Check [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- Review [Prisma Documentation](https://www.prisma.io/docs)

---

## 🗺️ Roadmap

Future enhancements:

- [ ] User authentication and authorization
- [ ] Multi-user support with role-based access
- [ ] Scheduled campaigns
- [ ] Rich media support (images, videos, documents)
- [ ] Advanced analytics and reporting
- [ ] Contact segmentation and tagging
- [ ] Template message builder
- [ ] Webhook integration for message status
- [ ] Export campaign reports
- [ ] Multi-language support

---

**Built with ❤️ for efficient WhatsApp Business Messaging**
