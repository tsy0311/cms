import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    }
  };

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/cart');
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '3rem', marginTop: '2rem', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 400px' }}>
        <img
          src={product.images[0]?.url || '/placeholder.jpg'}
          alt={product.name}
          style={{ 
            width: '100%', 
            borderRadius: '0',
            border: '1px solid #e0e0e0'
          }}
        />
      </div>
      <div style={{ flex: '1 1 400px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {product.name}
        </h1>
        <div style={{ fontSize: '2rem', margin: '1.5rem 0', fontWeight: '700' }}>
          <span style={{ color: '#000' }}>
            ${product.price.toFixed(2)}
          </span>
          {product.compareAtPrice && (
            <span
              style={{
                textDecoration: 'line-through',
                color: '#999',
                marginLeft: '1rem',
                fontSize: '1.5rem',
                fontWeight: '400'
              }}
            >
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>
        <p style={{ 
          marginBottom: '2rem', 
          fontSize: '1.1rem',
          lineHeight: '1.8',
          color: '#555'
        }}>
          {product.description}
        </p>
        
        {product.stock > 0 ? (
          <>
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Size: <span style={{ color: 'red' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: selectedSize === size ? '2px solid #000' : '2px solid #ddd',
                        background: selectedSize === size ? '#000' : 'white',
                        color: selectedSize === size ? 'white' : '#000',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  Color:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color.name)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: selectedColor === color.name ? '3px solid #000' : '2px solid #ddd',
                        background: color.hex || color.name,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Quantity:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '2px solid #000',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ 
                    padding: '0.5rem', 
                    width: '80px', 
                    textAlign: 'center',
                    border: '2px solid #000',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '2px solid #000',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +
                </button>
                <span style={{ marginLeft: '1rem', color: '#666' }}>
                  {product.stock} in stock
                </span>
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}
              disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
            >
              Add to Cart
            </button>
            {product.sizes && product.sizes.length > 0 && !selectedSize && (
              <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Please select a size
              </p>
            )}
          </>
        ) : (
          <p style={{ color: 'red', fontSize: '1.1rem', fontWeight: '600' }}>
            Out of Stock
          </p>
        )}
      </div>
    </div>
  );
}

