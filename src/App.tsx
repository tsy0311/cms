import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Admin from "@/pages/Admin";

/**
 * Toy Store E-commerce Platform - 2026 Edition
 * Root application component managing routing, global state providers, and layout.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Homepage: Hero, Featured Toys, Categories */}
              <Route 
                path={ROUTE_PATHS.HOME} 
                element={<Home />} 
              />

              {/* Product Listing: Catalog with Filtering and Search */}
              <Route 
                path={ROUTE_PATHS.PRODUCTS} 
                element={<Products />} 
              />

              {/* Product Details: Specs, Reviews, and Cart Actions */}
              <Route 
                path={ROUTE_PATHS.PRODUCT_DETAIL} 
                element={<ProductDetail />} 
              />

              {/* Shopping Cart: Item Management and Checkout Entry */}
              <Route 
                path={ROUTE_PATHS.CART} 
                element={<Cart />} 
              />

              {/* Admin Dashboard: Excel Bulk Upload and Management */}
              <Route 
                path={ROUTE_PATHS.ADMIN} 
                element={<Admin />} 
              />

              {/* Fallback Route: Redirect to Home for unmatched paths */}
              <Route 
                path="*" 
                element={<Home />} 
              />
            </Routes>
          </Layout>
        </BrowserRouter>

        {/* Global UI Feedback Systems */}
        <Toaster />
        <Sonner position="top-right" expand={false} richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
