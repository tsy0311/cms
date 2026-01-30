/**
 * Connection Test Utility
 * Tests MongoDB and JWT connections
 * Run: node src/utils/testConnections.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testMongoDB() {
  log('\n📊 Testing MongoDB Connection...', 'blue');
  
  if (!process.env.MONGODB_URI) {
    log('❌ MONGODB_URI not found in .env file', 'red');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    log('✅ MongoDB connection: SUCCESS', 'green');
    log(`   Connected to: ${process.env.MONGODB_URI.split('@')[1] || 'database'}`, 'green');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`   Collections found: ${collections.length}`, 'green');
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    log('❌ MongoDB connection: FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

function testJWT() {
  log('\n🔐 Testing JWT Configuration...', 'blue');
  
  if (!process.env.JWT_SECRET) {
    log('❌ JWT_SECRET not found in .env file', 'red');
    return false;
  }

  if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
    log('⚠️  JWT_SECRET is still using default value', 'yellow');
    log('   Consider generating a new secret: node src/utils/generateJWTSecret.js', 'yellow');
  }

  try {
    const testPayload = { id: 'test123', role: 'admin' };
    const token = jwt.sign(testPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.id === testPayload.id) {
      log('✅ JWT generation and verification: SUCCESS', 'green');
      log(`   Token expires in: ${process.env.JWT_EXPIRE || '7d'}`, 'green');
      return true;
    } else {
      log('❌ JWT verification: FAILED (payload mismatch)', 'red');
      return false;
    }
  } catch (error) {
    log('❌ JWT test: FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

function testEnvironment() {
  log('\n⚙️  Checking Environment Variables...', 'blue');
  
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const optional = ['PORT', 'NODE_ENV', 'CORS_ORIGIN', 'JWT_EXPIRE'];
  
  let allGood = true;
  
  required.forEach(key => {
    if (process.env[key]) {
      log(`✅ ${key}: Set`, 'green');
    } else {
      log(`❌ ${key}: Missing (REQUIRED)`, 'red');
      allGood = false;
    }
  });
  
  optional.forEach(key => {
    if (process.env[key]) {
      log(`✅ ${key}: ${process.env[key]}`, 'green');
    } else {
      log(`⚠️  ${key}: Not set (using default)`, 'yellow');
    }
  });
  
  return allGood;
}

async function runTests() {
  log('🚀 Starting Connection Tests...\n', 'blue');
  
  const envTest = testEnvironment();
  const mongoTest = await testMongoDB();
  const jwtTest = testJWT();
  
  log('\n📋 Test Summary:', 'blue');
  log(`   Environment: ${envTest ? '✅ PASS' : '❌ FAIL'}`, envTest ? 'green' : 'red');
  log(`   MongoDB: ${mongoTest ? '✅ PASS' : '❌ FAIL'}`, mongoTest ? 'green' : 'red');
  log(`   JWT: ${jwtTest ? '✅ PASS' : '❌ FAIL'}`, jwtTest ? 'green' : 'red');
  
  const allPassed = envTest && mongoTest && jwtTest;
  
  if (allPassed) {
    log('\n✅ All tests passed! Your system is ready to use.', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});



