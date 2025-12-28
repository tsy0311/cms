import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/api';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const cartTotal = Math.round(getCartTotal());
  const tax = Math.round(cartTotal * 0.08);
  const shipping = cartTotal >= 150 ? 0 : 10; // MYR 150 for free shipping
  const total = cartTotal + tax + shipping;

  if (cart.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem',
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB6C1 100%)',
        borderRadius: '8px'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>
          {t('emptyCart')}
        </h2>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
          {language === 'en' ? 'Start adding items to your cart!' : '开始将商品添加到购物车！'}
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
          {t('continue')} {language === 'en' ? 'Shopping' : '购物'}
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
        {language === 'en' ? 'Shopping Cart' : '购物车'}
      </h1>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 2 }}>
          {cart.map((item, index) => {
            const itemKey = `${item.product._id}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
            return (
            <div key={itemKey || `${item.product._id}-${index}`} className="cart-item">
              <img
                src={getImageUrl(item.product.images[0]?.url) || '/placeholder.jpg'}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details" style={{ flex: 1 }}>
                <h3>{item.product.name}</h3>
                {item.selectedSize && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    {language === 'en' ? 'Size' : '尺寸'}: {item.selectedSize}
                  </p>
                )}
                {item.selectedColor && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    {language === 'en' ? 'Color' : '颜色'}: {item.selectedColor}
                  </p>
                )}
                <p style={{ fontWeight: '600', marginTop: '0.5rem' }}>
                  MYR {Math.round(item.product.price)}
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
                  MYR {Math.round(item.product.price * item.quantity)}
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
            <h3>{language === 'en' ? 'Order Summary' : '订单摘要'}</h3>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{t('subtotal')}:</span>
                <span>MYR {getCartTotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{language === 'en' ? 'Tax' : '税费'}:</span>
                <span>MYR {tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{language === 'en' ? 'Shipping' : '运费'}:</span>
                <span>MYR {shipping.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #000', fontWeight: '700', fontSize: '1.2rem' }}>
                <span>{t('total')}:</span>
                <span>MYR {total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/checkout')}
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
            >
              {language === 'en' ? 'Proceed to Checkout' : '前往结账'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

