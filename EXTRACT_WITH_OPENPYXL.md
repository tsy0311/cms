# Extract Products and Images with openpyxl

## Overview

Python script using `openpyxl` library to extract products and images from Excel with proper image-to-row position mapping.

## Prerequisites

Install required Python package:

```bash
pip install openpyxl
```

## Usage

```bash
# Basic usage
python backend/src/utils/extract_with_openpyxl_improved.py "../最新全品类报价单65（2025.4.10）.xlsx" "../extracted_data_openpyxl"

# Or from backend directory
cd backend
python src/utils/extract_with_openpyxl_improved.py "../最新全品类报价单65（2025.4.10）.xlsx" "../extracted_data_openpyxl"
```

## What It Does

1. **Extracts images** from XLSX archive (as ZIP)
2. **Gets image positions** from worksheet._images using openpyxl
3. **Maps images to rows** based on their Excel row positions
4. **Extracts product data** row by row
5. **Matches images to products** using:
   - Primary: Row-based mapping (if image position data is available)
   - Fallback: Sequential index matching
6. **Saves results** to JSON file in the same format as the Node.js extraction

## Output

- `extracted_products_with_images.json` - Product data with matched images
- `product_images_corrected/` - Directory containing all extracted images

## Advantages over JavaScript libraries

- **Better image position support**: openpyxl can access `worksheet._images` with anchor information
- **Row-based matching**: Images can be matched to products by their actual Excel row positions
- **More reliable**: Python's openpyxl library is more mature for Excel image handling

## After Extraction

1. **Verify the extracted data**:
   ```bash
   node src/utils/verifyExtractedData.js "../最新全品类报价单65（2025.4.10）.xlsx" "../extracted_data_openpyxl/extracted_products_with_images.json"
   ```

2. **Re-import products** (if extraction looks good):
   ```bash
   npm run clear:dummy
   node src/utils/importProductsWithSmartCategories.js ../extracted_data_openpyxl/extracted_products_with_images.json --overwrite
   ```

3. **Manually verify** a few products on the website to ensure images match correctly

