const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * Verify image-to-product matching by checking the original Excel file
 * This script will read the Excel file and check if images are correctly matched
 */
async function verifyImageProductMatching(excelFilePath) {
  try {
    if (!excelFilePath || !fs.existsSync(excelFilePath)) {
      console.error('❌ Excel file not found:', excelFilePath);
      console.log('\nUsage: node verifyImageProductMatching.js <path-to-excel-file>');
      process.exit(1);
    }

    console.log('📊 Verifying Image-to-Product Matching\n');
    console.log(`Reading Excel file: ${excelFilePath}\n`);

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    
    const worksheet = workbook.worksheets[0]; // Get first worksheet
    console.log(`Worksheet: ${worksheet.name}`);
    console.log(`Total rows: ${worksheet.rowCount}\n`);

    // Get all products from database
    const dbProducts = await Product.find({ status: 'active' })
      .populate('category')
      .sort({ createdAt: 1 });

    console.log(`Found ${dbProducts.length} products in database\n`);

    // Analyze image positions in Excel
    console.log('=== Analyzing Images in Excel ===\n');
    
    const excelImageInfo = [];
    if (worksheet.images && worksheet.images.length > 0) {
      console.log(`Found ${worksheet.images.length} images in Excel\n`);
      
      worksheet.images.forEach((image, idx) => {
        const anchor = image.range ? image.range.tl : null;
        const row = anchor ? anchor.row : null;
        const col = anchor ? anchor.col : null;
        
        excelImageInfo.push({
          index: idx,
          row: row,
          column: col,
          hasPosition: row !== null && col !== null,
          imageId: image.imageId || idx
        });
        
        if (idx < 10) {
          console.log(`Image ${idx + 1}: Row ${row || 'N/A'}, Column ${col || 'N/A'}`);
        }
      });
      
      if (worksheet.images.length > 10) {
        console.log(`... and ${worksheet.images.length - 10} more images\n`);
      }
    } else {
      console.log('⚠️  No images found via worksheet.images\n');
      console.log('Images may be embedded differently in the Excel file.\n');
    }

    // Read product data from Excel
    console.log('=== Reading Product Data from Excel ===\n');
    
    const excelProducts = [];
    let headerRow = null;
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1 || rowNumber === 2) {
        // First 2 rows are likely headers
        if (rowNumber === 1) {
          headerRow = {};
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            headerRow[colNumber] = cell.value;
          });
        }
        return;
      }

      const rowData = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        rowData[colNumber] = cell.value;
      });

      // Extract key fields (assuming standard columns)
      const productCode = rowData[1] || rowData[2] || ''; // 序号 column
      const productName = rowData[2] || rowData[3] || ''; // 名称 column
      
      if (productName && productName.toString().trim() !== '') {
        excelProducts.push({
          rowNumber: rowNumber,
          code: productCode ? productCode.toString().trim() : '',
          name: productName.toString().trim(),
          rowData: rowData
        });
      }
    });

    console.log(`Found ${excelProducts.length} products in Excel\n`);

    // Check matching
    console.log('=== Comparing Database Products with Excel ===\n');
    
    let matchCount = 0;
    let mismatchCount = 0;
    const mismatches = [];

    for (let i = 0; i < Math.min(dbProducts.length, excelProducts.length, 100); i++) {
      const dbProduct = dbProducts[i];
      const excelProduct = excelProducts[i];
      
      // Check if names match
      const dbName = dbProduct.name.trim();
      const excelName = excelProduct.name.trim();
      
      const namesMatch = dbName === excelName || 
                         dbName.toLowerCase() === excelName.toLowerCase() ||
                         dbName.replace(/\s+/g, '') === excelName.replace(/\s+/g, '');
      
      if (namesMatch) {
        matchCount++;
        if (i < 10) {
          console.log(`✅ Row ${excelProduct.rowNumber}: "${excelName.substring(0, 40)}..." - Names match`);
        }
      } else {
        mismatchCount++;
        mismatches.push({
          dbIndex: i + 1,
          dbName: dbName.substring(0, 50),
          excelRow: excelProduct.rowNumber,
          excelName: excelName.substring(0, 50),
          dbCode: dbProduct.sku || 'N/A',
          excelCode: excelProduct.code
        });
        
        if (mismatches.length <= 10) {
          console.log(`❌ Row ${excelProduct.rowNumber}: Name mismatch`);
          console.log(`   DB: "${dbName.substring(0, 50)}..."`);
          console.log(`   Excel: "${excelName.substring(0, 50)}..."`);
        }
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Products checked: ${Math.min(dbProducts.length, excelProducts.length, 100)}`);
    console.log(`✅ Names match: ${matchCount}`);
    console.log(`❌ Names mismatch: ${mismatchCount}`);

    if (mismatches.length > 0) {
      console.log('\n=== Mismatched Products (first 10) ===');
      mismatches.slice(0, 10).forEach((mismatch, idx) => {
        console.log(`\n${idx + 1}. Row ${mismatch.excelRow}`);
        console.log(`   Database: "${mismatch.dbName}..."`);
        console.log(`   Excel: "${mismatch.excelName}..."`);
        console.log(`   Codes: DB=${mismatch.dbCode}, Excel=${mismatch.excelCode}`);
      });
      
      if (mismatches.length > 10) {
        console.log(`\n... and ${mismatches.length - 10} more mismatches`);
      }
    }

    // Note about image matching
    console.log('\n=== Image Matching Notes ===');
    console.log('⚠️  Image-to-product matching requires visual verification.');
    console.log('   The Excel file may have images embedded, but their positions');
    console.log('   may not be directly accessible via ExcelJS.');
    console.log('\n💡 Recommendations:');
    console.log('   1. Manually check a few products on the website');
    console.log('   2. Compare product images with Excel file visually');
    console.log('   3. If mismatches found, re-extract with proper image mapping');

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');

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
  const excelFilePath = process.argv[2] || process.argv[3];
  
  if (!excelFilePath) {
    console.error('❌ Please provide the Excel file path');
    console.log('\nUsage: node verifyImageProductMatching.js <path-to-excel-file>');
    console.log('Example: node verifyImageProductMatching.js "../最新全品类报价单65（2025.4.10）.xlsx"');
    process.exit(1);
  }

  verifyImageProductMatching(excelFilePath)
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifyImageProductMatching };

