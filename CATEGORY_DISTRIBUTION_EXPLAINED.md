# How Category Distribution Works

## Overview

The category distribution is based on **product codes (序号)** from your Excel file. Each product code follows a specific pattern that determines which category it belongs to.

## Category Mapping Rules

### 1. **Condoms & Protection** (避孕套/安全套)
- **T-A, T-B, T-C, T-D** codes → Condoms
  - Example: `T-A-003`, `T-B-001`, `T-C-005`
- **Q-N-005 to Q-N-019.3** → Condoms
  - Example: `Q-N-005`, `Q-N-010`, `Q-N-015`, `Q-N-019.3`
- **Q-N-023** → Condoms
  - Example: `Q-N-023`
- **Fallback**: If code doesn't match but product name contains keywords like "套", "condom", "Durex", "杜蕾斯", etc.

### 2. **Lubricants** (润滑剂)
- **R-E, R-F** codes → Lubricants
  - Example: `R-E-001`, `R-F-002`
- **Fallback**: Product name contains "润滑", "lubricant", etc.

### 3. **Female Toys** (女性玩具)
- **N-G-XXX** (any number) → Female Toys (vibrators)
  - Example: `N-G-001`, `N-G-100`, `N-G-200`
- **N-H-001 to N-H-179** → Female Toys (vibrators)
  - Example: `N-H-050`, `N-H-100`, `N-H-179`
- **Fallback**: Product name contains "跳蛋", "震动棒", "女用", etc.

### 4. **Lingerie & Clothing** (情趣内衣/服装)
- **N-H-180 to N-H-439** → Lingerie & Clothing
  - Example: `N-H-180`, `N-H-200`, `N-H-300`
- **N-H-500 to N-H-549** → Lingerie & Clothing
  - Example: `N-H-500`, `N-H-520`, `N-H-549`
- **N-H-550 to N-H-599** → Lingerie & Clothing
- **N-H-607 and above** → Lingerie & Clothing
- **Fallback**: Product name contains "丝袜", "内衣", "制服", "旗袍", etc.

### 5. **BDSM & Accessories** (BDSM用品)
- **N-H-440 to N-H-495** → BDSM & Accessories
  - Example: `N-H-440`, `N-H-450`, `N-H-495`
- **Fallback**: Product name contains "束缚", "调教", "SM", "BDSM", etc.

### 6. **Male Toys** (男性玩具)
- **Q-N-020 to Q-N-022** → Male Toys (penis extenders)
  - Example: `Q-N-020`, `Q-N-021`, `Q-N-022`
- **Q-N-024 and Q-N-024.1** → Male Toys (masturbators)
  - Example: `Q-N-024`, `Q-N-024.1`
- **Fallback**: Product name contains "飞机杯", "名器", "男用", etc.

### 7. **Dolls & Figures** (娃娃/充气)
- **G-I, G-J, G-K, G-L, G-M** codes → Dolls
  - Example: `G-I-001`, `G-J-002`, `G-K-003`, `G-L-004`, `G-M-005`
- **Fallback**: Product name contains "娃娃", "充气", "实体", "仿真", etc.

### 8. **Health & Care** (健康护理)
- **Q-N-001 to Q-N-004** → Health & Care (pregnancy test kits)
  - Example: `Q-N-001`, `Q-N-002`, `Q-N-003`, `Q-N-004`
- **Fallback**: Product name contains "测试", "试纸", "pregnant", etc.

### 9. **Accessories & Others** (配件/其他)
- **N-H-600 to N-H-606** → Accessories (anal plugs)
  - Example: `N-H-600`, `N-H-605`, `N-H-606`
- **Default**: Any product that doesn't match the above patterns

### 10. **Enhancement Products** (延时/增强)
- Based on product name keywords: "延时", "喷剂", "增强", "持久", etc.
- No specific code pattern (relies on name matching)

## How It Works

The categorization uses a **three-tier approach** with priority order:

1. **Primary Method**: Check product code (序号) first
   - The script extracts the product code from the Excel data
   - It matches the code against predefined patterns
   - Category is assigned based on the code pattern
   - **Highest priority** - if code matches, this is used

2. **Secondary Method**: If code doesn't match, analyze product images
   - Analyzes image filenames and paths for category keywords
   - Checks for visual patterns in image metadata
   - Uses image filename patterns (e.g., "condom", "doll", "lingerie")
   - Confidence threshold: 60% minimum to use image-based categorization
   - **Medium priority** - only used if code doesn't match

3. **Fallback Method**: If code and images don't match, check product name
   - Uses keyword matching on the product name
   - Looks for Chinese and English keywords associated with each category
   - Assigns category based on found keywords
   - **Lower priority** - used when code and image analysis fail

4. **Default**: If no method matches, assign to "Accessories & Others"

## Code Location

The categorization logic is in:
- **File**: `backend/src/utils/categorizeProductByCode.js`
- **Function**: `categorizeProductByCode(productCode, productName, images)`
- **Image Analysis**: `backend/src/utils/analyzeProductImage.js`
- **Used by**: `backend/src/utils/importProductsWithSmartCategories.js`

## Image-Based Categorization

The system now includes image identification for better categorization:

### How Image Analysis Works:
1. **Filename Pattern Matching**: Analyzes image filenames for category keywords
   - Examples: `condom_*.jpg` → Condoms, `doll_*.png` → Dolls
   - Looks for keywords in both English and Chinese

2. **Path Pattern Matching**: Checks image paths for category indicators
   - Example: `/uploads/lingerie/product.jpg` → Lingerie & Clothing

3. **Metadata Analysis**: Uses file size and type as heuristics
   - Larger files might indicate dolls (high-detail products)
   - File extensions provide context

4. **Multiple Image Support**: Combines analysis from multiple product images
   - Higher confidence when multiple images suggest the same category
   - Uses weighted voting based on confidence scores

### Image Categories Detected:
- **Condoms**: Keywords like "condom", "套", "durex", "双一"
- **Lubricants**: "lubricant", "润滑", "lube"
- **Female Toys**: "vibrator", "跳蛋", "震动", "女用"
- **Male Toys**: "masturbator", "飞机杯", "名器"
- **Lingerie**: "lingerie", "内衣", "丝袜", "stocking", "bra"
- **Dolls**: "doll", "娃娃", "充气", "实体", "realdoll"
- **BDSM**: "bdsm", "sm", "束缚", "调教"
- **Health**: "test", "测试", "health", "pregnant"

### Example:
```javascript
// Code doesn't match → Check images → Found "condom" in image filename → Category: Condoms
categorizeProductByCode('UNKNOWN-001', 'Product Name', [
  { filename: 'condom_durex_image.jpg' }
]);
// Returns: { en: 'Condoms & Protection', cn: '避孕套/安全套' }
```

## Current Distribution

Based on the last import:
- **Condoms & Protection**: 426 products
- **Dolls & Figures**: 295 products
- **Lubricants**: 211 products
- **Lingerie & Clothing**: 202 products
- **Female Toys**: 173 products
- **BDSM & Accessories**: 54 products
- **Accessories & Others**: 42 products
- **Male Toys**: 24 products
- **Enhancement Products**: 19 products
- **Health & Care**: 16 products

## How to Modify Categories

If you need to change category mappings:

1. Edit `backend/src/utils/categorizeProductByCode.js`
2. Modify the code patterns or keyword lists
3. Re-import products with: `npm run import:smart:overwrite`

The categorization runs during the import process, so you need to re-import to apply changes.

