import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTE_PATHS } from "@/lib/index";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";

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
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Customer-facing routes with main Layout */}
              <Route 
                path={ROUTE_PATHS.HOME} 
                element={
                  <Layout>
                    <Home />
                  </Layout>
                } 
              />

              <Route 
                path={ROUTE_PATHS.PRODUCTS} 
                element={
                  <Layout>
                    <Products />
                  </Layout>
                } 
              />

              <Route 
                path={ROUTE_PATHS.PRODUCT_DETAIL} 
                element={
                  <Layout>
                    <ProductDetail />
                  </Layout>
                } 
              />

              <Route 
                path={ROUTE_PATHS.CART} 
                element={
                  <Layout>
                    <Cart />
                  </Layout>
                } 
              />

              {/* Admin routes with separate layout */}
              <Route path={ROUTE_PATHS.ADMIN_LOGIN} element={<AdminLogin />} />
              
              <Route
                path={ROUTE_PATHS.ADMIN}
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout>
                      <Admin />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route: Redirect to Home for unmatched paths */}
              <Route 
                path="*" 
                element={
                  <Layout>
                    <Home />
                  </Layout>
                } 
              />
            </Routes>
          </BrowserRouter>

          {/* Global UI Feedback Systems */}
          <Toaster />
          <Sonner position="top-right" expand={false} richColors />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
