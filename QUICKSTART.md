# WhatsApp Broadcast Portal - Quick Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Setup Database

Create PostgreSQL database:
```sql
CREATE DATABASE whatsapp_portal;
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TOKEN=your_access_token
GRAPH_API_VERSION=v17.0
DATABASE_URL="postgresql://postgres:password@localhost:5432/whatsapp_portal"
PORT=5000
NODE_ENV=development
RATE_LIMIT_CONCURRENCY=5
RATE_LIMIT_INTERVAL=1000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Setup Prisma

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 6. Access Application

Open browser: `http://localhost:5173`

## Getting WhatsApp API Credentials

1. Go to https://developers.facebook.com/
2. Create/Select App → Add WhatsApp Product
3. Navigate to WhatsApp → Getting Started
4. Copy:
   - Phone Number ID
   - Access Token (temporary for testing)
5. Add test recipient numbers

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Database connection successful
- [ ] WhatsApp API credentials configured
- [ ] Test numbers added in Meta dashboard
- [ ] Sample CSV file prepared

## Common Commands

```powershell
# Backend
cd backend
npm run dev          # Start dev server
npm start           # Start production server
npx prisma studio   # Open database GUI

# Frontend
cd frontend
npm run dev         # Start dev server
npm run build       # Build for production

# Database
npx prisma generate              # Generate Prisma client
npx prisma migrate dev           # Run migrations
npx prisma migrate reset         # Reset database
```

## Sample CSV File

Create `contacts.csv`:
```
9876543210
9999888877
+919888777666
1234567890
```

## Troubleshooting

**Can't connect to database?**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

**WhatsApp API errors?**
- Verify credentials in .env
- Check test numbers are added
- Ensure access token is valid

**Frontend can't connect?**
- Ensure backend is running
- Check VITE_API_URL matches backend port
- Verify CORS settings

## Next Steps

1. Upload your contact list
2. Validate contacts
3. Compose your message
4. Send broadcast
5. Monitor results

**Happy Broadcasting! 📱**
