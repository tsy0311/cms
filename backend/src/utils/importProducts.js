const XLSX = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

// CNY to MYR exchange rate (approximate, update as needed)
// As of 2025, 1 CNY ≈ 0.66 MYR
const CNY_TO_MYR_RATE = 0.66;

/**
 * Convert CNY to MYR
 */
function convertCNYToMYR(cnyAmount) {
  if (!cnyAmount || isNaN(cnyAmount)) return 0;
  return parseFloat((parseFloat(cnyAmount) * CNY_TO_MYR_RATE).toFixed(2));
}

/**
 * Find or create category
 */
async function findOrCreateCategory(categoryName) {
  if (!categoryName || categoryName.trim() === '') {
    return null;
  }

  let category = await Category.findOne({ name: categoryName.trim() });
  
  if (!category) {
    category = await Category.create({
      name: categoryName.trim(),
      description: `Category for ${categoryName.trim()}`,
      isActive: true
    });
    console.log(`Created new category: ${categoryName.trim()}`);
  }
  
  return category._id;
}

/**
 * Parse Excel file and import products
 * @param {string} filePath - Path to Excel file
 * @param {boolean} dryRun - If true, only preview without importing
 */
async function importProductsFromExcel(filePath, dryRun = false) {
  try {
    // Connect to MongoDB (skip if dry run)
    if (!dryRun) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } else {
      console.log('DRY RUN MODE - No data will be imported');
    }

    // Read Excel file
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} rows in Excel file`);

    if (data.length === 0) {
      console.log('No data found in Excel file');
      return;
    }

    // Display first row to understand structure
    console.log('\nFirst row structure:');
    console.log(Object.keys(data[0]));
    console.log('\nFirst row sample:');
    console.log(data[0]);

    // Process each row
    // Skip first row (header info) and second row (column headers)
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Skip header rows
        // Row 1: Contains "配货中心" with description text
        // Row 2: Contains "序号" as column header
        if (i === 0 && row['配货中心']) {
          continue; // Skip first header row
        }
        if (i === 1 && row['__EMPTY'] === '序号') {
          continue; // Skip column header row
        }
        
        // Skip rows without product name
        if (!row['__EMPTY_1'] || row['__EMPTY_1'].trim() === '') {
          continue;
        }

        // Extract product information based on actual Excel structure
        // Column mapping:
        // __EMPTY: 序号 (Serial number)
        // __EMPTY_1: 名称 (Name)
        // __EMPTY_4: 价格 (Price - cost)
        // __EMPTY_8: 建议价 (Suggested price - market price)
        // __EMPTY_10: 条码 (Barcode)
        // __EMPTY_11: 重量KG (Weight)
        // __EMPTY_6: 规格 (Specification)
        
        const productName = row['__EMPTY_1'] || '';
        const description = row['__EMPTY_6'] || productName || ''; // Use specification as description
        const categoryName = '成人用品'; // Default category, can be extracted from name if needed
        const sku = row['__EMPTY_10'] || row['__EMPTY'] || ''; // Use barcode or serial number as SKU
        const weight = row['__EMPTY_11'] || 0;
        const specification = row['__EMPTY_6'] || '';
        
        // Price fields - 建议价 (__EMPTY_8) is market price, 价格 (__EMPTY_4) is cost
        const suggestedPriceCNY = parseFloat(row['__EMPTY_8']) || 0;
        const costPriceCNY = parseFloat(row['__EMPTY_4']) || 0;
        
        // Convert to MYR
        const priceMYR = convertCNYToMYR(suggestedPriceCNY);
        const costMYR = convertCNYToMYR(costPriceCNY);
        
        // Other fields
        const stock = parseInt(row['__EMPTY_5']) || 0; // 数量 (Quantity)
        const sizeStr = ''; // Not in this Excel structure
        const colorStr = ''; // Not in this Excel structure

        // Validate required fields
        if (!productName || productName.trim() === '') {
          console.log(`Row ${i + 1}: Skipping - missing product name`);
          errorCount++;
          errors.push(`Row ${i + 1}: Missing product name`);
          continue;
        }

        if (priceMYR <= 0) {
          console.log(`Row ${i + 1}: Skipping - invalid price (${suggestedPriceCNY} CNY)`);
          errorCount++;
          errors.push(`Row ${i + 1}: Invalid price`);
          continue;
        }

        // Find or create category (skip in dry run)
        let categoryId = null;
        if (!dryRun) {
          categoryId = await findOrCreateCategory(categoryName);
          if (!categoryId) {
            console.log(`Row ${i + 1}: Skipping - no category`);
            errorCount++;
            errors.push(`Row ${i + 1}: No category specified`);
            continue;
          }
        } else {
          // In dry run, just use a placeholder
          categoryId = 'DRY_RUN_CATEGORY_ID';
        }

        // Parse sizes
        const sizes = [];
        if (sizeStr) {
          const sizeArray = sizeStr.split(/[,，、]/).map(s => s.trim().toUpperCase());
          const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
          sizeArray.forEach(size => {
            if (validSizes.includes(size)) {
              sizes.push(size);
            }
          });
        }

        // Parse colors (basic implementation - you may need to enhance this)
        const colors = [];
        if (colorStr) {
          const colorArray = colorStr.split(/[,，、]/).map(c => c.trim());
          colorArray.forEach(colorName => {
            if (colorName) {
              colors.push({
                name: colorName,
                hex: '#000000' // Default color, you may want to map colors to hex codes
              });
            }
          });
        }

        // Check if product already exists (by SKU or name) - skip in dry run
        if (!dryRun) {
          let existingProduct = null;
          if (sku && sku.trim() !== '') {
            existingProduct = await Product.findOne({ sku: sku.toString().trim() });
          }
          if (!existingProduct) {
            existingProduct = await Product.findOne({ name: productName.trim() });
          }

          if (existingProduct) {
            console.log(`Row ${i + 1}: Product "${productName}" already exists, skipping...`);
            continue;
          }
        }

        // Create product
        const productData = {
          name: productName.trim(),
          description: description || productName.trim(),
          shortDescription: specification || '',
          price: priceMYR,
          compareAtPrice: costMYR > 0 && costMYR !== priceMYR ? costMYR : null,
          sku: sku && sku.toString().trim() !== '' ? sku.toString().trim() : undefined,
          category: categoryId,
          stock: parseInt(stock) || 0,
          weight: parseFloat(weight) || 0,
          status: 'active',
          sizes: sizes.length > 0 ? sizes : undefined,
          colors: colors.length > 0 ? colors : undefined
        };

        if (dryRun) {
          console.log(`Row ${i + 1}: [DRY RUN] Would create product "${productName}"`);
          console.log(`  - Price: MYR ${priceMYR.toFixed(2)} (was ${suggestedPriceCNY} CNY)`);
          console.log(`  - Cost: MYR ${costMYR.toFixed(2)} (was ${costPriceCNY} CNY)`);
          console.log(`  - SKU: ${sku || 'N/A'}`);
          console.log(`  - Stock: ${stock}`);
          successCount++;
        } else {
          const product = await Product.create(productData);
          console.log(`Row ${i + 1}: Created product "${productName}" - Price: MYR ${priceMYR.toFixed(2)} (was ${suggestedPriceCNY} CNY)`);
          successCount++;
        }

      } catch (error) {
        console.error(`Row ${i + 1}: Error - ${error.message}`);
        errorCount++;
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total rows processed: ${data.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(err => console.log(`  - ${err}`));
    }

    if (!dryRun) {
      await mongoose.connection.close();
    }
    console.log('\nImport completed!');

  } catch (error) {
    console.error('Error importing products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const filePath = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-')) || 
                   path.join(__dirname, '../../最新全品类报价单65（2025.4.10）.xlsx');
  
  if (!filePath) {
    console.error('Please provide the Excel file path');
    console.log('Usage: node importProducts.js [<path-to-excel-file>] [--dry-run]');
    process.exit(1);
  }

  importProductsFromExcel(filePath, dryRun)
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { importProductsFromExcel, convertCNYToMYR };

