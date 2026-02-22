# CRM Pro - Sales Management System

A comprehensive Customer Relationship Management (CRM) platform built with modern web technologies for managing customers, sales, targets, agents, and performance metrics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Pages & Features](#pages--features)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Contributing](#contributing)

## 🎯 Overview

CRM Pro is a full-stack customer relationship management system designed for sales teams to:
- Manage customer information and interactions
- Track sales performance and revenue
- Set and monitor sales targets
- Manage agents and their productivity
- Generate comprehensive performance reports
- Track customer service interactions

## ✨ Features

### Core Features
- ✅ **User Management** - Admin controls for creating/managing users with role-based access
- ✅ **Customer Management** - Comprehensive customer database with contact information
- ✅ **Sales Tracking** - Real-time sales record creation and monitoring
- ✅ **Target Management** - Dynamic sales targets with progress tracking
- ✅ **Performance Analytics** - Agent performance dashboards with auto-refresh (30 seconds)
- ✅ **Dashboard** - Executive dashboard with period-based filtering and trend analysis
- ✅ **Service Management** - Customer service ticketing and tracking
- ✅ **Audit Logging** - Complete audit trail of all system actions
- ✅ **Notifications** - System notifications for important events
- ✅ **Performance Metrics** - Detailed conversion rates, revenue tracking, and KPIs

### Advanced Features
- 🔐 JWT-based Authentication with secure token management
- 🎨 Role-Based Access Control (Admin, Manager, Agent)
- 📊 Real-time data charts and visualizations (Chart.js)
- 💾 MongoDB database with Mongoose ODM
- 🔄 Auto-refresh performance data (30-second intervals)
- 📱 Responsive Tailwind CSS design
- ⚡ Next.js for optimized frontend performance
- 📈 Period-based filtering (daily, weekly, monthly, yearly)

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Input validation middleware
- **Logging**: Console-based logging with audit trail

### Frontend
- **Framework**: Next.js 16.1.6 with TypeScript
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios with interceptors
- **Icons**: React Icons
- **State Management**: React Hooks (useState, useEffect, useMemo)

## 📁 Project Structure

```
CRM/
├── crm-backend/                 # Express.js backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/             # Business logic
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── salesController.js
│   │   ├── targetController.js
│   │   ├── performanceController.js
│   │   ├── dashboardController.js
│   │   └── ...
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Sale.js
│   │   ├── Target.js
│   │   ├── Performance.js
│   │   └── ...
│   ├── routes/                  # API endpoints
│   │   ├── userRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── targetRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── ...
│   ├── middlewares/             # Auth & custom middleware
│   │   └── auth.js              # JWT authentication
│   ├── tests/                   # Test files
│   ├── server.js                # Entry point
│   └── package.json
│
├── crm-frontend/                # Next.js frontend
│   ├── pages/                   # Next.js pages
│   │   ├── _app.tsx
│   │   ├── dashboard.tsx        # Executive dashboard
│   │   ├── targets.tsx          # Sales targets management
│   │   ├── performance.tsx      # Performance analytics
│   │   ├── customers.tsx        # Customer management
│   │   ├── sales.tsx            # Sales tracking
│   │   ├── agents.tsx           # Agent management (admin)
│   │   ├── profile.tsx          # User profile
│   │   ├── settings.tsx         # System settings
│   │   └── ...
│   ├── components/              # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DashboardCard.tsx
│   │   └── ...
│   ├── services/                # API client layer
│   │   ├── api.ts              # Type-safe API definitions
│   │   └── dataService.ts      # Data fetching functions
│   ├── utils/                   # Utility functions
│   │   └── useAuth.ts          # Auth hook
│   ├── styles/                  # Global styles
│   │   └── globals.css
│   └── package.json
│
├── documentation/               # Project documentation
│   ├── API_FIXES_SUMMARY.md
│   ├── RBAC_IMPLEMENTATION_TEST_REPORT.md
│   └── ...
│
├── .gitignore
├── package.json
└── README.md
```

## 💻 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Backend Setup

```bash
cd crm-backend
npm install
```

### Frontend Setup

```bash
cd crm-frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in `crm-backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env.local` file in `crm-frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd crm-backend
npm run dev
```

Server runs on: `http://localhost:5000`

### Start Frontend Server

```bash
cd crm-frontend
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Access the Application

- **URL**: http://localhost:3000
- **Login**: Use your credentials (created by admin)
- **Default Admin**: Created during initial setup

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/users/login              - User login
POST   /api/users/register           - User registration (admin only)
GET    /api/users/profile            - Get user profile
PUT    /api/users/profile            - Update user profile
PUT    /api/users/change-password    - Change password
```

### Customer Endpoints

```
GET    /api/customers                - Get all customers
GET    /api/customers/:id            - Get customer by ID
POST   /api/customers                - Create customer
PUT    /api/customers/:id            - Update customer
DELETE /api/customers/:id            - Delete customer
```

### Sales Endpoints

```
GET    /api/sales                    - Get all sales
GET    /api/sales/:id                - Get sale by ID
POST   /api/sales                    - Create sale
PUT    /api/sales/:id                - Update sale
DELETE /api/sales/:id                - Delete sale
```

### Target Endpoints

```
GET    /api/targets                  - Get all targets
GET    /api/targets/:id              - Get target by ID
POST   /api/targets                  - Create target
PUT    /api/targets/:id              - Update target
DELETE /api/targets/:id              - Delete target
```

### Performance Endpoints

```
GET    /api/performances             - Get all performance records
GET    /api/performances/me           - Get user's own performance
```

### Dashboard Endpoints

```
GET    /api/dashboard/admin          - Admin dashboard data
GET    /api/dashboard/agent          - Agent dashboard data
GET    /api/dashboard/summary        - Quick dashboard summary
```

### Admin Endpoints (Admin Only)

```
GET    /api/admin/users              - Get all users
POST   /api/admin/users              - Create user
PUT    /api/admin/users/:id          - Update user
DELETE /api/admin/users/:id          - Delete user
GET    /api/admin/agents             - Get all agents
GET    /api/admin/agents/:id/stats   - Get agent statistics
```

## 📖 Pages & Features

### Dashboard (/)
- **Purpose**: Executive overview of business metrics
- **Data**: Real-time aggregated sales, revenue, customer, and target data
- **Features**:
  - Period filtering (today, this week, this month, last month, this year)
  - Role-based views (admin sees all, agents see personal)
  - Trend comparison with previous period
  - Recent sales table with customer/agent details
  - Top performers leaderboard
- **Updates**: On page load and period selection change
- **Data Source**: Dynamic calculations from Sales, Customer, and Target models

### Targets (/targets)
- **Purpose**: Manage and track sales targets
- **Data**: Individual sales targets with achievement tracking
- **Features**:
  - Create/edit/delete targets
  - Track achieved amounts vs target amounts
  - Progress visualization with color-coded bars
  - Period filtering (monthly, quarterly, yearly)
  - Status management (in_progress, completed, failed)
  - Admin can assign targets to agents
  - Agents can only view/edit their own targets
  - Charts: Agent-wise target comparison + status distribution
  - Statistics: Total targets, target amount, achieved amount, overall progress
- **Updates**: Real-time on create/edit/delete actions
- **Data Source**: Target model with userID references

### Performance (/performance)
- **Purpose**: Monitor agent sales performance and KPIs
- **Data**: Real-time performance metrics aggregated from sales
- **Features**:
  - Auto-refresh every 30 seconds
  - Period filtering (daily, weekly, monthly, all)
  - Multiple visualization charts:
    - Revenue by agent (bar chart)
    - Sales distribution (doughnut chart)
    - Conversion rates (line chart)
  - Performance leaderboard with rankings (🥇🥈🥉)
  - Real-time stats: Total revenue, total sales, avg conversion, avg target %
  - Color-coded rating system
- **Updates**: Automatic refresh every 30 seconds + manual refresh button
- **Data Source**: Performance model with aggregation from sales transactions

### Customers (/customers)
- **Purpose**: Manage customer database
- **Features**:
  - View all customers
  - Add new customers
  - Edit customer information
  - Delete customers
  - Filter customers by agent

### Sales (/sales)
- **Purpose**: Track and manage sales transactions
- **Features**:
  - Record new sales
  - Track sale status
  - View sales history
  - Customer and agent information

### Agents (/agents) - Admin Only
- **Purpose**: Manage sales agents and their statistics
- **Features**:
  - View all agents
  - Add new agents
  - Edit agent information
  - View agent performance statistics
  - Delete agents

### Profile (/profile)
- **Purpose**: User profile management
- **Features**:
  - View personal information
  - Update profile details
  - Change password
  - View account statistics

### Settings (/settings)
- **Purpose**: System configuration
- **Features**:
  - User preferences
  - System settings
  - Notification preferences

## 🗄️ Database Models

### User
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: "admin" | "manager" | "agent",
  createdAt: Date,
  updatedAt: Date
}
```

### Customer
```javascript
{
  name: String,
  email: String,
  phoneNumber: String,
  agentID: Reference to User,
  dateAdded: Date,
  createdAt: Date
}
```

### Sale
```javascript
{
  customerID: Reference to Customer,
  agentID: Reference to User,
  amount: Number,
  status: "pending" | "completed" | "failed",
  date: Date,
  createdAt: Date
}
```

### Target
```javascript
{
  userID: Reference to User,
  targetAmount: Number,
  achieved: Number,
  period: "monthly" | "quarterly" | "yearly",
  startDate: Date,
  endDate: Date,
  status: "in_progress" | "completed" | "failed",
  createdAt: Date,
  updatedAt: Date
}
```

### Performance
```javascript
{
  userID: Reference to User,
  totalSales: Number,
  totalRevenue: Number,
  targetAchievement: Number,
  conversionRate: Number,
  date: Date,
  period: "daily" | "weekly" | "monthly",
  createdAt: Date
}
```

## 🔐 Authentication

### How It Works

1. **Login**: User provides email and password
2. **Verification**: Backend validates credentials against hashed password
3. **Token Generation**: JWT token created with user ID and role
4. **Storage**: Token stored in localStorage on client
5. **Authorization**: Token sent in `Authorization: Bearer {token}` header
6. **Validation**: Backend verifies token on protected routes
7. **Access Control**: Routes check user role (admin, manager, agent)

### Protected Routes

- ✅ All customer routes (require authentication)
- ✅ All sales routes (require authentication)
- ✅ All target routes (require authentication)
- ✅ All performance routes (require authentication)
- ✅ Admin routes (require admin role)
- ✅ Dashboard routes (role-based data filtering)

### Public Routes
- Login page
- Register page (if enabled)

## 📊 Data Flow Architecture

### Targets Page Data Flow
```
1. User Action (Create/Edit/Delete)
   ↓
2. API Call to backend (/api/targets)
   ↓
3. Database Updated
   ↓
4. Frontend auto-fetches updated data
   ↓
5. Graphs recalculated with useMemo
   ↓
6. Charts re-render with new data
```

### Performance Page Data Flow
```
1. Initial Load: Fetch all performance records
   ↓
2. Auto-Refresh Interval (30 seconds)
   ↓
3. Backend Performance records updated
   ↓
4. Frontend refetches via scheduled interval
   ↓
5. Graphs recalculated with useMemo
   ↓
6. Charts re-render with new data
   ↓
7. Last Updated timestamp changes
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5000 (backend)
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**MongoDB Connection Error**
- Ensure MongoDB is running locally or check cloud connection string
- Verify `MONGODB_URI` in `.env` file

**Authentication Errors (403 Forbidden)**
- Check if user has admin role for admin-only endpoints
- Verify JWT token is valid and not expired
- Ensure token is sent in Authorization header

**Charts Not Displaying**
- Verify data is loading correctly
- Check browser console for errors
- Ensure Chart.js is properly installed

## 📝 Git Workflow

```bash
# Clone repository
git clone <repository-url>

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature

# Create pull request
```

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For issues or questions, please contact the development team.

---

**Last Updated**: February 2026
**Version**: 2.0.0
**Status**: Production Ready ✅
