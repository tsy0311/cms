import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Upload,
  Plus,
  Search,
  LayoutDashboard,
  AlertCircle,
  TrendingUp,
  Boxes,
  CheckCircle2,
  Filter,
  MoreVertical,
  Eye
} from 'lucide-react';
import {
  Product,
  formatPrice,
  cn,
  CATEGORIES
} from '@/lib/index';
import { useProducts } from '@/hooks/useProducts';
import { ExcelUpload } from '@/components/ExcelUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Admin() {
  const { products, replaceAllProducts, isInitialized } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpload = async (newProducts: Product[]) => {
    try {
      await replaceAllProducts(newProducts);
      toast.success(`Successfully imported ${newProducts.length} products. All existing products have been replaced.`);
    } catch (error) {
      console.error('Failed to import products:', error);
      toast.error('Failed to import products. Please try again.');
    }
  };

  // Show loading state while products are being loaded
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Boxes,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Inventory Value',
      value: formatPrice(products.reduce((acc, p) => acc + p.price * p.stock, 0)),
      icon: TrendingUp,
      color: 'text-secondary-foreground',
      bg: 'bg-secondary',
    },
    {
      label: 'Low Stock Items',
      value: products.filter((p) => p.stock < 15).length,
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Featured Products',
      value: products.filter((p) => p.isFeatured).length,
      icon: CheckCircle2,
      color: 'text-accent-foreground',
      bg: 'bg-accent',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and bulk import products from Excel.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="inventory" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="inventory" className="gap-2">
              <LayoutDashboard className="w-4 h-4" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" /> Bulk Import
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Product Collection</CardTitle>
                  <CardDescription>A list of all products currently in your store.</CardDescription>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id} className="group hover:bg-muted/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">{product.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">{product.id}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                product.stock < 15 ? "bg-destructive" : "bg-emerald-500"
                              )} />
                              {product.stock} units
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No products found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Bulk Excel Upload</CardTitle>
                  <CardDescription>
                    Import multiple products at once. Your Excel file should include columns for
                    Name, Description, Price (in CNY), Category, and Image URL. Prices will be automatically converted to MYR.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExcelUpload onUpload={handleUpload} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Helpful Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm">
                      Ensure category names match the predefined list: {CATEGORIES.join(', ')}.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm">
                      Images should be high-resolution public URLs (Unsplash links recommended).
                    </p>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Download Excel Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
