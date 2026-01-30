const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Extract data from Excel file and save to JSON
 */
function extractExcelData(filePath, outputPath) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON (skip first row which is header info)
    const data = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${data.length} rows in Excel file`);
    
    if (data.length === 0) {
      console.log('No data found in Excel file');
      return;
    }
    
    // Extract only product data (skip header rows)
    const products = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Skip header rows
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
      
      // Extract product information
      const product = {
        序号: row['__EMPTY'] || '',
        名称: row['__EMPTY_1'] || '',
        电池型号: row['__EMPTY_2'] || '',
        单位: row['__EMPTY_3'] || '',
        价格: parseFloat(row['__EMPTY_4']) || 0,
        数量: parseInt(row['__EMPTY_5']) || 0,
        规格: row['__EMPTY_6'] || '',
        金额: parseFloat(row['__EMPTY_7']) || 0,
        建议价: parseFloat(row['__EMPTY_8']) || 0,
        市值: parseFloat(row['__EMPTY_9']) || 0,
        条码: row['__EMPTY_10'] || '',
        重量KG: parseFloat(row['__EMPTY_11']) || 0,
        // Also include raw data for reference
        raw: row
      };
      
      products.push(product);
    }
    
    console.log(`\nExtracted ${products.length} products`);
    
    // Save to JSON file
    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
      console.log(`\nData saved to: ${outputPath}`);
    } else {
      // Print to console
      console.log('\nFirst 5 products:');
      products.slice(0, 5).forEach((product, i) => {
        console.log(`\nProduct ${i + 1}:`);
        console.log(`  名称: ${product.名称}`);
        console.log(`  价格: ${product.价格} CNY`);
        console.log(`  建议价: ${product.建议价} CNY`);
        console.log(`  条码: ${product.条码}`);
        console.log(`  数量: ${product.数量}`);
      });
      
      console.log(`\n... and ${products.length - 5} more products`);
    }
    
    return products;
    
  } catch (error) {
    console.error('Error extracting data:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0] || path.join(__dirname, '../../../最新全品类报价单65（2025.4.10）.xlsx');
  const outputPath = args[1] || path.join(__dirname, '../../../extracted_products.json');
  
  if (!filePath) {
    console.error('Please provide the Excel file path');
    console.log('Usage: node extractExcelData.js <path-to-excel-file> [output-json-file]');
    process.exit(1);
  }
  
  extractExcelData(filePath, outputPath);
  console.log('\nExtraction completed!');
}

module.exports = { extractExcelData };

