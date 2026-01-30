import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shippingName: user?.name || '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'USA',
    shippingPhone: '',
    paymentMethod: 'credit_card',
  });
  const [loading, setLoading] = useState(false);

  const cartTotal = Math.round(getCartTotal());
  const tax = Math.round(cartTotal * 0.08);
  const shipping = cartTotal >= 150 ? 0 : 10; // MYR 150 for free shipping
  const total = cartTotal + tax + shipping;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          name: formData.shippingName,
          street: formData.shippingStreet,
          city: formData.shippingCity,
          state: formData.shippingState,
          zipCode: formData.shippingZip,
          country: formData.shippingCountry,
          phone: formData.shippingPhone,
        },
        paymentMethod: formData.paymentMethod,
      };

      await axios.post('/api/orders', orderData);
      clearCart();
      navigate('/');
      alert('Order placed successfully!');
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ flex: 2 }}>
          <h2>Shipping Information</h2>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="shippingName"
              value={formData.shippingName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Street Address *</label>
            <input
              type="text"
              name="shippingStreet"
              value={formData.shippingStreet}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>City *</label>
            <input
              type="text"
              name="shippingCity"
              value={formData.shippingCity}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>State *</label>
              <input
                type="text"
                name="shippingState"
                value={formData.shippingState}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Zip Code *</label>
              <input
                type="text"
                name="shippingZip"
                value={formData.shippingZip}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              name="shippingCountry"
              value={formData.shippingCountry}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="shippingPhone"
              value={formData.shippingPhone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Method *</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
            </select>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>MYR {cartTotal}</span>
            </div>
            <div className="cart-summary-row">
              <span>Tax:</span>
              <span>MYR {tax}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping:</span>
              <span>MYR {shipping}</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total:</span>
              <span>MYR {total}</span>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

