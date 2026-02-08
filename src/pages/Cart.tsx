import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { 
  ROUTE_PATHS, 
  formatPrice, 
  cn 
} from '@/lib/index';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_RATE = 9.99;

export default function Cart() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    subtotal, 
    totalItems, 
    isInitialized 
  } = useCart();

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : (items.length > 0 ? FLAT_SHIPPING_RATE : 0);
  const total = subtotal + shipping;

  if (!isInitialized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your toys...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added any magic to your cart yet. Explore our collection of toys to get started!
          </p>
          <Link to={ROUTE_PATHS.PRODUCTS}>
            <Button size="lg" className="rounded-full px-8">
              Browse Toys
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          Shopping Cart
          <span className="text-sm font-normal bg-accent text-accent-foreground px-3 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </h1>
        <Link to={ROUTE_PATHS.PRODUCTS} className="text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 group hover:shadow-lg transition-shadow"
              >
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link 
                        to={ROUTE_PATHS.PRODUCT_DETAIL.replace(':id', item.product.id)}
                        className="font-bold text-lg hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          {item.product.category}
                        </span>
                        <span className="text-xs font-mono bg-accent/30 text-accent-foreground px-2 py-0.5 rounded">
                          AGE: {item.product.ageRange}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-border rounded-full p-1">
                      <button
                        className="p-1 hover:bg-muted rounded-full transition-colors disabled:opacity-30"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)} each</p>
                      <p className="text-lg font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className={cn("font-medium", shipping === 0 ? "text-secondary-foreground" : "text-foreground")}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div className="bg-accent/20 p-3 rounded-lg flex gap-3 items-center text-xs text-accent-foreground">
                  <Truck className="w-4 h-4 flex-shrink-0" />
                  <p>Add {formatPrice(SHIPPING_THRESHOLD - subtotal)} more for FREE shipping!</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Button className="w-full rounded-full py-6 text-lg group" size="lg">
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-secondary-foreground" />
                <span>Secure SSL encrypted checkout</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RotateCcw className="w-5 h-5 text-secondary-foreground" />
                <span>30-day play-safe return policy</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Shipping prices and taxes are calculated at checkout based on your location and selection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section - Placeholder for extra content */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Before you go...</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl aspect-square flex items-center justify-center p-4">
               <p className="text-xs text-muted-foreground text-center italic">More magic coming soon...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
