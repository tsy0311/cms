const fs = require('fs');
const path = require('path');

/**
 * Analyze product image to help with categorization
 * This function can be extended with ML models or image recognition APIs
 * 
 * Currently analyzes:
 * - Image filename patterns
 * - Image path patterns
 * - Image metadata (size, type)
 * - Visual content (can be extended with ML)
 */

/**
 * Analyze image to suggest category
 * @param {string|Object} imageData - Image path, URL, or image object with path/url
 * @param {string} productName - Product name for context
 * @returns {Object|null} Suggested category object or null if no suggestion
 */
function analyzeProductImage(imageData, productName = '') {
  let imagePath = '';
  let imageFilename = '';
  
  // Extract path from different input formats
  if (typeof imageData === 'string') {
    imagePath = imageData;
    imageFilename = path.basename(imageData);
  } else if (imageData && imageData.path) {
    imagePath = imageData.path;
    imageFilename = path.basename(imageData.path);
  } else if (imageData && imageData.url) {
    imagePath = imageData.url;
    imageFilename = path.basename(imageData.url);
  } else if (imageData && imageData.filename) {
    imageFilename = imageData.filename;
    imagePath = imageData.filename;
  } else {
    return null;
  }

  // Convert to lowercase for pattern matching
  const filenameLower = imageFilename.toLowerCase();
  const pathLower = imagePath.toLowerCase();

  // Pattern-based category suggestions from filename/path
  const imagePatterns = {
    'Condoms & Protection': {
      keywords: ['condom', '套', '安全套', '避孕套', 'durex', 'double one', '双一', 'momo', '陌陌'],
      patterns: [/condom/i, /套/i, /durex/i, /double.?one/i, /双一/i, /momo/i, /陌陌/i]
    },
    'Lubricants': {
      keywords: ['lubricant', '润滑', 'lube'],
      patterns: [/lubricant/i, /润滑/i, /lube/i]
    },
    'Female Toys': {
      keywords: ['vibrator', '跳蛋', '震动', '女用', 'av棒', '按摩棒', 'vibe'],
      patterns: [/vibrator/i, /跳蛋/i, /震动/i, /女用/i, /av棒/i, /按摩棒/i, /vibe/i]
    },
    'Male Toys': {
      keywords: ['masturbator', '飞机杯', '名器', '男用', 'cup'],
      patterns: [/masturbator/i, /飞机杯/i, /名器/i, /男用/i, /cup/i]
    },
    'Lingerie & Clothing': {
      keywords: ['lingerie', '内衣', '丝袜', '制服', '旗袍', 'stocking', 'socks', 'bra', 'panties'],
      patterns: [/lingerie/i, /内衣/i, /丝袜/i, /制服/i, /旗袍/i, /stocking/i, /sock/i, /bra/i, /pantie/i, /clothing/i, /clothes/i]
    },
    'BDSM & Accessories': {
      keywords: ['bdsm', 'sm', '束缚', '调教', 'toy', 'accessory'],
      patterns: [/bdsm/i, /\bsm\b/i, /束缚/i, /调教/i, /toy/i, /accessory/i]
    },
    'Dolls & Figures': {
      keywords: ['doll', '娃娃', '充气', '实体', 'figure', 'realdoll'],
      patterns: [/doll/i, /娃娃/i, /充气/i, /实体/i, /figure/i, /realdoll/i]
    },
    'Health & Care': {
      keywords: ['test', '测试', 'health', 'care', 'pregnant', '怀孕'],
      patterns: [/test/i, /测试/i, /health/i, /care/i, /pregnant/i, /怀孕/i]
    },
    'Accessories & Others': {
      keywords: ['accessory', '配件', 'plug', 'anal', 'other'],
      patterns: [/accessory/i, /配件/i, /plug/i, /anal/i, /other/i]
    }
  };

  // Check filename and path for category indicators
  for (const [categoryName, data] of Object.entries(imagePatterns)) {
    for (const pattern of data.patterns) {
      if (pattern.test(filenameLower) || pattern.test(pathLower)) {
        return {
          category: categoryName,
          confidence: 0.6, // Medium confidence for filename-based detection
          method: 'filename_pattern',
          matchedPattern: pattern.toString()
        };
      }
    }
  }

  // Check image file existence and get metadata
  try {
    let fullImagePath = imagePath;
    
    // Try different path resolutions
    if (!path.isAbsolute(imagePath)) {
      // Try relative to uploads directory
      const uploadsPath = path.join(__dirname, '../../uploads', imagePath);
      if (fs.existsSync(uploadsPath)) {
        fullImagePath = uploadsPath;
      }
      // Try relative to product_images directory
      const productImagesPath = path.join(__dirname, '../../../extracted_data/product_images', imagePath);
      if (fs.existsSync(productImagesPath)) {
        fullImagePath = productImagesPath;
      }
    }

    if (fs.existsSync(fullImagePath)) {
      const stats = fs.statSync(fullImagePath);
      const ext = path.extname(fullImagePath).toLowerCase();
      
      // Image size might indicate category (dolls are usually larger files)
      // This is a simple heuristic - can be improved with actual image analysis
      if (stats.size > 500000 && /doll|娃娃|充气|实体/i.test(productName)) {
        return {
          category: 'Dolls & Figures',
          confidence: 0.5,
          method: 'file_size_heuristic',
          fileSize: stats.size
        };
      }
    }
  } catch (error) {
    // File not found or error accessing - skip metadata analysis
  }

  return null;
}

/**
 * Combine multiple image analysis results
 * @param {Array} imageAnalyses - Array of analysis results from multiple images
 * @returns {Object|null} Best category suggestion
 */
function combineImageAnalyses(imageAnalyses) {
  if (!imageAnalyses || imageAnalyses.length === 0) {
    return null;
  }

  // Filter out null results
  const validAnalyses = imageAnalyses.filter(a => a !== null);
  if (validAnalyses.length === 0) {
    return null;
  }

  // Count category occurrences
  const categoryCounts = {};
  let totalConfidence = 0;

  validAnalyses.forEach(analysis => {
    const cat = analysis.category;
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = {
        count: 0,
        totalConfidence: 0,
        methods: []
      };
    }
    categoryCounts[cat].count++;
    categoryCounts[cat].totalConfidence += analysis.confidence;
    categoryCounts[cat].methods.push(analysis.method);
  });

  // Find category with highest count and confidence
  let bestCategory = null;
  let bestScore = 0;

  for (const [category, data] of Object.entries(categoryCounts)) {
    const avgConfidence = data.totalConfidence / data.count;
    const score = data.count * avgConfidence; // Weight by count and confidence
    
    if (score > bestScore) {
      bestScore = score;
      bestCategory = {
        category: category,
        confidence: Math.min(0.9, avgConfidence + (data.count - 1) * 0.1), // Boost confidence with multiple matches
        method: `image_analysis (${data.count} images)`,
        methods: data.methods
      };
    }
  }

  return bestCategory;
}

module.exports = {
  analyzeProductImage,
  combineImageAnalyses
};

