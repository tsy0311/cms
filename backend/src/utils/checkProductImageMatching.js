const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Check if products match their images by comparing with extracted data
 */
async function checkProductImageMatching() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Read extracted JSON to get original image mappings
    const extractedPath = path.join(__dirname, '../../../extracted_data/extracted_products_with_images.json');
    if (!fs.existsSync(extractedPath)) {
      console.error('❌ Extracted products file not found:', extractedPath);
      process.exit(1);
    }

    const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
    console.log(`Found ${extractedData.length} products in extracted data\n`);

    // Get all products from database
    const dbProducts = await Product.find({ status: 'active' })
      .populate('category')
      .sort({ createdAt: 1 });

    console.log(`Found ${dbProducts.length} products in database\n`);
    console.log('=== Checking Product-Image Matching ===\n');

    let matchCount = 0;
    let mismatchCount = 0;
    let noImageCount = 0;
    const mismatches = [];

    // Create a map of extracted data by product name for faster lookup
    const extractedMap = new Map();
    extractedData.forEach((prod, index) => {
      const name = prod['名称']?.trim();
      if (name) {
        extractedMap.set(name, { ...prod, index });
      }
    });

    // Check each database product
    for (let i = 0; i < dbProducts.length; i++) {
      const dbProduct = dbProducts[i];
      const dbName = dbProduct.name?.trim();
      
      if (!dbName) {
        console.log(`Product ${i + 1}: Skipping - no name`);
        continue;
      }

      // Find matching extracted product
      const extracted = extractedMap.get(dbName);
      
      if (!extracted) {
        mismatchCount++;
        mismatches.push({
          dbIndex: i + 1,
          dbName: dbName.substring(0, 50),
          issue: 'Product not found in extracted data'
        });
        continue;
      }

      // Check if product has images
      const dbHasImages = dbProduct.images && dbProduct.images.length > 0;
      const extractedHasImages = extracted['图片'] && extracted['图片'].length > 0;

      if (!dbHasImages) {
        noImageCount++;
        if (extractedHasImages) {
          mismatches.push({
            dbIndex: i + 1,
            dbName: dbName.substring(0, 50),
            issue: 'Product has no images in database but has images in extracted data'
          });
        }
        continue;
      }

      // Compare image filenames (base names)
      const dbImageName = dbProduct.images[0]?.url?.split('/').pop() || '';
      const extractedImageName = extracted['图片'][0]?.filename || '';
      
      // Extract base filename for comparison (remove timestamps/random strings from DB images)
      // DB images look like: product-1766910173866-172127758.jpeg
      // Extracted images look like: product_1_image1.jpeg.jpeg
      // We can't directly match these, so we'll verify that images exist and are in the correct order
      
      // Check if image file exists
      if (dbImageName) {
        const imagePath = path.join(__dirname, '../../', dbProduct.images[0].url);
        const imageExists = fs.existsSync(imagePath);
        
        if (!imageExists) {
          mismatchCount++;
          mismatches.push({
            dbIndex: i + 1,
            dbName: dbName.substring(0, 50),
            issue: `Image file not found: ${dbImageName}`
          });
          continue;
        }
      }

      // Since we can't directly compare image filenames (they're renamed during import),
      // we'll assume images are correct if:
      // 1. Product names match
      // 2. Products are in the same order (same index)
      // 3. Image files exist
      
      // For now, if product name matches and has images, consider it a match
      // The actual image-to-product matching would need to be verified visually
      matchCount++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total products checked: ${dbProducts.length}`);
    console.log(`✅ Products with matching names and images: ${matchCount}`);
    console.log(`❌ Products with mismatches: ${mismatchCount}`);
    console.log(`📦 Products without images: ${noImageCount}`);

    if (mismatches.length > 0 && mismatches.length <= 50) {
      console.log('\n=== Products with Issues ===');
      mismatches.slice(0, 20).forEach((mismatch, idx) => {
        console.log(`${idx + 1}. "${mismatch.dbName}..." - ${mismatch.issue}`);
      });
      if (mismatches.length > 20) {
        console.log(`   ... and ${mismatches.length - 20} more`);
      }
    } else if (mismatches.length > 50) {
      console.log(`\n⚠️  ${mismatches.length} products have issues (too many to display)`);
    }

    // Check for products in database that don't exist in extracted data
    const dbProductNames = new Set(dbProducts.map(p => p.name?.trim()).filter(Boolean));
    const extractedProductNames = new Set(extractedData.map(p => p['名称']?.trim()).filter(Boolean));
    
    const dbOnly = Array.from(dbProductNames).filter(name => !extractedProductNames.has(name));
    if (dbOnly.length > 0) {
      console.log(`\n⚠️  ${dbOnly.length} products in database not found in extracted data (may be hardcoded or manually added)`);
      if (dbOnly.length <= 10) {
        dbOnly.forEach(name => console.log(`   - ${name.substring(0, 50)}...`));
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');
    console.log('\n⚠️  Note: Image-to-product matching cannot be automatically verified.');
    console.log('   Please verify visually on the website that images match product names.');

  } catch (error) {
    console.error('❌ Error checking products:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkProductImageMatching()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { checkProductImageMatching };

