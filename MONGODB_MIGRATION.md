# MongoDB Migration Guide

## What Changed ✅

Your Prisma schema has been updated to use MongoDB instead of PostgreSQL. **All your code logic remains the same** — only the database connection changed.

### Schema Changes:
- IDs changed from `Int` (auto-increment) to `String` (MongoDB ObjectId)
- All table references updated to MongoDB format
- No breaking changes to your API or routes

---

## Step 1: Create MongoDB Atlas Account (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or Sign Up
3. Create a free cluster (M0 tier = 512MB, always free)
4. Whitelist your IP address in Network Access
5. Create a database user with username/password

---

## Step 2: Get Connection String

1. In MongoDB Atlas, click "Connect"
2. Choose "Drivers" → "Node.js"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/whatsapp_broadcast?retryWrites=true&w=majority
   ```
4. Replace `username`, `password`, and `whatsapp_broadcast` with your actual values

---

## Step 3: Update Your .env File

**Before (PostgreSQL):**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/whatsapp_broadcast
```

**After (MongoDB):**
```
DATABASE_URL=mongodb+srv://username:password@cluster0.mongodb.net/whatsapp_broadcast?retryWrites=true&w=majority
```

---

## Step 4: Generate Prisma Client

Run this command in your backend folder:

```bash
npm run prisma:generate
```

Or if you want to also run migrations:
```bash
npm run prisma:migrate
```

---

## Step 5: That's It! ✅

Your app will now use MongoDB. No code changes needed in your routes or services.

### Test it:
```bash
npm run dev
```

Visit `http://localhost:3000/api/health` — if you get `{"success":true,"status":"healthy"}`, you're connected!

---

## Cost Comparison

### MongoDB Atlas (Free Tier)
- **Always Free**: 512MB storage, 3 shared nodes
- **Enough for**: ~100k contacts, thousands of campaigns
- **When you grow**: $12/month (dedicated cluster)

### vs PostgreSQL
- **Railway**: $10/month (smallest plan)
- **Render**: $7/month (but limited)
- **DigitalOcean**: $15/month

**You save $7-15/month minimum by using MongoDB free tier.**

---

## Common Issues & Fixes

### ❌ "Invalid connection string"
- Make sure you're using the correct username/password
- Check that your IP is whitelisted in MongoDB Atlas

### ❌ "Cannot reach database"
- Verify Network Access in MongoDB Atlas allows your IP
- Check DATABASE_URL in .env has no typos

### ❌ "Connection timeout"
- Wait 1-2 minutes for MongoDB cluster to initialize
- Try restarting your server: `npm run dev`

---

## Reverting Back to PostgreSQL (If Needed)

Just change `schema.prisma` back:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Contact {
  id        Int      @id @default(autoincrement())
  ...
}
```

Then update `.env` back to PostgreSQL connection string.

---

## Need Help?

- MongoDB Atlas docs: https://docs.atlas.mongodb.com/
- Prisma MongoDB guide: https://www.prisma.io/docs/orm/overview/databases/mongodb
