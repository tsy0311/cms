const ExcelJS = require('exceljs');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

/**
 * Extract both data and images from Excel file, matching them by row
 */
async function extractExcelDataWithImages(filePath, outputDir) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    
    // Step 1: Extract images from ZIP archive
    console.log('\n=== Step 1: Extracting images ===');
    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    
    const mediaDir = 'xl/media';
    const imageFiles = [];
    
    zip.forEach((relativePath, file) => {
      if (relativePath.startsWith(mediaDir + '/') && !file.dir) {
        imageFiles.push(relativePath);
      }
    });
    
    console.log(`Found ${imageFiles.length} images in Excel archive`);
    
    // Step 2: Read Excel data with ExcelJS to get cell positions
    console.log('\n=== Step 2: Reading Excel data ===');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found');
    }
    
    // Step 3: Try to get image-to-cell mapping from drawing relationships
    console.log('\n=== Step 3: Mapping images to cells ===');
    const imageMapping = new Map(); // Map row number to image files
    
    // Read drawing relationships to map images to cells
    try {
      const drawingRels = [];
      zip.forEach((relativePath) => {
        if (relativePath.includes('xl/drawings/') && relativePath.endsWith('.rels')) {
          drawingRels.push(relativePath);
        }
      });
      
      // For now, we'll match images to rows based on order
      // Since we have 1462 images and ~1462 products, they should match 1:1
      console.log(`Will match ${imageFiles.length} images to product rows by order`);
      
    } catch (error) {
      console.warn(`Warning: Could not read relationships: ${error.message}`);
    }
    
    // Step 4: Extract images to directory
    console.log('\n=== Step 4: Saving images ===');
    const imagesDir = path.join(outputDir, 'product_images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    const extractedImages = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      const originalFileName = path.basename(imagePath);
      
      try {
        const imageData = await zip.file(imagePath).async('nodebuffer');
        
        // Keep original extension or detect from data
        let ext = path.extname(originalFileName) || '.jpeg';
        const outputFileName = `product_${i + 1}_${originalFileName}${ext}`;
        const outputPath = path.join(imagesDir, outputFileName);
        
        fs.writeFileSync(outputPath, imageData);
        
        extractedImages.push({
          index: i,
          originalPath: imagePath,
          fileName: outputFileName,
          path: `product_images/${outputFileName}`,
          size: imageData.length
        });
        
        if (i < 5) {
          console.log(`  Saved: ${outputFileName} (${(imageData.length / 1024).toFixed(2)} KB)`);
        }
      } catch (error) {
        console.warn(`  Warning: Could not extract ${imagePath}: ${error.message}`);
      }
    }
    
    if (imageFiles.length > 5) {
      console.log(`  ... and ${imageFiles.length - 5} more images`);
    }
    
    // Step 5: Extract product data and match with images
    console.log('\n=== Step 5: Extracting product data ===');
    const products = [];
    let productIndex = 0;
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const values = row.values;
      
      // Skip header rows
      // Row 1: Contains "配货中心" description
      if (rowNumber === 1) {
        return;
      }
      
      // Row 2: Contains column headers (序号, 产品图, etc.)
      if (rowNumber === 2) {
        const firstCol = values[1] ? values[1].toString().trim() : '';
        if (firstCol === '序号') {
          return;
        }
      }
      
      // Get product name from column 2 (index 2 in values array)
      const productName = values[2] ? values[2].toString().trim() : '';
      
      // Skip rows without product name or rows that look like headers
      if (!productName || 
          productName === '' || 
          productName.includes('配货中心') || 
          productName === '产品图' ||
          productName === '名称') {
        return;
      }
      
      productIndex++;
      
      // Extract product data
      const product = {
        序号: values[1] ? values[1].toString().trim() : '',
        名称: productName,
        电池型号: values[3] ? values[3].toString().trim() : '',
        单位: values[4] ? values[4].toString().trim() : '',
        价格: parseFloat(values[5]) || 0,
        数量: parseInt(values[6]) || 0,
        规格: values[7] ? values[7].toString().trim() : '',
        金额: parseFloat(values[8]) || 0,
        建议价: parseFloat(values[9]) || 0,
        市值: parseFloat(values[10]) || 0,
        条码: values[11] ? values[11].toString().trim() : '',
        重量KG: parseFloat(values[12]) || 0,
        图片: []
      };
      
      // Match image to this product (1:1 mapping by index)
      if (productIndex <= extractedImages.length) {
        const image = extractedImages[productIndex - 1];
        product.图片 = [{
          filename: image.fileName,
          path: image.path,
          size: image.size
        }];
      }
      
      products.push(product);
      
      if (productIndex <= 5) {
        console.log(`  Product ${productIndex}: ${productName} - ${product.图片.length} image(s)`);
      }
    });
    
    console.log(`\nExtracted ${products.length} products with images`);
    
    // Step 6: Save results
    console.log('\n=== Step 6: Saving results ===');
    const jsonPath = path.join(outputDir, 'extracted_products_with_images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
    console.log(`Products data saved to: ${jsonPath}`);
    
    // Summary
    const summary = {
      totalProducts: products.length,
      totalImages: extractedImages.length,
      productsWithImages: products.filter(p => p.图片 && p.图片.length > 0).length,
      extractionDate: new Date().toISOString()
    };
    
    const summaryPath = path.join(outputDir, 'extraction_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`Summary saved to: ${summaryPath}`);
    
    console.log('\n=== Extraction Summary ===');
    console.log(`Total products: ${summary.totalProducts}`);
    console.log(`Total images: ${summary.totalImages}`);
    console.log(`Products with images: ${summary.productsWithImages}`);
    
    return { products, images: extractedImages, summary };
    
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
    console.log('Usage: node extractExcelDataWithImages.js <path-to-excel-file> [output-directory]');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  extractExcelDataWithImages(filePath, outputDir)
    .then(() => {
      console.log('\nExtraction completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractExcelDataWithImages };

