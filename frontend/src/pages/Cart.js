import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const tax = getCartTotal() * 0.08;
  const shipping = getCartTotal() >= 50 ? 0 : 5.99;
  const total = getCartTotal() + tax + shipping;

  if (cart.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB6C1 100%)',
        borderRadius: '8px'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>
          Your cart is empty
        </h2>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          Start adding items to your cart!
        </p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/products')}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '2rem'
      }}>
        Shopping Cart
      </h1>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 2 }}>
          {cart.map((item, index) => {
            const itemKey = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
            return (
            <div key={itemKey || `${item.product._id}-${index}`} className="cart-item">
              <img
                src={item.product.images[0]?.url || '/placeholder.jpg'}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details" style={{ flex: 1 }}>
                <h3>{item.product.name}</h3>
                {item.selectedSize && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    Size: {item.selectedSize}
                  </p>
                )}
                {item.selectedColor && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    Color: {item.selectedColor}
                  </p>
                )}
                <p style={{ fontWeight: '600', marginTop: '0.5rem' }}>
                  ${item.product.price.toFixed(2)}
                </p>
              </div>
              <div className="cart-item-actions">
                <div className="quantity-control">
                  <button 
                    onClick={() => {
                      const itemKey = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
                      updateQuantity(itemKey, item.quantity - 1);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '2px solid #000',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    -
                  </button>
                  <span style={{ 
                    padding: '0 1rem', 
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    minWidth: '40px',
                    display: 'inline-block',
                    textAlign: 'center'
                  }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => {
                      const itemKey = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
                      updateQuantity(itemKey, item.quantity + 1);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '2px solid #000',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    +
                  </button>
                </div>
                <p style={{ minWidth: '80px', textAlign: 'right', fontWeight: '600' }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    const itemKey = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
                    removeFromCart(itemKey);
                  }}
                  style={{
                    borderColor: '#FF6B9D',
                    color: '#FF6B9D'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }}>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping:</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

