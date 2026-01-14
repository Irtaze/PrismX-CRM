const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testCustomerId = '';
let testSaleId = '';
let testPaymentId = '';

const testResults = {
  passed: [],
  failed: [],
  total: 0
};

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed.push(testName);
    console.log(`✓ PASS: ${testName}${details ? ' - ' + details : ''}`);
  } else {
    testResults.failed.push(testName);
    console.log(`✗ FAIL: ${testName}${details ? ' - ' + details : ''}`);
  }
}

async function runTests() {
  console.log('\n=== CRM SYSTEM COMPREHENSIVE TEST ===\n');
  
  // 1. Test User Registration
  console.log('\n--- USER AUTHENTICATION TESTS ---');
  try {
    const registerData = {
      email: `test${Date.now()}@crm.com`,
      password: 'Test@123',
      name: 'Comprehensive Test User',
      role: 'user'
    };
    
    const registerRes = await axios.post(`${BASE_URL}/users/register`, registerData);
    logTest('User Registration', registerRes.status === 200 && registerRes.data.token, 
      `Token received: ${!!registerRes.data.token}`);
    authToken = registerRes.data.token;
  } catch (error) {
    logTest('User Registration', false, error.response?.data?.message || error.message);
  }
  
  // 2. Test User Login
  try {
    const loginRes = await axios.post(`${BASE_URL}/users/login`, {
      email: 'testuser7@crm.com',
      password: 'Test@123'
    });
    logTest('User Login', loginRes.status === 200 && loginRes.data.token,
      `User: ${loginRes.data.user?.name}`);
    authToken = loginRes.data.token;
  } catch (error) {
    logTest('User Login', false, error.response?.data?.message || error.message);
  }
  
  const config = {
    headers: { 'Authorization': `Bearer ${authToken}` }
  };
  
  // 3. Customer CRUD Operations
  console.log('\n--- CUSTOMER CRUD TESTS ---');
  
  // CREATE Customer
  try {
    const customerData = {
      name: 'Test Customer',
      email: `customer${Date.now()}@test.com`,
      phone: '+1234567890',
      company: 'Test Company',
      status: 'active'
    };
    
    const createRes = await axios.post(`${BASE_URL}/customers`, customerData, config);
    testCustomerId = createRes.data._id;
    logTest('Create Customer', createRes.status === 201 || createRes.status === 200,
      `ID: ${testCustomerId}`);
  } catch (error) {
    logTest('Create Customer', false, error.response?.data?.message || error.message);
  }
  
  // READ Customers (List)
  try {
    const listRes = await axios.get(`${BASE_URL}/customers`, config);
    logTest('List Customers', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Customers', false, error.response?.data?.message || error.message);
  }
  
  // READ Customer (Single)
  if (testCustomerId) {
    try {
      const getRes = await axios.get(`${BASE_URL}/customers/${testCustomerId}`, config);
      logTest('Get Customer by ID', getRes.status === 200 && getRes.data._id === testCustomerId);
    } catch (error) {
      logTest('Get Customer by ID', false, error.response?.data?.message || error.message);
    }
  }
  
  // UPDATE Customer
  if (testCustomerId) {
    try {
      const updateData = {
        name: 'Updated Test Customer',
        status: 'inactive'
      };
      const updateRes = await axios.put(`${BASE_URL}/customers/${testCustomerId}`, updateData, config);
      logTest('Update Customer', updateRes.status === 200);
    } catch (error) {
      logTest('Update Customer', false, error.response?.data?.message || error.message);
    }
  }
  
  // 4. Sales CRUD Operations
  console.log('\n--- SALES CRUD TESTS ---');
  
  // CREATE Sale
  try {
    const saleData = {
      customer: testCustomerId,
      product: 'Test Product',
      amount: 1500.50,
      quantity: 5,
      date: new Date().toISOString()
    };
    
    const createRes = await axios.post(`${BASE_URL}/sales`, saleData, config);
    testSaleId = createRes.data._id;
    logTest('Create Sale', createRes.status === 201 || createRes.status === 200,
      `ID: ${testSaleId}`);
  } catch (error) {
    logTest('Create Sale', false, error.response?.data?.message || error.message);
  }
  
  // READ Sales
  try {
    const listRes = await axios.get(`${BASE_URL}/sales`, config);
    logTest('List Sales', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Sales', false, error.response?.data?.message || error.message);
  }
  
  // READ Sale by ID
  if (testSaleId) {
    try {
      const getRes = await axios.get(`${BASE_URL}/sales/${testSaleId}`, config);
      logTest('Get Sale by ID', getRes.status === 200 && getRes.data._id === testSaleId);
    } catch (error) {
      logTest('Get Sale by ID', false, error.response?.data?.message || error.message);
    }
  }
  
  // UPDATE Sale
  if (testSaleId) {
    try {
      const updateData = { amount: 2000.00, quantity: 10 };
      const updateRes = await axios.put(`${BASE_URL}/sales/${testSaleId}`, updateData, config);
      logTest('Update Sale', updateRes.status === 200);
    } catch (error) {
      logTest('Update Sale', false, error.response?.data?.message || error.message);
    }
  }
  
  // 5. Payment CRUD Operations
  console.log('\n--- PAYMENT CRUD TESTS ---');
  
  // CREATE Payment
  try {
    const paymentData = {
      sale: testSaleId,
      amount: 750.25,
      method: 'credit_card',
      date: new Date().toISOString()
    };
    
    const createRes = await axios.post(`${BASE_URL}/payments`, paymentData, config);
    testPaymentId = createRes.data._id;
    logTest('Create Payment', createRes.status === 201 || createRes.status === 200,
      `ID: ${testPaymentId}`);
  } catch (error) {
    logTest('Create Payment', false, error.response?.data?.message || error.message);
  }
  
  // READ Payments
  try {
    const listRes = await axios.get(`${BASE_URL}/payments`, config);
    logTest('List Payments', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Payments', false, error.response?.data?.message || error.message);
  }
  
  // 6. Target CRUD Operations
  console.log('\n--- TARGET CRUD TESTS ---');
  
  try {
    const targetData = {
      agent: authToken,
      targetAmount: 50000,
      period: 'monthly',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    };
    
    const createRes = await axios.post(`${BASE_URL}/targets`, targetData, config);
    logTest('Create Target', createRes.status === 201 || createRes.status === 200);
  } catch (error) {
    logTest('Create Target', false, error.response?.data?.message || error.message);
  }
  
  try {
    const listRes = await axios.get(`${BASE_URL}/targets`, config);
    logTest('List Targets', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Targets', false, error.response?.data?.message || error.message);
  }
  
  // 7. Revenue CRUD Operations
  console.log('\n--- REVENUE CRUD TESTS ---');
  
  try {
    const revenueData = {
      amount: 5000.00,
      source: 'Product Sales',
      date: new Date().toISOString(),
      category: 'sales'
    };
    
    const createRes = await axios.post(`${BASE_URL}/revenues`, revenueData, config);
    logTest('Create Revenue', createRes.status === 201 || createRes.status === 200);
  } catch (error) {
    logTest('Create Revenue', false, error.response?.data?.message || error.message);
  }
  
  try {
    const listRes = await axios.get(`${BASE_URL}/revenues`, config);
    logTest('List Revenues', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Revenues', false, error.response?.data?.message || error.message);
  }
  
  // 8. Performance CRUD Operations
  console.log('\n--- PERFORMANCE CRUD TESTS ---');
  
  try {
    const performanceData = {
      agent: authToken,
      salesCount: 25,
      revenue: 45000,
      targetAchievement: 90,
      period: 'monthly'
    };
    
    const createRes = await axios.post(`${BASE_URL}/performances`, performanceData, config);
    logTest('Create Performance', createRes.status === 201 || createRes.status === 200);
  } catch (error) {
    logTest('Create Performance', false, error.response?.data?.message || error.message);
  }
  
  try {
    const listRes = await axios.get(`${BASE_URL}/performances`, config);
    logTest('List Performances', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Performances', false, error.response?.data?.message || error.message);
  }
  
  // 9. Comment CRUD Operations
  console.log('\n--- COMMENT CRUD TESTS ---');
  
  try {
    const commentData = {
      relatedTo: 'customer',
      relatedId: testCustomerId,
      content: 'This is a test comment for the customer',
      author: authToken
    };
    
    const createRes = await axios.post(`${BASE_URL}/comments`, commentData, config);
    logTest('Create Comment', createRes.status === 201 || createRes.status === 200);
  } catch (error) {
    logTest('Create Comment', false, error.response?.data?.message || error.message);
  }
  
  try {
    const listRes = await axios.get(`${BASE_URL}/comments`, config);
    logTest('List Comments', listRes.status === 200 && Array.isArray(listRes.data),
      `Count: ${listRes.data.length}`);
  } catch (error) {
    logTest('List Comments', false, error.response?.data?.message || error.message);
  }
  
  // 10. DELETE Operations
  console.log('\n--- DELETE TESTS ---');
  
  if (testPaymentId) {
    try {
      const deleteRes = await axios.delete(`${BASE_URL}/payments/${testPaymentId}`, config);
      logTest('Delete Payment', deleteRes.status === 200 || deleteRes.status === 204);
    } catch (error) {
      logTest('Delete Payment', false, error.response?.data?.message || error.message);
    }
  }
  
  if (testSaleId) {
    try {
      const deleteRes = await axios.delete(`${BASE_URL}/sales/${testSaleId}`, config);
      logTest('Delete Sale', deleteRes.status === 200 || deleteRes.status === 204);
    } catch (error) {
      logTest('Delete Sale', false, error.response?.data?.message || error.message);
    }
  }
  
  if (testCustomerId) {
    try {
      const deleteRes = await axios.delete(`${BASE_URL}/customers/${testCustomerId}`, config);
      logTest('Delete Customer', deleteRes.status === 200 || deleteRes.status === 204);
    } catch (error) {
      logTest('Delete Customer', false, error.response?.data?.message || error.message);
    }
  }
  
  // Final Results
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed.length} (${((testResults.passed.length/testResults.total)*100).toFixed(1)}%)`);
  console.log(`Failed: ${testResults.failed.length} (${((testResults.failed.length/testResults.total)*100).toFixed(1)}%)`);
  
  if (testResults.failed.length > 0) {
    console.log('\nFailed Tests:');
    testResults.failed.forEach(test => console.log(`  - ${test}`));
  }
  
  console.log('\n===================\n');
}

runTests().catch(err => {
  console.error('Test execution error:', err.message);
  process.exit(1);
});
