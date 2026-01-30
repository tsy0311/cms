# Image-to-Product Matching Fix Instructions

## Problem

Product images may not match their products correctly because:
1. Images were matched using 1:1 index-based mapping (assumes image order = product order)
2. ExcelJS cannot reliably extract image row positions from the Excel file
3. Product order in database may differ from Excel file order

## Current Status

✅ **New extraction completed**: `extracted_data_corrected/extracted_products_with_images.json`
- 1,462 products extracted
- 1,462 images extracted
- Uses index-based matching (same as before, but with fresh extraction)

## Verification

Run verification to check if extracted data matches Excel:

```bash
cd backend
node src/utils/verifyExtractedData.js "../最新全品类报价单65（2025.4.10）.xlsx" "../extracted_data_corrected/extracted_products_with_images.json"
```

## Solutions

### Option 1: Re-import with Corrected Data (Recommended)

If verification shows the extracted data matches Excel correctly:

1. **Backup current database** (optional but recommended)
2. **Clear existing products**:
   ```bash
   npm run clear:dummy
   ```

3. **Re-import with corrected data**:
   ```bash
   npm run import:smart:overwrite
   ```
   Or manually:
   ```bash
   node src/utils/importProductsWithSmartCategories.js ../extracted_data_corrected/extracted_products_with_images.json --overwrite
   ```

4. **Verify on website** - Check a few products manually to ensure images match

### Option 2: Manual Visual Verification (If images still don't match)

Since ExcelJS cannot reliably map images to rows, you may need to:

1. **Open Excel file** and verify image-to-product mappings visually
2. **Note any mismatches** - Write down which images belong to which products
3. **Manual fix via admin panel** - Update product images one by one

### Option 3: Use Different Extraction Method

If you have access to the Excel file structure:
1. Try using a different library or method to extract image positions
2. Consider using Python libraries like `openpyxl` which may have better image position support
3. Extract image-to-row mapping using Excel's internal structure (drawing relationships)

## Image Position Mapping Limitation

**ExcelJS limitation**: The `worksheet.images` array doesn't reliably provide `range` or `anchor` information with row/column positions in many Excel files. This is why the script falls back to index-based matching.

## Next Steps

1. ✅ Run `verifyExtractedData.js` to check if extracted data matches Excel
2. If matches are good (>95%), proceed with re-import
3. If matches are poor, consider manual verification or different extraction approach
4. After re-import, manually verify 10-20 products on the website

## Commands Summary

```bash
# Verify extracted data matches Excel
npm run verify:extracted

# Re-extract data (if needed)
npm run extract:corrected "../最新全品类报价单65（2025.4.10）.xlsx" "../extracted_data_corrected"

# Clear and re-import
npm run clear:dummy
npm run import:smart:overwrite
```

