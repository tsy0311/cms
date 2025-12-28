const fs = require('fs');
const path = require('path');

/**
 * Analyze products to suggest better categories
 */
function analyzeCategories(jsonFilePath) {
  try {
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const products = JSON.parse(jsonData);
    
    console.log(`Analyzing ${products.length} products...\n`);
    
    // Analyze product names to identify product types
    const categorySuggestions = {
      'Condoms & Protection': [],
      'Lubricants': [],
      'Male Toys': [],
      'Female Toys': [],
      'Couples Toys': [],
      'BDSM & Accessories': [],
      'Lingerie & Clothing': [],
      'Dolls & Figures': [],
      'Enhancement Products': [],
      'Accessories & Others': []
    };
    
    // Keywords for categorization
    const keywords = {
      'Condoms & Protection': ['套', 'condom', '安全套', '避孕套', '套套', '水晶套', '狼牙套', '加长套'],
      'Lubricants': ['润滑', 'lubricant', '润滑液', '润滑啫喱', '润滑剂'],
      'Male Toys': ['飞机杯', '名器', '阳具', '男用', '男性', '男性用品', '锁紧环', '延时', '喷剂'],
      'Female Toys': ['跳蛋', '震动', '震动棒', 'AV棒', '女性', '女用', '按摩', '飞机杯'],
      'Couples Toys': ['双人', '情侣', '夫妻', '双飞', '互动', '语音', '发音'],
      'BDSM & Accessories': ['束缚', '情趣', '道具', '调教', '鞭', '链', 'BDSM'],
      'Lingerie & Clothing': ['丝袜', '连裤袜', '内衣', '制服', '旗袍', '情趣内衣', '套装', '裙', '制服'],
      'Dolls & Figures': ['娃娃', '充气', '实体', '仿真', '人型', '1:1', '实体娃娃'],
      'Enhancement Products': ['延时', '喷剂', '增强', '提高', '持久', '增强器'],
      'Accessories & Others': ['电池', '充电', '护理', '清洁', '消毒', '医用', '测试', '试纸']
    };
    
    // Categorize products
    products.forEach((product, index) => {
      const name = product['名称'] || '';
      const currentCategory = product['电池型号'] || '无';
      
      let categorized = false;
      
      for (const [category, categoryKeywords] of Object.entries(keywords)) {
        if (categoryKeywords.some(keyword => name.includes(keyword))) {
          categorySuggestions[category].push({
            name: name,
            currentCategory: currentCategory,
            index: index + 1
          });
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categorySuggestions['Accessories & Others'].push({
          name: name,
          currentCategory: currentCategory,
          index: index + 1
        });
      }
    });
    
    // Display analysis
    console.log('=== Category Analysis ===\n');
    for (const [category, items] of Object.entries(categorySuggestions)) {
      if (items.length > 0) {
        console.log(`${category}: ${items.length} products`);
        console.log(`  Sample products (first 5):`);
        items.slice(0, 5).forEach(item => {
          console.log(`    - ${item.name.substring(0, 50)}... (Current: ${item.currentCategory})`);
        });
        if (items.length > 5) {
          console.log(`    ... and ${items.length - 5} more`);
        }
        console.log('');
      }
    }
    
    // Generate category mapping recommendations
    console.log('\n=== Recommended Category Mapping ===\n');
    console.log('Suggested English Categories:');
    console.log('1. Condoms & Protection (避孕套/安全套类)');
    console.log('2. Lubricants (润滑剂类)');
    console.log('3. Male Toys (男性玩具类)');
    console.log('4. Female Toys (女性玩具类)');
    console.log('5. Couples Toys (情侣玩具类)');
    console.log('6. BDSM & Accessories (BDSM用品类)');
    console.log('7. Lingerie & Clothing (情趣内衣/服装类)');
    console.log('8. Dolls & Figures (娃娃/充气类)');
    console.log('9. Enhancement Products (延时/增强类)');
    console.log('10. Accessories & Others (配件/其他类)\n');
    
    // Save detailed analysis
    const analysisPath = path.join(__dirname, '../../../category_analysis.json');
    fs.writeFileSync(analysisPath, JSON.stringify({
      summary: Object.fromEntries(
        Object.entries(categorySuggestions).map(([cat, items]) => [cat, items.length])
      ),
      categories: categorySuggestions,
      generatedAt: new Date().toISOString()
    }, null, 2), 'utf8');
    
    console.log(`Detailed analysis saved to: ${analysisPath}`);
    
  } catch (error) {
    console.error('Error analyzing categories:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const jsonFilePath = process.argv[2] || path.join(__dirname, '../../../extracted_data/extracted_products_with_images.json');
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`File not found: ${jsonFilePath}`);
    process.exit(1);
  }
  
  analyzeCategories(jsonFilePath);
}

module.exports = { analyzeCategories };

