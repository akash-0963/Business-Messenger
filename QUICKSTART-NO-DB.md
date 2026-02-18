# Quick Start Guide - WhatsApp Broadcast Portal

Get up and running in 5 minutes!

---

## ⚡ 5-Minute Setup

### Step 1: Get WhatsApp API Credentials (2 min)

1. Go to https://developers.facebook.com/apps
2. Click "Create App" → "Business"
3. Add "WhatsApp" product
4. Copy these values:

```
PHONE_NUMBER_ID: [From API Setup page]
ACCESS_TOKEN: [Temporary token from same page]
```

### Step 2: Install Dependencies (1 min)

```bash
# Backend
cd no-db-backend
npm install

# Frontend  
cd ../frontend
npm install
```

### Step 3: Configure (1 min)

Create `no-db-backend/.env`:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_TOKEN=EAAxxxxxxxxxxxxx
GRAPH_API_VERSION=v17.0
PORT=3000
```

### Step 4: Start (1 min)

```bash
# Terminal 1
cd no-db-backend
npm start

# Terminal 2
cd frontend
npm run dev
```

### Step 5: Use! (immediate)

1. Open **http://localhost:5174**
2. Select country code (e.g., +91 for India)
3. Add numbers manually or upload CSV
4. Click "Validate Contacts"
5. Write message
6. Click "Send Broadcast"

---

## 📱 Test Your Setup

### Method 1: Use Interface

1. Add your own WhatsApp number
2. Validate it
3. Send a test message
4. Check your phone!

### Method 2: Direct API Call

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": "Hello from WhatsApp API!"
  }'
```

---

## 🌍 Adding Numbers

### Format 1: With Country Code
```
+91 9876543210
+1 415 555 2671  
+971 50 123 4567
```

### Format 2: Without Country Code
```
9876543210
(415) 555-2671
```
*Enable "Auto-apply country code" toggle*

### Format 3: CSV Upload
```csv
Name,Phone,Email
John,9876543210,john@test.com
Jane,+91-9123456789,jane@test.com
```
*Automatically extracts only phone numbers!*

---

## ⚙️ Key Settings

### Country Code Selector
- Search 200+ countries
- Auto-apply to local numbers
- Example: Select +91 → 9876543210 becomes +919876543210

### 250 Recipient Limit
- Hardcoded max recipients
- Frontend warning if exceeded
- Backend rejects >250

### Rate Limiting
Default: 5 concurrent, 1/sec

Adjust in `.env`:
```env
RATE_LIMIT_CONCURRENCY=5
RATE_LIMIT_INTERVAL=1000
```

---

## ✅ Pre-Flight Checklist

Before sending to customers:

- [ ] Test with your own number first
- [ ] Verify all numbers are opt-in
- [ ] Message complies with WhatsApp policies
- [ ] Validated all contacts
- [ ] Not exceeding 250 recipients
- [ ] Have opt-out mechanism ready

---

## 🚨 Common First-Time Issues

**"Invalid phone number"**
→ Must include country code: `+919876543210` ✅ not `9876543210` ❌

**"Message not delivered"**
→ Recipient must have WhatsApp installed

**"Access token expired"**
→ Get permanent token from Meta Business Manager

**"Template not approved"**
→ Only use pre-approved templates for first message

---

## 📚 Next Steps

1. **Read Full Docs:** `README-NO-DB.md`
2. **Production Setup:** `PRODUCTION-CHECKLIST-NO-DB.md`
3. **API Examples:** `CURL-EXAMPLES-NO-DB.md`
4. **Learn Templates:** https://developers.facebook.com/docs/whatsapp/message-templates

---

## 💡 Pro Tips

1. **Test Mode:** Use Meta's test number first
2. **Start Small:** Begin with 10-20 contacts
3. **Monitor Logs:** Watch backend console for errors
4. **Save Templates:** Pre-approve templates in Meta dashboard
5. **Respect Limits:** Don't spam, follow WhatsApp policies

---

**Ready to broadcast? Start adding contacts!** 🚀
