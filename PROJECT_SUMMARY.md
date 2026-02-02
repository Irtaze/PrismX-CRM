# CRM PRO - Complete Project Summary

## 📋 Project Overview

**CRM Pro** is a modern, full-stack Customer Relationship Management (CRM) system built with Next.js and Express.js. It provides comprehensive tools for managing customers, sales, targets, performance metrics, and team agents with real-time data synchronization, role-based access control, and interactive analytics dashboards.

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB (with Mongoose 9.1.2 ODM)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Middleware**: CORS, Body Parser
- **Environment**: dotenv 17.2.3
- **Testing**: Jest 30.2.0, Supertest 7.2.2
- **Port**: 5000

### Frontend
- **Framework**: Next.js 16.1.1 (Turbopack)
- **Language**: TypeScript
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4, PostCSS
- **HTTP Client**: Axios 1.13.2
- **Icons**: React Icons 5.5.0
- **Charts**: Chart.js with react-chartjs-2
- **Port**: 3000

---

## 📦 Database Schema

### 1. **User Model** (`models/User.js`)
```
- firstName: String (required)
- lastName: String (required)
- email: String (required, unique)
- password: String (required, hashed with bcryptjs)
- role: String enum ['admin', 'manager', 'user'] (default: 'user')
- createdAt: Date (auto)
```

### 2. **Customer Model** (`models/Customer.js`)
```
- userID: ObjectId (ref: User, required)
- name: String (required)
- email: String
- phone: String
- company: String
- status: String enum ['active', 'inactive', 'prospect'] (default: 'active')
- notes: String
- createdAt: Date (auto)
```

### 3. **Sale Model** (`models/Sale.js`)
```
- customerID: ObjectId (ref: Customer, required)
- amount: Number (required)
- status: String enum ['pending', 'completed', 'cancelled'] (default: 'pending')
- description: String
- date: Date (required)
- createdAt: Date (auto)
```

### 4. **Target Model** (`models/Target.js`)
```
- userID: ObjectId (ref: User, required)
- targetAmount: Number (required)
- period: String enum ['monthly', 'quarterly', 'yearly'] (required)
- startDate: Date (required)
- endDate: Date (required)
- achieved: Number (default: 0)
- status: String enum ['in_progress', 'completed', 'failed'] (default: 'in_progress')
- createdAt: Date (auto)
```

### 5. **Performance Model** (`models/Performance.js`)
```
- userID: ObjectId (ref: User, required)
- totalSales: Number (default: 0)
- totalRevenue: Number (default: 0)
- targetAchievement: Number (default: 0)
- conversionRate: Number (default: 0)
- date: Date (default: now)
- period: String enum ['daily', 'weekly', 'monthly'] (default: 'daily')
- createdAt: Date (auto)
```

### 6. **Notification Model** (`models/Notification.js`)
```
- userID: ObjectId (ref: User, required)
- title: String (required)
- message: String (required)
- type: String enum ['info', 'success', 'warning', 'error', 'sale', 'target', 'system']
- isRead: Boolean (default: false)
- link: String
- createdAt: Date (auto)
```

### 7. **Settings Model** (`models/Settings.js`)
```
- userID: ObjectId (ref: User, required, unique)
- notifications: {
    emailNotifications: Boolean
    pushNotifications: Boolean
    salesAlerts: Boolean
    targetAlerts: Boolean
    systemUpdates: Boolean
  }
- privacy: {
    showEmail: Boolean
    showPhone: Boolean
    showPerformance: Boolean
  }
- display: {
    theme: String
    language: String
    currency: String
    dateFormat: String
  }
- createdAt: Date (auto)
```

### 8. **Service Model** (`models/Service.js`)
```
- name: String (required)
- description: String
- price: Number
- category: String
- createdAt: Date (auto)
```

### 9. **CustomerService Model** (`models/CustomerService.js`)
```
- customerID: ObjectId (ref: Customer, required)
- serviceID: ObjectId (ref: Service, required)
- status: String (default: 'active')
- amount: Number
- notes: String
- startDate: Date
- endDate: Date
- createdAt: Date (auto)
```

### 10. **Payment Model** (`models/Payment.js`)
```
- saleID: ObjectId (ref: Sale, required)
- amount: Number (required)
- paymentMethod: String
- status: String enum ['pending', 'completed', 'failed'] (default: 'pending')
- date: Date (required)
- createdAt: Date (auto)
```

### 11. **Revenue Model** (`models/Revenue.js`)
```
- saleID: ObjectId (ref: Sale, required)
- amount: Number (required)
- source: String
- date: Date (required)
- createdAt: Date (auto)
```

### 12. **AuditLog Model** (`models/AuditLog.js`)
```
- userID: ObjectId (ref: User, required)
- action: String (required)
- entityType: String
- entityID: String
- changes: Object
- timestamp: Date (default: now)
```

### 13. **Comment Model** (`models/Comment.js`)
```
- userID: ObjectId (ref: User, required)
- entityType: String (required)
- entityID: String (required)
- content: String (required)
- createdAt: Date (auto)
- updatedAt: Date (auto)
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /users/register       - Register new user
POST   /users/login          - Login user
GET    /users/profile        - Get current user profile
PUT    /users/profile        - Update current user profile
PUT    /users/change-password - Change password (with old password verification)
```

### User Management (Admin Only)
```
GET    /users                - Get all users
GET    /users/:id            - Get user by ID
PUT    /users/:id            - Update user (admin only)
DELETE /users/:id            - Delete user (admin only, cannot delete self)
```

### Customers
```
GET    /customers            - Get all customers
GET    /customers/:id        - Get customer by ID
POST   /customers            - Create new customer
PUT    /customers/:id        - Update customer
DELETE /customers/:id        - Delete customer
```

### Sales
```
GET    /sales                - Get all sales
GET    /sales/:id            - Get sale by ID
POST   /sales                - Create new sale
PUT    /sales/:id            - Update sale
DELETE /sales/:id            - Delete sale
```

### Targets
```
GET    /targets              - Get all targets
GET    /targets/:id          - Get target by ID
POST   /targets              - Create new target
PUT    /targets/:id          - Update target
DELETE /targets/:id          - Delete target
```

### Performance
```
GET    /performance          - Get all performance records
GET    /performance/my       - Get current user's performance
```

### Notifications
```
GET    /notifications        - Get all notifications for current user
GET    /notifications/count  - Get unread notification count
POST   /notifications/:id/read - Mark notification as read
PUT    /notifications/read-all - Mark all notifications as read
DELETE /notifications/:id    - Delete notification
DELETE /notifications/clear  - Clear all notifications
```

### Settings
```
GET    /settings             - Get current user settings
PUT    /settings             - Update current user settings
POST   /settings/reset       - Reset settings to defaults
```

### Services
```
GET    /services             - Get all services
GET    /services/:id         - Get service by ID
POST   /services             - Create new service
PUT    /services/:id         - Update service
DELETE /services/:id         - Delete service
```

### Customer Services
```
GET    /customer-services    - Get all customer-service relationships
POST   /customer-services    - Assign service to customer
PUT    /customer-services/:id - Update customer-service
DELETE /customer-services/:id - Remove service from customer
```

### Payments
```
GET    /payments             - Get all payments
GET    /payments/:id         - Get payment by ID
POST   /payments             - Create new payment
PUT    /payments/:id         - Update payment
DELETE /payments/:id         - Delete payment
```

### Revenue
```
GET    /revenue              - Get all revenue records
GET    /revenue/:id          - Get revenue by ID
POST   /revenue              - Create new revenue record
PUT    /revenue/:id          - Update revenue record
DELETE /revenue/:id          - Delete revenue record
```

### Audit Logs
```
GET    /audit-logs           - Get all audit logs
GET    /audit-logs/:id       - Get audit log by ID
```

### Comments
```
GET    /comments             - Get all comments
GET    /comments/:id         - Get comment by ID
POST   /comments             - Create new comment
PUT    /comments/:id         - Update comment
DELETE /comments/:id         - Delete comment
```

---

## 🎨 Frontend Pages & Features

### 1. **Login Page** (`pages/login.tsx`)
- Email/password authentication
- JWT token storage
- Redirect to dashboard on success
- Error handling and validation

### 2. **Register Page** (`pages/register.tsx`)
- User registration form
- Email validation
- Password strength requirements
- Redirect to login on success

### 3. **Dashboard** (`pages/dashboard.tsx`)
- Overview stats (total customers, sales, revenue, targets)
- Quick action buttons
- Recent activity feed
- KPI metrics
- Real-time data updates

### 4. **Profile Page** (`pages/profile.tsx`)
- Edit user profile (firstName, lastName, email)
- Change password with old password verification
- Notification bell icon with dropdown
- Unread notification count badge
- Mark notifications as read
- Real-time notification updates

### 5. **Settings Page** (`pages/settings.tsx`)
- **Notifications Tab**: Email notifications, push notifications, sales alerts, target alerts, system updates
- **Privacy Tab**: Show/hide email, phone, performance data
- **Display Tab**: Theme selection, language, currency, date format
- Reset to defaults button
- Real-time save on change

### 6. **Customers Page** (`pages/customers.tsx`)
- View all customers in expandable cards
- Search and filter customers
- Eye icon to show/hide card reference (masked by default)
- Assign services to customers
- Remove services from customers
- Add/edit/delete customers
- Service management modal

### 7. **Sales Page** (`pages/sales.tsx`)
- List all sales with status badges
- Create/edit/delete sales
- Search functionality
- **Interactive Charts**:
  - Line chart: Sales trend over time
  - Bar chart: Revenue breakdown
  - Doughnut chart: Sales status distribution
- Time period selector (weekly/monthly/yearly)
- Toggle charts on/off
- Real-time data updates

### 8. **Targets Page** (`pages/targets.tsx`)
- Display targets with progress bars
- Create/edit/delete targets
- **Interactive Charts**:
  - Bar chart: Target vs achieved by agent
  - Doughnut chart: Target status distribution
- Period filter (all/monthly/quarterly/yearly)
- Overall progress statistics
- Agent-based target tracking

### 9. **Performance Page** (`pages/performance.tsx`)
- Real-time data with auto-refresh (every 30 seconds)
- Manual refresh button with loading state
- **Interactive Charts**:
  - Bar chart: Revenue by agent
  - Line chart: Conversion rates
  - Doughnut chart: Sales distribution
- Performance leaderboard (ranked by revenue)
- Period filter (all/daily/weekly/monthly)
- Last updated timestamp

### 10. **Agents Page** (`pages/agents.tsx`)
- View all agents with real-time performance data
- **Admin Features**:
  - Add new agent button (admin only)
  - Edit agent details (admin only)
  - Delete agent (admin only)
  - Role-based access control
- Agent statistics (sales, revenue, target, conversion rate)
- Real-time data with auto-refresh
- Search and filter agents
- Overview stats

---

## 🔐 Authentication & Authorization

### JWT Implementation
- Tokens stored in localStorage
- Token includes user ID and role
- Automatic logout on token expiration
- Auth middleware validates all protected routes

### Role-Based Access Control (RBAC)
```
ADMIN:
  - Full system access
  - Add/edit/delete users
  - View all customer data
  - Manage all sales, targets, performance
  - Access audit logs

MANAGER:
  - View own and team data
  - Create/edit own records
  - View customer data
  - Manage targets
  - View performance metrics

USER:
  - View own data
  - Create own records
  - Limited access to customer data
  - View own performance
```

---

## 📊 Key Features

### 1. **Real-Time Data**
- Auto-refresh every 30 seconds for performance, agents, sales
- Manual refresh buttons on all data pages
- Last updated timestamp indicator

### 2. **Interactive Analytics**
- Chart.js integration with responsive charts
- Multiple chart types: line, bar, doughnut
- Time period selectors (weekly/monthly/yearly/daily)
- Toggle charts visibility

### 3. **Customer Management**
- Service assignment and tracking
- Card reference masking with eye icon toggle
- Expandable customer cards
- Service history and details

### 4. **Agent Management**
- Admin can add, edit, delete agents
- Real-time agent stats (sales, revenue, target progress)
- Agent leaderboard and ranking
- Role assignment and management

### 5. **Notification System**
- Real-time notifications
- Mark as read functionality
- Notification preferences (email, push, alerts)
- Notification dropdown with badge count

### 6. **Settings & Preferences**
- User-specific settings
- Notification preferences
- Privacy controls
- Display settings (theme, language, currency)
- Reset to defaults option

### 7. **Responsive Design**
- Mobile-first approach
- Works on all device sizes
- Tailwind CSS responsive classes
- Touch-friendly UI components

### 8. **Data Validation**
- Frontend form validation
- Backend validation with error messages
- Email validation
- Number input validation (minimum values, decimal places)

---

## 📁 Project Structure

```
CRM/
├── crm-backend/                    # Express.js backend
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/                # Business logic
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── saleController.js
│   │   ├── targetController.js
│   │   ├── performanceController.js
│   │   ├── notificationController.js
│   │   ├── settingsController.js
│   │   ├── serviceController.js
│   │   ├── customerServiceController.js
│   │   └── ... (more controllers)
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Sale.js
│   │   ├── Target.js
│   │   ├── Performance.js
│   │   ├── Notification.js
│   │   ├── Settings.js
│   │   ├── Service.js
│   │   └── ... (more models)
│   ├── routes/                     # API routes
│   │   ├── userRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── targetRoutes.js
│   │   └── ... (more routes)
│   ├── middlewares/
│   │   └── auth.js                 # JWT authentication
│   ├── server.js                   # Main server file
│   ├── package.json
│   └── .env                        # Environment variables
│
└── crm-frontend/                   # Next.js frontend
    ├── pages/
    │   ├── _app.tsx                # App wrapper
    │   ├── index.tsx               # Home
    │   ├── login.tsx               # Login page
    │   ├── register.tsx            # Register page
    │   ├── dashboard.tsx           # Dashboard
    │   ├── profile.tsx             # Profile page
    │   ├── settings.tsx            # Settings page
    │   ├── customers.tsx           # Customers page
    │   ├── sales.tsx               # Sales page
    │   ├── targets.tsx             # Targets page
    │   ├── performance.tsx         # Performance page
    │   └── agents.tsx              # Agents page
    ├── components/
    │   ├── Sidebar.tsx             # Navigation sidebar
    │   ├── Navbar.tsx              # Top navigation bar
    │   └── DashboardCard.tsx       # Reusable card component
    ├── services/
    │   ├── api.ts                  # API interfaces and definitions
    │   └── dataService.ts          # Data fetching functions
    ├── utils/
    │   └── useAuth.ts              # Auth hook
    ├── styles/
    │   └── globals.css             # Global styles
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    └── next.config.ts
```

---

## 🚀 Running the Project

### Backend
```bash
cd crm-backend
npm install
npm start          # Runs on port 5000
# OR for development with auto-reload
npm run dev
```

### Frontend
```bash
cd crm-frontend
npm install
npm run dev        # Runs on port 3000
```

### Access
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Documentation**: Available via Postman Collection (CRM_API_Collection.postman_collection.json)

---

## 🧪 Testing

### Backend Tests
```bash
cd crm-backend
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Test Files
- `tests/auth.test.js` - Authentication tests
- `tests/customer.test.js` - Customer CRUD tests

---

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔄 Data Flow

1. **User Authentication**
   - User registers/logs in via frontend
   - Backend validates credentials and returns JWT token
   - Frontend stores token in localStorage
   - Token included in all subsequent API requests

2. **Data Management**
   - Frontend fetches data via dataService functions
   - Data cached in component state
   - Auto-refresh mechanism updates data periodically
   - Manual refresh available on all data pages

3. **Real-Time Updates**
   - Agent page refreshes every 30 seconds
   - Performance page refreshes every 30 seconds
   - Charts update based on selected time period
   - Notifications appear in real-time

4. **User Actions**
   - Create/Update/Delete operations trigger backend API calls
   - Success/error feedback displayed to user
   - Data refetched after successful operations
   - Form validation prevents invalid submissions

---

## 📈 Key Metrics Tracked

- **Sales**: Total count, amount, status breakdown
- **Revenue**: Total revenue, breakdown by customer/service
- **Targets**: Target amounts, achieved amounts, progress percentage
- **Performance**: Sales count, revenue, conversion rate, target achievement
- **Agents**: Individual metrics, team metrics, leaderboard ranking
- **Customers**: Count, status, services assigned, contact information
- **Notifications**: Read/unread count, notification types, preferences

---

## ✨ Latest Features (Jan 2026)

1. ✅ Profile page with password change
2. ✅ Settings page with notification/privacy/display preferences
3. ✅ Customer services management
4. ✅ Sales page with interactive charts (line, bar, doughnut)
5. ✅ Targets page with per-agent progress charts
6. ✅ Performance page with real-time metrics and charts
7. ✅ Agent page with real-time stats and admin management
8. ✅ Notification system with preferences
9. ✅ Admin agent management (add, edit, delete)
10. ✅ Role-based UI elements and API access control

---

## 🔧 Admin Capabilities

**Agent Management**:
- View all agents with real-time performance data
- Create new agents
- Edit agent details (name, email, role)
- Delete agents (prevents self-deletion)
- Assign roles: Admin, Manager, User

**System Access**:
- View all customer data
- View all sales and targets
- View all performance metrics
- Access audit logs
- Manage system settings

---

## 📚 API Response Format

### Success Response
```json
{
  "status": 200,
  "data": {
    "_id": "...",
    "field": "value"
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Error description"
}
```

### Array Response
```json
[
  { "_id": "...", "field": "value" },
  { "_id": "...", "field": "value" }
]
```

---

## 🎯 Current Status

✅ **Completed**:
- Full authentication system with JWT
- 13 database models with relationships
- 40+ API endpoints
- 10 frontend pages with full functionality
- Real-time data updates
- Interactive charts and analytics
- Role-based access control
- Settings and preferences management
- Notification system
- Admin agent management

🔄 **In Progress**:
- Additional testing and QA
- Performance optimization

📅 **Planned**:
- Email notifications integration
- SMS notifications
- Advanced reporting
- Data export functionality
- Calendar integration

---

## 💡 Usage Examples

### Add a New Customer
1. Click "Customers" in sidebar
2. Click "Add Customer" button
3. Fill in customer details
4. Click "Add Customer" in modal
5. Customer appears in the list

### Assign Service to Customer
1. Go to Customers page
2. Click expand arrow on customer card
3. Click "Add Service" in services section
4. Select service and enter amount
5. Click "Add Service"

### View Sales Charts
1. Click "Sales" in sidebar
2. Charts display automatically
3. Select time period (Weekly/Monthly/Yearly)
4. Charts update with new data
5. Click "Hide Charts" to collapse

### Admin: Add New Agent
1. Go to Agents page (admin only)
2. Click "Add Agent" button
3. Fill in agent details
4. Select agent role
5. Click "Add Agent"
6. New agent appears in list with data

### View Performance Metrics
1. Click "Performance" in sidebar
2. View leaderboard and stats
3. Toggle time periods
4. Charts update automatically
5. Last updated timestamp shown

---

## 🔒 Security Features

✅ Password hashing with bcryptjs
✅ JWT token authentication
✅ CORS enabled
✅ Role-based access control
✅ Protected API routes
✅ Input validation (frontend & backend)
✅ Environment variables for sensitive data
✅ Secure password change (requires old password verification)
✅ Prevent admin self-deletion
✅ Auto-logout on token expiration

---

**Version**: 1.0.0  
**Last Updated**: January 20, 2026  
**Status**: Production Ready ✅
