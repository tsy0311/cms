import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Header.css';

export default function Header() {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <div className="header-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" className="logo">
            6IXTY8IGHT
          </Link>
          <nav>
            <Link to="/">{t('home')}</Link>
            <Link to="/products">{t('products')}</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            {language === 'en' ? '中' : 'EN'}
          </button>
          {user ? (
            <>
              <Link to="/cart">
                {t('cart')}
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </Link>
              <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
                {t('logout')} ({user.name})
              </span>
            </>
          ) : (
            <>
              <Link to="/login">{t('login')}</Link>
              <Link to="/register">{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

