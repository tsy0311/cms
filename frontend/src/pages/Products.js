import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when category changes
    fetchProducts();
  }, [selectedCategory, currentPage]);

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
        limit: 24,  // Products per page
        page: currentPage 
      };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await axios.get('/api/products', { params });
      setProducts(response.data.data || []);
      setTotalPages(response.data.pages || 1);
      setTotalProducts(response.data.total || 0);
      console.log(`Loaded ${response.data.data?.length || 0} products for category: ${selectedCategory || 'All'} (Page ${currentPage}/${response.data.pages || 1})`);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
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
          {t('products')}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#333' }}>
          {language === 'en' ? 'Explore our complete collection' : '探索我们的完整产品系列'}
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
          {language === 'en' ? 'Category' : '类别'}:
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
        <p>{t('loading')}</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
            {language === 'en' ? 'No products found in this category' : '此类别中没有产品'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
            {language === 'en' 
              ? `Showing ${(currentPage - 1) * 24 + 1}-${Math.min(currentPage * 24, totalProducts)} of ${totalProducts} products`
              : `显示第 ${(currentPage - 1) * 24 + 1}-${Math.min(currentPage * 24, totalProducts)} 个，共 ${totalProducts} 个产品`}
          </div>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={getImageUrl(product.images[0]?.url) || '/placeholder.jpg'}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">
                      MYR {Math.round(product.price)}
                    </div>
                  </div>
                </Link>
                <button
                  className="btn btn-primary add-to-cart-btn"
                  onClick={() => {
                    addToCart(product, 1);
                    alert(t('addToCartSuccess'));
                  }}
                >
                  {t('addToCart')}
                </button>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginTop: '3rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #000',
                  background: currentPage === 1 ? '#ddd' : '#000',
                  color: currentPage === 1 ? '#999' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}
              >
                {language === 'en' ? 'Previous' : '上一页'}
              </button>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        padding: '0.75rem 1rem',
                        border: '2px solid #000',
                        background: currentPage === pageNum ? '#FF6B9D' : '#fff',
                        color: currentPage === pageNum ? '#fff' : '#000',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        borderRadius: '4px',
                        minWidth: '2.5rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== pageNum) {
                          e.target.style.background = '#f0f0f0';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== pageNum) {
                          e.target.style.background = '#fff';
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #000',
                  background: currentPage === totalPages ? '#ddd' : '#000',
                  color: currentPage === totalPages ? '#999' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}
              >
                {language === 'en' ? 'Next' : '下一页'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

