# Production Deployment Checklist

Complete guide to deploying WhatsApp Broadcast Portal to production.

---

## 🔐 Security Checklist

### Environment Variables
- [ ] Use permanent ACCESS_TOKEN (not temporary)
- [ ] Store tokens in secure environment (not in code)
- [ ] Enable NODE_ENV=production
- [ ] Use HTTPS for all endpoints
- [ ] Rotate tokens every 90 days

### Backend Security
- [ ] Add rate limiting middleware
- [ ] Implement authentication (if multi-user)
- [ ] Sanitize all inputs
- [ ] Enable CORS only for your domain
- [ ] Add request logging
- [ ] Set up error monitoring (Sentry, etc.)

### Frontend Security
- [ ] Build with `npm run build`
- [ ] Never expose API tokens
- [ ] Use environment variables for API URL
- [ ] Enable HTTPS
- [ ] Add CSP headers

---

## 📋 WhatsApp Business Verification

### 1. Get Business Account Verified
- Go to Meta Business Manager
- Submit business verification documents
- Verify your phone number
- Get official Business Account status

### 2. Message Template Approval
- Create templates in Meta dashboard
- Submit for approval (takes 24-48 hours)
- Use approved templates only
- Keep templates updated

### 3. Messaging Limits
- **Tier 1:** 1,000 conversations/day (new accounts)
- **Tier 2:** 10,000/day (after consistent quality)
- **Tier 3:** 100,000/day (verified businesses)
- **Tier 4:** Unlimited (enterprise)

---

## 🚀 Deployment Steps

### Backend Deployment

**Option 1: VPS (Digital Ocean, AWS EC2, etc.)**

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone your repo
git clone https://your-repo.git
cd whatsapp-marketing-broadcast/no-db-backend

# 4. Install dependencies
npm install --production

# 5. Create production .env
nano .env
# Add production credentials

# 6. Install PM2 for process management
sudo npm install -g pm2

# 7. Start with PM2
pm2 start server.js --name whatsapp-backend
pm2 startup
pm2 save

# 8. Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/whatsapp-api
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/whatsapp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

**Option 2: Heroku**

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create whatsapp-broadcast-api

# 4. Set environment variables
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_id
heroku config:set WHATSAPP_TOKEN=your_token
heroku config:set NODE_ENV=production

# 5. Deploy
git push heroku main

# 6. Open app
heroku open
```

### Frontend Deployment

**Build for Production:**

```bash
cd frontend

# Update API URL in .env
echo "VITE_API_URL=https://api.yourdomain.com/api" > .env.production

# Build
npm run build
# Creates /dist folder
```

**Option 1: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Option 2: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option 3: Nginx (Same server as backend)**

```bash
# Copy build files
sudo cp -r dist/* /var/www/whatsapp-frontend/

# Nginx config
sudo nano /etc/nginx/sites-available/whatsapp-frontend
```

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    root /var/www/whatsapp-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL
sudo certbot --nginx -d app.yourdomain.com
```

---

## ⚙️ Production Environment Variables

### Backend (.env)

```env
# WhatsApp API
WHATSAPP_PHONE_NUMBER_ID=your_verified_phone_id
WHATSAPP_TOKEN=your_permanent_access_token
GRAPH_API_VERSION=v17.0

# Server
PORT=3000
NODE_ENV=production

# Rate Limiting (conservative for production)
RATE_LIMIT_CONCURRENCY=3
RATE_LIMIT_INTERVAL=1500

# Optional: Monitoring
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=error
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 📊 Monitoring & Logging

### Setup Error Tracking

**Sentry (Recommended):**

```bash
npm install @sentry/node
```

In `server.js`:
```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

### PM2 Monitoring

```bash
# View logs
pm2 logs whatsapp-backend

# Monitor performance
pm2 monit

# Web dashboard
pm2 install pm2-logrotate
```

### Analytics
- Track message delivery rates
- Monitor API response times
- Log validation success/failure
- Track user activity

---

## 🔄 Backup & Recovery

### No Database = Minimal Backups

Since this is stateless:
- **Environment variables:** Keep secure backup of `.env`
- **Code:** Use Git for version control
- **Logs:** Rotate and archive logs regularly

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🧪 Testing Before Launch

### 1. Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test endpoint
ab -n 100 -c 10 https://api.yourdomain.com/health
```

### 2. Security Scan

```bash
# Install OWASP ZAP or use online tools
# Scan your API endpoints
```

### 3. Functional Testing

- [ ] Validate 10+ random numbers
- [ ] Send test broadcast to 5 numbers
- [ ] Test all country codes
- [ ] Try invalid inputs
- [ ] Test 250 recipient limit
- [ ] Verify error handling

---

## 📱 WhatsApp Business Compliance

### Required Elements

1. **Opt-In Mechanism**
   - Checkbox on website
   - SMS confirmation
   - Double opt-in email
   - Record consent timestamp

2. **Opt-Out Option**
   - Include in every message
   - Example: "Reply STOP to unsubscribe"
   - Honor immediately

3. **Message Content Rules**
   - No misleading information
   - Clear sender identification
   - No prohibited content (spam, adult, etc.)
   - Include business name

4. **Frequency**
   - Max 1 message/day per user (recommended)
   - Never exceed 24-hour window without template
   - Respect quiet hours

### Message Template Format

```
[APPROVED TEMPLATE: hello_world]

Hello {{1}},

Welcome to [Your Business]!

Thanks for subscribing to our updates.

Reply STOP to unsubscribe.
```

---

## 🚨 Emergency Procedures

### If Token Compromised
1. Immediately revoke in Meta dashboard
2. Generate new token
3. Update environment variables
4. Restart services
5. Audit recent activity

### If Banned by WhatsApp
1. Appeal through Meta Business Support
2. Review all recent messages
3. Ensure compliance
4. Provide opt-in records

### If Server Down
1. Check PM2 status: `pm2 status`
2. View logs: `pm2 logs`
3. Restart: `pm2 restart whatsapp-backend`
4. Check system resources: `htop`

---

## 📈 Scaling Considerations

### Horizontal Scaling

Since no database:
- Can run multiple backend instances
- Use load balancer (Nginx, HAProxy)
- Each instance independent
- No state synchronization needed

### Vertical Scaling

- Increase server resources
- Adjust `RATE_LIMIT_CONCURRENCY`
- Monitor API quotas

### WhatsApp Limits

- Request tier increase from Meta
- Maintain >95% delivery rate
- Keep quality score high
- Avoid spam reports

---

## ✅ Pre-Launch Checklist

### Technical
- [ ] SSL certificates installed
- [ ] Environment variables set
- [ ] PM2 configured and running
- [ ] Nginx configured
- [ ] Logs rotating
- [ ] Monitoring enabled
- [ ] Error tracking active

### WhatsApp
- [ ] Business account verified
- [ ] Phone number verified
- [ ] Templates approved
- [ ] Messaging limit sufficient
- [ ] Test messages sent successfully

### Legal & Compliance
- [ ] Privacy policy updated
- [ ] Terms of service include WhatsApp usage
- [ ] Opt-in mechanism tested
- [ ] Opt-out process functional
- [ ] Data retention policy defined

### Documentation
- [ ] API documentation for team
- [ ] User guide created
- [ ] Support process defined
- [ ] Emergency contacts listed

---

## 🎉 Launch Day

1. **Start Small:** 50-100 recipients first day
2. **Monitor Closely:** Watch logs and delivery rates
3. **Respond Quickly:** Handle opt-outs immediately
4. **Gather Feedback:** Ask users about experience
5. **Scale Gradually:** Increase volume over weeks

---

## 📞 Support Resources

- **Meta Business Support:** https://business.facebook.com/help
- **WhatsApp API Docs:** https://developers.facebook.com/docs/whatsapp
- **Cloud API Updates:** https://developers.facebook.com/docs/graph-api/changelog

---

**Ready for production? Follow this checklist carefully!** ✅
