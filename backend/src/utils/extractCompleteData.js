const XLSX = require('xlsx');
const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

/**
 * Extract complete data and images from Excel file
 * Uses XLSX for data (more reliable) and JSZip for images
 */
async function extractCompleteData(filePath, outputDir) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    
    // Step 1: Extract product data using XLSX (proven to work)
    console.log('\n=== Step 1: Extracting product data ===');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} rows in Excel file`);
    
    // Extract products (skip header rows)
    const products = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Skip header rows
      if (i === 0 && row['配货中心']) {
        continue;
      }
      if (i === 1 && row['__EMPTY'] === '序号') {
        continue;
      }
      
      // Skip rows without product name
      if (!row['__EMPTY_1'] || row['__EMPTY_1'].trim() === '') {
        continue;
      }
      
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
        图片: [] // Will be filled in next step
      };
      
      products.push(product);
    }
    
    console.log(`Extracted ${products.length} products`);
    
    // Step 2: Extract images using JSZip
    console.log('\n=== Step 2: Extracting images ===');
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
    
    // Step 3: Save images and create mapping
    console.log('\n=== Step 3: Saving images ===');
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
        
        // Keep original extension
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
    
    // Step 4: Match images to products (1:1 by index)
    console.log('\n=== Step 4: Matching images to products ===');
    const matchedCount = Math.min(products.length, extractedImages.length);
    
    for (let i = 0; i < matchedCount; i++) {
      const image = extractedImages[i];
      products[i].图片 = [{
        filename: image.fileName,
        path: image.path,
        size: image.size
      }];
    }
    
    console.log(`Matched ${matchedCount} products with images`);
    
    if (products.length > matchedCount) {
      console.log(`Warning: ${products.length - matchedCount} products without images`);
    }
    if (extractedImages.length > matchedCount) {
      console.log(`Info: ${extractedImages.length - matchedCount} extra images (may be header images)`);
    }
    
    // Step 5: Save results
    console.log('\n=== Step 5: Saving results ===');
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
    console.log('Usage: node extractCompleteData.js <path-to-excel-file> [output-directory]');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  extractCompleteData(filePath, outputDir)
    .then(() => {
      console.log('\nExtraction completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractCompleteData };

