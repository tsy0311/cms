# Product Import Guide

This guide explains how to import products from the Chinese Excel price list into the database.

## Overview

The import script reads an Excel file containing product information in Chinese, converts prices from Chinese Yuan (CNY) to Malaysian Ringgit (MYR), and imports products into the MongoDB database.

## Excel File Structure

The Excel file should contain the following columns:
- **序号** (Serial Number) - `__EMPTY`
- **名称** (Product Name) - `__EMPTY_1`
- **电池型号/节数** (Battery Model) - `__EMPTY_2`
- **单位** (Unit) - `__EMPTY_3`
- **价格** (Cost Price) - `__EMPTY_4` - This is the cost of the product
- **数量** (Quantity) - `__EMPTY_5`
- **规格** (Specification) - `__EMPTY_6`
- **金额** (Amount) - `__EMPTY_7`
- **建议价** (Suggested Price) - `__EMPTY_8` - This is the market/selling price
- **市值** (Market Value) - `__EMPTY_9`
- **条码** (Barcode) - `__EMPTY_10`
- **重量KG** (Weight in KG) - `__EMPTY_11`

## Price Conversion

- **Exchange Rate**: 1 CNY = 0.66 MYR (approximate)
- **建议价** (Suggested Price) → Converted to `price` field (selling price)
- **价格** (Cost Price) → Converted to `compareAtPrice` field (if different from selling price)

## Usage

### 1. Inspect Excel File Structure

Before importing, you can inspect the Excel file to see its structure:

```bash
cd backend
npm run inspect:excel "../最新全品类报价单65（2025.4.10）.xlsx"
```

Or with a custom path:

```bash
npm run inspect:excel "<path-to-excel-file>"
```

### 2. Preview Import (Dry Run)

Before importing, you can preview what will be imported without actually adding products to the database:

```bash
cd backend
npm run import:products:dry "../最新全品类报价单65（2025.4.10）.xlsx"
```

This will show you:
- Which products will be created
- Price conversions (CNY → MYR)
- Any errors that would occur
- Summary statistics

### 3. Import Products

To actually import products from the Excel file:

```bash
cd backend
npm run import:products "../最新全品类报价单65（2025.4.10）.xlsx"
```

Or with a custom path:

```bash
npm run import:products "<path-to-excel-file>"
```

You can also use the `--dry-run` flag:

```bash
node src/utils/importProducts.js "<path-to-excel-file>" --dry-run
```

### 3. Direct Node Command

You can also run the script directly:

```bash
cd backend
node src/utils/importProducts.js "../最新全品类报价单65（2025.4.10）.xlsx"
```

## Import Process

1. **Connect to MongoDB**: The script connects using `MONGODB_URI` from `.env`
2. **Read Excel File**: Parses the Excel file using the `xlsx` library
3. **Skip Header Rows**: Automatically skips the first two rows (header information)
4. **Process Each Row**:
   - Extracts product name, description, prices, SKU, etc.
   - Converts CNY prices to MYR
   - Finds or creates category (default: "成人用品")
   - Checks for duplicate products (by SKU or name)
   - Creates product in database
5. **Summary Report**: Displays import statistics

## Product Mapping

| Excel Column | Database Field | Notes |
|-------------|----------------|-------|
| `__EMPTY_1` (名称) | `name` | Product name |
| `__EMPTY_6` (规格) | `description` | Product description |
| `__EMPTY_8` (建议价) | `price` | Market price (CNY → MYR) |
| `__EMPTY_4` (价格) | `compareAtPrice` | Cost price (CNY → MYR) |
| `__EMPTY_10` (条码) | `sku` | Product SKU/Barcode |
| `__EMPTY_5` (数量) | `stock` | Stock quantity |
| `__EMPTY_11` (重量KG) | `weight` | Product weight |
| Default | `category` | "成人用品" category |
| Default | `status` | "active" |

## Requirements

- MongoDB must be running and accessible
- `.env` file must contain `MONGODB_URI`
- Excel file must be in the correct format
- At least one category must exist (or will be created automatically)

## Error Handling

The script will:
- Skip rows with missing product names
- Skip rows with invalid prices
- Skip duplicate products (by SKU or name)
- Continue processing even if individual rows fail
- Display a summary of successes and errors at the end

## Updating Exchange Rate

To update the CNY to MYR exchange rate, edit `backend/src/utils/importProducts.js`:

```javascript
const CNY_TO_MYR_RATE = 0.66; // Update this value
```

## Notes

- Products are set to `status: 'active'` by default
- Duplicate products (same SKU or name) are skipped
- Categories are created automatically if they don't exist
- The script preserves original data and only converts prices

