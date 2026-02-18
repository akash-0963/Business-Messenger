# cURL API Examples - WhatsApp Broadcast Portal

Complete collection of cURL commands for testing the WhatsApp Broadcast API.

---

## 🔧 Setup

Replace these values in all examples:
```bash
API_URL="http://localhost:3000"
PHONE_ID="your_phone_number_id"
ACCESS_TOKEN="your_whatsapp_access_token"
```

---

## 📋 Health Check

### Check if backend is running

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-28T10:30:00.000Z",
  "uptime": 1234.56,
  "environment": "development"
}
```

---

## ✅ Validate Phone Numbers

### Single Number

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "phones": ["+919876543210"]
  }'
```

### Multiple Numbers (Mixed Formats)

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "phones": [
      "+919876543210",
      "+14155552671",
      "+971501234567",
      "+447700900123"
    ]
  }'
```

### With Local Numbers (No Country Code)

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "phones": [
      "9876543210",
      "9123456789"
    ]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "validNumbers": ["+919876543210", "+919123456789"],
  "invalidNumbers": [],
  "total": 2,
  "valid": 2,
  "invalid": 0
}
```

**Error Response (>250 numbers):**
```json
{
  "success": false,
  "message": "Maximum 250 recipients allowed. You provided 300 numbers."
}
```

---

## 📤 Send Broadcast Messages

### Text Message - Single Recipient

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": "Hello! This is a test message from WhatsApp Broadcast Portal."
  }'
```

### Text Message - Multiple Recipients

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      "+919876543210",
      "+14155552671",
      "+971501234567"
    ],
    "message": "🎉 Special Offer! Get 20% off on all products today. Visit: https://example.com"
  }'
```

### Template Message

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "isTemplate": true,
    "templateName": "hello_world",
    "languageCode": "en"
  }'
```

### Template with Parameters

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "isTemplate": true,
    "templateName": "order_confirmation",
    "languageCode": "en",
    "templateParams": ["John Doe", "12345", "$99.99"]
  }'
```

**Success Response:**
```json
{
  "success": true,
  "results": {
    "total": 3,
    "sent": 3,
    "failed": 0
  },
  "details": [
    {
      "recipient": "+919876543210",
      "status": "sent",
      "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwFQIAERgSMzNDOTcxQzQwRkYxMjNCRDQ3AA==",
      "timestamp": "2025-11-28T10:30:00.000Z"
    },
    {
      "recipient": "+14155552671",
      "status": "sent",
      "messageId": "wamid.HBgNMTQxNTU1NTI2NzEVAgARGBIzM0Q5NzFDNDBGRjEyM0JENDA3AA==",
      "timestamp": "2025-11-28T10:30:01.000Z"
    },
    {
      "recipient": "+971501234567",
      "status": "sent",
      "messageId": "wamid.HBgNOTcxNTAxMjM0NTY3FQIAERgSMzNFOTcxQzQwRkYxMjNCRDA4AA==",
      "timestamp": "2025-11-28T10:30:02.000Z"
    }
  ]
}
```

**Partial Failure Response:**
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
      "recipient": "+919876543210",
      "status": "sent",
      "messageId": "wamid.xxx",
      "timestamp": "2025-11-28T10:30:00.000Z"
    },
    {
      "recipient": "+14155552671",
      "status": "failed",
      "error": "Phone number not registered on WhatsApp",
      "timestamp": "2025-11-28T10:30:01.000Z"
    },
    {
      "recipient": "+971501234567",
      "status": "sent",
      "messageId": "wamid.yyy",
      "timestamp": "2025-11-28T10:30:02.000Z"
    }
  ]
}
```

---

## 🚨 Error Cases

### Missing Recipients

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello World"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Please provide an array of recipient phone numbers"
}
```

### Exceeding 250 Limit

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["<251 phone numbers here>"],
    "message": "Bulk message"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Maximum 250 recipients allowed. You provided 251 numbers."
}
```

### Empty Message

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": ""
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Please provide a message to send"
}
```

### Missing Template Name

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "isTemplate": true
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Template name is required when using template messages"
}
```

---

## 🌐 Direct WhatsApp API Calls

### Send Message (Direct to WhatsApp)

```bash
curl -X POST \
  "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": "919876543210",
    "type": "text",
    "text": {
      "preview_url": false,
      "body": "Hello from WhatsApp Cloud API!"
    }
  }'
```

### Validate Contacts (Direct to WhatsApp)

```bash
curl -X POST \
  "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/contacts" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blocking": "wait",
    "contacts": ["+919876543210", "+14155552671"]
  }'
```

**Response:**
```json
{
  "contacts": [
    {
      "input": "+919876543210",
      "status": "valid",
      "wa_id": "919876543210"
    },
    {
      "input": "+14155552671",
      "status": "invalid"
    }
  ]
}
```

### Send Template Message (Direct)

```bash
curl -X POST \
  "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "919876543210",
    "type": "template",
    "template": {
      "name": "hello_world",
      "language": {
        "code": "en"
      }
    }
  }'
```

---

## 📊 Batch Testing

### Validate 50 Numbers at Once

```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d @test-numbers.json
```

**test-numbers.json:**
```json
{
  "phones": [
    "+919876543210",
    "+919123456789",
    "+919999888877",
    "... 47 more numbers ..."
  ]
}
```

### Send to 250 Recipients (Max Limit)

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d @broadcast-250.json
```

**broadcast-250.json:**
```json
{
  "recipients": [
    "+919876543210",
    "+919123456789",
    "... 248 more numbers ..."
  ],
  "message": "Important announcement for all subscribers!"
}
```

---

## 🔍 Debug & Testing

### Verbose Output

```bash
curl -v -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": "Test message"
  }'
```

### Save Response to File

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": "Test message"
  }' \
  -o response.json
```

### Timing Information

```bash
curl -w "\nTime: %{time_total}s\n" \
  -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": "Test message"
  }'
```

---

## 🧪 Load Testing

### Apache Bench (Simple)

```bash
# Install
sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/health
```

### Hey (Go-based tool)

```bash
# Install
go install github.com/rakyll/hey@latest

# Test API
hey -n 100 -c 10 -m POST \
  -H "Content-Type: application/json" \
  -d '{"phones":["+919876543210"]}' \
  http://localhost:3000/api/validate
```

---

## 📝 Scripts for Automation

### Bash Script: Send to CSV List

```bash
#!/bin/bash
# send-broadcast.sh

API_URL="http://localhost:3000/api/send"
MESSAGE="Your promotional message here"

# Read phone numbers from CSV
PHONES=$(cat contacts.csv | tail -n +2 | cut -d',' -f2 | jq -R -s -c 'split("\n")[:-1]')

# Send broadcast
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"recipients\": $PHONES,
    \"message\": \"$MESSAGE\"
  }"
```

### Python Script: Batch Processing

```python
#!/usr/bin/env python3
import requests
import json

API_URL = "http://localhost:3000/api/send"

def send_batch(recipients, message):
    response = requests.post(
        API_URL,
        json={
            "recipients": recipients,
            "message": message
        }
    )
    return response.json()

# Read from file
with open('contacts.txt') as f:
    numbers = [line.strip() for line in f if line.strip()]

# Send in batches of 250
for i in range(0, len(numbers), 250):
    batch = numbers[i:i+250]
    result = send_batch(batch, "Hello from Python!")
    print(f"Batch {i//250 + 1}: {result['results']}")
```

---

## 🔐 Authentication Examples

### If you add JWT auth later

```bash
# Login first
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret"}' \
  | jq -r '.token')

# Use token in requests
curl -X POST http://localhost:3000/api/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+919876543210"],
    "message": "Authenticated message"
  }'
```

---

## 📚 Additional Resources

- **WhatsApp Cloud API Docs:** https://developers.facebook.com/docs/whatsapp/cloud-api
- **Message Types:** https://developers.facebook.com/docs/whatsapp/cloud-api/messages
- **Template Messages:** https://developers.facebook.com/docs/whatsapp/message-templates
- **Error Codes:** https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes

---

**Happy Testing!** 🚀
