const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

/**
 * Extract images from Excel file (XLSX is a ZIP archive)
 */
async function extractImagesFromExcel(filePath, outputDir) {
  try {
    console.log(`Reading Excel file as ZIP: ${filePath}`);
    
    // Read the Excel file as a ZIP
    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    
    // Find all image files in the xl/media directory
    const imageFiles = [];
    const mediaDir = 'xl/media';
    
    zip.forEach((relativePath, file) => {
      if (relativePath.startsWith(mediaDir + '/') && !file.dir) {
        imageFiles.push(relativePath);
      }
    });
    
    console.log(`\nFound ${imageFiles.length} image files in Excel archive`);
    
    if (imageFiles.length === 0) {
      console.log('No images found in the Excel file.');
      return { images: [], mapping: {} };
    }
    
    // Create output directory
    const imagesDir = path.join(outputDir, 'product_images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Extract images and create mapping
    const images = [];
    const mapping = {}; // Map image names to extracted paths
    
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      const fileName = path.basename(imagePath);
      
      try {
        // Get image data
        const imageData = await zip.file(imagePath).async('nodebuffer');
        
        // Determine extension from file name or data
        let ext = path.extname(fileName) || '.png';
        if (!ext.startsWith('.')) {
          ext = '.' + ext;
        }
        
        // Create output filename
        const outputFileName = `image_${i + 1}_${fileName}${ext}`;
        const outputPath = path.join(imagesDir, outputFileName);
        
        // Save image
        fs.writeFileSync(outputPath, imageData);
        
        images.push({
          originalPath: imagePath,
          fileName: outputFileName,
          path: `product_images/${outputFileName}`,
          size: imageData.length
        });
        
        mapping[fileName] = outputFileName;
        
        if (i < 10) {
          console.log(`  Extracted: ${outputFileName} (${(imageData.length / 1024).toFixed(2)} KB)`);
        }
        
      } catch (error) {
        console.warn(`  Warning: Could not extract ${imagePath}: ${error.message}`);
      }
    }
    
    if (imageFiles.length > 10) {
      console.log(`  ... and ${imageFiles.length - 10} more images`);
    }
    
    // Also try to extract relationship files to map images to cells
    console.log('\n=== Looking for image relationships ===');
    const relationships = [];
    
    // Check for drawing relationships
    zip.forEach((relativePath, file) => {
      if (relativePath.includes('xl/drawings/') && relativePath.endsWith('.rels')) {
        relationships.push(relativePath);
      }
    });
    
    console.log(`Found ${relationships.length} relationship files`);
    
    // Save image list
    const imageListPath = path.join(outputDir, 'extracted_images.json');
    fs.writeFileSync(imageListPath, JSON.stringify({ images, mapping, total: images.length }, null, 2), 'utf8');
    console.log(`\nImage list saved to: ${imageListPath}`);
    
    return { images, mapping };
    
  } catch (error) {
    console.error('Error extracting images:', error.message);
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
    console.log('Usage: node extractImagesFromExcel.js <path-to-excel-file> [output-directory]');
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
  
  extractImagesFromExcel(filePath, outputDir)
    .then((result) => {
      console.log(`\nExtraction completed! ${result.images.length} images extracted.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractImagesFromExcel };

