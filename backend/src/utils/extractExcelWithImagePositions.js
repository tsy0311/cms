const ExcelJS = require('exceljs');
const JSZip = require('jszip');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Extract products and images from Excel with proper image-to-row mapping
 * Uses ExcelJS to get image positions (row/column) for accurate matching
 */
async function extractExcelWithImagePositions(filePath, outputDir) {
  try {
    console.log(`Reading Excel file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Step 1: Read Excel with ExcelJS to get image positions
    console.log('\n=== Step 1: Reading Excel with ExcelJS to get image positions ===');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No worksheet found');
    }

    // Get images from worksheet (ExcelJS provides row/column positions)
    // Note: getImages() might not exist, try worksheet.images instead
    const worksheetImages = worksheet.images || (typeof worksheet.getImages === 'function' ? worksheet.getImages() : []);
    console.log(`Found ${worksheetImages.length} images in worksheet`);

    // Create map: Excel row number -> image index
    // Images are typically in column 1 or 2 (序号 or 产品图 columns)
    const rowToImageIndex = new Map();
    
    for (let i = 0; i < worksheetImages.length; i++) {
      const image = worksheetImages[i];
      if (image.range) {
        const row = image.range.tl.row + 1; // ExcelJS is 0-indexed, Excel is 1-indexed
        const col = image.range.tl.col + 1;
        
        // Images are usually in column 1 or 2
        if (col === 1 || col === 2) {
          // Store image index for this row
          if (!rowToImageIndex.has(row)) {
            rowToImageIndex.set(row, i);
            if (i < 5) {
              console.log(`  Image ${i + 1}: Row ${row}, Column ${col}`);
            }
          }
        }
      }
    }

    console.log(`Mapped ${rowToImageIndex.size} images to rows`);

    // Step 2: Extract images from ZIP archive
    console.log('\n=== Step 2: Extracting images from archive ===');
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

    // Save images
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

    // Step 3: Extract product data using XLSX
    console.log('\n=== Step 3: Extracting product data ===');
    const workbookXLSX = XLSX.readFile(filePath);
    const sheetName = workbookXLSX.SheetNames[0];
    const worksheetXLSX = workbookXLSX.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheetXLSX, { defval: '', raw: false });

    console.log(`Found ${data.length} rows in Excel sheet`);

    // Extract products
    const products = [];
    let productIndex = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const productName = row['__EMPTY_1'] || '';
      
      // Skip header rows
      if (i === 0 && row['配货中心']) {
        continue;
      }
      if (i === 1 && row['__EMPTY'] === '序号') {
        continue;
      }
      
      // Skip rows without product name
      if (!productName || productName.trim() === '' || productName.includes('配货中心')) {
        continue;
      }

      productIndex++;

      // Excel row number (1-indexed, accounting for header rows)
      // XLSX sheet_to_json starts from row 1 (after skipping empty header)
      // We need to map back to actual Excel row number
      // Assuming header is 2 rows, actual product rows start from row 3
      const excelRowNumber = i + 1; // XLSX row number (may need adjustment)

      const product = {
        序号: row['__EMPTY'] || '',
        名称: productName.trim(),
        电池型号: row['__EMPTY_2'] || '无',
        单位: row['__EMPTY_3'] || '',
        价格: parseFloat(row['__EMPTY_4']) || 0,
        数量: parseInt(row['__EMPTY_5']) || 0,
        规格: row['__EMPTY_6'] || '',
        金额: parseFloat(row['__EMPTY_7']) || 0,
        建议价: parseFloat(row['__EMPTY_8']) || 0,
        市值: parseFloat(row['__EMPTY_9']) || 0,
        条码: row['__EMPTY_10'] || '',
        重量KG: parseFloat(row['__EMPTY_11']) || 0,
        图片: []
      };

      // Try to match image using row-to-image map
      // Note: ExcelJS row numbers may differ slightly from XLSX row numbers due to header handling
      // We'll try the exact row and nearby rows
      let matchedImageIndex = null;
      
      if (rowToImageIndex.has(excelRowNumber)) {
        matchedImageIndex = rowToImageIndex.get(excelRowNumber);
      } else if (rowToImageIndex.has(excelRowNumber + 1)) {
        // Try next row (in case of 1-row offset)
        matchedImageIndex = rowToImageIndex.get(excelRowNumber + 1);
      } else if (rowToImageIndex.has(excelRowNumber - 1)) {
        // Try previous row
        matchedImageIndex = rowToImageIndex.get(excelRowNumber - 1);
      }

      if (matchedImageIndex !== null && matchedImageIndex < extractedImages.length) {
        const image = extractedImages[matchedImageIndex];
        product.图片 = [{
          filename: image.fileName,
          path: image.path,
          size: image.size
        }];
      } else {
        // Fallback: use index-based matching if row mapping failed
        if (productIndex <= extractedImages.length) {
          const image = extractedImages[productIndex - 1];
          product.图片 = [{
            filename: image.fileName,
            path: image.path,
            size: image.size
          }];
        }
      }

      products.push(product);

      if (productIndex <= 5) {
        const imageInfo = product.图片.length > 0 ? product.图片[0].filename : 'None';
        console.log(`  Product ${productIndex}: "${product.名称.substring(0, 40)}..." - Image: ${imageInfo}`);
      }
    }

    console.log(`\nExtracted ${products.length} products`);

    // Step 4: Save results
    console.log('\n=== Step 4: Saving results ===');
    const jsonPath = path.join(outputDir, 'extracted_products_with_images.json');
    fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
    console.log(`Products data saved to: ${jsonPath}`);

    // Summary
    const summary = {
      totalProducts: products.length,
      totalImages: extractedImages.length,
      productsWithImages: products.filter(p => p.图片 && p.图片.length > 0).length,
      imagesMappedByPosition: rowToImageIndex.size,
      extractionDate: new Date().toISOString(),
      note: 'Images matched using ExcelJS row positions with index fallback'
    };

    const summaryPath = path.join(outputDir, 'extraction_summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`Summary saved to: ${summaryPath}`);

    console.log('\n=== Extraction Summary ===');
    console.log(`Total products: ${summary.totalProducts}`);
    console.log(`Total images: ${summary.totalImages}`);
    console.log(`Products with images: ${summary.productsWithImages}`);
    console.log(`Images mapped by position: ${summary.imagesMappedByPosition}`);
    console.log('\n✅ Extraction complete!');
    console.log('⚠️  Please verify a few products to ensure images match correctly.');

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
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Excel file not found at: ${filePath}`);
    console.log('Usage: node extractExcelWithImagePositions.js [excel-file-path] [output-directory]');
    process.exit(1);
  }

  extractExcelWithImagePositions(filePath, outputDir)
    .then(() => {
      console.log('\n✅ Extraction complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractExcelWithImagePositions };

