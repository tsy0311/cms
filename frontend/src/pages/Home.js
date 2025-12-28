import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/api/products?featured=true&status=active&limit=6');
      setFeaturedProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Express Your Style</h1>
        <p>
          Discover fun, casual fashion and lingerie designed for the modern woman. 
          Shop the latest trends in comfort and style.
        </p>
        <Link to="/products" className="btn btn-primary">
          Shop Now
        </Link>
      </section>

      {/* Promotional Banner */}
      <section className="promo-banner" style={{
        background: '#000',
        color: 'white',
        padding: '1.5rem',
        textAlign: 'center',
        marginBottom: '3rem',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        🎉 FREE SHIPPING on orders over $50 | Use code: SHOP50
      </section>

      <section className="featured-products">
        <h2>New Arrivals</h2>
        {featuredProducts.length === 0 && (
          <p className="no-products-message">
            Check back soon for our featured products!
          </p>
        )}
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <Link to={`/products/${product._id}`}>
                <img
                  src={product.images[0]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    ${product.price.toFixed(2)}
                    {product.compareAtPrice && (
                      <span className="product-price-old">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <button
                className="btn btn-primary add-to-cart-btn"
                onClick={() => {
                  addToCart(product);
                  alert(`${product.name} added to cart!`);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

