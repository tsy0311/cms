const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

/**
 * Extract data and images from Excel file
 */
async function extractExcelWithImages(filePath, outputDir) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1); // Get first worksheet
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
    
    console.log(`Worksheet name: ${worksheet.name}`);
    console.log(`Total rows: ${worksheet.rowCount}`);
    
    // Create output directory for images
    const imagesDir = path.join(outputDir, 'product_images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`Created images directory: ${imagesDir}`);
    }
    
    // Extract products
    const products = [];
    let productRowIndex = 0; // Track actual product rows (excluding headers)
    
    // Process each row
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip header rows (first 2 rows)
      if (rowNumber <= 2) {
        return;
      }
      
      try {
        // Get row values
        const values = row.values;
        
        // Skip empty rows or rows without product name
        // Column B (index 2) should contain product name (名称)
        const productName = values[2] ? values[2].toString().trim() : '';
        if (!productName || productName === '') {
          return;
        }
        
        productRowIndex++;
        
        // Extract product data
        const serialNumber = values[1] ? values[1].toString().trim() : '';
        const batteryModel = values[3] ? values[3].toString().trim() : '';
        const unit = values[4] ? values[4].toString().trim() : '';
        const costPrice = parseFloat(values[5]) || 0;
        const quantity = parseInt(values[6]) || 0;
        const specification = values[7] ? values[7].toString().trim() : '';
        const amount = parseFloat(values[8]) || 0;
        const suggestedPrice = parseFloat(values[9]) || 0;
        const marketValue = parseFloat(values[10]) || 0;
        const barcode = values[11] ? values[11].toString().trim() : '';
        const weight = parseFloat(values[12]) || 0;
        
        const product = {
          序号: serialNumber,
          名称: productName,
          电池型号: batteryModel,
          单位: unit,
          价格: costPrice,
          数量: quantity,
          规格: specification,
          金额: amount,
          建议价: suggestedPrice,
          市值: marketValue,
          条码: barcode,
          重量KG: weight,
          图片: [] // Will contain image paths
        };
        
        // Extract images from this row
        // Column A (index 1) typically contains images (产品图)
        const images = [];
        const rowImages = [];
        
        // Check if row has images
        // In ExcelJS, images are stored in worksheet.images array
        // We need to match images to rows by their position
        if (worksheet.images && worksheet.images.length > 0) {
          worksheet.images.forEach((image, imgIndex) => {
            // Get image's anchor (position) - tl = top-left
            const anchor = image.range ? image.range.tl : null;
            if (anchor) {
              // Check if image is in this row (column 1 or 2 typically)
              const imageRow = anchor.row + 1; // ExcelJS uses 0-based, Excel uses 1-based
              const imageCol = anchor.col + 1;
              
              // Match image to this row (images are usually in column 2, which is 配货中心/产品图)
              if (imageRow === rowNumber && (imageCol === 1 || imageCol === 2)) {
                try {
                  // Get image buffer
                  const imageBuffer = image.buffer || image.image;
                  
                  if (imageBuffer) {
                    // Determine image extension
                    let ext = 'jpg';
                    if (image.extension) {
                      ext = image.extension.replace('.', '');
                    } else if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
                      ext = 'jpg';
                    } else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
                      ext = 'png';
                    }
                    
                    // Create filename
                    const filename = `product_${productRowIndex}_${rowNumber}_${imgIndex}.${ext}`;
                    const imagePath = path.join(imagesDir, filename);
                    
                    // Save image
                    fs.writeFileSync(imagePath, imageBuffer);
                    
                    const imageInfo = {
                      filename: filename,
                      path: `product_images/${filename}`,
                      row: rowNumber,
                      column: imageCol
                    };
                    
                    images.push(imageInfo);
                    rowImages.push(imagePath);
                    
                    console.log(`  Extracted image for row ${rowNumber}: ${filename}`);
                  }
                } catch (imgError) {
                  console.warn(`  Warning: Could not extract image for row ${rowNumber}: ${imgError.message}`);
                }
              }
            }
          });
        }
        
        product.图片 = images;
        products.push(product);
        
        if (productRowIndex <= 5) {
          console.log(`Row ${rowNumber}: ${productName} - ${images.length} image(s)`);
        }
        
      } catch (error) {
        console.warn(`Error processing row ${rowNumber}: ${error.message}`);
      }
    });
    
    console.log(`\nExtracted ${products.length} products`);
    console.log(`Total images found: ${products.reduce((sum, p) => sum + p.图片.length, 0)}`);
    
    // Save products data to JSON
    const jsonPath = path.join(outputDir, 'extracted_products_with_images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
    console.log(`\nData saved to: ${jsonPath}`);
    
    // Create a summary file
    const summary = {
      totalProducts: products.length,
      totalImages: products.reduce((sum, p) => sum + p.图片.length, 0),
      productsWithImages: products.filter(p => p.图片.length > 0).length,
      extractionDate: new Date().toISOString()
    };
    
    const summaryPath = path.join(outputDir, 'extraction_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`Summary saved to: ${summaryPath}`);
    
    return { products, summary };
    
  } catch (error) {
    console.error('Error extracting data:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const filePath = args[0] || path.join(__dirname, '../../../最新全品类报价单65（2025.4.10）.xlsx');
  const outputDir = args[1] || path.join(__dirname, '../../../extracted_data');
  
  if (!filePath) {
    console.error('Please provide the Excel file path');
    console.log('Usage: node extractExcelWithImages.js <path-to-excel-file> [output-directory]');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  extractExcelWithImages(filePath, outputDir)
    .then(() => {
      console.log('\nExtraction completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractExcelWithImages };

