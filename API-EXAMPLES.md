# API Examples - WhatsApp Broadcast Portal

This document contains cURL examples and Postman collections for testing the API endpoints.

---

## 🔗 Base URL

```
http://localhost:5000/api
```

---

## 📋 Table of Contents

- [Health Check](#health-check)
- [Validate Phone Numbers](#validate-phone-numbers)
- [Send Broadcast](#send-broadcast)
- [Error Responses](#error-responses)
- [Postman Collection](#postman-collection)

---

## 1. Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Check if the API is running and responsive.

### cURL (Windows PowerShell)

```powershell
curl http://localhost:5000/api/health
```

### cURL (Linux/Mac)

```bash
curl http://localhost:5000/api/health
```

### Expected Response

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "maxRecipients": 250
}
```

---

## 2. Validate Phone Numbers

**Endpoint:** `POST /api/validate`

**Purpose:** Check which phone numbers are registered on WhatsApp.

### cURL (Windows PowerShell)

```powershell
curl -X POST http://localhost:5000/api/validate `
  -H "Content-Type: application/json" `
  -d '{\"phones\": [\"+12025551234\", \"+919876543210\", \"+442071234567\"]}'
```

### cURL (Linux/Mac)

```bash
curl -X POST http://localhost:5000/api/validate \
  -H "Content-Type: application/json" \
  -d '{"phones": ["+12025551234", "+919876543210", "+442071234567"]}'
```

### Request Body

```json
{
  "phones": [
    "+12025551234",
    "+919876543210",
    "+442071234567"
  ]
}
```

### Expected Response (Success)

```json
{
  "success": true,
  "valid": ["+12025551234", "+919876543210"],
  "invalid": ["+442071234567"],
  "total": 3,
  "validCount": 2,
  "invalidCount": 1,
  "missingCountryCode": []
}
```

### Example: Numbers Without Country Codes

**Request:**
```json
{
  "phones": ["1234567890", "+919876543210"]
}
```

**Response:**
```json
{
  "success": true,
  "valid": ["+919876543210"],
  "invalid": [],
  "total": 2,
  "validCount": 1,
  "invalidCount": 0,
  "missingCountryCode": ["1234567890"]
}
```

---

## 3. Send Broadcast

**Endpoint:** `POST /api/send`

**Purpose:** Send a broadcast message to multiple recipients (max 250).

### cURL (Windows PowerShell)

```powershell
curl -X POST http://localhost:5000/api/send `
  -H "Content-Type: application/json" `
  -d '{\"recipients\": [\"+12025551234\", \"+919876543210\"], \"message\": \"Hello! This is a test broadcast.\"}'
```

### cURL (Linux/Mac)

```bash
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["+12025551234", "+919876543210"], "message": "Hello! This is a test broadcast."}'
```

### Request Body

```json
{
  "recipients": [
    "+12025551234",
    "+919876543210"
  ],
  "message": "Hello! This is a test broadcast message from WhatsApp Broadcast Portal."
}
```

### Expected Response (Success)

```json
{
  "success": true,
  "results": {
    "total": 2,
    "sent": 2,
    "failed": 0
  },
  "details": [
    {
      "success": true,
      "messageId": "wamid.HBgNMTIwMjU1NTEyMzQVAgA=",
      "to": "+12025551234"
    },
    {
      "success": true,
      "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwVAgA=",
      "to": "+919876543210"
    }
  ],
  "message": "Broadcast completed: 2 sent, 0 failed"
}
```

### Expected Response (Partial Success)

```json
{
  "success": true,
  "results": {
    "total": 3,
    "sent": 2,
    "failed": 1
  },
  "details": [
    {
      "success": true,
      "messageId": "wamid.HBgNMTIwMjU1NTEyMzQVAgA=",
      "to": "+12025551234"
    },
    {
      "success": false,
      "error": "Invalid phone number format",
      "to": "+999999999999"
    },
    {
      "success": true,
      "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwVAgA=",
      "to": "+919876543210"
    }
  ],
  "message": "Broadcast completed: 2 sent, 1 failed"
}
```

---

## 4. Error Responses

### Error: Recipient Limit Exceeded

**Request:**
```json
{
  "recipients": ["... 300 phone numbers ..."],
  "message": "Test"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Maximum 250 recipients allowed per broadcast. You provided 300. Please reduce the number or split into multiple sends.",
  "recipientCount": 300,
  "maxAllowed": 250
}
```

**cURL Example:**
```bash
# This will fail intentionally to show error
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["...300 numbers..."], "message": "Test"}'
```

---

### Error: Missing Recipients

**Request:**
```json
{
  "message": "Test message"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required fields: recipients and message"
}
```

---

### Error: Missing Message

**Request:**
```json
{
  "recipients": ["+12025551234"]
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required fields: recipients and message"
}
```

---

### Error: Invalid WhatsApp Token

**Response (500 Internal Server Error):**
```json
{
  "success": false,
  "message": "WhatsApp API error",
  "error": "Invalid OAuth access token"
}
```

**Solution:** Check your `WHATSAPP_TOKEN` in `.env` file.

---

### Error: Rate Limit Exceeded

**Response (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Rate limit exceeded. Please wait before making more requests.",
  "retryAfter": 60
}
```

**Solution:** Wait and retry. Consider reducing `RATE_LIMIT_CONCURRENCY` in your `.env` file.

---

### Error: Pair Rate Limit (Per-Recipient)

**Response Detail (Individual):**
```json
{
  "success": false,
  "error": "Pair rate limit hit for this recipient (Error 130429)",
  "to": "+12025551234",
  "errorCode": 130429
}
```

**Explanation:** You've sent too many messages to this specific recipient. No retry will help - wait before sending to them again.

---

## 5. Postman Collection

### Import into Postman

1. Open Postman
2. Click "Import"
3. Copy and paste this JSON:

```json
{
  "info": {
    "name": "WhatsApp Broadcast Portal API",
    "description": "API collection for WhatsApp Broadcast Portal (No Database)",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Validate Phone Numbers",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"phones\": [\n    \"+12025551234\",\n    \"+919876543210\",\n    \"+442071234567\"\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/validate",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "validate"]
        }
      }
    },
    {
      "name": "Send Broadcast",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"recipients\": [\n    \"+12025551234\",\n    \"+919876543210\"\n  ],\n  \"message\": \"Hello! This is a test broadcast message.\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/send",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "send"]
        }
      }
    },
    {
      "name": "Send Broadcast - Over Limit (Error Test)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"recipients\": [\"... add 251 phone numbers here to test limit ...\"],\n  \"message\": \"This should fail with 400 error\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/send",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "send"]
        }
      }
    }
  ]
}
```

---

## 6. Testing Scripts

### PowerShell Script - Batch Test

Save as `test-api.ps1`:

```powershell
# Test WhatsApp Broadcast Portal API

Write-Host "Testing WhatsApp Broadcast Portal API..." -ForegroundColor Cyan

# 1. Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
curl http://localhost:5000/api/health

# 2. Validate Phones
Write-Host "`n2. Testing Phone Validation..." -ForegroundColor Yellow
curl -X POST http://localhost:5000/api/validate `
  -H "Content-Type: application/json" `
  -d '{\"phones\": [\"+12025551234\", \"+919876543210\"]}'

# 3. Send Broadcast (replace with real test numbers)
Write-Host "`n3. Testing Send Broadcast..." -ForegroundColor Yellow
Write-Host "Note: Replace with real WhatsApp test numbers" -ForegroundColor Red
# curl -X POST http://localhost:5000/api/send `
#   -H "Content-Type: application/json" `
#   -d '{\"recipients\": [\"+YOUR_TEST_NUMBER\"], \"message\": \"Test broadcast\"}'

Write-Host "`nAPI Tests Complete!" -ForegroundColor Green
```

Run with:
```powershell
.\test-api.ps1
```

---

## 7. Common Use Cases

### Use Case 1: Validate a CSV of Numbers

**Step 1:** Prepare your CSV (`phones.csv`):
```csv
+12025551234
+919876543210
+442071234567
```

**Step 2:** Read and validate (PowerShell):
```powershell
$phones = Get-Content phones.csv | ConvertTo-Json
curl -X POST http://localhost:5000/api/validate `
  -H "Content-Type: application/json" `
  -d "{\"phones\": $phones}"
```

---

### Use Case 2: Send to Multiple Recipients

```bash
curl -X POST http://localhost:5000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      "+12025551234",
      "+919876543210",
      "+442071234567"
    ],
    "message": "Hello everyone! This is your scheduled update."
  }'
```

---

### Use Case 3: Test Limit Enforcement

Create a test with 251 numbers to verify 250 limit:

```powershell
# Generate 251 dummy numbers (will fail validation but tests limit)
$numbers = 1..251 | ForEach-Object { "+1202555$_" }
$json = @{
  recipients = $numbers
  message = "Test"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/send `
  -H "Content-Type: application/json" `
  -d $json
```

Expected: `400 Bad Request` with message about limit exceeded.

---

## 8. Tips & Best Practices

### 1. Always Include Country Codes
```json
✅ Good: "+12025551234"
❌ Bad:  "2025551234"
```

### 2. Validate Before Sending
Always call `/api/validate` first to check which numbers are on WhatsApp.

### 3. Handle Errors Gracefully
Check the `success` field in responses and handle failures appropriately.

### 4. Respect Rate Limits
If you get 429 errors, reduce sending frequency.

### 5. Monitor Results
Check the `details` array in `/api/send` response to see individual failures.

---

**Happy Broadcasting! 📱✨**
