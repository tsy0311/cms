const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const JSZip = require('jszip');

/**
 * Re-extract product data and images with proper image-to-product mapping
 * This script attempts to match images to products based on Excel cell positions
 */
async function reExtractWithImageMapping(excelFilePath, outputDir) {
  try {
    if (!excelFilePath || !fs.existsSync(excelFilePath)) {
      throw new Error(`Excel file not found: ${excelFilePath}`);
    }

    console.log('📊 Re-extracting Product Data with Image Mapping\n');
    console.log(`Excel file: ${excelFilePath}`);
    console.log(`Output directory: ${outputDir}\n`);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'extracted_products_with_correct_images.json');
    const imagesDir = path.join(outputDir, 'product_images_corrected');
    
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Step 1: Extract images from XLSX (as ZIP)
    console.log('=== Step 1: Extracting images from XLSX ===\n');
    const zip = await JSZip.loadAsync(fs.readFileSync(excelFilePath));
    const imageFiles = Object.keys(zip.files).filter(file => 
      file.startsWith('xl/media/') && 
      /\.(jpg|jpeg|png|gif|bmp)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} images in XLSX archive\n`);

    const extractedImages = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      try {
        const imageData = await zip.file(imagePath).async('nodebuffer');
        const originalFileName = path.basename(imagePath);
        const ext = path.extname(originalFileName) || '.jpeg';
        const outputFileName = `image_${i + 1}_${originalFileName}`;
        const outputPath = path.join(imagesDir, outputFileName);
        
        fs.writeFileSync(outputPath, imageData);
        
        extractedImages.push({
          index: i,
          originalPath: imagePath,
          fileName: outputFileName,
          path: `product_images_corrected/${outputFileName}`,
          size: imageData.length
        });
        
        if (i < 5) {
          console.log(`  Extracted: ${outputFileName} (${(imageData.length / 1024).toFixed(2)} KB)`);
        }
      } catch (error) {
        console.warn(`  Warning: Could not extract ${imagePath}: ${error.message}`);
      }
    }

    console.log(`\n✅ Extracted ${extractedImages.length} images\n`);

    // Step 2: Read Excel with ExcelJS to get image positions
    console.log('=== Step 2: Reading Excel with image positions ===\n');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelFilePath);
    
    const worksheet = workbook.worksheets[0];
    console.log(`Worksheet: ${worksheet.name}`);
    console.log(`Total rows: ${worksheet.rowCount}\n`);

    // Get images with positions
    const imagesWithPositions = [];
    if (worksheet.images && worksheet.images.length > 0) {
      console.log(`Found ${worksheet.images.length} images via worksheet.images\n`);
      
      worksheet.images.forEach((image, idx) => {
        const anchor = image.range ? image.range.tl : null;
        const row = anchor ? anchor.row : null;
        const col = anchor ? anchor.col : null;
        
        imagesWithPositions.push({
          index: idx,
          row: row,
          column: col,
          imageId: image.imageId || idx,
          hasPosition: row !== null && col !== null
        });
      });

      const positionedCount = imagesWithPositions.filter(img => img.hasPosition).length;
      console.log(`Images with position data: ${positionedCount} / ${imagesWithPositions.length}\n`);
      
      if (positionedCount === 0) {
        console.log('⚠️  No images have position data. Will use index-based matching as fallback.\n');
      }
    } else {
      console.log('⚠️  worksheet.images is empty. Will use index-based matching.\n');
    }

    // Step 3: Extract product data
    console.log('=== Step 3: Extracting product data ===\n');
    const products = [];
    let productRowIndex = 0;

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      // Skip header rows
      if (rowNumber <= 2) {
        return;
      }

      const rowData = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        rowData[colNumber] = cell.value;
      });

      // Extract fields (adjust column numbers based on your Excel structure)
      const productCode = (rowData[1] || rowData[2] || '').toString().trim();
      const productName = (rowData[2] || rowData[3] || '').toString().trim();
      
      if (!productName || productName === '') {
        return; // Skip empty rows
      }

      // Try to find matching image based on row position
      let matchedImages = [];
      
      // Method 1: Try to match by row position (if image position data exists)
      if (imagesWithPositions.length > 0) {
        const rowImages = imagesWithPositions.filter(img => 
          img.hasPosition && img.row === rowNumber
        );
        
        if (rowImages.length > 0) {
          // Found images at this row
          rowImages.forEach(imgInfo => {
            if (extractedImages[imgInfo.index]) {
              matchedImages.push(extractedImages[imgInfo.index]);
            }
          });
        }
      }
      
      // Method 2: Fallback to index-based matching if no position data
      if (matchedImages.length === 0 && extractedImages[productRowIndex]) {
        matchedImages.push(extractedImages[productRowIndex]);
      }

      const product = {
        rowNumber: rowNumber,
        序号: productCode,
        名称: productName,
        图片: matchedImages
      };

      // Add other fields if needed
      if (rowData[3]) product['电池型号'] = rowData[3].toString().trim();
      if (rowData[4]) product['单位'] = rowData[4].toString().trim();
      if (rowData[5]) product['价格'] = parseFloat(rowData[5]) || 0;
      if (rowData[6]) product['数量'] = parseInt(rowData[6]) || 0;
      if (rowData[7]) product['规格'] = rowData[7].toString().trim();
      if (rowData[8]) product['金额'] = parseFloat(rowData[8]) || 0;
      if (rowData[9]) product['建议价'] = parseFloat(rowData[9]) || 0;
      if (rowData[10]) product['市值'] = parseFloat(rowData[10]) || 0;
      if (rowData[11]) product['条码'] = rowData[11] ? rowData[11].toString().trim() : '';
      if (rowData[12]) product['重量KG'] = parseFloat(rowData[12]) || 0;

      products.push(product);
      productRowIndex++;

      if (productRowIndex <= 5) {
        console.log(`Row ${rowNumber}: "${productName.substring(0, 40)}..." - ${matchedImages.length} image(s)`);
      }
    });

    console.log(`\n✅ Extracted ${products.length} products\n`);

    // Step 4: Save to JSON
    console.log('=== Step 4: Saving to JSON ===\n');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
    console.log(`✅ Saved to: ${outputPath}\n`);

    // Summary
    const productsWithImages = products.filter(p => p.图片 && p.图片.length > 0).length;
    console.log('=== Summary ===');
    console.log(`Total products: ${products.length}`);
    console.log(`Products with images: ${productsWithImages}`);
    console.log(`Images extracted: ${extractedImages.length}`);
    console.log(`Output file: ${outputPath}`);
    console.log(`Images directory: ${imagesDir}\n`);

    console.log('✅ Re-extraction complete!');
    console.log('\n⚠️  Note: Image matching accuracy depends on Excel structure.');
    console.log('   Please verify a few products manually to ensure correct matching.');

    return {
      products,
      images: extractedImages,
      outputPath,
      imagesDir
    };

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const excelFilePath = process.argv[2];
  const outputDir = process.argv[3] || path.join(__dirname, '../../../extracted_data_corrected');

  if (!excelFilePath) {
    console.error('❌ Please provide the Excel file path');
    console.log('\nUsage: node reExtractWithImageMapping.js <excel-file> [output-dir]');
    console.log('Example: node reExtractWithImageMapping.js "../最新全品类报价单65（2025.4.10）.xlsx"');
    process.exit(1);
  }

  reExtractWithImageMapping(excelFilePath, outputDir)
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { reExtractWithImageMapping };

