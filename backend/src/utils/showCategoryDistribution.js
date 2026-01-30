const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');
const { categorizeProductByCode } = require('./categorizeProductByCode');

/**
 * Show category distribution and explain how it works
 */
async function showCategoryDistribution() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cms_ecommerce';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all categories with product counts
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    console.log('=== Category Distribution ===\n');
    
    const distribution = {};
    let totalProducts = 0;

    for (const category of categories) {
      const count = await Product.countDocuments({ 
        category: category._id, 
        status: 'active' 
      });
      distribution[category.name] = count;
      totalProducts += count;
      
      console.log(`${category.name.padEnd(30)} : ${count.toString().padStart(4)} products`);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Total Products: ${totalProducts}\n`);

    // Show some examples
    console.log('=== How Categories Are Assigned ===\n');
    console.log('Categories are assigned based on product codes (序号):\n');
    
    const examples = [
      { code: 'T-A-003', desc: 'T-A/B/C/D → Condoms & Protection' },
      { code: 'R-E-001', desc: 'R-E/F → Lubricants' },
      { code: 'N-H-150', desc: 'N-H-001 to 179 → Female Toys' },
      { code: 'N-H-200', desc: 'N-H-180+ → Lingerie & Clothing' },
      { code: 'N-H-450', desc: 'N-H-440-495 → BDSM & Accessories' },
      { code: 'N-H-500', desc: 'N-H-500-549 → Lingerie & Clothing' },
      { code: 'N-H-605', desc: 'N-H-600-606 → Accessories & Others' },
      { code: 'G-I-001', desc: 'G-I/J/K/L/M → Dolls & Figures' },
      { code: 'Q-N-003', desc: 'Q-N-001-004 → Health & Care' },
      { code: 'Q-N-015', desc: 'Q-N-005-019.3 → Condoms & Protection' },
      { code: 'Q-N-021', desc: 'Q-N-020-022 → Male Toys' },
      { code: 'Q-N-024', desc: 'Q-N-024/024.1 → Male Toys' },
    ];

    examples.forEach(example => {
      const result = categorizeProductByCode(example.code, 'Test Product');
      console.log(`Code: ${example.code.padEnd(12)} → ${result.en.padEnd(25)} (${example.desc})`);
    });

    console.log('\n💡 If code doesn\'t match any pattern, categorization falls back to product name keywords.');
    console.log('📁 See CATEGORY_DISTRIBUTION_EXPLAINED.md for full details.\n');

    await mongoose.connection.close();
    console.log('✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  showCategoryDistribution()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { showCategoryDistribution };

