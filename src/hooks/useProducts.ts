import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/index';
import { productDB } from '@/lib/database';
import { sampleProducts } from '@/data/products';

const PRODUCTS_STORAGE_KEY = 'toy_store_products_v2026';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial load from database (localStorage-backed)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const dbProducts = await productDB.getAllProducts();
        if (dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          // First time - use sample products and save to database
          await productDB.addProducts(sampleProducts);
          setProducts(sampleProducts);
        }
      } catch (error) {
        console.error('Failed to load products from database:', error);
        // Fallback to localStorage if database fails
        const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (savedProducts) {
          try {
            const parsed = JSON.parse(savedProducts);
            setProducts(parsed);
          } catch (e) {
            setProducts(sampleProducts);
          }
        } else {
          setProducts(sampleProducts);
        }
      }
      setIsInitialized(true);
    };
    loadProducts();
  }, []);

  // Sync state across different instances of the hook (multi-component sync)
  useEffect(() => {
    const syncProducts = async () => {
      try {
        const dbProducts = await productDB.getAllProducts();
        setProducts(dbProducts);
      } catch (e) {
        console.error('Products sync failed', e);
      }
    };

    window.addEventListener('products-sync', syncProducts);
    window.addEventListener('storage', syncProducts); // For multi-tab sync

    return () => {
      window.removeEventListener('products-sync', syncProducts);
      window.removeEventListener('storage', syncProducts);
    };
  }, []);

  const addProducts = useCallback(async (newProducts: Product[]) => {
    try {
      const added = await productDB.addProducts(newProducts);
      const updated = await productDB.getAllProducts();
      setProducts(updated);
      window.dispatchEvent(new Event('products-sync'));
      return added;
    } catch (error) {
      console.error('Failed to add products:', error);
      // Fallback to local state
      setProducts((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id));
        return [...uniqueNewProducts, ...prev];
      });
    }
  }, []);

  const addProduct = useCallback(async (product: Product) => {
    try {
      await productDB.addProduct(product);
      const updated = await productDB.getAllProducts();
      setProducts(updated);
      window.dispatchEvent(new Event('products-sync'));
    } catch (error) {
      console.error('Failed to add product:', error);
      // Fallback to local state
      setProducts((prev) => {
        if (prev.some(p => p.id === product.id)) {
          return prev;
        }
        return [product, ...prev];
      });
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      await productDB.updateProduct(productId, updates);
      const updated = await productDB.getAllProducts();
      setProducts(updated);
      window.dispatchEvent(new Event('products-sync'));
    } catch (error) {
      console.error('Failed to update product:', error);
      // Fallback to local state
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
      );
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await productDB.deleteProduct(productId);
      const updated = await productDB.getAllProducts();
      setProducts(updated);
      window.dispatchEvent(new Event('products-sync'));
    } catch (error) {
      console.error('Failed to delete product:', error);
      // Fallback to local state
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  }, []);

  const clearProducts = useCallback(async () => {
    try {
      // Clear all products and reset to sample
      const allProducts = await productDB.getAllProducts();
      for (const product of allProducts) {
        await productDB.deleteProduct(product.id);
      }
      await productDB.addProducts(sampleProducts);
      setProducts(sampleProducts);
      window.dispatchEvent(new Event('products-sync'));
    } catch (error) {
      console.error('Failed to clear products:', error);
      setProducts(sampleProducts);
    }
  }, []);

  const replaceAllProducts = useCallback(async (newProducts: Product[]) => {
    try {
      // Replace all existing products (including hardcoded ones) with new ones
      const replaced = await productDB.replaceAllProducts(newProducts);
      setProducts(replaced);
      window.dispatchEvent(new Event('products-sync'));
      return replaced;
    } catch (error) {
      console.error('Failed to replace products:', error);
      // Fallback to local state
      setProducts(newProducts);
      return newProducts;
    }
  }, []);

  return {
    products,
    addProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    clearProducts,
    replaceAllProducts,
    isInitialized,
  };
};

