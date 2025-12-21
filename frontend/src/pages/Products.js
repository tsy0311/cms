import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories?isActive=true');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { status: 'active', limit: 50 };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await axios.get('/api/products', { params });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB6C1 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem',
        borderRadius: '8px'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          color: '#000',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Shop All
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>
          Explore our complete collection
        </p>
      </div>
      
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <label htmlFor="category" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
          Category:
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ 
            padding: '0.75rem 1.5rem', 
            border: '2px solid #000',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            background: '#000',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#FF6B9D';
            e.target.style.borderColor = '#FF6B9D';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#000';
            e.target.style.borderColor = '#000';
          }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
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
                  addToCart(product, 1);
                  alert(`${product.name} added to cart!`);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

