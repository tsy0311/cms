const fs = require('fs');
const path = require('path');

/**
 * Get statistics from extracted JSON data
 */
function getStats(jsonFilePath) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    console.log('\n=== Product Extraction Statistics ===\n');
    console.log(`Total products: ${data.length}`);
    
    // Products with prices
    const withPrice = data.filter(p => p.建议价 > 0);
    console.log(`Products with suggested price: ${withPrice.length}`);
    
    // Products with barcodes
    const withBarcode = data.filter(p => p.条码 && p.条码.toString().trim() !== '');
    console.log(`Products with barcode: ${withBarcode.length}`);
    
    // Products with stock
    const withStock = data.filter(p => p.数量 > 0);
    console.log(`Products with stock: ${withStock.length}`);
    
    // Price ranges
    const prices = data.filter(p => p.建议价 > 0).map(p => p.建议价);
    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
      console.log(`\nPrice range (CNY):`);
      console.log(`  Minimum: ${minPrice} CNY`);
      console.log(`  Maximum: ${maxPrice} CNY`);
      console.log(`  Average: ${avgPrice} CNY`);
    }
    
    // Total value
    const totalValue = data.reduce((sum, p) => sum + (p.金额 || 0), 0);
    console.log(`\nTotal amount: ${totalValue.toFixed(2)} CNY`);
    
    // Sample products
    console.log(`\n=== Sample Products (First 3) ===\n`);
    data.slice(0, 3).forEach((product, i) => {
      console.log(`${i + 1}. ${product.名称}`);
      console.log(`   Serial: ${product.序号}`);
      console.log(`   Cost: ${product.价格} CNY | Suggested: ${product.建议价} CNY`);
      console.log(`   Barcode: ${product.条码 || 'N/A'}`);
      console.log(`   Stock: ${product.数量}`);
      console.log(`   Weight: ${product.重量KG} KG`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const jsonFilePath = process.argv[2] || path.join(__dirname, '../../extracted_products.json');
  
  if (!fs.existsSync(jsonFilePath)) {
    console.error(`File not found: ${jsonFilePath}`);
    process.exit(1);
  }
  
  getStats(jsonFilePath);
}

module.exports = { getStats };

