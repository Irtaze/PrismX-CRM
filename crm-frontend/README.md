# PrismX CRM Frontend

A modern CRM frontend application built with Next.js, React, and Tailwind CSS.

## Features

- 🔐 User Authentication (Login with JWT)
- 📊 Dashboard Overview
- 👥 Customer Management
- 👨‍💼 Agent Management
- 💰 Sales & Revenue Tracking
- 🎯 Sales Targets
- 📈 Performance Metrics

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Authentication**: JWT (stored in localStorage)

## Prerequisites

- Node.js 16+ installed
- Backend API running on `http://localhost:5000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env.local`

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
crm-frontend/
├── components/          # Reusable React components
│   ├── Sidebar.js      # Navigation sidebar
│   ├── Navbar.js       # Top navigation bar
│   └── DashboardCard.js # Dashboard stat cards
├── pages/              # Next.js pages (routes)
│   ├── _app.js        # App wrapper
│   ├── index.js       # Landing page
│   ├── login.js       # Login page
│   ├── dashboard.js   # Dashboard
│   ├── customers.js   # Customers list
│   ├── agents.js      # Agents list
│   ├── sales.js       # Sales & revenue
│   ├── targets.js     # Sales targets
│   └── performance.js # Performance metrics
├── services/           # API service layer
│   └── api.js         # Axios configuration
└── styles/            # Global styles
    └── globals.css    # Tailwind imports
```

## Pages

- **/** - Landing page
- **/login** - User authentication
- **/dashboard** - Overview with key metrics
- **/customers** - Customer list and details
- **/agents** - Agent list and information
- **/sales** - Sales and revenue data
- **/targets** - Sales targets and progress
- **/performance** - Agent performance metrics

## API Integration

The frontend communicates with the backend API at `http://localhost:5000/api/`. All authenticated requests include the JWT token in the Authorization header.

## Authentication

1. Navigate to `/login`
2. Enter your email and password
3. Upon successful login, JWT token is stored in localStorage
4. Token is automatically included in all API requests
5. Click "Logout" in the navbar to clear the token

## Troubleshooting

### API Connection Issues
- Ensure backend server is running on port 5000
- Check CORS settings on the backend

### Authentication Issues
- Clear localStorage and try logging in again
- Verify user credentials

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

