# Quick Start - WhatsApp Broadcast Portal

Get up and running in 5 minutes!

---

## 🎯 What You'll Need

1. Node.js v18+ installed
2. WhatsApp Business API credentials (from Meta)
3. 10 minutes of your time

---

## 🚀 Step-by-Step Setup

### 1️⃣ Get WhatsApp API Credentials (5 min)

**Go to:** [Meta for Developers](https://developers.facebook.com/)

1. Click **"My Apps"** → **"Create App"**
2. Choose **"Business"** type
3. Fill in app details
4. Add **WhatsApp** product
5. Go to **WhatsApp → Getting Started**
6. Copy these two values:

```
Phone Number ID: 123456789012345
Temporary Access Token: EAAxxxxxxxxxxxx
```

**Add test numbers:**
- Click "Add phone number" under "Send and receive messages"
- Enter your phone number (with country code)
- Verify via SMS

---

### 2️⃣ Install Backend (2 min)

Open PowerShell and run:

```powershell
cd "c:\Users\Skill\Desktop\whatsapp campain\backend-simple"
npm install
```

---

### 3️⃣ Configure Backend (1 min)

```powershell
copy .env.example .env
notepad .env
```

**Edit `.env` and paste your credentials:**

```env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_TOKEN=EAAxxxxxxxxxxxx
GRAPH_API_VERSION=v17.0
PORT=5000
```

Save and close.

---

### 4️⃣ Install Frontend (2 min)

Open another PowerShell window:

```powershell
cd "c:\Users\Skill\Desktop\whatsapp campain\frontend-simple"
npm install
```

---

### 5️⃣ Start Everything (30 sec)

**Terminal 1 (Backend):**
```powershell
cd backend-simple
npm start
```

**Terminal 2 (Frontend):**
```powershell
cd frontend-simple
npm run dev
```

---

### 6️⃣ Open Browser

Navigate to: **http://localhost:5173**

---

## ✅ First Test

### Upload Sample Contacts

1. Click **"Choose File"**
2. Select `backend-simple/sample-contacts.csv`
3. Click **"✓ Validate Contacts"**
4. Select the contacts that show "✓ Valid"
5. Type a message
6. Click **"📤 Send Broadcast"**

**Note:** Sample contacts are dummy numbers. Replace with real WhatsApp numbers added to your test recipients list.

---

## 🎓 Next Steps

### Add Your Own Test Numbers

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Navigate to: Your App → WhatsApp → Getting Started
3. Under "Send and receive messages", click **"Add phone number"**
4. Enter your phone number with country code (e.g., `+1234567890`)
5. Verify via SMS code
6. Now you can send test messages to this number!

### Test the Full Flow

1. **Add Numbers:** Upload CSV or paste your test numbers
2. **Validate:** Click "✓ Validate Contacts"
3. **Select:** Choose which numbers to send to
4. **Compose:** Write your message
5. **Send:** Click "📤 Send Broadcast"
6. **Check:** Look at your phone for the WhatsApp message!

---

## ⚠️ Important Limits

- **Max Recipients:** 250 per broadcast
- **Test Numbers:** Limited to numbers you've added in Meta Console
- **Production:** Requires business verification and message templates

---

## 🐛 Troubleshooting

### "Invalid access token"
→ Check `WHATSAPP_TOKEN` in `.env` file  
→ Generate new token if expired (24 hours)

### "Invalid phone number ID"
→ Check `WHATSAPP_PHONE_NUMBER_ID` in `.env` file  
→ Copy from Meta Console → WhatsApp → API Setup

### Numbers not validating
→ Ensure numbers have country codes (e.g., `+1234567890`)  
→ For testing, add numbers to test recipients in Meta Console

### Frontend can't connect
→ Make sure backend is running on port 5000  
→ Check browser console for errors

---

## 📚 Full Documentation

- **Complete Setup:** See `README-SIMPLE.md`
- **API Examples:** See `API-EXAMPLES.md`
- **Production:** See `PRODUCTION-CHECKLIST.md`

---

## 🎉 That's It!

You now have a working WhatsApp Broadcast Portal!

**Questions?** Check the full README or Meta's documentation.

**Happy Broadcasting! 📱✨**
