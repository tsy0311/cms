import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedSize = '', selectedColor = '') => {
    setCart((prevCart) => {
      // Create unique key based on product ID, size, and color
      const itemKey = `${product._id}-${selectedSize}-${selectedColor}`;
      const existingItem = prevCart.find((item) => {
        const itemKeyExisting = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
        return itemKeyExisting === itemKey;
      });
      
      if (existingItem) {
        return prevCart.map((item) => {
          const itemKeyExisting = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
          if (itemKeyExisting === itemKey) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      }
      
      return [...prevCart, { product, quantity, selectedSize, selectedColor }];
    });
  };

  const removeFromCart = (itemKey) => {
    setCart((prevCart) => 
      prevCart.filter((item) => {
        const itemKeyExisting = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
        return itemKeyExisting !== itemKey;
      })
    );
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      setCart((prevCart) => 
        prevCart.filter((item) => {
          const itemKeyExisting = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
          return itemKeyExisting !== itemKey;
        })
      );
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        const itemKeyExisting = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
        return itemKeyExisting === itemKey ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

