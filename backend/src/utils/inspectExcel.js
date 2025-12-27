const XLSX = require('xlsx');
const path = require('path');

/**
 * Inspect Excel file structure
 */
function inspectExcelFile(filePath) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    
    console.log(`\nSheet names: ${workbook.SheetNames.join(', ')}`);
    
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`\n=== Sheet ${index + 1}: ${sheetName} ===`);
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`Total rows: ${data.length}`);
      
      if (data.length > 0) {
        console.log('\nColumn names:');
        const columns = Object.keys(data[0]);
        columns.forEach((col, i) => {
          console.log(`  ${i + 1}. ${col}`);
        });
        
        console.log('\nFirst 3 rows sample:');
        data.slice(0, 3).forEach((row, i) => {
          console.log(`\nRow ${i + 1}:`);
          Object.keys(row).forEach(key => {
            console.log(`  ${key}: ${row[key]}`);
          });
        });
      }
    });
    
  } catch (error) {
    console.error('Error reading Excel file:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const filePath = process.argv[2] || path.join(__dirname, '../../最新全品类报价单65（2025.4.10）.xlsx');
  
  if (!filePath) {
    console.error('Please provide the Excel file path');
    console.log('Usage: node inspectExcel.js <path-to-excel-file>');
    process.exit(1);
  }

  inspectExcelFile(filePath);
}

module.exports = { inspectExcelFile };

