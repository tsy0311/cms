# Product Category Recommendations

Based on analysis of your product catalog, here are the recommended categories that make more sense than using 电池型号 (battery model).

## Recommended Categories

### 1. **Condoms & Protection** (避孕套/安全套)
- Products: Condoms, safety products, protection items
- Keywords: 套, 安全套, 避孕套, condom, Double one, Durex, 杜蕾斯, MOMO, 陌陌, etc.
- Example products: Double one双一 003系列, Durex-杜蕾斯系列, MOMO-陌陌系列

### 2. **Lubricants** (润滑剂)
- Products: Lubricants, gels, oils
- Keywords: 润滑, lubricant, 润滑液, 润滑啫喱
- Example products: Double one双一 浓情超爽润滑, 第六感 超薄倍润

### 3. **Male Toys** (男性玩具)
- Products: Male masturbators, toys for men
- Keywords: 飞机杯, 名器, 男用, 男性用品, 男根
- Example products: 飞机杯系列, 名器系列, 男用软胶系列

### 4. **Female Toys** (女性玩具)
- Products: Vibrators, toys for women
- Keywords: 跳蛋, 震动棒, AV棒, 女用, 女性, 按摩器, 按摩棒
- Example products: 跳蛋系列, 震动棒系列, 按摩器系列

### 5. **Couples Toys** (情侣玩具)
- Products: Toys for couples, interactive toys
- Keywords: 双人, 情侣, 夫妻, 双飞, 互动, 语音, 发音, 智能
- Example products: 双飞系列, 智能互动系列, 语音系列

### 6. **BDSM & Accessories** (BDSM用品)
- Products: BDSM gear, games, accessories
- Keywords: 束缚, 调教, SM, BDSM, 捆绑, 情趣用品, 骰子, 扑克, 飞行棋
- Example products: 捆绑系列, 情趣骰子, 飞行棋系列

### 7. **Lingerie & Clothing** (情趣内衣/服装)
- Products: Lingerie, stockings, costumes
- Keywords: 丝袜, 连裤袜, 内衣, 制服, 旗袍, 情趣内衣, 套装
- Example products: FM-霏慕系列丝袜, 制服系列, 旗袍系列

### 8. **Dolls & Figures** (娃娃/充气)
- Products: Sex dolls, inflatable products
- Keywords: 娃娃, 充气, 实体, 仿真, 人型, 1:1, 实体娃娃, 充气娃娃
- Example products: 实体娃娃系列, 充气娃娃系列, 画皮娃娃系列

### 9. **Enhancement Products** (延时/增强)
- Products: Delay sprays, enhancement products
- Keywords: 延时, 喷剂, 增强, 持久, 延时喷剂, 外用, 湿巾
- Example products: HB-黑豹系列, 享久系列, 安太医系列, 夜劲系列

### 10. **Batteries & Power** (电池/充电)
- Products: Batteries, chargers, power accessories
- Keywords: 电池, 充电, USB, USB充电, 磁吸充电, 太阳能
- Example products: 5号电池, 7号电池, USB充电线

### 11. **Health & Care** (健康护理)
- Products: Health products, medical supplies, care items
- Keywords: 医用, 测试, 试纸, 消毒, 护理, 凝胶, 洗涤器, 绷带
- Example products: 早早孕试纸, 海氏海诺系列, 消毒用品

### 12. **Accessories & Others** (配件/其他)
- Products: Other items that don't fit above categories
- Example products: 装饰品, 手提袋, 记号笔, etc.

## How to Use Smart Categories

### Option 1: Preview with Smart Categories (Dry Run)

```bash
cd backend
npm run import:smart:dry "../extracted_data/extracted_products_with_images.json"
```

This will show you what categories each product would be assigned to without actually importing.

### Option 2: Import with Smart Categories

```bash
cd backend
npm run import:smart "../extracted_data/extracted_products_with_images.json"
```

This will import products with the new smart category system.

### Option 3: Update Existing Products with Smart Categories

```bash
cd backend
npm run import:smart:overwrite "../extracted_data/extracted_products_with_images.json"
```

This will update existing products with the new category assignments.

## Comparison

### Current System (Using 电池型号)
- Categories like: "无", "5号电池2节", "USB充电", "卡纸自封袋"
- Not user-friendly
- Difficult for customers to browse
- Categories don't reflect product types

### New System (Smart Categories)
- Categories like: "Condoms & Protection", "Male Toys", "Female Toys"
- User-friendly and intuitive
- Easy for customers to browse by product type
- Categories reflect actual product categories
- Supports both English and Chinese names

## Category Distribution Preview

Based on the analysis script, here's an approximate distribution:
- Condoms & Protection: ~171 products
- Male Toys: ~211 products
- Female Toys: ~147 products
- Lubricants: ~85 products
- Enhancement Products: ~13 products
- Lingerie & Clothing: ~65 products
- Dolls & Figures: ~36 products
- Couples Toys: ~21 products
- BDSM & Accessories: ~71 products
- Batteries & Power: Various
- Health & Care: Various
- Accessories & Others: Remaining items

## Next Steps

1. **Review the categories**: Run a dry-run to see how products are categorized
2. **Adjust if needed**: If some products are miscategorized, you can update the keywords in `backend/src/utils/categorizeProduct.js`
3. **Import with new categories**: Once satisfied, run the import with `--overwrite` to update all products

