const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Find products in database that are not in the extracted data
 * These might be hardcoded or manually added products
 */
async function findNonExtractedProducts() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Read extracted JSON
    const extractedPath = path.join(__dirname, '../../../extracted_data/extracted_products_with_images.json');
    if (!fs.existsSync(extractedPath)) {
      console.error('❌ Extracted products file not found:', extractedPath);
      process.exit(1);
    }

    const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
    console.log(`Found ${extractedData.length} products in extracted data\n`);

    // Create set of extracted product names
    const extractedNames = new Set();
    extractedData.forEach(prod => {
      const name = prod['名称']?.trim();
      if (name) {
        extractedNames.add(name);
      }
    });

    // Get all products from database
    const dbProducts = await Product.find({ status: 'active' })
      .populate('category')
      .sort({ createdAt: 1 });

    console.log(`Found ${dbProducts.length} products in database\n`);
    console.log('=== Finding Non-Extracted Products ===\n');

    const nonExtracted = [];
    
    for (const dbProduct of dbProducts) {
      const dbName = dbProduct.name?.trim();
      if (!dbName) continue;

      if (!extractedNames.has(dbName)) {
        nonExtracted.push({
          _id: dbProduct._id,
          name: dbName,
          category: dbProduct.category?.name || 'N/A',
          price: dbProduct.price,
          sku: dbProduct.sku,
          createdAt: dbProduct.createdAt,
          hasImages: dbProduct.images && dbProduct.images.length > 0
        });
      }
    }

    console.log(`\n=== Results ===`);
    console.log(`Total products in database: ${dbProducts.length}`);
    console.log(`Products from extracted data: ${dbProducts.length - nonExtracted.length}`);
    console.log(`Products NOT in extracted data: ${nonExtracted.length}\n`);

    if (nonExtracted.length > 0) {
      console.log('=== Products NOT in Extracted Data ===');
      console.log('These products may be hardcoded or manually added:\n');
      
      nonExtracted.forEach((prod, idx) => {
        console.log(`${idx + 1}. "${prod.name.substring(0, 60)}..."`);
        console.log(`   - ID: ${prod._id}`);
        console.log(`   - Category: ${prod.category}`);
        console.log(`   - Price: MYR ${prod.price?.toFixed(2) || 'N/A'}`);
        console.log(`   - SKU: ${prod.sku || 'N/A'}`);
        console.log(`   - Created: ${prod.createdAt}`);
        console.log(`   - Has Images: ${prod.hasImages ? 'Yes' : 'No'}\n`);
      });

      console.log(`\n⚠️  ${nonExtracted.length} products found that are not in extracted data.`);
      console.log('   If these are unwanted, you can delete them using:');
      console.log('   node -e "const mongoose = require(\'mongoose\'); const Product = require(\'./src/models/Product\'); (async () => { await mongoose.connect(\'mongodb://localhost:27017/cms_ecommerce\'); const ids = [\'ID1\', \'ID2\', ...]; await Product.deleteMany({ _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } }); await mongoose.connection.close(); })()"');
    } else {
      console.log('✅ All products in database are from extracted data!');
      console.log('   No hardcoded or manually added products found.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Check complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  findNonExtractedProducts()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { findNonExtractedProducts };

