import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Rocket, Heart, ShieldCheck } from 'lucide-react';
import { ROUTE_PATHS, CATEGORIES, cn } from '@/lib/index';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { IMAGES } from '@/assets/images';

const springPresets = {
  gentle: { type: 'spring', stiffness: 300, damping: 35 },
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);

  return (
    <div className="flex flex-col gap-16 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.KIDS_PLAYING_5}
            alt="Product showcase"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeInUp}
              transition={springPresets.gentle}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-mono mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>NEW ARRIVALS 2026</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={springPresets.gentle}
              className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
            >
              Discover Your <span className="text-primary">Perfect Style</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={springPresets.gentle}
              className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
            >
              Explore our premium collection of comfortable and stylish products 
              designed for everyday elegance and comfort.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={springPresets.snappy}
              className="flex flex-wrap gap-4"
            >
              <Link
                to={ROUTE_PATHS.PRODUCTS}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                Shop Collection
                <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#featured"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-border rounded-full font-bold text-lg hover:bg-white/20 transition-all"
              >
                View Featured
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Explore by Category</h2>
            <p className="text-muted-foreground">Find the perfect products for your style</p>
          </div>
          <Link
            to={ROUTE_PATHS.PRODUCTS}
            className="text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            See all categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springPresets.gentle, delay: index * 0.05 }}
            >
              <Link
                to={`${ROUTE_PATHS.PRODUCTS}?category=${category}`}
                className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all text-center h-full"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <span className="font-bold text-sm md:text-base">{category}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Our Best Sellers</h2>
          <p className="text-muted-foreground">Loved by customers worldwide</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container mx-auto px-4">
        <div className="relative rounded-[2rem] overflow-hidden bg-foreground text-background">
          <div className="absolute inset-0 z-0">
            <img
              src={IMAGES.STORE_INTERIOR_2}
              alt="Store Interior"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Eco-Friendly Play for a <br /> Brighter Tomorrow
            </h2>
            <p className="text-lg text-background/80 mb-10 leading-relaxed">
              In 2026, we've committed to 100% premium quality materials. 
              Join our mission to provide comfortable, stylish products that don't compromise on quality.
            </p>
            <Link
              to={ROUTE_PATHS.PRODUCTS}
              className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-xl hover:scale-105 transition-transform"
            >
              Learn About Our Mission
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-muted/50 py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Safety Certified</h3>
              <p className="text-muted-foreground">All products meet strict 2026 safety and non-toxic standards.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
              <p className="text-muted-foreground">Free worldwide shipping on all orders over $75.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Made with Love</h3>
              <p className="text-muted-foreground">Carefully selected products that support your comfort and style.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="container mx-auto px-4 text-center">
        <div className="bg-accent rounded-[2rem] p-12 md:p-16 border border-accent-foreground/10">
          <h2 className="text-3xl font-bold mb-4">Join the Playroom Club</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Get exclusive early access to new releases and 15% off your first order.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground">
            © 2026 Premium Store Co. All rights reserved. 
          </p>
        </div>
      </section>
    </div>
  );
}
