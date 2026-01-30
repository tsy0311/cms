/**
 * Categorize product based on product name
 * Returns both English and Chinese category names
 */

// Categories ordered by specificity (most specific first)
const categoryMap = [
  // Lingerie & Clothing - 情趣内衣/服装 (check first as it has specific terms)
  {
    en: 'Lingerie & Clothing',
    cn: '情趣内衣/服装',
    keywords: ['丝袜', '连裤袜', '内衣', '制服', '旗袍', '情趣内衣', '套装', '裙', '连身袜', '网袜', '渔网', '蕾丝', '吊带', 'FM-', '情趣套装']
  },
  
  // Dolls & Figures - 娃娃/充气
  {
    en: 'Dolls & Figures',
    cn: '娃娃/充气',
    keywords: ['实体娃娃', '充气娃娃', '画皮娃娃', '腿模', '半身', '分体', '娃娃', '充气', '实体', '仿真', '人型', '1:1']
  },
  
  // Male Toys - 男性玩具 (check before condoms for terms like 飞机杯)
  {
    en: 'Male Toys',
    cn: '男性玩具',
    keywords: ['飞机杯', '名器', '男用', '男性用品', '男根', '男用软胶', '极致名器', '男用腿模']
  },
  
  // Female Toys - 女性玩具
  {
    en: 'Female Toys',
    cn: '女性玩具',
    keywords: ['跳蛋', '震动棒', 'AV棒', '女用', '女性', '按摩器', '按摩棒', '按摩仪', '阳具', '仿真阳具', '震动阳具', '震动', '加温棒']
  },
  
  // Condoms & Protection - 避孕套/安全套 (check after male toys to avoid conflicts)
  {
    en: 'Condoms & Protection',
    cn: '避孕套/安全套',
    keywords: ['安全套', '避孕套', 'condom', '套套', '水晶套', '狼牙套', '加长套', '加粗套', '龟头套', '套', 'Durex', '杜蕾斯', 'Double one', '双一', 'MOMO', '陌陌', '第六感', '杰士邦', '冈本', 'okamoto']
  },
  
  // Lubricants - 润滑剂
  {
    en: 'Lubricants',
    cn: '润滑剂',
    keywords: ['润滑液', '润滑啫喱', '润滑剂', '润滑膏', '润滑油', '润滑', 'lubricant']
  },
  
  // Enhancement Products - 延时/增强
  {
    en: 'Enhancement Products',
    cn: '延时/增强',
    keywords: ['延时喷剂', '延时', '喷剂', '增强', '提高', '持久', '增强器', '外用', '湿巾', '快感', '增感', '修护', 'HB-', '黑豹', '享久', '安太医', '夜劲', '延时龙水']
  },
  
  // Couples Toys - 情侣玩具
  {
    en: 'Couples Toys',
    cn: '情侣玩具',
    keywords: ['双人', '情侣', '夫妻', '双飞', '互动', '语音', '发音', '智能互动', '智能']
  },
  
  // BDSM & Accessories - BDSM用品
  {
    en: 'BDSM & Accessories',
    cn: 'BDSM用品',
    keywords: ['束缚', '调教', 'SM', 'BDSM', '捆绑', '鞭', '链', '情趣', '情趣用品', '道具', '骰子', '扑克', '飞行棋', '摇签', '玩范']
  },
  
  // Batteries & Power - 电池/充电
  {
    en: 'Batteries & Power',
    cn: '电池/充电',
    keywords: ['电池', 'USB充电', '磁吸充电', '太阳能', '充电', 'USB']
  },
  
  // Health & Care - 健康护理
  {
    en: 'Health & Care',
    cn: '健康护理',
    keywords: ['医用', '测试', '试纸', '消毒', '护理', '凝胶', '洗涤器', '绷带', '创口贴', '退热', '晕车', '酒精', '碘伏', '早早孕', '海氏海诺']
  },
  
  // Accessories & Others - 配件/其他 (default, no keywords)
  {
    en: 'Accessories & Others',
    cn: '配件/其他',
    keywords: []
  }
];

/**
 * Determine product category based on product name
 * @param {string} productName - Product name
 * @returns {Object} Category object with en and cn names
 */
function categorizeProduct(productName) {
  if (!productName || typeof productName !== 'string') {
    return { en: 'Accessories & Others', cn: '配件/其他' };
  }
  
  const nameLower = productName.toLowerCase();
  
  // Check each category in order (most specific first)
  for (const category of categoryMap) {
    if (category.keywords.length === 0) {
      continue; // Skip default category for now
    }
    
    // Check if any keyword matches (case-insensitive)
    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase();
      if (nameLower.includes(keywordLower) || productName.includes(keyword)) {
        return { en: category.en, cn: category.cn };
      }
    }
  }
  
  // Default category (last item in array)
  const defaultCategory = categoryMap[categoryMap.length - 1];
  return { en: defaultCategory.en, cn: defaultCategory.cn };
}

// Export category list for reference
const categoryList = categoryMap.map(cat => ({ en: cat.en, cn: cat.cn }));

module.exports = { categorizeProduct, categoryMap, categoryList };

