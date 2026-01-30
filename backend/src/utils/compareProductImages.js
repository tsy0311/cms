const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Product = require('../models/Product');

/**
 * Compare database products with extracted JSON to check image matching
 */
async function compareProductImages() {
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

    // Get all products from database (sorted by creation time to match extraction order)
    const dbProducts = await Product.find({})
      .sort({ createdAt: 1 })
      .limit(extractedData.length);

    console.log(`Found ${dbProducts.length} products in database\n`);
    console.log('=== Comparing Product Names and Images ===\n');

    let matchCount = 0;
    let mismatchCount = 0;
    const mismatches = [];

    // Compare first 20 products
    const compareCount = Math.min(20, Math.min(extractedData.length, dbProducts.length));
    
    for (let i = 0; i < compareCount; i++) {
      const extracted = extractedData[i];
      const dbProduct = dbProducts[i];
      
      const extractedName = extracted['名称'] || '';
      const dbName = dbProduct.name || '';
      
      const extractedImage = extracted['图片'] && extracted['图片'].length > 0 
        ? extracted['图片'][0].filename 
        : 'NO IMAGE';
      
      const dbImage = dbProduct.images && dbProduct.images.length > 0
        ? dbProduct.images[0].url
        : 'NO IMAGE';

      const namesMatch = extractedName.trim() === dbName.trim();
      
      console.log(`Product ${i + 1}:`);
      console.log(`  Extracted Name: "${extractedName.substring(0, 50)}..."`);
      console.log(`  Database Name:  "${dbName.substring(0, 50)}..."`);
      console.log(`  Names Match: ${namesMatch ? '✅' : '❌'}`);
      console.log(`  Extracted Image: ${extractedImage}`);
      console.log(`  Database Image: ${dbImage.split('/').pop()}`);
      
      if (!namesMatch) {
        mismatchCount++;
        mismatches.push({
          index: i + 1,
          extractedName,
          dbName,
          extractedImage,
          dbImage
        });
      } else {
        matchCount++;
      }
      console.log('');
    }

    console.log('\n=== Summary ===');
    console.log(`Products compared: ${compareCount}`);
    console.log(`✅ Names match: ${matchCount}`);
    console.log(`❌ Names don't match: ${mismatchCount}`);

    if (mismatches.length > 0) {
      console.log('\n=== Mismatches Found ===');
      mismatches.forEach(m => {
        console.log(`\nProduct ${m.index}:`);
        console.log(`  Extracted: "${m.extractedName.substring(0, 40)}..."`);
        console.log(`  Database:  "${m.dbName.substring(0, 40)}..."`);
      });
      console.log('\n⚠️  This indicates products may have been reordered or mismatched during import');
    } else {
      console.log('\n✅ All checked products have matching names!');
      console.log('   If images still don\'t match, the issue may be in the original extraction.');
    }

    // Check if there are more products to compare
    if (dbProducts.length !== extractedData.length) {
      console.log(`\n⚠️  Warning: Database has ${dbProducts.length} products, extracted data has ${extractedData.length}`);
      console.log('   This may indicate some products were not imported or were filtered out.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Comparison complete!');

  } catch (error) {
    console.error('❌ Error comparing products:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  compareProductImages()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { compareProductImages };

