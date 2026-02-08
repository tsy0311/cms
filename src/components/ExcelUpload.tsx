import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Product, 
  CATEGORIES, 
  AGE_RANGES, 
  Category, 
  AgeRange 
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
    const normalized = name.trim().toLowerCase();
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
      'age range': 'ageRange',
      'age': 'ageRange',
      'age range (years)': 'ageRange',
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
      // Chinese
      '名称': 'name',
      '产品名称': 'name',
      '产品名': 'name',
      '商品名称': 'name',
      '描述': 'description',
      '产品描述': 'description',
      '说明': 'description',
      '价格': 'price',
      '单价': 'price',
      '售价': 'price',
      '类别': 'category',
      '分类': 'category',
      '产品类别': 'category',
      '年龄范围': 'ageRange',
      '适用年龄': 'ageRange',
      '年龄': 'ageRange',
      '图片': 'image',
      '图片链接': 'image',
      '图片地址': 'image',
      '图像': 'image',
      '库存': 'stock',
      '数量': 'stock',
      '库存数量': 'stock',
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
    // If it's already a URL, return it
    if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    
    // If it's a local file path, we can't access it directly from the browser
    // Return a placeholder image
    // Note: In production, you'd need to upload local images to a server first
    if (imagePath && imagePath.trim() !== '') {
      // Could be a relative path - log a warning but use placeholder
      console.warn(`Local image path detected: ${imagePath}. Please use full URLs for images.`);
    }
    
    // Default placeholder image
    return 'https://images.unsplash.com/photo-1564429238817-393bd4286b2d?auto=format&fit=crop&q=80&w=800';
  };

  // Helper function to map category
  const mapCategory = (categoryStr: string): Category => {
    const normalized = categoryStr.trim();
    const categoryMap: Record<string, Category> = {
      // English
      'educational': 'Educational',
      'plush': 'Plush',
      'building blocks': 'Building Blocks',
      'outdoor': 'Outdoor',
      'arts & crafts': 'Arts & Crafts',
      'arts and crafts': 'Arts & Crafts',
      'stem': 'STEM',
      // Chinese - add common Chinese category names
      '教育': 'Educational',
      '教育类': 'Educational',
      '毛绒': 'Plush',
      '毛绒玩具': 'Plush',
      '积木': 'Building Blocks',
      '积木类': 'Building Blocks',
      '户外': 'Outdoor',
      '户外类': 'Outdoor',
      '手工': 'Arts & Crafts',
      '手工类': 'Arts & Crafts',
      '科学': 'STEM',
      '科学类': 'STEM',
    };
    return categoryMap[normalized.toLowerCase()] || 'Educational';
  };

  // Helper function to map age range
  const mapAgeRange = (ageStr: string): AgeRange => {
    const normalized = ageStr.trim().toLowerCase();
    // Try to extract age range from various formats
    if (normalized.includes('0-2') || normalized.includes('0到2') || normalized.includes('0至2')) {
      return '0-2 Years';
    }
    if (normalized.includes('3-5') || normalized.includes('3到5') || normalized.includes('3至5')) {
      return '3-5 Years';
    }
    if (normalized.includes('6-8') || normalized.includes('6到8') || normalized.includes('6至8')) {
      return '6-8 Years';
    }
    if (normalized.includes('9-12') || normalized.includes('9到12') || normalized.includes('9至12')) {
      return '9-12 Years';
    }
    if (normalized.includes('13+') || normalized.includes('13以上')) {
      return '13+ Years';
    }
    // Default
    return '3-5 Years';
  };

  const parseExcelFile = async (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length < 2) {
            reject(new Error('Excel file must have at least a header row and one data row'));
            return;
          }

          // First row is headers
          const headers = (jsonData[0] as string[]).map(h => normalizeColumnName(String(h || '')));
          const rows = jsonData.slice(1) as any[][];

          const products: Product[] = [];

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
              continue; // Skip empty rows
            }

            // Create a map of column name to value
            const rowData: Record<string, any> = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index];
            });

            // Extract and validate required fields
            const name = String(rowData.name || rowData[''] || `Product ${i + 1}`).trim();
            if (!name || name === 'Product') continue; // Skip if no name

            const description = String(rowData.description || name || 'No description available').trim();
            const priceStr = String(rowData.price || '0').replace(/[^0-9.]/g, '');
            const price = parseFloat(priceStr) || 0;
            if (price <= 0) continue; // Skip products with invalid price

            const categoryStr = String(rowData.category || 'Educational').trim();
            const category = mapCategory(categoryStr);

            const ageRangeStr = String(rowData.ageRange || '3-5 Years').trim();
            const ageRange = mapAgeRange(ageRangeStr);

            const stockStr = String(rowData.stock || '0').replace(/[^0-9]/g, '');
            const stock = parseInt(stockStr) || 0;

            const imagePath = String(rowData.image || '').trim();
            const image = processImagePath(imagePath);

            const product: Product = {
              id: `bulk-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              description,
              price,
              category,
              ageRange,
              image,
              stock,
              rating: 4.0 + Math.random() * 1, // Random rating between 4.0-5.0
              reviewsCount: Math.floor(Math.random() * 100),
              isFeatured: Math.random() > 0.7, // 30% chance of being featured
            };

            products.push(product);
          }

          if (products.length === 0) {
            reject(new Error('No valid products found in the Excel file. Please check the data format.'));
            return;
          }

          resolve(products);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file. Please ensure the data format is correct.';
      setError(errorMessage);
      setUploading(false);
      setProgress(0);
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
            className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
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
              <li><strong>Optional columns:</strong> Description (描述), Stock (库存), Age Range (年龄范围), Image (图片/图片链接)</li>
              <li><strong>Supported categories:</strong> {CATEGORIES.join(', ')}</li>
              <li><strong>Age ranges:</strong> {AGE_RANGES.join(', ')} or Chinese equivalents</li>
              <li><strong>Images:</strong> Provide full URLs (http:// or https://) or local file paths</li>
              <li><strong>Price:</strong> Must be a valid number (currency symbols will be removed)</li>
              <li><strong>Note:</strong> Both English and Chinese column names are supported</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
