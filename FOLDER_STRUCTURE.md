# Project Folder Structure Analysis

Your WA Messenger project has **2 main folders**. Here's what each does and why they exist:

---

## 1. 📱 **FRONTEND** - React UI Application

### Purpose
User-facing web interface for the WA Messenger.

### Structure
```
frontend/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── pages/
│   │   └── BroadcastPage.jsx      # Main broadcast interface
│   ├── components/
│   │   ├── FileUpload.jsx         # Upload contacts
│   │   ├── ContactList.jsx        # View contacts
│   │   ├── MessageComposer.jsx    # Write messages
│   │   ├── ActionButtons.jsx      # Send/Validate buttons
│   │   ├── StatusLog.jsx          # See results
│   │   └── ...
│   └── main.jsx                   # React entry point
├── index.html
├── package.json                   # Dependencies: React, Axios, Tailwind CSS
├── vite.config.js                 # Vite bundler config
├── tailwind.config.js             # Tailwind CSS config
└── postcss.config.js              # CSS processing

```

### Technologies
- **React 18** - UI components
- **Vite** - Fast bundler & dev server
- **Tailwind CSS** - Styling
- **Axios** - API calls to backend

### What it does
✅ Uploads contact CSV files
✅ Shows list of contacts
✅ Composes broadcast messages
✅ Sends broadcasts via API
✅ Shows real-time status/results

### When to use it
- Production: Use this for users to interact with the platform
- Development: Run with `npm run dev` to test UI

---

## 2. 🗄️ **BACKEND** - Express.js API with Database (MongoDB)

### Purpose
API server that handles WhatsApp integration, message sending, and data persistence.

### Structure
```
backend/
├── server.js                      # Main Express server
├── package.json                   # Dependencies: Express, Prisma, MongoDB
├── .env.example                   # Environment variables template
├── prisma/
│   └── schema.prisma              # Database schema (MongoDB)
├── routes/
│   ├── send.js                    # POST /api/send - Send broadcasts
│   ├── validate.js                # POST /api/validate - Validate phone numbers
│   └── data.js                    # GET /api/campaigns, /api/contacts - Fetch data
├── services/
│   └── whatsappService.js         # WhatsApp Cloud API integration
└── utils/
    └── helpers.js                 # Utility functions
```

### Technologies
- **Express.js** - Web server
- **Prisma** - Database ORM
- **MongoDB Atlas** - Cloud database (recently migrated from PostgreSQL)
- **Axios** - HTTP requests to WhatsApp API
- **p-queue** - Rate limiting & concurrency control

### Database Models
```
Contact
├── id (MongoDB ObjectId)
├── phone (unique)
├── name
├── isValid
├── createdAt, updatedAt

Campaign
├── id (MongoDB ObjectId)
├── message
├── totalRecipients
├── successCount
├── failureCount
└── CampaignRecipient[] (relationship)

CampaignRecipient
├── id
├── campaignId (FK)
├── phone
├── status ('sent', 'failed', 'pending')
├── error
└── sentAt
```

### What it does
✅ Validates phone numbers against WhatsApp API
✅ Sends broadcast messages with rate limiting
✅ Stores contacts and campaigns in database
✅ Tracks delivery status for each recipient
✅ Retries failed sends with exponential backoff
✅ Personalizes messages with contact data

### When to use it
- Production: Use this for real WhatsApp marketing
- Development: Run with `npm run dev` for API testing
- Cost: $0/month (MongoDB free tier)

---


---

## 📊 Quick Comparison

| Feature | Frontend | Backend (DB) |
|---------|----------|--------------|
| **Purpose** | UI/UX | Production API |
| **Database** | N/A | ✅ MongoDB |
| **Data Persistence** | N/A | ✅ Permanent |
| **Contact History** | Shows cached | ✅ Full history |
| **Campaign Tracking** | Shows results | ✅ Full tracking |
| **WhatsApp Integration** | Calls API | ✅ Yes |
| **Rate Limiting** | N/A | ✅ Yes |
| **Production Ready** | ✅ Yes | ✅ Yes |
| **Cost** | $0-5/mo | $0/mo (free tier) |
| **Deployment** | Vercel/Netlify | Railway/Render |

---

## 🎯 Recommended Setup

### For Production
```
Use:  Frontend + Backend (with MongoDB)
Why:  Full features, data persistence, professional tracking
```

### For Development
```
Use:  Frontend + Backend (with MongoDB)
Why:  Same as production, test real scenarios
```

---


## 🚀 Next Steps

1. **Choose your setup** (Production or Dev)
2. **Configure .env files**:
   - `frontend/.env` → Backend API URL
   - `backend/.env` → WhatsApp credentials + MongoDB URI
3. **Install dependencies**:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
4. **Run services**:
   ```bash
   # Terminal 1: Frontend
   cd frontend && npm run dev
   
   # Terminal 2: Backend
   cd backend && npm run dev
   ```
5. **Access UI**: http://localhost:5173

---

## 📝 Architecture

```
┌─────────────────┐
│     FRONTEND    │
│  (React + UI)   │
└────────┬────────┘
         │ HTTP (Axios)
         ↓
┌─────────────────┐
│     BACKEND     │
│  (Express API)  │
└────────┬────────┘
         │ Prisma ORM
         ↓
  ┌─────────────────┐
  │ MongoDB Atlas   │
  │  (Database)     │
  └─────────────────┘
         
Backend also connects to:
  └─→ WhatsApp Cloud API (HTTPS)
