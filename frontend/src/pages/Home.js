import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { addToCart } = useCart();
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // Try to get featured products first
      let response = await axios.get('/api/products?featured=true&status=active&limit=6');
      
      // If no featured products, get latest products instead
      if (!response.data.data || response.data.data.length === 0) {
        response = await axios.get('/api/products?status=active&limit=6&sort=-createdAt');
      }
      
      setFeaturedProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>{language === 'en' ? 'Express Your Style' : '表达您的风格'}</h1>
        <p>
          {language === 'en' 
            ? 'Discover fun, casual fashion and lingerie designed for the modern woman. Shop the latest trends in comfort and style.'
            : '发现为现代女性设计的有趣、休闲的时尚和内衣。购买最新的舒适和时尚潮流。'}
        </p>
        <Link to="/products" className="btn btn-primary">
          {language === 'en' ? 'Shop Now' : '立即购买'}
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
        {language === 'en' 
          ? '🎉 FREE SHIPPING on orders over MYR 150 | Use code: SHOP50'
          : '🎉 订单超过 150 马来西亚林吉特免运费 | 使用代码: SHOP50'}
      </section>

      <section className="featured-products">
        <h2>{language === 'en' ? 'New Arrivals' : '新品上架'}</h2>
        {featuredProducts.length === 0 && (
          <p className="no-products-message">
            {language === 'en' ? 'Check back soon for our featured products!' : '请稍后再查看我们的特色产品！'}
          </p>
        )}
        <div className="products-grid">
          {featuredProducts.map((product) => (
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
                  addToCart(product);
                  alert(t('addToCartSuccess'));
                }}
              >
                {t('addToCart')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

