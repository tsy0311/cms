import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const simulateUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulation of parsing and uploading to backend (Django)
    // In a real implementation, you would use FormData to send 'file' to your Django API
    try {
      for (let i = 0; i <= 100; i += 5) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProgress(i);
      }

      // Generate mock products based on the file content (Simulated results)
      const mockProducts: Product[] = [
        {
          id: `bulk-${Math.random().toString(36).substr(2, 9)}`,
          name: 'STEM Robot Kit',
          description: 'A comprehensive robotics kit for young engineers to learn coding and mechanics.',
          price: 89.99,
          category: 'STEM' as Category,
          ageRange: '9-12 Years' as AgeRange,
          image: 'https://images.unsplash.com/photo-1564429238817-393bd4286b2d?auto=format&fit=crop&q=80&w=800',
          stock: 50,
          rating: 4.8,
          reviewsCount: 12,
          isFeatured: true
        },
        {
          id: `bulk-${Math.random().toString(36).substr(2, 9)}`,
          name: 'Plush Panda Explorer',
          description: 'Soft and cuddly panda with a miniature backpack for imaginative adventures.',
          price: 24.50,
          category: 'Plush' as Category,
          ageRange: '0-2 Years' as AgeRange,
          image: 'https://images.unsplash.com/photo-1598838909554-7ed3ccba096d?auto=format&fit=crop&q=80&w=800',
          stock: 120,
          rating: 4.5,
          reviewsCount: 8
        }
      ];

      onUpload(mockProducts);
      setFile(null);
      setUploading(false);
      setProgress(0);
    } catch (err) {
      setError('Failed to process file. Please ensure the data format is correct.');
      setUploading(false);
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
            <h4 className="text-sm font-bold text-accent-foreground">Data Requirements</h4>
            <ul className="text-xs text-accent-foreground/80 space-y-1 list-disc pl-4">
              <li>Include columns: Name, Description, Price, Stock, Category, AgeRange, ImageURL</li>
              <li>Categories must match: {CATEGORIES.join(', ')}</li>
              <li>Age ranges must match: {AGE_RANGES.join(', ')}</li>
              <li>Price must be a valid number</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
