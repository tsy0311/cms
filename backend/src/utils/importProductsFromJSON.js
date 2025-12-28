const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file - try backend directory first, then root
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Try default location
}

const Product = require('../models/Product');
const Category = require('../models/Category');

// Latest CNY to MYR exchange rate (as of December 2025)
// 1 CNY = 0.58 MYR (current rate)
const CNY_TO_MYR_RATE = 0.58;

/**
 * Convert CNY to MYR and round to nearest integer (no decimal places)
 */
function convertCNYToMYR(cnyAmount) {
  if (!cnyAmount || isNaN(cnyAmount)) return 0;
  const myrAmount = parseFloat(cnyAmount) * CNY_TO_MYR_RATE;
  return Math.round(myrAmount); // Round to nearest integer
}

/**
 * Find or create category based on 电池型号 (battery model)
 */
async function findOrCreateCategory(categoryName) {
  // Normalize category name
  if (!categoryName || categoryName.trim() === '' || categoryName.trim() === '无') {
    // Default category if battery model is empty or "无"
    categoryName = '成人用品';
  }
  
  const normalizedName = categoryName.trim();
  
  // Find existing category by name
  let category = await Category.findOne({ name: normalizedName });
  
  if (!category) {
    try {
      category = await Category.create({
        name: normalizedName,
        description: `Category: ${normalizedName}`,
        isActive: true
      });
      console.log(`Created new category: ${normalizedName}`);
    } catch (error) {
      // If creation fails (e.g., duplicate slug), try to find by slug or create with unique name
      if (error.code === 11000) {
        // Try to find existing category that might have been created
        category = await Category.findOne({ name: normalizedName });
        if (!category) {
          // Create with timestamp to ensure uniqueness
          category = await Category.create({
            name: `${normalizedName}-${Date.now()}`,
            description: `Category: ${normalizedName}`,
            isActive: true
          });
          console.log(`Created new category with unique name: ${category.name}`);
        }
      } else {
        throw error;
      }
    }
  }
  
  return category._id;
}

/**
 * Copy image file to uploads directory
 */
function copyImageToUploads(imagePath, imageFileName) {
  const sourcePath = path.join(__dirname, '../../../extracted_data', imagePath);
  const uploadsDir = path.join(__dirname, '../../uploads/products');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate unique filename
  const ext = path.extname(imageFileName);
  const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
  const destPath = path.join(uploadsDir, uniqueName);
  
  try {
    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    
    // Return the URL path
    return `/uploads/products/${uniqueName}`;
  } catch (error) {
    console.warn(`Warning: Could not copy image ${imagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Import products from extracted JSON file
 * @param {string} jsonFilePath - Path to extracted JSON file
 * @param {boolean} dryRun - If true, only preview without importing
 * @param {boolean} overwrite - If true, update existing products instead of skipping
 */
async function importProductsFromJSON(jsonFilePath, dryRun = false, overwrite = false) {
  try {
    // Connect to MongoDB (skip if dry run)
    if (!dryRun) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
      if (!process.env.MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI not found in .env file, using default: mongodb://localhost:27017/cms_ecommerce');
      }
      await mongoose.connect(mongoURI);
      console.log('✅ Connected to MongoDB');
      if (overwrite) {
        console.log('🔄 OVERWRITE MODE: Existing products will be updated');
      }
    } else {
      console.log('DRY RUN MODE - No data will be imported');
      if (overwrite) {
        console.log('🔄 OVERWRITE MODE: Would update existing products');
      }
    }

    // Read JSON file
    console.log(`Reading JSON file: ${jsonFilePath}`);
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const products = JSON.parse(jsonData);
    
    console.log(`Found ${products.length} products in JSON file`);

    if (products.length === 0) {
      console.log('No products found in JSON file');
      return;
    }

    // Process each product
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      try {
        // Extract fields
        const productName = productData['名称'] || '';
        const batteryModel = productData['电池型号'] || '无'; // Use battery model as category
        const specification = productData['规格'] || '';
        const weight = productData['重量KG'] || 0;
        const suggestedPriceCNY = productData['建议价'] || 0;
        const sku = productData['条码'] || productData['序号'] || '';
        const stock = productData['数量'] || 0;
        const images = productData['图片'] || [];

        // Validate required fields
        if (!productName || productName.trim() === '') {
          console.log(`Product ${i + 1}: Skipping - missing product name`);
          errorCount++;
          errors.push(`Product ${i + 1}: Missing product name`);
          continue;
        }

        if (suggestedPriceCNY <= 0) {
          console.log(`Product ${i + 1}: Skipping - invalid price (${suggestedPriceCNY} CNY)`);
          errorCount++;
          errors.push(`Product ${i + 1}: Invalid price`);
          continue;
        }

        // Convert price from CNY to MYR (only 建议价, hide 价格/cost price)
        const priceMYR = convertCNYToMYR(suggestedPriceCNY);

        // Build description with 规格 and 重量
        let descriptionParts = [];
        if (specification && specification.trim() !== '') {
          descriptionParts.push(`规格: ${specification.trim()}`);
        }
        if (weight && weight > 0) {
          descriptionParts.push(`重量: ${weight} KG`);
        }
        const description = descriptionParts.length > 0 
          ? descriptionParts.join('\n') 
          : productName;

        // Find or create category based on 电池型号
        let categoryId = null;
        if (!dryRun) {
          categoryId = await findOrCreateCategory(batteryModel);
          if (!categoryId) {
            console.log(`Product ${i + 1}: Skipping - no category`);
            errorCount++;
            errors.push(`Product ${i + 1}: No category specified`);
            continue;
          }
        } else {
          categoryId = 'DRY_RUN_CATEGORY_ID';
        }

        // Check if product already exists (by SKU or name) - check in both dry run and actual import
        let existingProduct = null;
        if (!dryRun) {
          if (sku && sku.toString().trim() !== '') {
            existingProduct = await Product.findOne({ sku: sku.toString().trim() });
          }
          if (!existingProduct) {
            existingProduct = await Product.findOne({ name: productName.trim() });
          }

          if (existingProduct && !overwrite) {
            console.log(`Product ${i + 1}: Product "${productName}" already exists, skipping...`);
            continue;
          }
        }

        // Handle images - copy to uploads directory
        const productImages = [];
        if (!dryRun && images && images.length > 0) {
          for (const img of images) {
            if (img.path) {
              const imageUrl = copyImageToUploads(img.path, img.filename);
              if (imageUrl) {
                productImages.push({
                  url: imageUrl,
                  alt: productName
                });
              }
            }
          }
        }

        // Create product data
        // Note: compareAtPrice is NOT set (价格/cost price is hidden)
        const productToCreate = {
          name: productName.trim(),
          description: description,
          shortDescription: specification || productName.trim(),
          price: priceMYR, // Only 建议价 converted to MYR
          sku: sku && sku.toString().trim() !== '' ? sku.toString().trim() : undefined,
          category: categoryId,
          stock: parseInt(stock) || 0,
          weight: parseFloat(weight) || 0,
          status: 'active',
          images: productImages.length > 0 ? productImages : undefined
        };

        if (dryRun) {
          const action = existingProduct ? 'update' : 'create';
          console.log(`Product ${i + 1}: [DRY RUN] Would ${action} product "${productName}"`);
          console.log(`  - Category: ${batteryModel}`);
          console.log(`  - Price: MYR ${priceMYR.toFixed(2)} (was ${suggestedPriceCNY} CNY)`);
          console.log(`  - Description: ${description}`);
          console.log(`  - SKU: ${sku || 'N/A'}`);
          console.log(`  - Stock: ${stock}`);
          console.log(`  - Images: ${productImages.length}`);
          successCount++;
        } else {
          if (existingProduct && overwrite) {
            // Update existing product
            Object.assign(existingProduct, productToCreate);
            await existingProduct.save();
            console.log(`Product ${i + 1}: Updated product "${productName}" - Price: MYR ${priceMYR.toFixed(2)} (was ${suggestedPriceCNY} CNY), Category: ${batteryModel}`);
          } else {
            // Create new product
            const product = await Product.create(productToCreate);
            console.log(`Product ${i + 1}: Created product "${productName}" - Price: MYR ${priceMYR.toFixed(2)} (was ${suggestedPriceCNY} CNY), Category: ${batteryModel}`);
          }
          successCount++;
        }

      } catch (error) {
        console.error(`Product ${i + 1}: Error - ${error.message}`);
        errorCount++;
        errors.push(`Product ${i + 1}: ${error.message}`);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total products processed: ${products.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Exchange rate used: 1 CNY = ${CNY_TO_MYR_RATE} MYR`);
    
    if (errors.length > 0 && errors.length <= 20) {
      console.log('\nErrors:');
      errors.forEach(err => console.log(`  - ${err}`));
    } else if (errors.length > 20) {
      console.log(`\nFirst 20 errors:`);
      errors.slice(0, 20).forEach(err => console.log(`  - ${err}`));
      console.log(`  ... and ${errors.length - 20} more errors`);
    }

    if (!dryRun) {
      await mongoose.connection.close();
    }
    console.log('\nImport completed!');

  } catch (error) {
    console.error('Error importing products:', error);
    if (!dryRun) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const overwrite = args.includes('--overwrite') || args.includes('-o');
  const jsonFilePath = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-')) || 
                       path.join(__dirname, '../../../extracted_data/extracted_products_with_images.json');
  
  if (!jsonFilePath) {
    console.error('Please provide the JSON file path');
    console.log('Usage: node importProductsFromJSON.js [<path-to-json-file>] [--dry-run] [--overwrite]');
    console.log('  --dry-run, -d    Preview without importing');
    console.log('  --overwrite, -o  Update existing products instead of skipping');
    process.exit(1);
  }
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`File not found: ${jsonFilePath}`);
    process.exit(1);
  }

  if (overwrite) {
    console.log('⚠️  OVERWRITE MODE: Existing products will be updated with new data');
  }

  importProductsFromJSON(jsonFilePath, dryRun, overwrite)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { importProductsFromJSON, convertCNYToMYR };

