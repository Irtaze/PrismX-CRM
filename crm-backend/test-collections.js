const mongoose = require('mongoose');
const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('\n🧪 Testing API & Creating Collections...\n');
    
    // Test 1: Register User
    console.log('1️⃣ Testing User Registration...');
    const registerRes = await axios.post('http://localhost:5000/api/users/register', {
      firstName: 'John',
      lastName: 'Doe',
      email: `john${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });
    
    const token = registerRes.data.token;
    const userId = registerRes.data.token ? 'Token received ✅' : 'Failed ❌';
    console.log(`   Result: ${userId}`);
    
    // Get user ID from database
    await mongoose.connect('mongodb://localhost:27017/crm_system');
    const db = mongoose.connection.db;
    
    const users = await db.collection('users').findOne({});
    const userID = users ? users._id : null;
    
    if (userID) {
      console.log(`   User ID: ${userID}\n`);
    }
    
    // Test 2: Create Customer
    console.log('2️⃣ Testing Customer Creation...');
    const customerRes = await axios.post('http://localhost:5000/api/customers', {
      userID: userID,
      name: 'Tech Solutions Inc',
      email: 'tech@example.com',
      phoneNumber: '555-1234',
      cardReference: 'CARD-001'
    }, {
      headers: { 'Authorization': token }
    });
    
    console.log(`   Result: Customer created ✅`);
    console.log(`   Customer ID: ${customerRes.data._id}\n`);
    
    // Test 3: Create Sale
    console.log('3️⃣ Testing Sale Creation...');
    const saleRes = await axios.post('http://localhost:5000/api/sales', {
      userID: userID,
      customerID: customerRes.data._id,
      amount: 5000,
      status: 'completed',
      description: 'Test sale'
    }, {
      headers: { 'Authorization': token }
    });
    
    console.log(`   Result: Sale created ✅`);
    console.log(`   Sale ID: ${saleRes.data._id}\n`);
    
    // Check collections
    console.log('📊 Collections Created:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   ✓ ${col.name}`);
    });
    
    console.log('\n✅ All tests passed! Database is working perfectly.\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

setTimeout(testAPI, 2000); // Wait 2 seconds for server to start
