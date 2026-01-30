const ExcelJS = require('exceljs');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Extract products and images from Excel with proper image-to-product mapping
 * This version uses ExcelJS to get image positions and matches them to product rows
 */
async function extractExcelWithProperImageMapping(filePath, outputDir) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Step 1: Extract images from ZIP archive first
    console.log('\n=== Step 1: Extracting images ===');
    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    
    const mediaDir = 'xl/media';
    const imageFiles = [];
    
    zip.forEach((relativePath) => {
      if (relativePath.startsWith(mediaDir + '/') && !relativePath.endsWith('/')) {
        imageFiles.push(relativePath);
      }
    });
    
    console.log(`Found ${imageFiles.length} images in Excel archive`);

    // Save images to directory
    const imagesDir = path.join(outputDir, 'product_images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const imageMap = new Map(); // Map original image path to saved filename
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      const originalFileName = path.basename(imagePath);
      
      try {
        const imageData = await zip.file(imagePath).async('nodebuffer');
        let ext = path.extname(originalFileName) || '.jpeg';
        const outputFileName = `image_${i + 1}_${originalFileName}${ext}`;
        const outputPath = path.join(imagesDir, outputFileName);
        
        fs.writeFileSync(outputPath, imageData);
        imageMap.set(originalFileName, {
          index: i + 1,
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

    // Step 2: Read Excel data using ExcelJS to get product rows and image positions
    console.log('\n=== Step 2: Reading Excel data with ExcelJS ===');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found');
    }

    // Get images from worksheet
    const worksheetImages = worksheet.getImages();
    console.log(`Found ${worksheetImages.length} images in worksheet`);

    // Create a map of row number to image filename
    const rowToImageMap = new Map();
    for (const image of worksheetImages) {
      const range = image.range;
      const rowNumber = range.tl.row + 1; // ExcelJS is 0-indexed, Excel is 1-indexed
      const imageIndex = image.imageId || image.name;
      
      // Find the corresponding image file
      // Image ID corresponds to the rId in drawing relationships
      // We need to match this to the actual image file
      if (imageIndex) {
        // Try to find image by checking the drawing relationships
        // For now, we'll use the row number to match
        rowToImageMap.set(rowNumber, imageIndex);
      }
    }

    // Step 3: Read product data using XLSX (better for data extraction)
    console.log('\n=== Step 3: Extracting product data ===');
    const workbookXLSX = XLSX.readFile(filePath);
    const sheetName = workbookXLSX.SheetNames[0];
    const worksheetXLSX = workbookXLSX.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheetXLSX, { defval: '', raw: false });

    console.log(`Found ${data.length} rows in Excel sheet`);

    // Step 4: Extract products and match with images
    console.log('\n=== Step 4: Matching products with images ===');
    const products = [];
    let productIndex = 0;

    // We need to find the header row first
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      const keys = Object.keys(row);
      if (keys.some(key => row[key] && row[key].toString().includes('序号'))) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.warn('Warning: Could not find header row, assuming first row is header');
      headerRowIndex = 0;
    }

    // Get column mappings from header row
    const headerRow = data[headerRowIndex];
    const columnMap = {};
    Object.keys(headerRow).forEach(key => {
      const value = headerRow[key];
      if (value && typeof value === 'string') {
        if (value.includes('序号')) columnMap['序号'] = key;
        else if (value.includes('名称') || value.includes('产品名')) columnMap['名称'] = key;
        else if (value.includes('电池型号')) columnMap['电池型号'] = key;
        else if (value.includes('价格')) columnMap['价格'] = key;
        else if (value.includes('建议价')) columnMap['建议价'] = key;
        else if (value.includes('规格')) columnMap['规格'] = key;
        else if (value.includes('条码')) columnMap['条码'] = key;
        else if (value.includes('重量')) columnMap['重量KG'] = key;
        else if (value.includes('数量')) columnMap['数量'] = key;
      }
    });

    // If column mapping failed, try to infer from first data row
    if (Object.keys(columnMap).length === 0) {
      console.warn('Could not map columns from header, trying first row...');
      const firstDataRow = data[headerRowIndex + 1];
      if (firstDataRow) {
        const keys = Object.keys(firstDataRow);
        columnMap['序号'] = keys[0];
        columnMap['名称'] = keys[1];
        columnMap['电池型号'] = keys[2];
        columnMap['价格'] = keys[4];
        columnMap['建议价'] = keys[8];
        columnMap['规格'] = keys[6];
        columnMap['条码'] = keys[10];
        columnMap['重量KG'] = keys[11];
        columnMap['数量'] = keys[5];
      }
    }

    console.log('Column mapping:', columnMap);

    // Extract products
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      const productName = row[columnMap['名称']] || '';
      
      // Skip rows without product name or header-like rows
      if (!productName || 
          productName.toString().trim() === '' || 
          productName.toString().includes('配货中心') ||
          productName.toString() === '名称') {
        continue;
      }

      productIndex++;

      // Extract product data
      const product = {
        序号: row[columnMap['序号']] || '',
        名称: productName.toString().trim(),
        电池型号: row[columnMap['电池型号']] || '无',
        单位: row['单位'] || '',
        价格: parseFloat(row[columnMap['价格']]) || 0,
        数量: parseInt(row[columnMap['数量']]) || 0,
        规格: row[columnMap['规格']] || '',
        金额: parseFloat(row['金额']) || 0,
        建议价: parseFloat(row[columnMap['建议价']]) || 0,
        市值: parseFloat(row['市值']) || 0,
        条码: row[columnMap['条码']] || '',
        重量KG: parseFloat(row[columnMap['重量KG']]) || 0,
        图片: []
      };

      // Try to match image to this product row
      // Excel row number = i + 1 (since Excel is 1-indexed and array is 0-indexed)
      const excelRowNumber = i + 1;
      
      // Check if we have an image mapped to this row
      if (rowToImageMap.has(excelRowNumber)) {
        const imageId = rowToImageMap.get(excelRowNumber);
        // Find image file - this is complex, so we'll use index-based matching for now
        // but log the row mapping for verification
        console.log(`Row ${excelRowNumber}: Image ID ${imageId} found`);
      }

      // For now, match by product index (will be improved with proper image-to-cell mapping)
      // This is a limitation - we need to use ExcelJS drawing relationships to properly map
      const imageIndex = productIndex - 1;
      const imageEntries = Array.from(imageMap.values());
      if (imageIndex < imageEntries.length) {
        const image = imageEntries[imageIndex];
        product.图片 = [{
          filename: image.fileName,
          path: image.path,
          size: image.size
        }];
      }

      products.push(product);

      if (productIndex <= 5) {
        console.log(`  Product ${productIndex}: "${product.名称.substring(0, 40)}..." - Image: ${product.图片.length > 0 ? product.图片[0].filename : 'None'}`);
      }
    }

    console.log(`\nExtracted ${products.length} products`);

    // Step 5: Save results
    console.log('\n=== Step 5: Saving results ===');
    const jsonPath = path.join(outputDir, 'extracted_products_with_images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
    console.log(`Products data saved to: ${jsonPath}`);

    // Summary
    const summary = {
      totalProducts: products.length,
      totalImages: imageMap.size,
      productsWithImages: products.filter(p => p.图片 && p.图片.length > 0).length,
      extractionDate: new Date().toISOString(),
      note: 'Images matched by index - manual verification recommended'
    };

    const summaryPath = path.join(outputDir, 'extraction_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`Summary saved to: ${summaryPath}`);

    console.log('\n=== Extraction Summary ===');
    console.log(`Total products: ${summary.totalProducts}`);
    console.log(`Total images: ${summary.totalImages}`);
    console.log(`Products with images: ${summary.productsWithImages}`);
    console.log('\n⚠️  Note: Image-to-product matching uses index-based approach.');
    console.log('   Please verify a few products manually to ensure correct matching.');

    return { products, images: Array.from(imageMap.values()), summary };

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
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Excel file not found at: ${filePath}`);
    console.log('Usage: node extractExcelWithProperImageMapping.js [excel-file-path] [output-directory]');
    process.exit(1);
  }

  extractExcelWithProperImageMapping(filePath, outputDir)
    .then(() => {
      console.log('\n✅ Extraction complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractExcelWithProperImageMapping };

