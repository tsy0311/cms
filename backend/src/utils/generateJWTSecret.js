/**
 * Utility script to generate a secure JWT secret
 * Run: node src/utils/generateJWTSecret.js
 */

const crypto = require('crypto');

// Generate a random 64-byte (512-bit) secret
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ Generated JWT Secret:');
console.log('='.repeat(80));
console.log(secret);
console.log('='.repeat(80));
console.log('\n📝 Add this to your backend/.env file:');
console.log(`JWT_SECRET=${secret}\n`);
console.log('⚠️  Keep this secret secure and never commit it to version control!\n');

