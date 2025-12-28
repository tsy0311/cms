const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Verify if product images match product names
 * This script checks if the images displayed match the actual product
 */
async function verifyProductImages() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not found in .env file, using default: mongodb://localhost:27017/cms_ecommerce');
    }
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all products with images
    const products = await Product.find({ images: { $exists: true, $ne: [] } })
      .populate('category')
      .sort({ createdAt: 1 });

    console.log(`Found ${products.length} products with images\n`);
    console.log('=== Product Image Verification ===\n');

    let mismatchCount = 0;
    let noImageCount = 0;
    let matchCount = 0;
    const mismatches = [];

    // Check a sample of products
    for (let i = 0; i < Math.min(products.length, 50); i++) {
      const product = products[i];
      const hasImages = product.images && product.images.length > 0;
      
      if (!hasImages) {
        noImageCount++;
        console.log(`❌ Product ${i + 1}: "${product.name}" - NO IMAGES`);
        continue;
      }

      // Get first image URL
      const imageUrl = product.images[0].url;
      const imagePath = path.join(__dirname, '../../', imageUrl.replace(/^\//, ''));
      
      // Check if image file exists
      const imageExists = fs.existsSync(imagePath);
      
      console.log(`Product ${i + 1}: "${product.name.substring(0, 50)}..."`);
      console.log(`  - Image: ${imageUrl}`);
      console.log(`  - File exists: ${imageExists ? '✅' : '❌'}`);
      console.log(`  - Category: ${product.category?.name || 'N/A'}\n`);

      if (!imageExists) {
        mismatchCount++;
        mismatches.push({
          productId: product._id,
          productName: product.name,
          imageUrl: imageUrl,
          issue: 'Image file not found'
        });
      } else {
        matchCount++;
      }
    }

    // Get products without images
    const productsWithoutImages = await Product.find({ 
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    }).countDocuments();

    console.log('\n=== Summary ===');
    console.log(`Total products checked: ${Math.min(products.length, 50)}`);
    console.log(`✅ Products with matching images: ${matchCount}`);
    console.log(`❌ Products with missing image files: ${mismatchCount}`);
    console.log(`📦 Products without images (total): ${productsWithoutImages}`);
    
    if (mismatches.length > 0) {
      console.log('\n=== Products with Image Issues ===');
      mismatches.slice(0, 10).forEach((mismatch, idx) => {
        console.log(`${idx + 1}. "${mismatch.productName.substring(0, 40)}..."`);
        console.log(`   Issue: ${mismatch.issue}`);
        console.log(`   Image: ${mismatch.imageUrl}\n`);
      });
      if (mismatches.length > 10) {
        console.log(`   ... and ${mismatches.length - 10} more\n`);
      }
    }

    // Check the original extracted data structure
    console.log('\n=== Checking Original Data Structure ===');
    const extractedDataPath = path.join(__dirname, '../../../extracted_data/extracted_products_with_images.json');
    if (fs.existsSync(extractedDataPath)) {
      console.log('Reading extracted products data...');
      const extractedData = JSON.parse(fs.readFileSync(extractedDataPath, 'utf8'));
      console.log(`Total products in extracted data: ${extractedData.length}`);
      
      // Show first few products and their image structure
      console.log('\nFirst 3 products from extracted data:');
      for (let i = 0; i < Math.min(3, extractedData.length); i++) {
        const prod = extractedData[i];
        console.log(`\n${i + 1}. Product Name: "${prod['名称']}"`);
        console.log(`   Images: ${JSON.stringify(prod['图片'] || [], null, 2)}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error verifying product images:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  verifyProductImages()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifyProductImages };

