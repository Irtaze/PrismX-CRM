# CRM Backend - Testing Workflow

## Quick Start (5 minutes)

### 1. Start MongoDB
```bash
mongod
```
Keep this running in a terminal.

### 2. Start Server
```bash
cd D:\CRM\crm-backend
npm start
```
You should see:
```
Server is running on port 5000
MongoDB connected
```

### 3. Download & Install Postman
- Download from: https://www.postman.com/downloads/
- Install it

### 4. Import Collection
- Open Postman
- Click `File` → `Import`
- Select: `D:\CRM\crm-backend\CRM_API_Collection.postman_collection.json`
- Now you have all API requests ready!

---

## Testing Workflow (Visual Guide)

### Phase 1: Authentication (Get JWT Token)

```
┌─────────────────────────────────────┐
│  1. Register User                   │
│  POST /api/users/register           │
│  Body: firstName, lastName, email,  │
│         password, role              │
└──────────────┬──────────────────────┘
               │
               ▼
        ✅ 200 Response
        "token": "jwt_token_xyz"
        📌 COPY THIS TOKEN
               │
┌──────────────▼──────────────────────┐
│  2. Login User (Alternative)        │
│  POST /api/users/login              │
│  Body: email, password              │
└──────────────┬──────────────────────┘
               │
               ▼
        ✅ 200 Response
        "token": "jwt_token_xyz"
```

### Phase 2: Customer Management

```
┌─────────────────────────────────────┐
│  3. Create Customer                 │
│  POST /api/customers                │
│  Header: Authorization: [TOKEN]     │
│  Body: name, email, phone, etc      │
└──────────────┬──────────────────────┘
               │
               ▼
        ✅ 201 Response
        "_id": "customer_id_123"
        📌 COPY THIS ID
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
    GET    UPDATE  DELETE
    All    One     One
```

### Phase 3: Sales Management

```
┌─────────────────────────────────────┐
│  Create Sale                        │
│  POST /api/sales                    │
│  Body: userID, customerID, amount,  │
│         status, description         │
└──────────────┬──────────────────────┘
               │
               ▼
        ✅ 201 Response
        "_id": "sale_id_456"
```

### Phase 4: Revenue & Payments

```
┌─────────────────────────────────────┐
│  Create Revenue/Payment             │
│  POST /api/revenues or /payments    │
│  Body: saleID, amount, method, etc  │
└──────────────┬──────────────────────┘
               │
               ▼
        ✅ 201 Response
```

---

## Detailed Testing Steps

### Step 1: Register & Get Token

**Request:**
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Action:** Copy the token value and save it temporarily. You'll use this in all subsequent requests.

---

### Step 2: Create Customer

**Request:**
```
POST http://localhost:5000/api/customers
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userID": "678ab7c1f...",
  "name": "Tech Solutions Inc",
  "email": "contact@techsolutions.com",
  "phoneNumber": "555-0123",
  "cardReference": "CARD-TS-001"
}
```

**Response:**
```json
{
  "_id": "678ab7c1f1a2b3c4d5e6f7g8",
  "userID": "678ab7c1f...",
  "name": "Tech Solutions Inc",
  "email": "contact@techsolutions.com",
  "phoneNumber": "555-0123",
  "cardReference": "CARD-TS-001",
  "dateAdded": "2025-01-08T12:30:45.000Z"
}
```

---

### Step 3: Create Sale

**Request:**
```
POST http://localhost:5000/api/sales
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "userID": "678ab7c1f...",
  "customerID": "678ab7c1f1a2b3c4d5e6f7g8",
  "amount": 15000,
  "status": "completed",
  "description": "Enterprise package sale"
}
```

**Response:**
```json
{
  "_id": "678ab7d2g...",
  "userID": "678ab7c1f...",
  "customerID": "678ab7c1f1a2b3c4d5e6f7g8",
  "amount": 15000,
  "date": "2025-01-08T12:31:00.000Z",
  "status": "completed",
  "description": "Enterprise package sale"
}
```

---

### Step 4: Create Revenue

**Request:**
```
POST http://localhost:5000/api/revenues
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "saleID": "678ab7d2g...",
  "amount": 15000,
  "source": "direct_sales",
  "category": "enterprise"
}
```

**Response:**
```json
{
  "_id": "678ab7e3h...",
  "saleID": "678ab7d2g...",
  "amount": 15000,
  "date": "2025-01-08T12:31:15.000Z",
  "source": "direct_sales",
  "category": "enterprise"
}
```

---

### Step 5: Create Payment

**Request:**
```
POST http://localhost:5000/api/payments
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "saleID": "678ab7d2g...",
  "customerID": "678ab7c1f1a2b3c4d5e6f7g8",
  "amount": 15000,
  "paymentMethod": "bank_transfer",
  "status": "completed"
}
```

**Response:**
```json
{
  "_id": "678ab7f4i...",
  "saleID": "678ab7d2g...",
  "customerID": "678ab7c1f1a2b3c4d5e6f7g8",
  "amount": 15000,
  "paymentDate": "2025-01-08T12:31:30.000Z",
  "paymentMethod": "bank_transfer",
  "status": "completed"
}
```

---

### Step 6: Get All Data

**Get Customers:**
```
GET http://localhost:5000/api/customers
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get Sales:**
```
GET http://localhost:5000/api/sales
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get Payments:**
```
GET http://localhost:5000/api/payments
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 7: Update Data

**Update Customer:**
```
PUT http://localhost:5000/api/customers/678ab7c1f1a2b3c4d5e6f7g8
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Tech Solutions Global",
  "email": "newemail@techsolutions.com",
  "phoneNumber": "555-0199"
}
```

---

### Step 8: Delete Data

**Delete Customer:**
```
DELETE http://localhost:5000/api/customers/678ab7c1f1a2b3c4d5e6f7g8
Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Customer deleted"
}
```

---

## Testing Checklist

### ✅ Authentication
- [ ] Register new user → Get token
- [ ] Login user → Get token
- [ ] Try request without token → Get 401 error

### ✅ Customers
- [ ] Create customer
- [ ] Get all customers
- [ ] Get customer by ID
- [ ] Update customer
- [ ] Delete customer

### ✅ Sales
- [ ] Create sale
- [ ] Get all sales
- [ ] Get sale by ID
- [ ] Update sale
- [ ] Delete sale

### ✅ Revenue
- [ ] Create revenue
- [ ] Get all revenues
- [ ] Get revenue by ID
- [ ] Update revenue
- [ ] Delete revenue

### ✅ Payments
- [ ] Create payment
- [ ] Get all payments
- [ ] Get payment by ID
- [ ] Update payment
- [ ] Delete payment

### ✅ Other Entities (Targets, Performance, AuditLogs, Comments)
- [ ] Repeat above pattern for each entity

---

## Troubleshooting

### 401 Unauthorized
**Problem:** Token missing or invalid
**Solution:** 
1. Register/Login again to get fresh token
2. Copy exact token (no spaces)
3. Paste in Authorization header: `Authorization: your_token_here`

### 404 Not Found
**Problem:** Wrong endpoint or ID
**Solution:**
1. Check spelling of endpoint
2. Verify ID exists (create resource first)
3. Use IDs from previous responses

### 500 Server Error
**Problem:** Server error
**Solution:**
1. Check server terminal for error message
2. Restart server: `npm start`
3. Verify MongoDB is running

### Cannot Connect
**Problem:** Server not running
**Solution:**
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start server
cd D:\CRM\crm-backend
npm start
```

---

## Performance Testing Tips

### Load Test (Optional)
Use Apache Bench or Artillery:
```bash
npm install -g artillery
artillery quick -c 100 -n 1000 http://localhost:5000/api/customers
```

### Monitor Performance
Check server terminal for response times and check MongoDB for query performance.

---

## Next Steps After Manual Testing

1. ✅ All endpoints working manually
2. ✅ Automated tests passing (`npm test`)
3. ✅ Ready for deployment
4. ✅ Ready to build frontend

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.
