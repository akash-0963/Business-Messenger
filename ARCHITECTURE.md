# System Architecture & Flow Diagrams

## 📊 System Architecture

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        CLIENT LAYER                        ┃
┃  ┌──────────────────────────────────────────────────────┐  ┃
┃  │           Browser (React Application)                │  ┃
┃  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  ┃
┃  │  │  Upload  │  │ Validate │  │  Message Composer │   │  ┃
┃  │  └──────────┘  └──────────┘  └──────────────────┘   │  ┃
┃  └──────────────────────────────────────────────────────┘  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                             │ HTTP/REST API
                             │ (axios)
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                    APPLICATION LAYER                       ┃
┃  ┌──────────────────────────────────────────────────────┐  ┃
┃  │           Express.js Server (Node.js)                │  ┃
┃  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  ┃
┃  │  │ Validate │  │   Send   │  │    Data Routes   │   │  ┃
┃  │  │  Routes  │  │  Routes  │  │                  │   │  ┃
┃  │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │  ┃
┃  │       │             │                  │             │  ┃
┃  │       └─────────────┴──────────────────┘             │  ┃
┃  │                     │                                │  ┃
┃  │          ┌──────────▼──────────┐                     │  ┃
┃  │          │  WhatsApp Service   │                     │  ┃
┃  │          │  ┌──────────────┐   │                     │  ┃
┃  │          │  │ Rate Limiter │   │                     │  ┃
┃  │          │  │  (p-queue)   │   │                     │  ┃
┃  │          │  └──────────────┘   │                     │  ┃
┃  │          └─────────────────────┘                     │  ┃
┃  └──────────────────────────────────────────────────────┘  ┃
┗━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━┛
                    │                    │
                    │ Prisma ORM         │ HTTPS
                    │                    │
┏━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━┓  ┏━━━━━┻━━━━━━━━━━━━━━━━━━┓
┃      DATA LAYER               ┃  ┃   EXTERNAL SERVICE      ┃
┃  ┌─────────────────────────┐  ┃  ┃  ┌───────────────────┐  ┃
┃  │   PostgreSQL Database   │  ┃  ┃  │  WhatsApp Cloud   │  ┃
┃  │  ┌──────────────────┐   │  ┃  ┃  │       API         │  ┃
┃  │  │    Contacts      │   │  ┃  ┃  │  (Meta/Facebook)  │  ┃
┃  │  │    Campaigns     │   │  ┃  ┃  └───────────────────┘  ┃
┃  │  │ CampaignRecipient│   │  ┃  ┃                         ┃
┃  │  └──────────────────┘   │  ┃  ┃                         ┃
┃  └─────────────────────────┘  ┃  ┃                         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔄 Data Flow Diagrams

### 1. File Upload Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Select/Drop CSV/TXT file
     ▼
┌─────────────────┐
│  FileUpload     │
│   Component     │
└────┬────────────┘
     │ 2. Read file content
     │ 3. Parse & extract phone numbers
     ▼
┌─────────────────┐
│  Parse Logic    │
│  - Split lines  │
│  - Extract nums │
└────┬────────────┘
     │ 4. Return phone array
     ▼
┌─────────────────┐
│ Normalize       │
│ - Strip chars   │
│ - Add +91       │
│ - Remove dupes  │
└────┬────────────┘
     │ 5. Normalized phone list
     ▼
┌─────────────────┐
│  ContactList    │
│  Component      │
│  (Display)      │
└─────────────────┘
```

---

### 2. Validation Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ Click "Validate Contacts"
     ▼
┌─────────────────┐
│   Frontend      │
│ validatePhones()│
└────┬────────────┘
     │ POST /api/validate
     │ { phones: [...] }
     ▼
┌─────────────────────────────────────┐
│         Backend Route               │
│  /routes/validate.js                │
│  1. Normalize phones                │
│  2. Remove duplicates               │
│  3. Chunk into batches of 50        │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│      WhatsApp Service               │
│  1. POST to WhatsApp API            │
│  2. Endpoint: /contacts             │
│  3. Get valid WhatsApp IDs          │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│      WhatsApp Cloud API             │
│  Returns: { contacts: [            │
│    { input: "+91...", status: ... }│
│  ]}                                 │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│      Database (Prisma)              │
│  Store valid contacts:              │
│  Contact.upsert({                   │
│    phone, isValid: true             │
│  })                                 │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│         Response to Frontend        │
│  {                                  │
│    validNumbers: [...],             │
│    invalidNumbers: [...],           │
│    total, valid, invalid            │
│  }                                  │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────┐
│  ContactList    │
│  Update UI with │
│  status badges  │
└─────────────────┘
```

---

### 3. Broadcast Send Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │ 1. Compose message
     │ 2. Click "Send Broadcast"
     ▼
┌─────────────────┐
│   Frontend      │
│  sendBroadcast()│
└────┬────────────┘
     │ POST /api/send
     │ { recipients: [...], message: "..." }
     ▼
┌─────────────────────────────────────────┐
│         Backend Route                   │
│  /routes/send.js                        │
│  1. Create Campaign record              │
│  2. Initialize p-queue                  │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      For each recipient (queued)        │
│  1. Fetch contact data from DB          │
│  2. Personalize message                 │
│     personalizeMessage(contact, msg)    │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      WhatsApp Service                   │
│  sendMessage(to, message)               │
│  1. POST to WhatsApp API                │
│  2. Endpoint: /messages                 │
│  3. Retry on rate limit (3x)            │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      WhatsApp Cloud API                 │
│  Delivers message                       │
│  Returns: { messages: [{id: "..."}] }   │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      Database (Prisma)                  │
│  Log result:                            │
│  CampaignRecipient.create({             │
│    campaignId, phone,                   │
│    status: 'sent'/'failed',             │
│    error: null/message                  │
│  })                                     │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      After all messages                 │
│  Update Campaign:                       │
│  - successCount                         │
│  - failureCount                         │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│         Response to Frontend            │
│  {                                      │
│    campaignId,                          │
│    results: { total, sent, failed },    │
│    details: [...]                       │
│  }                                      │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────┐
│  StatusLog      │
│  Show results   │
│  with timeline  │
└─────────────────┘
```

---

## 🗄️ Database Schema Diagram

```
┌─────────────────────────────────────────┐
│           Contact                       │
├─────────────────────────────────────────┤
│ PK  id           INT                    │
│ UK  phone        VARCHAR                │
│     name         VARCHAR (nullable)     │
│     isValid      BOOLEAN (default false)│
│     createdAt    TIMESTAMP              │
│     updatedAt    TIMESTAMP              │
└─────────────────────────────────────────┘
                                            
┌─────────────────────────────────────────┐
│           Campaign                      │
├─────────────────────────────────────────┤
│ PK  id              INT                 │
│     message         TEXT                │
│     totalRecipients INT (default 0)     │
│     successCount    INT (default 0)     │
│     failureCount    INT (default 0)     │
│     createdAt       TIMESTAMP           │
└────┬────────────────────────────────────┘
     │
     │ 1:N
     │
     ▼
┌─────────────────────────────────────────┐
│      CampaignRecipient                  │
├─────────────────────────────────────────┤
│ PK  id          INT                     │
│ FK  campaignId  INT ──┐                 │
│     phone       VARCHAR │                │
│     status      VARCHAR │                │
│     error       TEXT (nullable)         │
│     sentAt      TIMESTAMP               │
└─────────────────────────────────────────┘
                         │
                         │ References Campaign(id)
                         │ ON DELETE CASCADE
                         └─────────────────────
```

**Relationships:**
- Campaign → CampaignRecipient (1:N)
- Contact has unique phone constraint
- CampaignRecipient cascades on Campaign delete

---

## 🔁 Rate Limiting Flow

```
┌────────────────────────────────────┐
│   Send Request                     │
│   (100 recipients)                 │
└────┬───────────────────────────────┘
     │
     ▼
┌────────────────────────────────────┐
│   p-queue Configuration            │
│   - concurrency: 5                 │
│   - interval: 1000ms               │
│   - intervalCap: 5                 │
└────┬───────────────────────────────┘
     │
     ▼
┌────────────────────────────────────┐
│   Queue Processing                 │
│                                    │
│   Time    │ Active Tasks           │
│   ─────────┼───────────────        │
│   0-1s    │ 5 tasks running        │
│   1-2s    │ 5 tasks running        │
│   2-3s    │ 5 tasks running        │
│   ...     │ ...                    │
│   19-20s  │ 5 tasks running        │
└────┬───────────────────────────────┘
     │
     ▼
┌────────────────────────────────────┐
│   Total Time: ~20 seconds          │
│   (100 messages ÷ 5 per second)    │
└────────────────────────────────────┘

With Retry Logic:
┌────────────────────────────────────┐
│   If Rate Limited                  │
│   1. Wait 2 seconds                │
│   2. Retry (max 3 attempts)        │
│   3. Log failure if all fail       │
└────────────────────────────────────┘
```

---

## 🎨 Component Hierarchy

```
App
├── BroadcastPage
│   ├── Header
│   │   └── Logo + Title
│   │
│   ├── FileUpload
│   │   ├── Drag-drop zone
│   │   └── File input
│   │
│   ├── ContactList
│   │   ├── Stats summary
│   │   └── Table
│   │       ├── Header row
│   │       └── Contact rows
│   │           ├── Phone number
│   │           └── Status badge
│   │
│   ├── MessageComposer
│   │   ├── Textarea
│   │   ├── Character count
│   │   ├── Placeholder hints
│   │   └── Send button
│   │
│   ├── ActionButtons
│   │   ├── Validate button
│   │   ├── Clear button
│   │   └── Warning note
│   │
│   ├── StatusLog
│   │   └── Timeline items
│   │       ├── Icon (status)
│   │       ├── Message
│   │       └── Timestamp
│   │
│   └── Footer
│       └── Copyright info
```

---

## 📡 API Request/Response Flow

### Validation Request
```
Client                Server              WhatsApp API
  │                     │                      │
  ├─POST /api/validate─>│                      │
  │ {phones:[...]}      │                      │
  │                     ├─Normalize phones─────┤
  │                     │                      │
  │                     ├─POST /contacts──────>│
  │                     │ {blocking:'wait'}    │
  │                     │                      │
  │                     │<────Response─────────┤
  │                     │ {contacts:[...]}     │
  │                     │                      │
  │                     ├─Store in DB──────────┤
  │                     │                      │
  │<────Response────────┤                      │
  │ {validNumbers:[]}   │                      │
  │                     │                      │
```

### Send Request
```
Client                Server              WhatsApp API    Database
  │                     │                      │             │
  ├─POST /api/send─────>│                      │             │
  │ {recipients:[],     │                      │             │
  │  message:"..."}     │                      │             │
  │                     ├─Create Campaign─────────────────>│
  │                     │                      │             │
  │                     ├─For each recipient───┤             │
  │                     │                      │             │
  │                     ├─Personalize msg──────┤             │
  │                     │                      │             │
  │                     ├─POST /messages──────>│             │
  │                     │                      │             │
  │                     │<────Response─────────┤             │
  │                     │                      │             │
  │                     ├─Log result─────────────────────>│
  │                     │                      │             │
  │                     ├─(repeat for all)─────┤             │
  │                     │                      │             │
  │<────Response────────┤                      │             │
  │ {results:{...}}     │                      │             │
  │                     │                      │             │
```

---

## 🔐 Security Flow

```
┌──────────────────────┐
│   User Input         │
│ (phone numbers,      │
│  messages)           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Input Validation    │
│  - Type checking     │
│  - Format validation │
│  - Sanitization      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Environment Vars    │
│  - Never in code     │
│  - Loaded from .env  │
│  - Not committed     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Rate Limiting       │
│  - Queue control     │
│  - API throttling    │
│  - Retry logic       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Database Access     │
│  - Prisma ORM        │
│  - Parameterized     │
│  - No raw SQL        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  API Communication   │
│  - HTTPS only        │
│  - Bearer token      │
│  - Secure headers    │
└──────────────────────┘
```

---

## 📊 Performance Optimization

```
┌─────────────────────────────────────┐
│          Optimization Strategy      │
├─────────────────────────────────────┤
│                                     │
│  Frontend:                          │
│  ├─ Component memoization          │
│  ├─ Efficient re-renders           │
│  ├─ Lazy loading                   │
│  └─ Debounced inputs               │
│                                     │
│  Backend:                           │
│  ├─ Batch processing (50/batch)    │
│  ├─ Queue-based sending            │
│  ├─ Connection pooling             │
│  └─ Efficient DB queries           │
│                                     │
│  Database:                          │
│  ├─ Indexed columns (phone)        │
│  ├─ Optimized schema               │
│  ├─ Cascade deletes                │
│  └─ Transaction support            │
│                                     │
│  API:                               │
│  ├─ Rate limiting                  │
│  ├─ Retry logic                    │
│  ├─ Error handling                 │
│  └─ Response caching               │
│                                     │
└─────────────────────────────────────┘
```

---

**These diagrams help visualize the system architecture and data flows.**
**Refer to README.md for detailed implementation details.**
