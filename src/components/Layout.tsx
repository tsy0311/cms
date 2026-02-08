import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Search, 
  Rocket, 
  Gamepad2, 
  Heart, 
  Instagram, 
  Facebook, 
  Twitter, 
  ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { ROUTE_PATHS, cn } from '@/lib/index';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: ROUTE_PATHS.HOME },
    { name: 'Shop All', path: ROUTE_PATHS.PRODUCTS },
    { name: 'Admin', path: ROUTE_PATHS.ADMIN },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled 
            ? "h-16 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm"
            : "h-20 bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <Link 
            to={ROUTE_PATHS.HOME} 
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Rocket className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Toy<span className="text-primary">Cloud</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-muted-foreground hover:text-primary transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <Link
              to={ROUTE_PATHS.CART}
              className="p-2 text-muted-foreground hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-20 px-4 md:hidden"
          >
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors"
                >
                  <span className="text-lg font-semibold">{link.name}</span>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </Link>
              ))}
              <div className="mt-8 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground px-4">Quick Access</p>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center gap-2 p-4 bg-secondary/20 rounded-2xl">
                    <Gamepad2 className="text-secondary-foreground" />
                    <span className="text-xs font-medium">Games</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 p-4 bg-accent/20 rounded-2xl">
                    <Heart className="text-accent-foreground" />
                    <span className="text-xs font-medium">Wishlist</span>
                  </button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-24">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
                <Rocket className="text-primary w-6 h-6" />
                <span className="font-bold text-xl tracking-tight">ToyCloud</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Curating the world's most innovative and educational toys for the creators of 2026 and beyond.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors shadow-sm">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors shadow-sm">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="p-2 bg-background rounded-full hover:text-primary transition-colors shadow-sm">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Shop By Category</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">STEM Toys</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Building Blocks</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Plush Buddies</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Outdoor Play</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Help & Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Shipping Info</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Return Policy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Safety Guides</li>
                <li className="hover:text-primary cursor-pointer transition-colors">FAQ</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get 10% off your first order and stay updated on new arrivals!
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-background border border-border rounded-xl px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 ToyCloud. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
