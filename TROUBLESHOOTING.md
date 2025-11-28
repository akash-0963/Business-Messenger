# Troubleshooting Guide

## Common Issues & Solutions

### Installation Issues

#### Issue: npm install fails
```
Error: EACCES: permission denied
```

**Solution:**
```powershell
# Run PowerShell as Administrator
# Or clear npm cache
npm cache clean --force
npm install
```

---

#### Issue: Prisma Client not generated
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```powershell
cd backend
npx prisma generate
```

---

### Database Issues

#### Issue: Can't connect to PostgreSQL
```
Error: Can't reach database server at localhost:5432
```

**Solutions:**
1. Check if PostgreSQL is running:
```powershell
# Check service status
Get-Service -Name postgresql*
```

2. Verify PostgreSQL credentials in `.env`:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/whatsapp_portal"
```

3. Test connection manually:
```powershell
psql -U postgres -d whatsapp_portal
```

---

#### Issue: Database doesn't exist
```
Error: Database 'whatsapp_portal' does not exist
```

**Solution:**
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE whatsapp_portal;"
```

---

#### Issue: Prisma migration failed
```
Error: Migration failed to apply
```

**Solutions:**
```powershell
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE whatsapp_portal;"
psql -U postgres -c "CREATE DATABASE whatsapp_portal;"
npx prisma migrate dev --name init
```

---

### WhatsApp API Issues

#### Issue: Invalid Phone Number ID
```
Error: (#100) Invalid phone number ID
```

**Solutions:**
1. Verify Phone Number ID in Meta Dashboard
2. Update `.env`:
```env
WHATSAPP_PHONE_NUMBER_ID=your_correct_phone_number_id
```

3. Restart backend server after updating `.env`

---

#### Issue: Invalid Access Token
```
Error: Invalid OAuth access token
```

**Solutions:**
1. Generate new token from Meta Dashboard:
   - Go to WhatsApp > Getting Started
   - Copy the new temporary token
   
2. For production, create permanent token:
   - WhatsApp > Configuration
   - System User > Generate Token

3. Update `.env`:
```env
WHATSAPP_TOKEN=your_new_token
```

---

#### Issue: Message not delivered
```
Error: Message failed to send
```

**Common Causes & Solutions:**

1. **Recipient not in test numbers** (Test Mode)
   - Add recipient in Meta Dashboard
   - WhatsApp > API Setup > "To" field
   - Verify via SMS/call

2. **Outside 24-hour window**
   - Use template messages
   - Submit template for approval
   - Wait 24-48 hours for review

3. **Invalid phone number format**
   - Ensure format: +[country_code][number]
   - Example: +919876543210
   - No spaces or special characters

4. **Recipient blocked your number**
   - Try different test number
   - Check spam/block status

---

#### Issue: Rate limit exceeded
```
Error: (#4) Application request limit reached
```

**Solutions:**
1. Reduce sending rate in `.env`:
```env
RATE_LIMIT_CONCURRENCY=3        # Lower from 5
RATE_LIMIT_INTERVAL=2000        # Increase from 1000
```

2. Wait 5-10 minutes before retrying

3. For production, request higher limits from Meta

---

### Frontend Issues

#### Issue: Frontend can't connect to backend
```
Error: Network Error
Error: Request failed with status code 404
```

**Solutions:**
1. Ensure backend is running:
```powershell
cd backend
npm run dev
# Should show: Server running on port 5000
```

2. Check frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Restart frontend after `.env` changes:
```powershell
# Stop frontend (Ctrl+C)
npm run dev
```

4. Check CORS in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

---

#### Issue: File upload not working
```
Error: Please upload a CSV or TXT file
```

**Solutions:**
1. Verify file format:
   - Only `.csv` or `.txt` files supported
   - One phone number per line

2. Check file content:
```
9876543210
9999888877
+919888777666
```

3. Try sample files:
   - Use `sample-contacts.csv`
   - Use `sample-contacts.txt`

---

#### Issue: Contacts not showing after upload
**Check browser console for errors:**
```
Press F12 → Console tab
```

**Common fixes:**
- Refresh page (F5)
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser

---

### Server Issues

#### Issue: Port already in use
```
Error: Port 5000 is already in use
```

**Solutions:**
1. Find and kill process using port:
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

2. Or change port in `backend/.env`:
```env
PORT=5001
```

And update frontend `.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

#### Issue: Server crashes immediately
**Check for errors:**
```powershell
cd backend
npm run dev
# Read error message
```

**Common causes:**
1. Missing `.env` file → Create from `.env.example`
2. Invalid DATABASE_URL → Check PostgreSQL credentials
3. Missing dependencies → Run `npm install`
4. Syntax errors → Check recent code changes

---

### Validation Issues

#### Issue: All numbers showing as invalid
**Possible causes:**
1. **WhatsApp API credentials incorrect**
   - Verify Phone Number ID
   - Verify Access Token
   - Check API version

2. **Test numbers not added** (Test Mode)
   - Add numbers in Meta Dashboard
   - Verify each number

3. **API rate limit hit**
   - Wait 5 minutes
   - Try with fewer numbers

**Debug steps:**
```powershell
# Check backend logs for actual error
# Look for "WhatsApp validation error:"
```

---

#### Issue: Some numbers valid, some invalid
**This is normal!**
- Invalid numbers are not on WhatsApp
- Or phone numbers are incorrectly formatted
- Double-check the phone numbers

---

### Send Issues

#### Issue: Broadcast not starting
**Solutions:**
1. Ensure contacts are validated first
2. Check message is not empty
3. Verify backend is running
4. Check Activity Log for errors

---

#### Issue: Some messages sent, some failed
**This is expected behavior.**

**Common failure reasons:**
- Network timeouts
- Recipient blocked number
- Temporary WhatsApp API issues
- Invalid message content

**Check Activity Log for specific errors**

---

## Debugging Tips

### Enable Detailed Logging

**Backend:**
Add to `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Frontend:**
Add to API calls:
```javascript
console.log('Request:', url, data);
console.log('Response:', response);
```

---

### Check Database Content

```powershell
cd backend
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

### Test WhatsApp API Directly

```powershell
# Using curl (install from https://curl.se/)
curl -X POST https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"messaging_product":"whatsapp","to":"919876543210","type":"text","text":{"body":"Test"}}'
```

---

### Reset Everything

**Complete reset:**
```powershell
# Stop all servers

# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install
npx prisma migrate reset
npx prisma generate

# Frontend
cd ../frontend
Remove-Item -Recurse -Force node_modules
npm install

# Restart servers
```

---

## Getting Help

**Before asking for help, collect:**
1. Error message (full text)
2. Backend console output
3. Frontend browser console (F12)
4. Database status (`npx prisma studio`)
5. Environment setup:
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - PostgreSQL version: `psql --version`

**Resources:**
- WhatsApp Cloud API Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
- Prisma Docs: https://www.prisma.io/docs
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

---

## Prevention Tips

✅ **Best Practices:**
1. Always test with small batches first (5-10 contacts)
2. Keep temporary access tokens updated
3. Monitor rate limits
4. Validate regularly
5. Keep logs for debugging
6. Backup database before major changes
7. Use version control (Git)
8. Document custom changes

---

**Still having issues?** Check the main README.md for detailed setup instructions.
