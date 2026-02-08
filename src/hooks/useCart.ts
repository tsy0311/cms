import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, CartItem, calculateSubtotal } from '@/lib/index';

const CART_STORAGE_KEY = 'toy_store_cart_v2026';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart data from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      // Dispatch custom event to sync multiple hook instances in the same tab
      window.dispatchEvent(new Event('cart-sync'));
    }
  }, [items, isInitialized]);

  // Sync state across different instances of the hook (multi-component sync)
  useEffect(() => {
    const syncCart = () => {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setItems(parsed);
        } catch (e) {
          console.error('Sync failed', e);
        }
      }
    };

    window.addEventListener('cart-sync', syncCart);
    window.addEventListener('storage', syncCart); // For multi-tab sync

    return () => {
      window.removeEventListener('cart-sync', syncCart);
      window.removeEventListener('storage', syncCart);
    };
  }, []);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };
        return updatedItems;
      }

      return [...prevItems, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(() => 
    items.reduce((sum, item) => sum + item.quantity, 0), 
  [items]);

  const subtotal = useMemo(() => 
    calculateSubtotal(items), 
  [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    isInitialized,
  };
};
