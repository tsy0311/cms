import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Eye } from 'lucide-react';
import { Product, ROUTE_PATHS, formatPrice } from '@/lib/index';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const detailPath = ROUTE_PATHS.PRODUCT_DETAIL.replace(':id', product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Link
            to={detailPath}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </Link>
          <button
            onClick={() => addItem(product)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95"
            title="Add to Cart"
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
            {product.category}
          </p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-semibold">{product.rating}</span>
          </div>
        </div>

        <Link to={detailPath} className="mb-2 group/title">
          <h3 className="line-clamp-1 text-lg font-bold leading-tight text-foreground transition-colors group-hover/title:text-primary">
            {product.name}
          </h3>
        </Link>

        <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-extrabold text-foreground">
            {formatPrice(product.price)}
          </span>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addItem(product)}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Add</span>
          </motion.button>
        </div>
      </div>

      {/* Subtle Rim Light Highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10" />
    </motion.div>
  );
}
