# 📋 Production Deployment Checklist

Use this checklist before deploying your WhatsApp Broadcast Portal to production.

---

## ✅ 1. WhatsApp Business API Setup

### 1.1 Business Verification
- [ ] Meta Business account verified
- [ ] Business information complete and accurate
- [ ] Business documents submitted and approved
- [ ] Phone number ownership verified

### 1.2 Message Templates
- [ ] Created message templates for all broadcast scenarios
- [ ] Templates submitted to Meta for approval
- [ ] Approval received (can take 24-48 hours)
- [ ] Template IDs documented for reference
- [ ] Placeholder parameters documented

**Note:** Templates are REQUIRED for:
- Messages outside the 24-hour customer care window
- Cold messaging to new contacts
- Marketing/promotional content

**Resources:**
- [Create Message Templates](https://business.facebook.com/wa/manage/message-templates/)
- [Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)

### 1.3 Phone Number Configuration
- [ ] Production phone number registered with WhatsApp
- [ ] Display name configured
- [ ] Profile picture uploaded
- [ ] Business description added
- [ ] Business category selected

---

## ✅ 2. Compliance & Legal

### 2.1 Opt-In Mechanism
- [ ] **Clear opt-in process implemented** (checkbox, form, etc.)
- [ ] Opt-in language is clear and specific
- [ ] Opt-in records stored with timestamps
- [ ] Double opt-in considered for sensitive content
- [ ] Proof of consent available on request

**Example Opt-In Language:**
> "I agree to receive WhatsApp messages from [Your Business] including updates, promotions, and notifications."

### 2.2 Opt-Out Mechanism
- [ ] **Easy opt-out method available** (reply "STOP", link, etc.)
- [ ] Opt-out requests processed immediately
- [ ] Opted-out users added to suppression list
- [ ] Confirmation message sent after opt-out

**Example Opt-Out Message:**
> "Reply STOP to unsubscribe from these messages."

### 2.3 Privacy & Data Protection
- [ ] Privacy policy updated to mention WhatsApp messaging
- [ ] GDPR compliance reviewed (if applicable)
- [ ] Data retention policy defined
- [ ] User data deletion process implemented
- [ ] Data export capability for user requests

### 2.4 WhatsApp Business Policy Compliance
- [ ] Read [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [ ] No spam or unsolicited messages
- [ ] No prohibited content (adult, weapons, etc.)
- [ ] Accurate business representation
- [ ] Respect user privacy and preferences

---

## ✅ 3. Security Hardening

### 3.1 Access Tokens
- [ ] **Temporary token replaced with permanent System User token**
- [ ] Token stored in environment variables (never in code)
- [ ] Token rotation schedule established
- [ ] Access logs monitored for unauthorized use
- [ ] Token permissions scoped to minimum required

**Generate Permanent Token:**
1. Meta Business Settings → System Users
2. Create System User
3. Assign WhatsApp permissions
4. Generate token and save securely

### 3.2 Environment Variables
- [ ] `.env` file never committed to version control
- [ ] `.gitignore` includes `.env`
- [ ] Use secrets manager in production (Azure Key Vault, AWS Secrets Manager, etc.)
- [ ] Environment variables validated on startup
- [ ] Sensitive data encrypted at rest

### 3.3 API Security
- [ ] **Authentication added to portal** (login required)
- [ ] Role-based access control (RBAC) implemented
- [ ] API rate limiting configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (N/A for no-database version)
- [ ] XSS protection enabled
- [ ] CORS configured for production domains only

**Add Authentication Example (Express):**
```javascript
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));

// Middleware
function requireAuth(req, res, next) {
  if (req.session.user) next();
  else res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/send', requireAuth, async (req, res) => {
  // ...
});
```

### 3.4 HTTPS/TLS
- [ ] SSL certificate installed
- [ ] HTTP redirects to HTTPS
- [ ] Certificate auto-renewal configured
- [ ] Strong TLS version enforced (TLS 1.2+)
- [ ] Mixed content warnings resolved

---

## ✅ 4. Rate Limiting & Messaging Tier

### 4.1 Understand Your Tier

WhatsApp assigns messaging tiers based on phone number quality:

| Tier | Daily Limit | How to Advance |
|------|-------------|----------------|
| Tier 1 | 1,000 conversations | Good quality messages |
| Tier 2 | 10,000 conversations | Maintain quality |
| Tier 3 | 100,000 conversations | Maintain quality |
| Tier 4 | Unlimited | Maintain quality |

**Check Your Tier:**
- Meta Business Manager → WhatsApp Manager → Phone Numbers → Insights

### 4.2 Configure Rate Limits
- [ ] Identify your current tier limit
- [ ] Configure `RATE_LIMIT_CONCURRENCY` appropriately
- [ ] Configure `RATE_LIMIT_INTERVAL` based on tier
- [ ] Monitor for 429 rate limit errors
- [ ] Set up alerts for approaching limits

**Recommended Settings by Tier:**

```env
# Tier 1 (1,000/day)
RATE_LIMIT_CONCURRENCY=3
RATE_LIMIT_INTERVAL=2000

# Tier 2 (10,000/day)
RATE_LIMIT_CONCURRENCY=5
RATE_LIMIT_INTERVAL=1000

# Tier 3+ (100,000+/day)
RATE_LIMIT_CONCURRENCY=10
RATE_LIMIT_INTERVAL=500
```

### 4.3 Quality Monitoring
- [ ] Track message delivery rates
- [ ] Monitor block/report rates (keep under 0.5%)
- [ ] Respond to user messages promptly
- [ ] Avoid spam complaints

**Quality Score Factors:**
- User blocks/reports
- Message delivery success
- Opt-in/opt-out rates
- User engagement

---

## ✅ 5. Error Handling & Monitoring

### 5.1 Logging
- [ ] Structured logging implemented
- [ ] Log levels configured (debug, info, warn, error)
- [ ] Failed messages logged with details
- [ ] API errors logged with stack traces
- [ ] Logs centralized (CloudWatch, Datadog, etc.)

**Add Logging Example:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log failed messages
logger.error('Message send failed', {
  to: recipient,
  error: error.message,
  timestamp: new Date()
});
```

### 5.2 Error Monitoring
- [ ] Error tracking service integrated (Sentry, Rollbar, etc.)
- [ ] Critical errors trigger alerts
- [ ] On-call rotation established
- [ ] Runbooks created for common errors

### 5.3 Specific Error Handling
- [ ] **130429 (Pair Rate Limit):** Skip and log, don't retry
- [ ] **429 (Rate Limit):** Exponential backoff implemented
- [ ] **Invalid Token:** Alert and stop sending
- [ ] **24-Hour Window:** Use templates automatically
- [ ] **Network Errors:** Retry with backoff

---

## ✅ 6. Infrastructure & Deployment

### 6.1 Hosting
- [ ] Production server provisioned
- [ ] Auto-scaling configured (if needed)
- [ ] Load balancer configured (if multiple instances)
- [ ] Static IP or domain assigned
- [ ] Firewall rules configured

### 6.2 Database (If Added Later)
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Connection pooling configured
- [ ] Indexes optimized
- [ ] Data retention policy enforced

### 6.3 CI/CD Pipeline
- [ ] Automated tests written
- [ ] Deployment pipeline configured
- [ ] Staging environment set up
- [ ] Rollback procedure documented
- [ ] Zero-downtime deployment strategy

### 6.4 Monitoring
- [ ] Uptime monitoring (Pingdom, UptimeRobot, etc.)
- [ ] Server resource monitoring (CPU, memory, disk)
- [ ] API endpoint health checks
- [ ] Performance metrics tracked
- [ ] Alerting configured

---

## ✅ 7. Performance Optimization

### 7.1 Backend
- [ ] Caching strategy implemented (if needed)
- [ ] API request batching optimized
- [ ] Database queries optimized (if database added)
- [ ] Compression enabled (gzip)
- [ ] Keep-alive connections configured

### 7.2 Frontend
- [ ] Code minified and bundled
- [ ] Assets compressed
- [ ] CDN configured for static files
- [ ] Lazy loading implemented
- [ ] Browser caching configured

---

## ✅ 8. User Experience

### 8.1 UI/UX
- [ ] Error messages are user-friendly
- [ ] Loading states for all async operations
- [ ] Success confirmations clear
- [ ] Mobile-responsive design tested
- [ ] Accessibility (a11y) reviewed

### 8.2 Documentation
- [ ] User guide created
- [ ] FAQ documented
- [ ] Video tutorials (optional)
- [ ] Support contact information provided

---

## ✅ 9. Testing

### 9.1 Functional Testing
- [ ] All API endpoints tested
- [ ] Edge cases tested (empty input, max limits, etc.)
- [ ] Error scenarios tested
- [ ] File upload tested (CSV/TXT)
- [ ] Phone validation tested with various formats

### 9.2 Load Testing
- [ ] Tested with 250 recipients
- [ ] Tested concurrent requests
- [ ] Memory usage monitored under load
- [ ] API response times acceptable

### 9.3 Security Testing
- [ ] Penetration testing conducted
- [ ] OWASP Top 10 vulnerabilities checked
- [ ] Dependency vulnerabilities scanned (`npm audit`)
- [ ] Secrets not exposed in client code

---

## ✅ 10. Launch Preparation

### 10.1 Pre-Launch
- [ ] Soft launch with small user group
- [ ] Monitor for issues during soft launch
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Performance baseline established

### 10.2 Launch Day
- [ ] All team members notified
- [ ] Monitoring dashboards open
- [ ] Support team ready
- [ ] Rollback plan ready
- [ ] Communication plan ready (if issues occur)

### 10.3 Post-Launch
- [ ] Monitor error rates closely (first 24-48 hours)
- [ ] Track user feedback
- [ ] Review performance metrics
- [ ] Plan iterative improvements
- [ ] Celebrate success! 🎉

---

## 📊 Metrics to Track

### Key Performance Indicators (KPIs)
- **Delivery Rate:** % of messages successfully delivered
- **Response Rate:** % of recipients who respond
- **Opt-Out Rate:** % of users who unsubscribe (keep under 1%)
- **Block/Report Rate:** % of users who block/report (keep under 0.5%)
- **API Error Rate:** % of API calls that fail
- **Average Response Time:** Time to send 250 messages

### WhatsApp-Specific Metrics
- **Quality Rating:** Green (good), Yellow (medium), Red (poor)
- **Messaging Tier:** Current tier and progress to next
- **24-Hour Window Usage:** % of messages within window
- **Template Approval Rate:** % of templates approved

---

## 🚨 Red Flags - Stop Sending If:

- [ ] Quality rating drops to Yellow or Red
- [ ] Block/report rate exceeds 1%
- [ ] Delivery rate drops below 90%
- [ ] Receiving 429 errors frequently
- [ ] Users complaining about spam
- [ ] Meta sends policy violation warning

**Action:** Pause sending, investigate root cause, fix issues, then resume.

---

## 📞 Support Contacts

- **WhatsApp Business Support:** [Business Help Center](https://business.whatsapp.com/support)
- **Meta Developer Support:** [Developer Community](https://developers.facebook.com/community/)
- **Emergency Escalation:** Define internal contact for critical issues

---

## 📝 Sign-Off

### Deployment Approval

- [ ] Technical Lead Approval: _________________ Date: _______
- [ ] Security Review Approval: _________________ Date: _______
- [ ] Legal/Compliance Approval: _________________ Date: _______
- [ ] Product Owner Approval: _________________ Date: _______

---

**Ready for Production! 🚀**

*Remember: Start slow, monitor closely, scale gradually.*
