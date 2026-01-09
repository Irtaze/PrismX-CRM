# CRM Backend API - Manual Testing Guide

## Prerequisites

Before testing, ensure:
1. **MongoDB is running** on `mongodb://localhost:27017`
2. **Node.js** is installed
3. **Postman** or **Insomnia** installed (API testing tools)

## Starting the Server

### Option 1: Run with npm
```bash
cd D:\CRM\crm-backend
npm start
```
This will run `node server.js` and start on port 5000.

### Option 2: Run with auto-reload (development mode)
```bash
npm install --save-dev nodemon
npm run dev
```
Server runs on `http://localhost:5000`

### Verify Server is Running
Check terminal for:
```
Server is running on port 5000
MongoDB connected
```

---

## Testing Flow (Step-by-Step)

### STEP 1: Register a New User

**Endpoint:** `POST http://localhost:5000/api/users/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzhhYjc4YWZkYjk2ZmUwYjRkNGEzNzciLCJpYXQiOjE3Mzc0NTEyMzQsImV4cCI6MTczNzQ1NDgzNH0.LQy8sdfPLkU..."
}
```


**Save this token** - you'll use it for all protected routes!

---

### STEP 2: Login with User

**Endpoint:** `POST http://localhost:5000/api/users/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### STEP 3: Create a Customer

**Endpoint:** `POST http://localhost:5000/api/customers`

**Headers:**
```
Content-Type: application/json
Authorization: <your_token_from_step_1_or_2>
```

**Body (JSON):**
```json
{
  "userID": "your_user_id_here",
  "name": "Acme Corporation",
  "email": "acme@example.com",
  "phoneNumber": "555-1234-5678",
  "cardReference": "CARD-001"
}
```

**Expected Response (201):**
```json
{
  "_id": "678ab78afdb96fe0b4d4a378",
  "userID": "678ab78afdb96fe0b4d4a377",
  "name": "Acme Corporation",
  "email": "acme@example.com",
  "phoneNumber": "555-1234-5678",
  "cardReference": "CARD-001",
  "dateAdded": "2025-01-08T12:30:00.000Z"
}
```

**Save the _id** for GET/UPDATE/DELETE operations!

---

### STEP 4: Get All Customers

**Endpoint:** `GET http://localhost:5000/api/customers`

**Headers:**
```
Authorization: <your_token>
```

**Expected Response (200):**
```json
[
  {
    "_id": "678ab78afdb96fe0b4d4a378",
    "userID": {
      "_id": "678ab78afdb96fe0b4d4a377",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "name": "Acme Corporation",
    "email": "acme@example.com",
    "phoneNumber": "555-1234-5678",
    "cardReference": "CARD-001",
    "dateAdded": "2025-01-08T12:30:00.000Z"
  }
]
```

---

### STEP 5: Get Customer by ID

**Endpoint:** `GET http://localhost:5000/api/customers/678ab78afdb96fe0b4d4a378`

**Headers:**
```
Authorization: <your_token>
```

**Expected Response (200):**
```json
{
  "_id": "678ab78afdb96fe0b4d4a378",
  "userID": {...},
  "name": "Acme Corporation",
  "email": "acme@example.com",
  "phoneNumber": "555-1234-5678",
  "cardReference": "CARD-001",
  "dateAdded": "2025-01-08T12:30:00.000Z"
}
```

---

### STEP 6: Update Customer

**Endpoint:** `PUT http://localhost:5000/api/customers/678ab78afdb96fe0b4d4a378`

**Headers:**
```
Content-Type: application/json
Authorization: <your_token>
```

**Body (JSON):**
```json
{
  "name": "Updated Acme Corp",
  "email": "updated@example.com",
  "phoneNumber": "555-9876-5432"
}
```

**Expected Response (200):**
```json
{
  "_id": "678ab78afdb96fe0b4d4a378",
  "name": "Updated Acme Corp",
  "email": "updated@example.com",
  "phoneNumber": "555-9876-5432",
  "cardReference": "CARD-001",
  "dateAdded": "2025-01-08T12:30:00.000Z"
}
```

---

### STEP 7: Delete Customer

**Endpoint:** `DELETE http://localhost:5000/api/customers/678ab78afdb96fe0b4d4a378`

**Headers:**
```
Authorization: <your_token>
```

**Expected Response (200):**
```json
{
  "message": "Customer deleted"
}
```

---

## All Available Endpoints

### User Routes (Authentication)
| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/api/users/register` | ❌ No | Register new user |
| POST | `/api/users/login` | ❌ No | Login user |

### Customer Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers` | Create customer |
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Sale Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sales` | Create sale |
| GET | `/api/sales` | Get all sales |
| GET | `/api/sales/:id` | Get sale by ID |
| PUT | `/api/sales/:id` | Update sale |
| DELETE | `/api/sales/:id` | Delete sale |

**Sale Create/Update Body:**
```json
{
  "userID": "user_id",
  "customerID": "customer_id",
  "amount": 5000,
  "status": "pending",
  "description": "Sale description"
}
```

### Revenue Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/revenues` | Create revenue |
| GET | `/api/revenues` | Get all revenues |
| GET | `/api/revenues/:id` | Get revenue by ID |
| PUT | `/api/revenues/:id` | Update revenue |
| DELETE | `/api/revenues/:id` | Delete revenue |

**Revenue Create/Update Body:**
```json
{
  "saleID": "sale_id",
  "amount": 5000,
  "source": "direct_sales",
  "category": "product_sales"
}
```

### Payment Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments` | Create payment |
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/:id` | Get payment by ID |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

**Payment Create/Update Body:**
```json
{
  "saleID": "sale_id",
  "customerID": "customer_id",
  "amount": 5000,
  "paymentMethod": "credit_card",
  "status": "completed"
}
```

### Target Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/targets` | Create target |
| GET | `/api/targets` | Get all targets |
| GET | `/api/targets/:id` | Get target by ID |
| PUT | `/api/targets/:id` | Update target |
| DELETE | `/api/targets/:id` | Delete target |

**Target Create/Update Body:**
```json
{
  "userID": "user_id",
  "targetAmount": 100000,
  "period": "monthly",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "status": "in_progress"
}
```

### Performance Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/performances` | Create performance |
| GET | `/api/performances` | Get all performances |
| GET | `/api/performances/:id` | Get performance by ID |
| PUT | `/api/performances/:id` | Update performance |
| DELETE | `/api/performances/:id` | Delete performance |

**Performance Create/Update Body:**
```json
{
  "userID": "user_id",
  "totalSales": 50000,
  "totalRevenue": 45000,
  "targetAchievement": 85,
  "conversionRate": 12.5,
  "period": "monthly"
}
```

### Audit Log Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auditlogs` | Create audit log |
| GET | `/api/auditlogs` | Get all audit logs |
| GET | `/api/auditlogs/:id` | Get audit log by ID |
| DELETE | `/api/auditlogs/:id` | Delete audit log |

**Audit Log Create Body:**
```json
{
  "userID": "user_id",
  "action": "created",
  "entityType": "Customer",
  "entityID": "entity_id",
  "changes": { "field": "value" },
  "ipAddress": "192.168.1.1"
}
```

### Comment Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comments` | Create comment |
| GET | `/api/comments` | Get all comments |
| GET | `/api/comments/:id` | Get comment by ID |
| PUT | `/api/comments/:id` | Update comment |
| DELETE | `/api/comments/:id` | Delete comment |

**Comment Create/Update Body:**
```json
{
  "userID": "user_id",
  "entityType": "Customer",
  "entityID": "entity_id",
  "content": "This is a comment"
}
```

---

## Testing in Postman/Insomnia

### Import Collection (Optional)
1. Copy all endpoints above into Postman/Insomnia
2. Create a Collection named "CRM API"
3. Add all requests with their methods and URLs

### Environment Variables (Recommended)
Set up environment variables in Postman to reuse token:

**Variable: `token`**
- After registering/logging in, copy the token value
- In Postman: Environments → Add Variable
- Use in requests: `Authorization: {{token}}`

**Variable: `baseUrl`**
- Value: `http://localhost:5000`
- Use in endpoints: `{{baseUrl}}/api/customers`

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Missing/invalid token | Copy token from register/login response |
| `404 Not Found` | Wrong endpoint/ID | Verify the endpoint URL and object ID |
| `500 Server error` | Server crashed | Check console, restart server |
| `MongoNetworkError` | MongoDB not running | Start MongoDB: `mongod` |
| `Cannot POST /api/...` | Typo in endpoint | Check the endpoint path carefully |

---

## Quick Testing Checklist

- [ ] Server running on port 5000
- [ ] MongoDB connected
- [ ] Register user and save token
- [ ] Login and verify token works
- [ ] Create customer with valid token
- [ ] Get all customers
- [ ] Get customer by ID
- [ ] Update customer
- [ ] Delete customer
- [ ] Test other entities (Sales, Revenue, etc.)
- [ ] Test 401 error by removing auth header
