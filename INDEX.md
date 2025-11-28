# 📱 WhatsApp Broadcast Portal
### Complete Production-Ready Full-Stack Application

---

## 🚀 Quick Navigation

| Document | Description |
|----------|-------------|
| **[README.md](README.md)** | Complete documentation (setup, API, usage) |
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute quick start guide |
| **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** | Technical overview and features |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Common issues and solutions |

---

## 📂 Project Structure

```
whatsapp-campain/
│
├── 📄 Documentation
│   ├── README.md                 - Full documentation
│   ├── QUICKSTART.md            - Quick start guide  
│   ├── PROJECT-SUMMARY.md       - Technical summary
│   ├── TROUBLESHOOTING.md       - Issue solutions
│   ├── LICENSE                  - MIT License
│   └── INDEX.md                 - This file
│
├── 🔧 Setup Scripts
│   ├── setup.ps1                - Automated setup
│   ├── start-backend.ps1        - Start backend server
│   └── start-frontend.ps1       - Start frontend server
│
├── 📊 Sample Data
│   ├── sample-contacts.csv      - Sample CSV file
│   └── sample-contacts.txt      - Sample TXT file
│
├── 🎨 Frontend (React + Vite + Tailwind)
│   └── frontend/
│       ├── src/
│       │   ├── api/             - API client
│       │   ├── components/      - React components
│       │   ├── pages/           - Page components
│       │   ├── App.jsx          - Root component
│       │   └── main.jsx         - Entry point
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── .env.example
│
└── ⚙️ Backend (Node.js + Express + Prisma)
    └── backend/
        ├── prisma/
        │   └── schema.prisma    - Database schema
        ├── routes/
        │   ├── validate.js      - Validation endpoint
        │   ├── send.js          - Send endpoint
        │   └── data.js          - Data endpoints
        ├── services/
        │   └── whatsappService.js - WhatsApp API
        ├── utils/
        │   └── helpers.js       - Utility functions
        ├── server.js            - Express server
        ├── package.json
        └── .env.example
```

---

## ⚡ Quick Start

### 1️⃣ Automated Setup (Recommended)
```powershell
.\setup.ps1
```

### 2️⃣ Manual Setup
```powershell
# Install dependencies
cd backend; npm install
cd ../frontend; npm install

# Configure environment
Copy backend\.env.example backend\.env
Copy frontend\.env.example frontend\.env
# Edit .env files with your credentials

# Setup database
cd backend
npx prisma generate
npx prisma migrate dev
```

### 3️⃣ Run Application
```powershell
# Terminal 1: Backend
.\start-backend.ps1

# Terminal 2: Frontend
.\start-frontend.ps1
```

### 4️⃣ Access
Open browser: **http://localhost:5173**

---

## ✨ Key Features

### Contact Management
- ✅ Upload CSV/TXT files
- ✅ Auto-normalize phone numbers
- ✅ Remove duplicates
- ✅ Validate against WhatsApp

### Message Broadcasting
- ✅ Compose messages with placeholders
- ✅ Personalize with contact data
- ✅ Send to validated contacts
- ✅ Track delivery status

### Campaign Tracking
- ✅ Real-time progress monitoring
- ✅ Success/failure statistics
- ✅ Detailed error logs
- ✅ Campaign history

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL, Prisma ORM |
| **API** | WhatsApp Cloud API (Meta) |
| **Queue** | p-queue (rate limiting) |

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/validate` | Validate phone numbers |
| POST | `/api/send` | Send broadcast messages |
| GET | `/api/campaigns` | Get all campaigns |
| GET | `/api/campaigns/:id` | Get campaign details |
| GET | `/api/contacts` | Get all contacts |
| GET | `/api/health` | Health check |

---

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **WhatsApp Business Account** ([Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started))

---

## 🔧 Configuration

### Required Environment Variables

**Backend (.env):**
```env
WHATSAPP_PHONE_NUMBER_ID=     # From Meta Dashboard
WHATSAPP_TOKEN=               # Access token
DATABASE_URL=                 # PostgreSQL connection
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

**See `.env.example` files for all options**

---

## 📚 Documentation Guide

### For First-Time Users
1. Read [QUICKSTART.md](QUICKSTART.md) - 5-minute setup
2. Follow setup instructions
3. Test with sample data

### For Developers
1. Read [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Architecture overview
2. Read [README.md](README.md) - Complete documentation
3. Review code structure

### For Troubleshooting
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
2. Enable debug logging
3. Check backend/frontend consoles

---

## 🎯 Usage Workflow

```
1. Upload CSV/TXT → 2. Validate Contacts → 3. Compose Message → 4. Send Broadcast → 5. Monitor Results
```

**Detailed steps in [README.md](README.md#usage-guide)**

---

## 🔒 Security Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Keep access tokens secure
- ⚠️ Use permanent tokens in production
- ⚠️ Enable HTTPS in production
- ⚠️ Implement authentication for multi-user setups

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Can't connect to DB | Check PostgreSQL running, verify DATABASE_URL |
| WhatsApp API error | Verify credentials, check test numbers added |
| Port already in use | Kill process or change PORT in .env |
| Rate limit error | Reduce RATE_LIMIT_CONCURRENCY |

**Full troubleshooting guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

---

## 📦 What's Included

- ✅ Complete frontend application
- ✅ Complete backend API
- ✅ Database schema and migrations
- ✅ WhatsApp API integration
- ✅ Rate limiting and retry logic
- ✅ Error handling
- ✅ Comprehensive documentation
- ✅ Setup scripts
- ✅ Sample test data
- ✅ Production-ready code

---

## 🚀 Next Steps After Setup

1. ✅ Configure WhatsApp API credentials
2. ✅ Create PostgreSQL database
3. ✅ Run Prisma migrations
4. ✅ Upload test contacts
5. ✅ Validate contacts
6. ✅ Send test broadcast
7. ✅ Review results

---

## 📞 Support Resources

- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Prisma Docs**: https://www.prisma.io/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 🎓 Learning Path

### Beginner
1. Follow QUICKSTART.md
2. Test with sample data
3. Understand basic workflow

### Intermediate
1. Read README.md API section
2. Explore code structure
3. Customize components

### Advanced
1. Review architecture in PROJECT-SUMMARY.md
2. Implement custom features
3. Deploy to production

---

## ✅ Quick Checklist

Before starting:
- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] WhatsApp Business Account created
- [ ] API credentials obtained

Setup:
- [ ] Dependencies installed
- [ ] .env files configured
- [ ] Database created
- [ ] Prisma migrations run

Testing:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Sample contacts uploaded
- [ ] Test broadcast sent

---

## 🎉 You're Ready!

Everything is set up and ready to use. Start with [QUICKSTART.md](QUICKSTART.md) for a 5-minute setup, or dive into [README.md](README.md) for complete documentation.

**Happy Broadcasting! 📱💬**

---

*Last Updated: November 2024*
*Version: 1.0.0*
