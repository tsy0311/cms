# Excel Product Import Guide

This guide explains how to import products and product images from an Excel file into the website.

## Excel File Format

Your Excel file should have the following structure:

### Required Columns

1. **Name** (名称) - Product name
   - English: `Name`, `Product Name`, `Product`, `Title`
   - Chinese: `名称`, `产品名称`, `产品名`, `商品名称`

2. **Price** (价格) - Product price
   - English: `Price`, `Cost`
   - Chinese: `价格`, `单价`, `售价`
   - Format: Numbers only (currency symbols will be removed automatically)
   - Example: `59.99` or `¥59.99` or `$59.99`

### Optional Columns

3. **Description** (描述) - Product description
   - English: `Description`, `Desc`
   - Chinese: `描述`, `产品描述`, `说明`
   - If not provided, the product name will be used as description

4. **Category** (类别) - Product category
   - English: `Category`, `Cat`
   - Chinese: `类别`, `分类`, `产品类别`
   - Supported categories:
     - Educational (教育/教育类)
     - Plush (毛绒/毛绒玩具)
     - Building Blocks (积木/积木类)
     - Outdoor (户外/户外类)
     - Arts & Crafts (手工/手工类)
     - STEM (科学/科学类)
   - If not provided, defaults to "Educational"

5. **Age Range** (年龄范围) - Target age group
   - English: `Age Range`, `Age`, `Age Range (Years)`
   - Chinese: `年龄范围`, `适用年龄`, `年龄`
   - Supported ranges:
     - `0-2 Years` (or `0到2`, `0至2`)
     - `3-5 Years` (or `3到5`, `3至5`)
     - `6-8 Years` (or `6到8`, `6至8`)
     - `9-12 Years` (or `9到12`, `9至12`)
     - `13+ Years` (or `13以上`)
   - If not provided, defaults to "3-5 Years"

6. **Stock** (库存) - Inventory quantity
   - English: `Stock`, `Quantity`, `Qty`, `Inventory`
   - Chinese: `库存`, `数量`, `库存数量`
   - Format: Whole numbers only
   - If not provided, defaults to 0

7. **Image** (图片) - Product image URL or path
   - English: `Image`, `Image URL`, `ImageUrl`, `Img`, `Picture`, `Photo`
   - Chinese: `图片`, `图片链接`, `图片地址`, `图像`
   - Format: 
     - Full URL: `https://example.com/image.jpg`
     - Local path: `./images/product1.jpg` (will need to be uploaded separately)
   - If not provided, a default placeholder image will be used

## Example Excel Structure

| Name (名称) | Price (价格) | Description (描述) | Category (类别) | Age Range (年龄范围) | Stock (库存) | Image (图片) |
|------------|-------------|-------------------|----------------|---------------------|-------------|-------------|
| Wooden Blocks | 59.99 | Premium wooden building blocks | Building Blocks | 3-5 Years | 25 | https://example.com/blocks.jpg |
| Plush Bunny | 24.50 | Soft cuddly bunny toy | Plush | 0-2 Years | 40 | https://example.com/bunny.jpg |

## How to Import

1. **Navigate to Admin Dashboard**
   - Go to `/admin` in your website
   - Click on the "Bulk Import" tab

2. **Upload Excel File**
   - Drag and drop your Excel file (.xlsx, .xls, or .csv) into the upload area
   - Or click "Select File" to browse and choose your file

3. **Process Import**
   - Click "Process Import" button
   - Wait for the file to be processed (progress bar will show status)
   - Products will be automatically added to your inventory

## Image Handling

### Option 1: Image URLs (Recommended)
- Place full image URLs in the Image column
- URLs should start with `http://` or `https://`
- Images will be loaded directly from these URLs

### Option 2: Local File Paths
- If you use local file paths (e.g., `./images/product.jpg`)
- You'll need to upload the images separately to a server
- Then update the Image column with the server URLs

### Option 3: Embedded Images in Excel
- Currently, embedded images in Excel cells are not automatically extracted
- You'll need to:
  1. Extract images from Excel manually
  2. Upload them to a server or image hosting service
  3. Add the URLs to the Image column in your Excel file

## Tips

1. **Column Names**: The system supports both English and Chinese column names. Use whichever is more convenient.

2. **Data Validation**: 
   - Invalid prices (0 or negative) will cause rows to be skipped
   - Products without names will be skipped
   - Invalid categories will default to "Educational"

3. **Large Files**: 
   - Files with many rows may take longer to process
   - Progress will be shown during processing

4. **Error Handling**:
   - If an error occurs, check the error message for details
   - Common issues:
     - Missing required columns (Name, Price)
     - Invalid data formats
     - Empty file or no valid rows

## Troubleshooting

**Problem**: "No valid products found"
- **Solution**: Check that your Excel file has:
  - A header row with column names
  - At least one data row
  - Valid product names and prices

**Problem**: Products imported but images not showing
- **Solution**: 
  - Verify image URLs are accessible
  - Check that URLs start with `http://` or `https://`
  - For local paths, upload images to a server first

**Problem**: Categories not matching
- **Solution**: Use exact category names from the supported list, or use Chinese equivalents

**Problem**: Age ranges not recognized
- **Solution**: Use the exact format: "0-2 Years", "3-5 Years", etc., or Chinese equivalents

## Next Steps

After importing:
1. Review imported products in the Inventory tab
2. Edit individual products if needed
3. Verify images are displaying correctly
4. Check stock levels and update if necessary

