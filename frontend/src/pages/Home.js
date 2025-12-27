import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchCategoryProducts();
    }
  }, [categories]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories?isActive=true&limit=6');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategoryProducts = async () => {
    const productsByCategory = {};
    for (const category of categories) {
      try {
        const response = await axios.get(`/api/products?category=${category._id}&status=active&limit=8`);
        productsByCategory[category._id] = response.data.data;
      } catch (error) {
        console.error(`Error fetching products for category ${category.name}:`, error);
        productsByCategory[category._id] = [];
      }
    }
    setCategoryProducts(productsByCategory);
  };

  const formatPrice = (price) => {
    return `RM${price.toFixed(2)}`;
  };

  const formatSoldCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '5rem 2rem',
        marginBottom: '0',
        marginTop: '0'
      }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '1px' }}>
          6D Hyper-Real Doll
        </h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '700' }}>
          Malaysia's #1 Toy Store
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Fast & Private Delivery | Body-Safe Quality
        </p>
      </section>

      {/* Category Navigation */}
      <section style={{ padding: '2rem 0', background: '#f8f8f8', marginBottom: '3rem' }}>
        <div className="main-content">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem', fontWeight: '700' }}>
            Shop by <strong>Category</strong>
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
            Choose a category, click, and enjoy. Everything ships fast in plain wrap, and it's strictly for grown-ups (18+).
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1.5rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                style={{
                  textDecoration: 'none',
                  color: '#333'
                }}
              >
                <div style={{
                  background: 'white',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#000';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {category.name}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>Shop Now →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Product Sections */}
      {categories.map((category) => {
        const products = categoryProducts[category._id] || [];
        if (products.length === 0) return null;

        return (
          <section key={category._id} className="category-section" style={{ marginBottom: '4rem' }}>
            <div className="main-content">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>
                  For <strong>{category.name}</strong>
                </h2>
                <Link
                  to={`/products?category=${category._id}`}
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  shop all →
                </Link>
              </div>
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img
                        src={product.images[0]?.url || 'https://placehold.co/500x500/000000/FFFFFF?text=Product'}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/500x500/000000/FFFFFF?text=Product';
                        }}
                      />
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        {(product.reviewCount > 0 || product.soldCount > 0) && (
                          <div className="product-meta">
                            {product.reviewCount > 0 && (
                              <span>
                                ({product.reviewCount} reviews
                                {product.soldCount > 0 && ` | ${formatSoldCount(product.soldCount)} sold`})
                              </span>
                            )}
                            {product.reviewCount === 0 && product.soldCount > 0 && (
                              <span>{formatSoldCount(product.soldCount)} sold</span>
                            )}
                          </div>
                        )}
                        <div className="product-price">
                          {formatPrice(product.price)}
                          {product.compareAtPrice && (
                            <span className="product-price-old">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <button
                      className="btn btn-primary add-to-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                        showToast(`${product.name} added to cart!`, 'success');
                      }}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'See options'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {categories.length === 0 && (
        <section className="featured-products">
          <div className="main-content">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Featured Products</h2>
            <p className="no-products-message">
              Check back soon for our featured products!
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

