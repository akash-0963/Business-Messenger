# WhatsApp Marketing Broadcast Portal (NO-DB Version)

> **Production-Ready** | **Stateless** | **Global Phone Support** | **250 Recipient Limit**

A complete, database-free WhatsApp broadcast solution supporting phone numbers from 200+ countries. Built with React, Node.js, and WhatsApp Cloud API.

---

## ✨ Features

### Core Capabilities
- ✅ **NO DATABASE** - Completely stateless, in-memory only
- ✅ **Global Phone Support** - 200+ country codes with searchable dropdown
- ✅ **250 Recipient Limit** - Enforced on both frontend and backend
- ✅ **Dual Input Methods** - File upload (CSV/TXT) + Manual entry
- ✅ **Phone Validation** - Real-time WhatsApp number verification
- ✅ **Smart Extraction** - Auto-extracts numbers from mixed CSV data
- ✅ **Rate Limiting** - Built-in queue to prevent API throttling
- ✅ **Template Messages** - Support for approved WhatsApp templates
- ✅ **Retry Logic** - Exponential backoff for failed sends
- ✅ **Live Progress** - Real-time status updates and logs

### Phone Number Support
Accepts numbers in ANY format:
```
+91 9876543210
+1 415 555 2671
+31 612345678
9876543210
07700-900123
(245) 123-4567
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- WhatsApp Business API account
- Meta Developer App with WhatsApp product

### 1. Clone & Install

```bash
# Backend
cd no-db-backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `no-db-backend/.env`:
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_TOKEN=your_access_token_here
GRAPH_API_VERSION=v17.0
PORT=3000
NODE_ENV=development
RATE_LIMIT_CONCURRENCY=5
RATE_LIMIT_INTERVAL=1000
```

### 3. Start Servers

```bash
# Terminal 1 - Backend
cd no-db-backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access Application

Open browser: **http://localhost:5174**

---

## 📖 How to Get WhatsApp API Access

### Step 1: Create Meta Developer Account
1. Go to https://developers.facebook.com/
2. Create a developer account
3. Verify your email

### Step 2: Create App
1. Click "My Apps" → "Create App"
2. Select "Business" as app type
3. Fill in app details

### Step 3: Add WhatsApp Product
1. In app dashboard, click "Add Product"
2. Select "WhatsApp" → "Set Up"
3. You'll get a **Test Phone Number** to start

### Step 4: Get Your Credentials

**PHONE_NUMBER_ID:**
- Go to WhatsApp → API Setup
- Copy the "Phone number ID" (looks like: `123456789012345`)

**ACCESS_TOKEN:**
- Same page, copy the "Temporary access token"
- For production, generate a permanent token

**Testing:**
```bash
curl -X POST \
  "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919876543210",
    "type": "text",
    "text": { "body": "Hello from WhatsApp API!" }
  }'
```

### Step 5: Add Your Business Number (Production)
1. Go to WhatsApp → Phone Numbers
2. Click "Add phone number"
3. Follow verification process
4. Update `.env` with your new PHONE_NUMBER_ID

---

## 🌍 Global Country Code Support

The application includes 200+ countries with flags and codes:

```javascript
// Auto-populated dropdown with search
🇮🇳 +91 India
🇺🇸 +1 United States  
🇬🇧 +44 United Kingdom
🇦🇪 +971 United Arab Emirates
🇦🇺 +61 Australia
... and 195+ more
```

**Auto-Apply Feature:**
- Toggle "Auto-apply country code to numbers without one"
- Automatically adds selected CC to local numbers
- Example: `9876543210` → `+919876543210` (if +91 selected)

---

## 📋 Usage Guide

### 1. Add Contacts

**Method A: Manual Input**
```
9876543210
+91 9123456789, 9999888877
(415) 555-2671
```

**Method B: Upload CSV/TXT**
```csv
Name, Phone, Email, Address
John Doe, 9876543210, john@email.com, Mumbai
Jane Smith, +91-9123456789, jane@email.com, Delhi
```
→ Auto-extracts only phone numbers!

### 2. Select Country Code
- Search and select default country code (e.g., +91 for India)
- Enable toggle to auto-apply to numbers without CC

### 3. Validate Numbers
- Click "Validate Contacts"
- System checks each number against WhatsApp database
- Shows ✓ Valid / ✗ Invalid status

### 4. Compose Message
```
Hello! This is a test message from our broadcast portal.

Visit: https://example.com
```

### 5. Send Broadcast
- Review recipient count (max 250)
- Click "Send Broadcast"
- Monitor real-time progress

---

## 🔒 Security & Compliance

### ⚠️ IMPORTANT RULES

**Opt-In Required:**
- Only send to users who have opted-in
- Save proof of consent
- Never spam or unsolicited messaging

**Rate Limits:**
- Max 250 recipients per broadcast
- Built-in queue: 5 concurrent, 1/sec
- Exponential backoff on errors

**Template Messages:**
- Required for first 24 hours or after 24h window
- Must be pre-approved by Meta
- Use for promotional content

**Security:**
- Never expose WHATSAPP_TOKEN to frontend
- Use HTTPS in production
- Rotate tokens regularly

---

## 🛠️ API Reference

### Backend Endpoints

#### POST /api/validate
Validate phone numbers

**Request:**
```json
{
  "phones": ["+919876543210", "+14155552671"]
}
```

**Response:**
```json
{
  "success": true,
  "validNumbers": ["+919876543210"],
  "invalidNumbers": ["+14155552671"],
  "total": 2,
  "valid": 1,
  "invalid": 1
}
```

#### POST /api/send
Send broadcast messages

**Text Message:**
```json
{
  "recipients": ["+919876543210"],
  "message": "Hello from WhatsApp!"
}
```

**Template Message:**
```json
{
  "recipients": ["+919876543210"],
  "isTemplate": true,
  "templateName": "hello_world",
  "languageCode": "en"
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "total": 1,
    "sent": 1,
    "failed": 0
  },
  "details": [
    {
      "recipient": "+919876543210",
      "status": "sent",
      "messageId": "wamid.xxxxx",
      "timestamp": "2025-11-28T10:30:00.000Z"
    }
  ]
}
```

---

## 📁 Project Structure

```
/whatsapp-marketing-broadcast
├── /no-db-backend          # Express backend (port 3000)
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   ├── /routes
│   │   ├── validate.js     # Phone validation endpoint
│   │   └── send.js         # Broadcast endpoint
│   ├── /services
│   │   └── whatsappService.js  # WhatsApp API wrapper
│   └── /utils
│       ├── normalizer.js   # Phone number normalizer
│       └── helpers.js      # Utility functions
│
├── /frontend               # React frontend (port 5174)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── /src
│       ├── main.jsx
│       ├── App.jsx
│       ├── /components
│       │   ├── FileUpload.jsx
│       │   ├── CountryCodeSelector.jsx
│       │   ├── ContactList.jsx
│       │   ├── MessageComposer.jsx
│       │   └── StatusLog.jsx
│       ├── /data
│       │   └── countryCodes.js  # 200+ country codes
│       └── /api
│           └── api.js
│
└── /docs                   # Documentation
    ├── README-NO-DB.md
    ├── QUICKSTART-NO-DB.md
    ├── PRODUCTION-CHECKLIST-NO-DB.md
    └── CURL-EXAMPLES-NO-DB.md
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Phone number not registered"**
- Recipient must have WhatsApp installed
- Number must be verified in WhatsApp

**2. "Message failed to send"**
- Check ACCESS_TOKEN is valid
- Verify PHONE_NUMBER_ID is correct
- Ensure number format is correct (+countrycode + number)

**3. "Rate limit exceeded"**
- Reduce RATE_LIMIT_CONCURRENCY in .env
- Increase RATE_LIMIT_INTERVAL

**4. "Template not found"**
- Template must be approved in Meta dashboard
- Use exact template name
- Check language code matches

---

## 📦 Deployment

### Environment Variables (Production)
```env
WHATSAPP_PHONE_NUMBER_ID=production_phone_id
WHATSAPP_TOKEN=production_permanent_token
GRAPH_API_VERSION=v17.0
PORT=3000
NODE_ENV=production
RATE_LIMIT_CONCURRENCY=3
RATE_LIMIT_INTERVAL=1500
```

### Build Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting
```

### Run Backend
```bash
cd no-db-backend
npm start
# Use PM2 or similar for production
```

---

## 📄 License

MIT License - See LICENSE file

---

## 🤝 Support

- **Documentation:** See `/docs` folder
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp
- **Meta Business Help:** https://business.facebook.com/help

---

**Built with ❤️ for global WhatsApp marketing**
