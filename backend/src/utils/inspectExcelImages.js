const ExcelJS = require('exceljs');
const path = require('path');

/**
 * Inspect Excel file for images
 */
async function inspectExcelImages(filePath) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found');
    }
    
    console.log(`\nWorksheet: ${worksheet.name}`);
    console.log(`Total rows: ${worksheet.rowCount}`);
    
    // Check for images in worksheet
    console.log('\n=== Checking for images ===');
    
    // Method 1: worksheet.images (if available)
    if (worksheet.images) {
      console.log(`\nworksheet.images array length: ${worksheet.images.length}`);
      worksheet.images.forEach((image, index) => {
        console.log(`\nImage ${index + 1}:`);
        console.log(`  Type: ${typeof image}`);
        console.log(`  Keys: ${Object.keys(image || {}).join(', ')}`);
        if (image.range) {
          console.log(`  Range: ${JSON.stringify(image.range)}`);
        }
        if (image.buffer) {
          console.log(`  Buffer size: ${image.buffer.length} bytes`);
        }
        if (image.image) {
          console.log(`  Image object exists`);
        }
      });
    } else {
      console.log('worksheet.images is not available');
    }
    
    // Method 2: Check workbook model
    if (workbook.model && workbook.model.worksheets) {
      console.log('\n=== Workbook Model ===');
      const wsModel = workbook.model.worksheets[0];
      if (wsModel.images) {
        console.log(`Model images found: ${wsModel.images.length}`);
      }
    }
    
    // Method 3: Check worksheet model directly
    if (worksheet.model) {
      console.log('\n=== Worksheet Model ===');
      const model = worksheet.model;
      if (model.images) {
        console.log(`Model images: ${model.images.length}`);
        model.images.forEach((img, i) => {
          console.log(`Image ${i + 1}:`, JSON.stringify(img, null, 2));
        });
      }
    }
    
    // Method 4: Try to access via workbook.xlsx.archive
    console.log('\n=== Trying to access archive ===');
    try {
      const archive = workbook.xlsx.archive;
      if (archive) {
        console.log('Archive found');
        // List files in archive
        const files = [];
        archive.forEach((entry) => {
          if (entry.name.includes('image') || entry.name.includes('media')) {
            files.push(entry.name);
          }
        });
        console.log(`Media/image files in archive: ${files.length}`);
        files.forEach(f => console.log(`  - ${f}`));
      }
    } catch (e) {
      console.log(`Cannot access archive: ${e.message}`);
    }
    
    // Check a few sample cells for image data
    console.log('\n=== Checking sample cells ===');
    for (let row = 1; row <= Math.min(10, worksheet.rowCount); row++) {
      const rowObj = worksheet.getRow(row);
      rowObj.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        // Check if cell has value that might be image reference
        if (cell.value && typeof cell.value === 'object') {
          console.log(`Row ${row}, Col ${colNumber}:`, Object.keys(cell.value));
        }
      });
    }
    
  } catch (error) {
    console.error('Error inspecting Excel file:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const filePath = process.argv[2] || path.join(__dirname, '../../../最新全品类报价单65（2025.4.10）.xlsx');
  
  inspectExcelImages(filePath)
    .then(() => {
      console.log('\nInspection completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { inspectExcelImages };

