/**
 * Categorize product based on product code (序号), name, and images
 * Uses the provided mapping rules
 */

const { analyzeProductImage, combineImageAnalyses } = require('./analyzeProductImage');

/**
 * Determine product category based on product code (序号), name, and images
 * @param {string} productCode - Product code (序号) like "T-A-003", "N-H-179", etc.
 * @param {string} productName - Product name
 * @param {Array|Object} images - Product images (optional) - can be array of image objects or single image
 * @returns {Object} Category object with en and cn names, plus confidence and method
 */
function categorizeProductByCode(productCode, productName, images = null) {
  const codeUpper = productCode ? productCode.toUpperCase().trim() : '';
  const nameLower = (productName || '').toLowerCase();
  
  // If no code, try image analysis first, then name-based
  if (!productCode || typeof productCode !== 'string') {
    if (images) {
      const imageArray = Array.isArray(images) ? images : [images];
      const imageAnalyses = imageArray
        .map(img => analyzeProductImage(img, productName))
        .filter(result => result !== null);
      
      if (imageAnalyses.length > 0) {
        const imageCategory = combineImageAnalyses(imageAnalyses);
        if (imageCategory && imageCategory.confidence >= 0.6) {
          const categoryMap = {
            'Condoms & Protection': { en: 'Condoms & Protection', cn: '避孕套/安全套' },
            'Lubricants': { en: 'Lubricants', cn: '润滑剂' },
            'Female Toys': { en: 'Female Toys', cn: '女性玩具' },
            'Male Toys': { en: 'Male Toys', cn: '男性玩具' },
            'Lingerie & Clothing': { en: 'Lingerie & Clothing', cn: '情趣内衣/服装' },
            'BDSM & Accessories': { en: 'BDSM & Accessories', cn: 'BDSM用品' },
            'Dolls & Figures': { en: 'Dolls & Figures', cn: '娃娃/充气' },
            'Health & Care': { en: 'Health & Care', cn: '健康护理' },
            'Accessories & Others': { en: 'Accessories & Others', cn: '配件/其他' }
          };
          const mapped = categoryMap[imageCategory.category];
          if (mapped) return mapped;
        }
      }
    }
    return categorizeByNameOnly(productName);
  }
  
  // T-A/B/C/D - condoms
  if (/^T-[A-D]/i.test(codeUpper)) {
    return { en: 'Condoms & Protection', cn: '避孕套/安全套' };
  }
  
  // R-E/F - lubricants
  if (/^R-[E-F]/i.test(codeUpper)) {
    return { en: 'Lubricants', cn: '润滑剂' };
  }
  
  // N-G to H till 179 - vibrators (Female Toys)
  // Check N-G first (all N-G are vibrators)
  if (/^N-G-[0-9]+$/i.test(codeUpper)) {
    return { en: 'Female Toys', cn: '女性玩具' };
  }
  
  // N-H ranges - need to check specific ranges
  if (/^N-H-[0-9]+$/i.test(codeUpper)) {
    const match = codeUpper.match(/^N-H-([0-9]+)$/i);
    if (match) {
      const num = parseInt(match[1]);
      
      // N-H-1 to 179 - vibrators (Female Toys)
      if (num <= 179) {
        return { en: 'Female Toys', cn: '女性玩具' };
      }
      
      // N-H-440 to N-H-495 - SM accessories
      if (num >= 440 && num <= 495) {
        return { en: 'BDSM & Accessories', cn: 'BDSM用品' };
      }
      
      // N-H-500 starting till N-H-549 - clothing
      if (num >= 500 && num <= 549) {
        return { en: 'Lingerie & Clothing', cn: '情趣内衣/服装' };
      }
      
      // N-H-600-606 - anal plug (accessories)
      if (num >= 600 && num <= 606) {
        return { en: 'Accessories & Others', cn: '配件/其他' };
      }
      
      // N-H-180 to 439 - clothing
      if (num >= 180 && num < 440) {
        return { en: 'Lingerie & Clothing', cn: '情趣内衣/服装' };
      }
      
      // N-H-550-599 and 607+ - clothing
      if (num >= 550 && num < 600) {
        return { en: 'Lingerie & Clothing', cn: '情趣内衣/服装' };
      }
      if (num >= 607) {
        return { en: 'Lingerie & Clothing', cn: '情趣内衣/服装' };
      }
    }
  }
  
  // G-I/J/K/L/M - doll
  if (/^G-[I-M]/i.test(codeUpper)) {
    return { en: 'Dolls & Figures', cn: '娃娃/充气' };
  }
  
  // Q-N-001 to 004 - pregnant test kit
  if (/^Q-N-00[1-4]$/i.test(codeUpper)) {
    return { en: 'Health & Care', cn: '健康护理' };
  }
  
  // Q-N-005 to 019.3 - condoms (check for numbers 5-19, can have decimal)
  if (/^Q-N-0[0-9]+(\.[0-9]+)?$/i.test(codeUpper)) {
    const match = codeUpper.match(/^Q-N-0([0-9]+)(\.[0-9]+)?$/i);
    if (match) {
      const num = parseInt(match[1]);
      if (num >= 5 && num <= 19) {
        return { en: 'Condoms & Protection', cn: '避孕套/安全套' };
      }
    }
  }
  
  // Q-N-020 to 022 - penis extender (Male Toys/Enhancement)
  if (/^Q-N-02[0-2]$/i.test(codeUpper)) {
    return { en: 'Male Toys', cn: '男性玩具' };
  }
  
  // Q-N-023 - condoms
  if (/^Q-N-023$/i.test(codeUpper)) {
    return { en: 'Condoms & Protection', cn: '避孕套/安全套' };
  }
  
  // Q-N-024 and Q-N-024.1 - masturbate men (Male Toys)
  if (/^Q-N-024/i.test(codeUpper)) {
    return { en: 'Male Toys', cn: '男性玩具' };
  }
  
  // If no code pattern matched, try image-based categorization first, then name-based
  let imageCategory = null;
  
  if (images) {
    const imageArray = Array.isArray(images) ? images : [images];
    const imageAnalyses = imageArray
      .map(img => analyzeProductImage(img, productName))
      .filter(result => result !== null);
    
    if (imageAnalyses.length > 0) {
      imageCategory = combineImageAnalyses(imageAnalyses);
    }
  }
  
  // If image analysis found a category with good confidence, use it
  if (imageCategory && imageCategory.confidence >= 0.6) {
    // Map category name to our standard format
    const categoryMap = {
      'Condoms & Protection': { en: 'Condoms & Protection', cn: '避孕套/安全套' },
      'Lubricants': { en: 'Lubricants', cn: '润滑剂' },
      'Female Toys': { en: 'Female Toys', cn: '女性玩具' },
      'Male Toys': { en: 'Male Toys', cn: '男性玩具' },
      'Lingerie & Clothing': { en: 'Lingerie & Clothing', cn: '情趣内衣/服装' },
      'BDSM & Accessories': { en: 'BDSM & Accessories', cn: 'BDSM用品' },
      'Dolls & Figures': { en: 'Dolls & Figures', cn: '娃娃/充气' },
      'Health & Care': { en: 'Health & Care', cn: '健康护理' },
      'Accessories & Others': { en: 'Accessories & Others', cn: '配件/其他' }
    };
    
    const mapped = categoryMap[imageCategory.category];
    if (mapped) {
      return mapped; // Return standard format, image analysis already provided confidence
    }
  }
  
  // Fallback to name-based categorization
  return categorizeByNameOnly(productName);
}

/**
 * Fallback categorization by product name only
 */
function categorizeByNameOnly(productName) {
  if (!productName || typeof productName !== 'string') {
    return { en: 'Accessories & Others', cn: '配件/其他' };
  }
  
  const nameLower = productName.toLowerCase();
  
  // Define keyword mappings
  const keywords = {
    'Condoms & Protection': { cn: '避孕套/安全套', words: ['套', 'condom', '安全套', '避孕套', '套套', '水晶套', '狼牙套', '加长套', '加粗套', '龟头套', '包皮环', '锁紧环', '锁精环', 'durex', '杜蕾斯', 'double one', '双一', 'momo', '陌陌', '第六感', '杰士邦', '冈本', 'okamoto'] },
    'Lubricants': { cn: '润滑剂', words: ['润滑', 'lubricant', '润滑液', '润滑啫喱', '润滑剂', '润滑膏', '润滑油'] },
    'Female Toys': { cn: '女性玩具', words: ['跳蛋', '震动棒', 'av棒', '女用', '女性', '按摩器', '按摩棒', '按摩仪', '阳具', '仿真阳具', '震动阳具'] },
    'Male Toys': { cn: '男性玩具', words: ['飞机杯', '名器', '男用', '男性用品', '男根', '男用软胶', '极致名器', '男用腿模'] },
    'Lingerie & Clothing': { cn: '情趣内衣/服装', words: ['丝袜', '连裤袜', '内衣', '制服', '旗袍', '情趣内衣', '套装', '裙', '连身袜', '网袜', '渔网', '蕾丝', '吊带'] },
    'BDSM & Accessories': { cn: 'BDSM用品', words: ['束缚', '调教', 'sm', 'bdsm', '捆绑', '情趣用品', '道具', '骰子', '扑克', '飞行棋', '摇签'] },
    'Dolls & Figures': { cn: '娃娃/充气', words: ['娃娃', '充气', '实体', '仿真', '人型', '1:1', '实体娃娃', '充气娃娃', '画皮娃娃', '腿模', '半身', '分体'] },
    'Enhancement Products': { cn: '延时/增强', words: ['延时', '喷剂', '增强', '持久', '延时喷剂', '外用', '湿巾', '快感', '增感', '修护', 'penis extender', 'extender'] },
    'Health & Care': { cn: '健康护理', words: ['医用', '测试', '试纸', '消毒', '护理', '凝胶', '洗涤器', '绷带', '创口贴', '退热', '晕车', '酒精', '碘伏', 'pregnant', '怀孕', '早早孕'] }
  };
  
  // Check each category
  for (const [categoryEn, data] of Object.entries(keywords)) {
    for (const keyword of data.words) {
      if (nameLower.includes(keyword.toLowerCase()) || productName.includes(keyword)) {
        return { en: categoryEn, cn: data.cn };
      }
    }
  }
  
  // Default category
  return { en: 'Accessories & Others', cn: '配件/其他' };
}

module.exports = { categorizeProductByCode, categorizeByNameOnly };
