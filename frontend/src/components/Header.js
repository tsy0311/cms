import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Header.css';

export default function Header() {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories?isActive=true');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header>
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            ADAM
          </Link>
          <nav className="header-nav">
            <Link to="/products">All Products</Link>
            <div 
              className="nav-category-dropdown"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <span className="nav-link">Categories</span>
              {showCategories && categories.length > 0 && (
                <div className="category-dropdown-menu">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products?category=${category._id}`}
                      className="category-dropdown-item"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
        <form onSubmit={handleSearch} className="header-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>
        <div className="header-right">
          {user ? (
            <>
              <Link to="/account" className="header-link">Account</Link>
              <Link to="/cart" className="header-link cart-link">
                Cart
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </Link>
              <span onClick={handleLogout} className="header-link logout-link">
                Logout
                <span className="user-name-mobile">({user.name})</span>
              </span>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">Login</Link>
              <Link to="/register" className="header-link">Register</Link>
            </>
          )}
        </div>
      </div>
      <div className="header-promo-bar">
        <div className="promo-text">
          <span>🚚 Private Delivery in 2-Hour</span>
        </div>
        <div className="promo-text">
          <span>🎁 Get your FREE Adam Smooth</span>
        </div>
      </div>
    </header>
  );
}

