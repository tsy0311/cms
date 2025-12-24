import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, sortBy, page]);

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
      const params = { 
        status: 'active', 
        limit: 12,
        page,
        sort: sortBy
      };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      if (minPrice) {
        params.minPrice = minPrice;
      }
      if (maxPrice) {
        params.maxPrice = maxPrice;
      }
      const response = await axios.get('/api/products', { params });
      setProducts(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('-createdAt');
    setPage(1);
  };

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem',
        borderRadius: '0',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          color: 'white',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Shop All
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'white', opacity: 0.9 }}>
          Explore our complete collection
        </p>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#f8f8f8',
        borderRadius: '8px'
      }}>
        <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </div>
        </form>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{ 
                width: '100%',
                padding: '0.75rem', 
                border: '2px solid #000',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Min Price:
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder="0"
              style={{ 
                width: '100%',
                padding: '0.75rem', 
                border: '2px solid #000',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Max Price:
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder="1000"
              style={{ 
                width: '100%',
                padding: '0.75rem', 
                border: '2px solid #000',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              style={{ 
                width: '100%',
                padding: '0.75rem', 
                border: '2px solid #000',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
            </select>
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="btn btn-outline"
          style={{ marginTop: '0.5rem' }}
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products-message">
          <p>No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
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
                            {product.soldCount > 0 && ` | ${product.soldCount >= 1000 ? `${(product.soldCount / 1000).toFixed(1)}k` : product.soldCount} sold`})
                          </span>
                        )}
                        {product.reviewCount === 0 && product.soldCount > 0 && (
                          <span>{product.soldCount >= 1000 ? `${(product.soldCount / 1000).toFixed(1)}k` : product.soldCount} sold</span>
                        )}
                      </div>
                    )}
                    <div className="product-price">
                      RM{product.price.toFixed(2)}
                      {product.compareAtPrice && (
                        <span className="product-price-old">
                          RM{product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  className="btn btn-primary add-to-cart-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Out of Stock' : 'See options'}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '0 1rem',
                fontWeight: '600'
              }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
