import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  Product, 
  formatPrice, 
  cn, 
  ROUTE_PATHS 
} from '@/lib/index';
import { sampleProducts } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const product = useMemo(() => 
    sampleProducts.find((p) => p.id === id), 
  [id]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Toy Not Found</h1>
          <p className="text-muted-foreground">The toy you are looking for might have rolled under the sofa.</p>
        </div>
        <Button onClick={() => navigate(ROUTE_PATHS.PRODUCTS)} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const incrementQty = () => setQuantity((prev) => Math.min(prev + 1, product.stock));
  const decrementQty = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <div className="container mx-auto px-4 py-12 lg:py-24">
      {/* Breadcrumbs & Back Button */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link to={ROUTE_PATHS.HOME} className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-primary transition-colors">Toys</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 items-start">
        {/* Left Column: Image Gallery */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-muted shadow-xl border border-border/50 group">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <Badge className="bg-accent text-accent-foreground border-none px-4 py-1.5 rounded-full shadow-sm font-mono text-xs">
                AGE: {product.ageRange}
              </Badge>
              {product.isFeatured && (
                <Badge className="bg-primary text-primary-foreground border-none px-4 py-1.5 rounded-full shadow-sm">
                  Featured Toy
                </Badge>
              )}
            </div>
          </div>

          {/* Trust Indicators (Mobile Hidden) */}
          <div className="hidden md:grid grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-secondary/30 flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-6 w-6 text-secondary-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground/70">Safety Tested</span>
            </div>
            <div className="p-4 rounded-2xl bg-accent/30 flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-accent-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground/70">Fast Shipping</span>
            </div>
            <div className="p-4 rounded-2xl bg-muted flex flex-col items-center text-center gap-2">
              <RotateCcw className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">30-Day Return</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <Badge variant="secondary" className="rounded-full">
              {product.category}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.rating)
                        ? "fill-accent text-accent-foreground"
                        : "text-muted"
                    )}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  ({product.reviewsCount} verified parents)
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <span className={cn(
                "text-sm font-medium",
                product.stock > 10 ? "text-emerald-600" : "text-destructive"
              )}>
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center border border-border rounded-full p-1 bg-muted/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-background"
                  onClick={decrementQty}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-background"
                  onClick={incrementQty}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                className="flex-1 h-14 rounded-full text-lg font-bold shadow-lg transition-all active:scale-95"
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Added to Cart!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            {/* Specifications Bento-ish Grid */}
            <div className="pt-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Toy Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <Card key={key} className="p-4 bg-muted/30 border-none rounded-2xl">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">{key}</p>
                    <p className="font-bold text-foreground">{value}</p>
                  </Card>
                ))}
                <Card className="p-4 bg-secondary/20 border-none rounded-2xl">
                  <p className="text-xs font-mono uppercase tracking-widest text-secondary-foreground/70 mb-1">Age Range</p>
                  <p className="font-bold text-secondary-foreground">{product.ageRange}</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Footer Safety Note */}
          <div className="pt-8 border-t border-border flex items-start gap-3">
            <div className="mt-1 p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">Safety Guarantee 2026:</span> This product meets all international toy safety standards and is made with sustainable, non-toxic materials. Lead-free and BPA-free.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
