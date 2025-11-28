# 📱 WhatsApp Broadcast Portal (No Database)

A lightweight, stateless WhatsApp broadcast portal built with React and Node.js. **No database required** - all data is handled in-memory during requests.

## ⚡ Features

- ✅ **No Database** - Completely stateless, no persistent storage
- ✅ **250 Recipient Limit** - Hard limit enforced on both frontend and backend
- ✅ **International Phone Numbers** - Supports any country code
- ✅ **Flexible Input** - CSV upload, paste, or manual entry
- ✅ **WhatsApp Validation** - Check which numbers are registered on WhatsApp
- ✅ **Inline Editing** - Edit numbers directly in the UI
- ✅ **Selective Sending** - Choose exactly which numbers to send to
- ✅ **Rate Limiting** - Built-in queue to avoid API limits
- ✅ **Error Handling** - Robust handling of WhatsApp API errors including pair-rate limits
- ✅ **Real-time Progress** - See validation and sending progress

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [WhatsApp API Setup](#whatsapp-api-setup)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **WhatsApp Business Account** with Cloud API access
- **Meta Developer Account** ([Sign up](https://developers.facebook.com/))

---

## 📦 Installation

### 1. Clone/Download Project

```bash
cd whatsapp-campain
```

### 2. Install Backend Dependencies

```bash
cd backend-simple
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend-simple
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. **Navigate to backend directory:**
```bash
cd backend-simple
```

2. **Copy `.env.example` to `.env`:**
```bash
copy .env.example .env
```

3. **Edit `.env` and add your WhatsApp credentials:**

```env
# Get these from Meta Developer Console: https://developers.facebook.com/apps
# Instructions in "WhatsApp API Setup" section below
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_TOKEN=your_access_token_here
GRAPH_API_VERSION=v17.0

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting (adjust based on your WhatsApp tier)
RATE_LIMIT_CONCURRENCY=5
RATE_LIMIT_INTERVAL=1000
```

**Where to find your credentials:**
- **WHATSAPP_PHONE_NUMBER_ID**: Meta Developer Console → Your App → WhatsApp → API Setup → Phone Number ID
- **WHATSAPP_TOKEN**: Meta Developer Console → Your App → WhatsApp → API Setup → Temporary Access Token (for testing) or create a System User for permanent token

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend-simple
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend-simple
npm run dev
```
Frontend will run on `http://localhost:5173`

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. **POST /api/validate**

Validates phone numbers against WhatsApp API to check registration status.

**Request:**
```json
{
  "phones": [
    "+1234567890",
    "9876543210",
    "+441234567890"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "valid": ["+1234567890", "+441234567890"],
  "invalid": ["9876543210"],
  "total": 3,
  "validCount": 2,
  "invalidCount": 1,
  "missingCountryCode": ["9876543210"]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"phones\": [\"+1234567890\", \"+919876543210\"]}"
```

---

#### 2. **POST /api/send**

Sends broadcast messages to recipients. **Maximum 250 recipients** enforced.

**Request:**
```json
{
  "recipients": ["+1234567890", "+919876543210"],
  "message": "Hello! This is a test broadcast message."
}
```

**Response (Success):**
```json
{
  "success": true,
  "results": {
    "total": 2,
    "sent": 2,
    "failed": 0
  },
  "details": [
    {
      "success": true,
      "messageId": "wamid.HBgNMTIzNDU2Nzg5MAA=",
      "to": "+1234567890"
    },
    {
      "success": true,
      "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwAA=",
      "to": "+919876543210"
    }
  ],
  "message": "Broadcast completed: 2 sent, 0 failed"
}
```

**Response (Over Limit):**
```json
{
  "success": false,
  "message": "Maximum 250 recipients allowed per broadcast. You provided 300. Please reduce the number or split into multiple sends.",
  "recipientCount": 300,
  "maxAllowed": 250
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d "{\"recipients\": [\"+1234567890\"], \"message\": \"Test message\"}"
```

---

#### 3. **GET /api/health**

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "maxRecipients": 250
}
```

---

## 📖 Usage Guide

### Step 1: Add Phone Numbers

You have three options:

**Option A: Upload CSV/TXT File**
1. Click "Choose File" under "Upload Contacts"
2. Select a CSV or TXT file with phone numbers (one per line or comma-separated)

**Option B: Paste Numbers**
1. Copy phone numbers to clipboard
2. Paste into the "Paste Phone Numbers" textarea
3. Click "Add Numbers"

**Option C: Manual Entry**
1. Add numbers via paste or upload
2. Edit any number inline in the contact list

**Sample Format (CSV/TXT):**
```
+1234567890
+919876543210
+441234567890
```

### Step 2: Handle Country Codes

**Important**: Phone numbers MUST include country codes for WhatsApp API.

If you have numbers without country codes:
1. Enter the country code in the "Add Country Code" field (e.g., `1`, `91`, `44`)
2. Click "Apply to All"
3. All numbers without `+` will get the country code prepended

### Step 3: Validate Contacts

1. Click "✓ Validate Contacts" button
2. Wait for validation to complete (batches of 50)
3. Valid numbers will be marked with green "✓ Valid" badge
4. Invalid numbers will be marked with red "✗ Invalid" badge
5. Only valid numbers will be auto-selected

### Step 4: Select Recipients

- **Select All**: Click "Select All" button
- **Deselect All**: Click "Deselect All" button
- **Individual**: Check/uncheck boxes next to each number
- **Limit Check**: If more than 250 selected, you'll see a red warning

### Step 5: Compose Message

1. Type your message in the "Compose Message" textarea
2. Keep it under 1000 characters for best results
3. Note: For messages outside 24-hour window, you need an approved template

### Step 6: Send Broadcast

1. Click "📤 Send Broadcast" button
2. Confirm the action
3. Wait for sending to complete
4. View results in the "Result" panel

---

## 🔧 WhatsApp API Setup

### 1. Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Fill in app details

### 2. Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Follow the setup wizard

### 3. Get Credentials

**Phone Number ID:**
1. Navigate to WhatsApp → Getting Started
2. Copy the "Phone Number ID" (format: `123456789012345`)

**Access Token (Temporary - for testing):**
1. Navigate to WhatsApp → Getting Started
2. Copy the "Temporary access token"
3. Valid for 24 hours

**Access Token (Permanent - for production):**
1. Navigate to Business Settings → System Users
2. Create a System User
3. Assign WhatsApp permissions
4. Generate a token
5. Save securely (you won't see it again!)

### 4. Add Test Numbers (Development)

1. Navigate to WhatsApp → Getting Started
2. Under "Send and receive messages", click "Add phone number"
3. Enter phone number (with country code)
4. Verify via SMS/call
5. You can now send test messages to these numbers

### 5. Get Production Access

For production use beyond test numbers:
1. Complete business verification
2. Add payment method
3. Submit your app for review
4. Create and submit message templates for approval

**Resources:**
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Getting Started Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

## ✅ Production Checklist

Before deploying to production, ensure:

### 1. **Opt-In Compliance**
- [ ] All recipients have opted in to receive messages
- [ ] Maintain opt-out mechanism
- [ ] Keep records of consent
- [ ] Honor unsubscribe requests immediately

### 2. **Template Approval**
- [ ] Create message templates for common broadcasts
- [ ] Submit templates to Meta for approval (24-48 hours)
- [ ] Use templates for messages outside 24-hour window
- [ ] Template approval required for cold messaging

### 3. **Rate Limits**
- [ ] Understand your tier limits (varies by business verification)
- [ ] Adjust `RATE_LIMIT_CONCURRENCY` based on your tier
- [ ] Monitor for 429 errors (rate limit exceeded)
- [ ] Consider upgrading tier if needed

### 4. **Security**
- [ ] Use permanent access token (not temporary)
- [ ] Store `WHATSAPP_TOKEN` securely (environment variables, secrets manager)
- [ ] Never commit `.env` file to version control
- [ ] Rotate tokens periodically
- [ ] Use HTTPS in production
- [ ] Implement authentication for your portal
- [ ] Add authorization/role-based access

### 5. **Monitoring**
- [ ] Set up logging for failed messages
- [ ] Monitor for error patterns
- [ ] Track delivery rates
- [ ] Set up alerts for high failure rates

### 6. **WhatsApp Business Policy**
- [ ] Read and comply with [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [ ] Don't send spam or promotional messages without opt-in
- [ ] Don't send messages to numbers on WhatsApp's blocked list
- [ ] Respect user privacy

### 7. **Error Handling**
- [ ] Handle 24-hour window restrictions
- [ ] Handle pair rate limiting (130429 error)
- [ ] Handle general rate limiting (429 error)
- [ ] Handle invalid numbers gracefully
- [ ] Implement exponential backoff

### 8. **Data Management**
- [ ] Since there's no database, export results after each campaign
- [ ] Keep campaign logs externally if needed for compliance
- [ ] Consider adding CSV export of results

---

## 🐛 Troubleshooting

### Issue: "Invalid WhatsApp access token"

**Solution:**
- Verify `WHATSAPP_TOKEN` in `.env` file
- Check if token expired (temporary tokens last 24 hours)
- Generate new token from Meta Developer Console

---

### Issue: "Invalid phone number ID"

**Solution:**
- Verify `WHATSAPP_PHONE_NUMBER_ID` in `.env` file
- Check Meta Developer Console → WhatsApp → API Setup

---

### Issue: "Rate limit exceeded"

**Solution:**
- Reduce `RATE_LIMIT_CONCURRENCY` in `.env` (try 3 instead of 5)
- Increase `RATE_LIMIT_INTERVAL` (try 2000 instead of 1000)
- Wait a few minutes before retrying

---

### Issue: "Message outside 24-hour window"

**Explanation:**
WhatsApp only allows free-form messages within 24 hours of user interaction.

**Solution:**
- Use approved message templates
- Submit templates for approval in Meta Business Manager
- Use template message endpoint (requires modification)

---

### Issue: Numbers not validating

**Solution:**
- Ensure numbers have country codes (e.g., `+1`, `+91`)
- Check if numbers are in international format
- Verify numbers are actually registered on WhatsApp
- For testing, add numbers to test recipients in Meta Console

---

### Issue: "Pair rate limit exceeded" (Error 130429)

**Explanation:**
You've sent too many messages to a specific recipient too quickly.

**Solution:**
- This is automatic per-recipient rate limiting
- Wait before sending to that recipient again
- No retry will help - system automatically skips and marks as failed

---

### Issue: Frontend can't connect to backend

**Solution:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `proxy` settings in `vite.config.js`

---

## 📚 Additional Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [Meta Developer Console](https://developers.facebook.com/)
- [Rate Limit Best Practices](https://developers.facebook.com/docs/whatsapp/cloud-api/rate-limits)

---

## 🤝 Support

For WhatsApp API issues:
- Check [Meta Developer Community](https://developers.facebook.com/community/)
- Review [WhatsApp Cloud API Changelog](https://developers.facebook.com/docs/whatsapp/cloud-api/changelog)

---

## 📄 License

MIT License - Feel free to use and modify for your needs.

---

**Built with ❤️ - No Database Required**
