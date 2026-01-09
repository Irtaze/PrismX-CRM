const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

// Connect to database
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Parse incoming JSON requests

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/revenues', require('./routes/revenueRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/targets', require('./routes/targetRoutes'));
app.use('/api/performances', require('./routes/performanceRoutes'));
app.use('/api/auditlogs', require('./routes/auditLogRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
