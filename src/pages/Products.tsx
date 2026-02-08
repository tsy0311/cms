import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { 
  Product, 
  Category, 
  AgeRange, 
  CATEGORIES, 
  AGE_RANGES,
  cn
} from '@/lib/index';
import { sampleProducts } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const Products: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | 'All'>('All');

  const filteredProducts = useMemo(() => {
    return sampleProducts.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesAge = selectedAgeRange === 'All' || product.ageRange === selectedAgeRange;

      return matchesSearch && matchesCategory && matchesAge;
    });
  }, [searchQuery, selectedCategory, selectedAgeRange]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAgeRange('All');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedAgeRange !== 'All';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/50 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Toy Collection</h1>
                <p className="text-muted-foreground mt-1">Discover the perfect playmate for every age</p>
              </div>
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search toys..."
                  className="pl-10 h-12 bg-card border-border/50 focus:border-primary/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters:
              </div>
              
              <Select 
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Category | 'All')}
              >
                <SelectTrigger className="w-[180px] h-10 bg-card rounded-full border-border/40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedAgeRange}
                onValueChange={(value) => setSelectedAgeRange(value as AgeRange | 'All')}
              >
                <SelectTrigger className="w-[180px] h-10 bg-card rounded-full border-border/40">
                  <SelectValue placeholder="Age Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Ages</SelectItem>
                  {AGE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  onClick={clearFilters}
                  className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted-foreground font-mono">
            SHOWING <span className="text-foreground font-bold">{filteredProducts.length}</span> PRODUCTS
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-card/30 rounded-3xl border border-dashed border-border"
          >
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No toys found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try adjusting your search or clearing the filters.
            </p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="mt-6 rounded-full px-8"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </main>

      <section className="bg-accent/30 py-20 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-8">Our inventory is growing every week. Subscribe to get notified about new arrivals!</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
            <Input 
              placeholder="Enter your email"
              className="rounded-full bg-card h-12"
            />
            <Button className="rounded-full h-12 px-8 shadow-lg shadow-primary/20">
              Notify Me
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;