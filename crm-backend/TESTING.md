# CRM Backend Testing Guide

## Testing Approaches

### 1. Manual Testing with Postman/Insomnia

You can test all API endpoints manually using Postman or Insomnia.

#### Authentication Flow:
1. **Register a user**
   - Endpoint: `POST http://localhost:5000/api/users/register`
   - Body:
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "password": "password123",
     "role": "user"
   }
   ```
   - Response: `{ "token": "jwt_token_here" }`

2. **Login**
   - Endpoint: `POST http://localhost:5000/api/users/login`
   - Body:
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
   - Response: `{ "token": "jwt_token_here" }`

3. **Use token for protected routes**
   - Add header: `Authorization: <token>`
   - Example: Create a customer
   - Endpoint: `POST http://localhost:5000/api/customers`
   - Headers: `Authorization: <your_jwt_token>`
   - Body:
   ```json
   {
     "userID": "<user_id>",
     "name": "Acme Corporation",
     "email": "acme@example.com",
     "phoneNumber": "555-1234",
     "cardReference": "CARD-001"
   }
   ```

#### All API Endpoints:

**Users:**
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

**Customers (Protected):**
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Sales (Protected):**
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

**Revenue, Payments, Targets, Performance, Audit Logs, Comments:**
- Same CRUD pattern as above (replace `sales` with entity name)
- Base paths: `/api/revenues`, `/api/payments`, `/api/targets`, `/api/performances`, `/api/auditlogs`, `/api/comments`

### 2. Automated Testing with Jest & Supertest

#### Running Tests:

```bash
# Run all tests
npm test

# Watch mode (rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### Test Files:

- **tests/auth.test.js** - User registration and login tests
- **tests/customer.test.js** - Customer CRUD operations tests

#### Test Coverage:

The tests cover:
- ✅ User registration success and duplicate email handling
- ✅ User login with valid/invalid credentials
- ✅ Customer CRUD operations (Create, Read, Update, Delete)
- ✅ JWT authentication middleware validation
- ✅ 404 error handling for non-existent resources

#### Creating Additional Tests:

To add more tests, create files in the `tests/` directory following the naming convention `entity.test.js`.

Example structure:
```javascript
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const auth = require('../middlewares/auth');

describe('Entity Tests', () => {
  beforeAll(async () => {
    // Setup database connection
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /api/entity', () => {
    it('should create an entity', async () => {
      const res = await request(app)
        .post('/api/entity')
        .set('Authorization', token)
        .send({ /* data */ });
      expect(res.statusCode).toBe(201);
    });
  });
});
```

## Important Notes

1. **Database:** Tests use `mongodb://localhost:27017/crm_test` database (separate from production)
2. **Tokens:** JWT tokens expire in 1 hour. Test tokens are created with the JWT_SECRET from `.env`
3. **Authentication:** All protected routes require an `Authorization` header with a valid JWT token
4. **Error Handling:** All endpoints return appropriate HTTP status codes and error messages

## Debugging Failed Tests

If tests fail:
1. Ensure MongoDB is running: `mongod`
2. Check `.env` file has correct `MONGODB_URI` and `JWT_SECRET`
3. Clear test database: `db.dropDatabase()` in MongoDB shell
4. Check console output for specific error messages
5. Verify node modules are installed: `npm install`

## Next Steps

1. Run `npm run dev` to start the server in development mode
2. Test endpoints using Postman/Insomnia
3. Run `npm test` to execute automated tests
4. Deploy to production (see deployment section)
