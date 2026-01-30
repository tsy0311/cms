const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * Verify that extracted data matches the Excel file
 * Compares product names and order between extracted JSON and Excel
 */
async function verifyExtractedData(excelFilePath, extractedJsonPath) {
  try {
    console.log('📊 Verifying Extracted Data\n');
    console.log(`Excel file: ${excelFilePath}`);
    console.log(`Extracted JSON: ${extractedJsonPath}\n`);

    // Read extracted JSON
    if (!fs.existsSync(extractedJsonPath)) {
      console.error('❌ Extracted JSON file not found:', extractedJsonPath);
      process.exit(1);
    }

    const extractedData = JSON.parse(fs.readFileSync(extractedJsonPath, 'utf8'));
    console.log(`Found ${extractedData.length} products in extracted data\n`);

    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    
    const worksheet = workbook.worksheets[0];
    console.log(`Worksheet: ${worksheet.name}`);
    console.log(`Total rows: ${worksheet.rowCount}\n`);

    // Extract products from Excel
    const excelProducts = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 2) {
        return; // Skip header rows
      }

      const values = row.values;
      const productName = values[2] ? values[2].toString().trim() : '';
      
      if (productName && productName !== '' && !productName.includes('配货中心')) {
        const productCode = values[1] ? values[1].toString().trim() : '';
        excelProducts.push({
          rowNumber: rowNumber,
          code: productCode,
          name: productName
        });
      }
    });

    console.log(`Found ${excelProducts.length} products in Excel\n`);
    console.log('=== Comparing Extracted Data with Excel ===\n');

    // Compare first 50 products
    const compareCount = Math.min(50, extractedData.length, excelProducts.length);
    let matchCount = 0;
    let mismatchCount = 0;
    const mismatches = [];

    for (let i = 0; i < compareCount; i++) {
      const extracted = extractedData[i];
      const excel = excelProducts[i];

      const extractedName = extracted['名称'] ? extracted['名称'].trim() : '';
      const excelName = excel.name.trim();

      // Normalize names for comparison (remove extra spaces, etc.)
      const normalizedExtracted = extractedName.replace(/\s+/g, ' ').trim();
      const normalizedExcel = excelName.replace(/\s+/g, ' ').trim();

      const namesMatch = normalizedExtracted === normalizedExcel || 
                         normalizedExtracted.toLowerCase() === normalizedExcel.toLowerCase();

      if (namesMatch) {
        matchCount++;
        if (i < 10) {
          console.log(`✅ Product ${i + 1}: Names match`);
          console.log(`   "${extractedName.substring(0, 50)}..."`);
        }
      } else {
        mismatchCount++;
        mismatches.push({
          index: i + 1,
          extractedName: extractedName.substring(0, 60),
          excelName: excelName.substring(0, 60),
          extractedCode: extracted['序号'] || 'N/A',
          excelCode: excel.code || 'N/A'
        });

        if (mismatches.length <= 10) {
          console.log(`❌ Product ${i + 1}: Name mismatch`);
          console.log(`   Extracted: "${extractedName.substring(0, 50)}..."`);
          console.log(`   Excel: "${excelName.substring(0, 50)}..."`);
          console.log(`   Codes: Extracted=${extracted['序号'] || 'N/A'}, Excel=${excel.code || 'N/A'}\n`);
        }
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Products compared: ${compareCount}`);
    console.log(`✅ Names match: ${matchCount} (${((matchCount/compareCount)*100).toFixed(1)}%)`);
    console.log(`❌ Names mismatch: ${mismatchCount} (${((mismatchCount/compareCount)*100).toFixed(1)}%)`);

    if (mismatchCount === 0) {
      console.log('\n✅ Extracted data matches Excel file perfectly!');
      console.log('   Products are in the correct order.');
    } else if (mismatchCount <= 5) {
      console.log('\n⚠️  Minor mismatches found. Data is mostly correct.');
    } else {
      console.log('\n❌ Significant mismatches found!');
      console.log('   Product order may be incorrect.');
      console.log('   Images may not match products correctly.');
    }

    // Check if product codes match
    let codeMatchCount = 0;
    for (let i = 0; i < compareCount; i++) {
      const extractedCode = extractedData[i]['序号'] ? extractedData[i]['序号'].toString().trim() : '';
      const excelCode = excelProducts[i].code ? excelProducts[i].code.toString().trim() : '';
      if (extractedCode === excelCode && extractedCode !== '') {
        codeMatchCount++;
      }
    }

    console.log(`\nProduct codes match: ${codeMatchCount}/${compareCount} (${((codeMatchCount/compareCount)*100).toFixed(1)}%)`);

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const excelFilePath = process.argv[2] || '../最新全品类报价单65（2025.4.10）.xlsx';
  const extractedJsonPath = process.argv[3] || '../extracted_data_corrected/extracted_products_with_images.json';

  if (!fs.existsSync(excelFilePath)) {
    console.error('❌ Excel file not found:', excelFilePath);
    process.exit(1);
  }

  verifyExtractedData(excelFilePath, extractedJsonPath)
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifyExtractedData };

