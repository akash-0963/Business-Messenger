# Render Deployment Guide

This guide explains how to deploy the WhatsApp Marketing Broadcast platform on Render (both frontend and backend).

---

## **Prerequisites**

- ✅ GitHub repository (your own account)
- ✅ Render account ([Create free account](https://render.com))
- ✅ MongoDB Atlas cluster (already set up)
- ✅ WhatsApp Business Account credentials

---

## **Step 1: Connect GitHub to Render**

1. Go to **[Render Dashboard](https://dashboard.render.com/)**
2. Click **New +** → **Web Service**
3. Click **Connect account** under "GitHub"
4. Authorize Render to access your GitHub
5. Select your `whatsapp-marketing-broadcast` repository
6. Click **Connect**

---

## **Step 2: Deploy Backend Service**

1. In Render, you should see the repo connected
2. Click **Create Web Service**
3. Configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `whatsapp-api` |
   | **Environment** | `Node` |
   | **Build Command** | `cd backend && npm install && npx prisma generate` |
   | **Start Command** | `cd backend && npm run dev` |
   | **Plan** | `Free` |

4. **Add Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `WHATSAPP_PHONE_NUMBER_ID` = (your phone number ID)
   - `WHATSAPP_TOKEN` = (your WhatsApp token)
   - `DATABASE_URL` = (your MongoDB Atlas connection string)
   - `WEBHOOK_VERIFY_TOKEN` = (your webhook token)
   - `RATE_LIMIT_CONCURRENCY` = `5`
   - `RATE_LIMIT_INTERVAL` = `1000`
   - `FRONTEND_URL` = (your frontend URL after deployment)

5. Click **Create Web Service**
6. Wait for deployment (takes ~3-5 minutes)
7. You'll get a URL like: `https://whatsapp-api.onrender.com`

---

## **Step 3: Deploy Frontend Service**

1. Back in Render Dashboard, click **New +** → **Web Service** again
2. Select the same repository
3. Configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `whatsapp-ui` |
   | **Environment** | `Node` |
   | **Build Command** | `cd frontend && npm install && npm run build` |
   | **Start Command** | `cd frontend && npm run preview` |
   | **Plan** | `Free` |

4. **Add Environment Variables:**
   - `VITE_API_URL` = `https://whatsapp-api.onrender.com` (the backend URL from Step 2)
   - `VITE_DEBUG_MODE` = `false`

5. Click **Create Web Service**
6. Wait for deployment (takes ~2-3 minutes)
7. You'll get a URL like: `https://whatsapp-ui.onrender.com`

---

## **Step 4: Update Backend Frontend URL**

1. Go back to **whatsapp-api** service
2. Click **Settings** → **Environment**
3. Update `FRONTEND_URL` to your frontend URL: `https://whatsapp-ui.onrender.com`
4. Click **Save**
5. Service will redeploy automatically

---

## **Step 5: Configure WhatsApp Webhooks**

1. Go to **[Meta Developers](https://developers.facebook.com/)**
2. Go to your app → **WhatsApp** → **Configuration**
3. Update **Callback URL:**
   ```
   https://whatsapp-api.onrender.com/webhook
   ```
4. Keep **Verify Token** the same as `WEBHOOK_VERIFY_TOKEN`
5. Click **Verify and Save**

---

## **Test Deployment**

### Test Backend:
```bash
curl https://whatsapp-api.onrender.com/api/health
```

Should return: `{"success":true,"status":"healthy"}`

### Test Frontend:
Open: `https://whatsapp-ui.onrender.com`

You should see the WhatsApp broadcast UI!

---

## **Common Issues & Fixes**

### ❌ Frontend won't load
- Check `VITE_API_URL` is correct
- Check backend URL is accessible
- Check CORS settings in backend

### ❌ Backend crashes on startup
- Check MongoDB connection string
- Check all required environment variables are set
- Check Render logs for errors: **Settings** → **Logs**

### ❌ Messages not sending
- Check WhatsApp credentials are correct
- Check MongoDB IP whitelist includes Render IPs
- Check webhook configuration

### ❌ Webhook not receiving
- Check callback URL is exactly: `https://whatsapp-api.onrender.com/webhook`
- Check verify token matches
- Check Render logs for incoming requests

---

## **Monitoring & Logs**

To see logs:
1. Go to service in Render
2. Click **Logs** tab
3. View real-time logs of your deployment

---

## **Updating Deployment**

Every time you push to GitHub:
1. Render automatically detects changes
2. Runs build command
3. Redeploys service
4. No manual action needed!

Just push your code:
```bash
git push origin main
```

---

## **Costs**

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Render** | ✅ Free (sleeps after 15m inactivity) | $7/month (always on) |
| **MongoDB Atlas** | ✅ Free (512MB) | $12+/month (scaling) |
| **Total** | **$0/month** | **$19+/month** |

Free tier is perfect for testing. Pay for hosting only when ready for production.

---

## **Next Steps**

1. ✅ Push code to GitHub
2. ✅ Connect GitHub to Render
3. ✅ Deploy backend
4. ✅ Deploy frontend
5. ✅ Configure webhooks
6. ✅ Test everything
7. ✅ Share your public URL!

---

**Questions?** Check Render docs: https://render.com/docs
