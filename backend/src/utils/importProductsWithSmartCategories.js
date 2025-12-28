const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const Product = require('../models/Product');
const Category = require('../models/Category');
const { categorizeProduct } = require('./categorizeProduct');
const { categorizeProductByCode } = require('./categorizeProductByCode');

// Latest CNY to MYR exchange rate (current rate)
// 1 CNY = 0.58 MYR
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
 * Find or create category based on smart categorization
 */
async function findOrCreateCategory(categoryEn, categoryCn) {
  // Use English name as primary, Chinese as description
  const categoryName = categoryEn;
  const categoryDescription = categoryCn;
  
  let category = await Category.findOne({ name: categoryName });
  
  if (!category) {
    try {
      category = await Category.create({
        name: categoryName,
        description: categoryDescription,
        isActive: true
      });
      console.log(`Created new category: ${categoryName} (${categoryDescription})`);
    } catch (error) {
      // Handle duplicate slug errors
      if (error.code === 11000) {
        category = await Category.findOne({ name: categoryName });
        if (!category) {
          category = await Category.create({
            name: `${categoryName}-${Date.now()}`,
            description: categoryDescription,
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
  // Try multiple possible source directories
  const possibleSourceDirs = [
    path.join(__dirname, '../../../extracted_data_openpyxl'),  // New openpyxl extraction
    path.join(__dirname, '../../../extracted_data'),           // Old extraction
    path.join(__dirname, '../../../extracted_data_corrected')  // Corrected extraction
  ];
  
  let sourcePath = null;
  for (const sourceDir of possibleSourceDirs) {
    const testPath = path.join(sourceDir, imagePath);
    if (fs.existsSync(testPath)) {
      sourcePath = testPath;
      break;
    }
  }
  
  // If not found in any directory, try constructing path directly
  if (!sourcePath) {
    // Try with extracted_data_openpyxl first (most likely for new extraction)
    sourcePath = path.join(__dirname, '../../../extracted_data_openpyxl', imagePath);
    if (!fs.existsSync(sourcePath)) {
      // Fallback to extracted_data
      sourcePath = path.join(__dirname, '../../../extracted_data', imagePath);
    }
  }
  
  const uploadsDir = path.join(__dirname, '../../uploads/products');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const ext = path.extname(imageFileName);
  const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
  const destPath = path.join(uploadsDir, uniqueName);
  
  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Warning: Image file not found: ${sourcePath}`);
      return null;
    }
    fs.copyFileSync(sourcePath, destPath);
    return `/uploads/products/${uniqueName}`;
  } catch (error) {
    console.warn(`Warning: Could not copy image ${imagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Import products with smart category mapping
 */
async function importProductsWithSmartCategories(jsonFilePath, dryRun = false, overwrite = false) {
  try {
    // Connect to MongoDB
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

    // Load .env file
    const envPath = path.join(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    } else {
      dotenv.config();
    }

    // Read JSON file
    console.log(`Reading JSON file: ${jsonFilePath}`);
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const products = JSON.parse(jsonData);
    
    console.log(`Found ${products.length} products in JSON file`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const categoryStats = {};

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      try {
        const productCode = productData['序号'] || ''; // Get product code first
        const productName = productData['名称'] || '';
        const specification = productData['规格'] || '';
        const weight = productData['重量KG'] || 0;
        const suggestedPriceCNY = productData['建议价'] || 0;
        const sku = productData['条码'] || productCode || '';
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

        // Handle images for categorization
        const productImagesForAnalysis = images && images.length > 0 ? images : null;
        
        // Smart categorization based on product code (序号), name, and images
        const categoryInfo = categorizeProductByCode(productCode, productName, productImagesForAnalysis);
        const categoryEn = categoryInfo.en;
        const categoryCn = categoryInfo.cn;
        
        // Track category usage
        categoryStats[categoryEn] = (categoryStats[categoryEn] || 0) + 1;

        // Convert price from CNY to MYR
        const priceMYR = convertCNYToMYR(suggestedPriceCNY);

        // Build description
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

        // Find or create category
        let categoryId = null;
        if (!dryRun) {
          categoryId = await findOrCreateCategory(categoryEn, categoryCn);
        } else {
          categoryId = 'DRY_RUN_CATEGORY_ID';
        }

        // Handle images
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

        // Check if product already exists
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

        // Create product data
        const productToCreate = {
          name: productName.trim(),
          description: description,
          shortDescription: specification || productName.trim(),
          price: priceMYR,
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
          console.log(`  - Category: ${categoryEn} (${categoryCn})`);
          console.log(`  - Price: MYR ${priceMYR.toFixed(2)} (was ${suggestedPriceCNY} CNY)`);
          successCount++;
        } else {
          if (existingProduct && overwrite) {
            Object.assign(existingProduct, productToCreate);
            await existingProduct.save();
            console.log(`Product ${i + 1}: Updated product "${productName}" - Category: ${categoryEn}, Price: MYR ${priceMYR.toFixed(2)}`);
          } else {
            const product = await Product.create(productToCreate);
            console.log(`Product ${i + 1}: Created product "${productName}" - Category: ${categoryEn}, Price: MYR ${priceMYR.toFixed(2)}`);
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
    
    console.log('\n=== Category Distribution ===');
    Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });

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
    console.log('Usage: node importProductsWithSmartCategories.js [<path-to-json-file>] [--dry-run] [--overwrite]');
    process.exit(1);
  }
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`File not found: ${jsonFilePath}`);
    process.exit(1);
  }

  if (overwrite) {
    console.log('⚠️  OVERWRITE MODE: Existing products will be updated with new categories');
  }

  importProductsWithSmartCategories(jsonFilePath, dryRun, overwrite)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { importProductsWithSmartCategories };

