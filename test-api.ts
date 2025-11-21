// Test script to verify API routes are working
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

async function testAPI() {
  console.log('Testing API routes...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test user registration
    console.log('\nTesting user registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };
    
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    // Test login
    console.log('\nTesting user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful:', loginResponse.data.message);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error: any) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

// Only run if server is available
if (process.env.NODE_ENV !== 'production') {
  testAPI();
}