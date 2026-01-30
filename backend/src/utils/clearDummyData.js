const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Clear all dummy/seed data from the database
 * This will delete ALL products and categories
 * ⚠️ WARNING: This action cannot be undone!
 */
async function clearDummyData(dryRun = false) {
  try {
    // Connect to MongoDB
    if (!dryRun) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
      if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not found in .env file, using default: mongodb://localhost:27017/cms_ecommerce');
      }
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB');
    } else {
      // Still need to connect for counting
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB');
      console.log('DRY RUN MODE - No data will be deleted');
    }

    // Load .env file
    const envPath = path.join(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    } else {
      dotenv.config();
    }

    if (dryRun) {
      // Count items that would be deleted
      const productCount = await Product.countDocuments();
      const categoryCount = await Category.countDocuments();
      
      console.log('\n=== DRY RUN - Items that would be deleted ===');
      console.log(`Products: ${productCount}`);
      console.log(`Categories: ${categoryCount}`);
      console.log('\n⚠️  Run without --dry-run flag to actually delete the data');
      await mongoose.connection.close();
      return;
    }

    // Delete all products
    const productResult = await Product.deleteMany({});
    console.log(`\n✅ Deleted ${productResult.deletedCount} products`);

    // Delete all categories
    const categoryResult = await Category.deleteMany({});
    console.log(`✅ Deleted ${categoryResult.deletedCount} categories`);

    console.log('\n=== Summary ===');
    console.log(`Products deleted: ${productResult.deletedCount}`);
    console.log(`Categories deleted: ${categoryResult.deletedCount}`);
    console.log('\n✅ All dummy data has been cleared!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  
  console.log('🗑️  Clear Dummy Data Script');
  console.log('⚠️  WARNING: This will delete ALL products and categories!');
  
  if (!dryRun) {
    console.log('\n⚠️  This action cannot be undone!');
    console.log('💡 Use --dry-run flag to preview what would be deleted');
    console.log('\nProceeding in 3 seconds... (Ctrl+C to cancel)');
    
    setTimeout(() => {
      clearDummyData(false)
        .then(() => {
          console.log('\nDone!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('Fatal error:', error);
          process.exit(1);
        });
    }, 3000);
  } else {
    clearDummyData(true)
      .then(() => {
        console.log('\nDone!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  }
}

module.exports = { clearDummyData };
