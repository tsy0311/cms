import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    // Check if it's a cart success message
    const isCartSuccess = type === 'success' && (
      message.toLowerCase().includes('added to cart') ||
      message.toLowerCase().includes('cart')
    );
    // Extend duration for cart success messages to show animation better
    const finalDuration = isCartSuccess ? 4000 : duration;
    const toast = { id, message, type, isCartSuccess };
    
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, finalDuration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.isCartSuccess ? 'toast-success-cart' : ''}`}
            onClick={() => removeToast(toast.id)}
          >
            {toast.type === 'success' && (
              <span className="toast-icon">
                {toast.isCartSuccess ? '🛒' : '✓'}
              </span>
            )}
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};



