import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Product, 
  CATEGORIES, 
  Category,
  convertCNYToMYR
} from '@/lib/index';

interface ExcelUploadProps {
  onUpload: (products: Product[]) => void;
}

export function ExcelUpload({ onUpload }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // Helper function to normalize column names (handles both English and Chinese)
  const normalizeColumnName = (name: string): string => {
    if (!name) return '';
    const normalized = String(name).trim().toLowerCase();
    const columnMap: Record<string, string> = {
      // English
      'name': 'name',
      'product name': 'name',
      'product': 'name',
      'title': 'name',
      'description': 'description',
      'desc': 'description',
      'price': 'price',
      'cost': 'price',
      'category': 'category',
      'cat': 'category',
      'image': 'image',
      'image url': 'image',
      'imageurl': 'image',
      'img': 'image',
      'picture': 'image',
      'photo': 'image',
      'stock': 'stock',
      'quantity': 'stock',
      'qty': 'stock',
      'inventory': 'stock',
      // Chinese - exact matches
      '名称': 'name',
      '产品名称': 'name',
      '产品名': 'name',
      '商品名称': 'name',
      '描述': 'description',
      '产品描述': 'description',
      '说明': 'description',
      '规格': 'description', // Also use 规格 as description
      '价格': 'price',
      '单价': 'price',
      '售价': 'price',
      '建议价': 'price', // Also check 建议价
      '类别': 'category',
      '分类': 'category',
      '产品类别': 'category',
      '图片': 'image',
      '产品图': 'image', // Product image column
      '图片链接': 'image',
      '图片地址': 'image',
      '图像': 'image',
      '库存': 'stock',
      '数量': 'stock',
      '库存数量': 'stock',
      '序号': 'id', // Serial number/ID
      '单位': 'unit', // Unit
    };
    return columnMap[normalized] || normalized;
  };

  // Helper function to extract images from Excel
  const extractImageFromExcel = async (workbook: XLSX.WorkBook, sheetName: string, rowIndex: number): Promise<string | null> => {
    try {
      // Try to get embedded images from the workbook
      // Note: xlsx library doesn't directly support embedded images, so we'll use image URLs/paths from cells
      // If images are embedded, you might need a different library like exceljs
      return null;
    } catch (err) {
      return null;
    }
  };

  // Helper function to convert image path to data URL or keep as URL
  const processImagePath = (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === '') {
      // Default placeholder image if no path provided
      return 'https://images.unsplash.com/photo-1564429238817-393bd4286b2d?auto=format&fit=crop&q=80&w=800';
    }

    const trimmedPath = imagePath.trim();
    
    // If it's already a full URL, return it
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      return trimmedPath;
    }
    
    // If it starts with /, it's a public folder path (valid in Vite/React)
    // Paths like /product_images/image_row_0008.jpg refer to public/product_images/
    if (trimmedPath.startsWith('/')) {
      console.log(`Using public folder image: ${trimmedPath}`);
      return trimmedPath;
    }
    
    // If it's a relative path without leading slash, add one
    // e.g., "product_images/image.jpg" -> "/product_images/image.jpg"
    if (trimmedPath.includes('product_images/') || trimmedPath.includes('images/')) {
      const publicPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
      console.log(`Converting to public path: ${publicPath}`);
      return publicPath;
    }
    
    // If it's a local file path (like ./images/ or ../images/), try to convert
    if (trimmedPath.startsWith('./') || trimmedPath.startsWith('../')) {
      // Remove ./ or ../ and add leading slash
      const cleanPath = trimmedPath.replace(/^\.\.?\//, '');
      const publicPath = `/${cleanPath}`;
      console.log(`Converting relative path to public: ${publicPath}`);
      return publicPath;
    }
    
    // Default placeholder image for unrecognized paths
    console.warn(`Unrecognized image path format: ${imagePath}. Using placeholder.`);
    return 'https://images.unsplash.com/photo-1564429238817-393bd4286b2d?auto=format&fit=crop&q=80&w=800';
  };

  // Helper function to map category to adult product categories
  const mapCategory = (categoryStr: string): Category => {
    const normalized = categoryStr.trim().toLowerCase();
    const categoryMap: Record<string, Category> = {
      // English
      'bras': 'Bras',
      'bra': 'Bras',
      'panties': 'Panties',
      'panty': 'Panties',
      'underwear': 'Panties',
      'homewear': 'Homewear',
      'home wear': 'Homewear',
      'pajamas': 'Homewear',
      'loungewear': 'Homewear',
      'clothing': 'Clothing',
      'clothes': 'Clothing',
      'accessories': 'Accessories',
      'combo deals': 'Combo Deals',
      'combo': 'Combo Deals',
      // Chinese - map to appropriate categories
      '内衣': 'Bras',
      '文胸': 'Bras',
      '内裤': 'Panties',
      '家居服': 'Homewear',
      '睡衣': 'Homewear',
      '服装': 'Clothing',
      '配饰': 'Accessories',
      '组合': 'Combo Deals',
      '套装': 'Combo Deals',
    };
    return categoryMap[normalized] || 'Clothing'; // Default to Clothing
  };

  const parseExcelFile = async (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file - no data returned'));
            return;
          }

          console.log(`Reading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

          let jsonData: any[][];
          
          // Check if it's a CSV file
          if (file.name.endsWith('.csv')) {
            console.log('Parsing CSV file...');
            // Parse CSV file - data is already text
            let text = typeof data === 'string' ? data : '';
            
            // Remove BOM if present (UTF-8 BOM: \uFEFF)
            if (text.charCodeAt(0) === 0xFEFF) {
              text = text.slice(1);
            }
            
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            
            if (lines.length === 0) {
              reject(new Error('CSV file is empty'));
              return;
            }
            
            jsonData = lines.map(line => {
              // Improved CSV parsing (handles quoted fields and commas within quotes)
              const result: string[] = [];
              let current = '';
              let inQuotes = false;
              
              for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (char === '"') {
                  if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                  } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                  }
                } else if (char === ',' && !inQuotes) {
                  result.push(current.trim());
                  current = '';
                } else {
                  current += char;
                }
              }
              result.push(current.trim());
              return result;
            });
            
            console.log(`Parsed CSV: ${lines.length} lines, first row:`, jsonData[0]);
          } else {
            // Parse Excel file
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON - get all rows
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
          }
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'));
            return;
          }

          // Find the header row - look for common Chinese headers
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;
            
            const rowStr = row.map(cell => String(cell || '').trim()).join(' ');
            // Check if this row contains common header keywords
            if (rowStr.includes('名称') || rowStr.includes('价格') || rowStr.includes('产品图') || 
                rowStr.includes('序号') || rowStr.includes('数量')) {
              headerRowIndex = i;
              console.log(`Found header row at index ${i}:`, row);
              break;
            }
          }
          
          // If no header found, assume first row is header
          if (headerRowIndex === 0 && jsonData.length > 0) {
            const firstRow = jsonData[0] as any[];
            const firstRowStr = firstRow?.map(cell => String(cell || '').trim()).join(' ') || '';
            if (!firstRowStr.includes('名称') && !firstRowStr.includes('价格')) {
              console.warn('Header row not found, using first row as header');
            }
          }

          // Get headers from the found header row
          const headerRow = jsonData[headerRowIndex] as any[];
          const headers = headerRow.map(h => normalizeColumnName(String(h || '')));

          console.log('Found headers:', headers);
          console.log('Original header row:', headerRow);
          console.log('Header row index:', headerRowIndex);
          console.log('Total rows in file:', jsonData.length);
          console.log('Total rows to process:', jsonData.length - headerRowIndex - 1);
          
          // Get data rows (skip header row and any empty rows before it)
          const rows = jsonData.slice(headerRowIndex + 1) as any[][];
          
          if (rows.length === 0) {
            reject(new Error('No data rows found after header row. Please check the file format.'));
            return;
          }

          const products: Product[] = [];
          let skippedCount = 0;
          const skipReasons: Record<string, number> = {};

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
              skippedCount++;
              skipReasons['empty'] = (skipReasons['empty'] || 0) + 1;
              continue; // Skip empty rows
            }

            // Create a map of column name to value
            const rowData: Record<string, any> = {};
            headers.forEach((header, index) => {
              if (header) {
                rowData[header] = row[index];
              }
            });
            
            // Also map by original Chinese headers for direct access (using headerRow from outer scope)
            if (headerRow) {
              headerRow.forEach((origHeader: any, index: number) => {
                const headerStr = String(origHeader || '').trim();
                if (headerStr) {
                  rowData[headerStr] = row[index];
                }
              });
            }

            // Extract and validate required fields
            // Try multiple name column variations
            const name = String(
              rowData.name || 
              rowData['名称'] || // Direct Chinese header
              rowData[''] || 
              (row && row.length > 2 ? row[2] : null) || // Column C (名称) is typically index 2
              `Product ${i + 1}`
            ).trim();
            
            if (!name || name === 'Product' || name.length < 2) {
              skippedCount++;
              skipReasons['no_name'] = (skipReasons['no_name'] || 0) + 1;
              if (i < 3) {
                console.warn(`Skipping row ${i + 1}: No valid name found. Row data:`, row);
              }
              continue; // Skip if no valid name
            }

            // Get description from description column or use specifications/unit
            const description = String(
              rowData.description || 
              rowData['规格'] || // 规格 (specifications)
              row[7] || // Column H (规格) is index 7
              rowData.unit || // 单位 (unit)
              row[4] || // Column E (单位) is index 4
              name
            ).trim();

            // Try to get price from multiple sources
            // CSV columns: 序号(0), 产品图(1), 名称(2), 电池型号/节数(3), 单位(4), 价格(5), 数量(6), ...
            let priceStr = String(
              rowData.price || 
              rowData['价格'] || // Direct Chinese header access
              (row && row.length > 5 ? row[5] : null) || // Column F (价格) is index 5
              rowData['建议价'] || // Try 建议价 (suggested price) as fallback - column index 9
              (row && row.length > 9 ? row[9] : null) || // Column J (建议价) is index 9
              '0'
            ).trim();
            
            // Debug logging for first few products
            if (i < 3) {
              console.log(`Row ${i + 1} - Price extraction:`, {
                'rowData.price': rowData.price,
                'rowData[价格]': rowData['价格'],
                'row[5]': (row && row.length > 5 ? row[5] : 'N/A'),
                'row length': row?.length || 0,
                'final priceStr': priceStr
              });
            }
            
            // Handle formulas (like =G8*F8) - skip them and use 0
            if (priceStr.startsWith('=')) {
              priceStr = '0';
            }
            
            // Remove currency symbols and non-numeric characters except decimal point
            priceStr = priceStr.replace(/[^0-9.]/g, '');
            const priceCNY = parseFloat(priceStr) || 0;
            
            // Convert CNY to MYR (Malaysian Ringgit)
            const price = convertCNYToMYR(priceCNY);
            
            // Log conversion for first few products
            if (i < 3) {
              console.log(`Price conversion: ${priceCNY} CNY → ${price} MYR`);
            }
            
            // Allow 0 price but log warning for first few
            if (price <= 0 && i < 3) {
              console.warn(`Product "${name}" has price 0. Original value: "${rowData['价格'] || row[5]}"`);
            }

            // Category - not in CSV, set default to 'Educational'
            const categoryStr = String(rowData.category || 'Clothing').trim();
            const category = mapCategory(categoryStr);

            // Get stock from stock column (数量) - column index 6
            let stockStr = String(
              rowData.stock || 
              rowData['数量'] || // Direct Chinese header access
              row[6] || // Column G (数量) is index 6
              '0'
            ).trim();
            
            // Handle empty stock or formulas
            if (stockStr === '' || stockStr.startsWith('=') || stockStr === 'None' || stockStr === 'null') {
              stockStr = '0';
            }
            
            // Remove non-numeric characters
            stockStr = stockStr.replace(/[^0-9]/g, '');
            const stock = parseInt(stockStr) || 0;
            
            // Debug logging for first few products
            if (i < 3) {
              console.log(`Row ${i + 1} - Stock extraction:`, {
                'rowData.stock': rowData.stock,
                'rowData[数量]': rowData['数量'],
                'row[6]': row[6],
                'final stock': stock
              });
            }

            // Get image - might be empty, use placeholder if needed
            const imagePath = String(
              rowData.image || 
              row[1] || // Column B (产品图) is typically index 1
              ''
            ).trim();
            
            // Log image path for debugging
            if (imagePath) {
              console.log(`Product "${name}": Image path = "${imagePath}"`);
            }
            
            const image = processImagePath(imagePath);
            
            // Log final image URL
            if (imagePath && image !== imagePath) {
              console.log(`  → Processed to: "${image}"`);
            }

            const product: Product = {
              id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              description,
              price, // Already converted to MYR
              category,
              image,
              stock,
              rating: 4.0 + Math.random() * 1, // Random rating between 4.0-5.0
              reviewsCount: Math.floor(Math.random() * 100),
              isFeatured: Math.random() > 0.7, // 30% chance of being featured
            };
            
            // Debug logging for first few products
            if (i < 3) {
              console.log(`Product ${i + 1} created:`, {
                name,
                price: `${price} MYR (from ${priceCNY} CNY)`,
                stock,
                category,
                image: image.substring(0, 50) + '...'
              });
            }

            products.push(product);
          }

          console.log(`Parsed ${products.length} products, skipped ${skippedCount} rows`);
          console.log('Skip reasons:', skipReasons);

          if (products.length === 0) {
            const errorMsg = `No valid products found in the Excel file. 
              Processed ${rows.length} rows, skipped ${skippedCount} rows.
              Reasons: ${JSON.stringify(skipReasons)}.
              Please ensure the file has columns: 名称 (Name), 价格 (Price)`;
            reject(new Error(errorMsg));
            return;
          }

          resolve(products);
        } catch (error) {
          console.error('Error parsing Excel:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error(`Failed to read file: ${error}`));
      };

      // Read as text for CSV, binary for Excel
      if (file.name.endsWith('.csv')) {
        try {
          reader.readAsText(file, 'UTF-8');
        } catch (error) {
          reject(new Error(`Failed to read CSV file: ${error}`));
        }
      } else {
        try {
          reader.readAsBinaryString(file);
        } catch (error) {
          reject(new Error(`Failed to read Excel file: ${error}`));
        }
      }
    });
  };

  const simulateUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Parse the Excel file
      const products = await parseExcelFile(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      await new Promise((resolve) => setTimeout(resolve, 300));

      onUpload(products);
      setFile(null);
      setUploading(false);
      setProgress(0);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file. Please ensure the data format is correct.';
      setError(errorMessage);
      setUploading(false);
      setProgress(0);
      
      // Also show error in toast
      toast.error(`Import failed: ${errorMessage}`);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card 
        className={`relative overflow-hidden border-2 border-dashed transition-all duration-300 p-8 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.01]' 
            : 'border-border bg-card hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Bulk Upload Toys</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Drag and drop your Excel (.xlsx) or CSV file here to import multiple products at once.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Select File
          </Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Import Error</p>
              <p className="text-xs text-destructive/80 whitespace-pre-wrap">{error}</p>
            </div>
          </motion.div>
        )}

        {file && !uploading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <FileText className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={simulateUpload} size="sm">
                Process Import
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={removeFile} 
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 p-6 rounded-xl border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="font-medium">Processing file...</span>
              </div>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Validating product data and mapping images. Please do not close this window.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-lg bg-accent/50 border border-accent p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-accent-foreground shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-accent-foreground">Excel File Format Requirements</h4>
            <ul className="text-xs text-accent-foreground/80 space-y-1 list-disc pl-4">
              <li><strong>Required columns:</strong> Name (名称), Price (价格), Category (类别)</li>
              <li><strong>Optional columns:</strong> Description (描述), Stock (库存), Image (图片/图片链接)</li>
              <li><strong>Supported categories:</strong> {CATEGORIES.join(', ')}</li>
              <li><strong>Images:</strong> Provide full URLs (http:// or https://) or local file paths</li>
              <li><strong>Price:</strong> Prices in CSV should be in Chinese Yuan (CNY), will be automatically converted to Malaysian Ringgit (MYR)</li>
              <li><strong>Price:</strong> Must be a valid number (currency symbols will be removed)</li>
              <li><strong>Note:</strong> Both English and Chinese column names are supported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
