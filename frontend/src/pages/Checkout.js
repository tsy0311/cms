import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 200 ? 0 : 10.00; // RM200 for free shipping, RM10 shipping cost
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal + tax + shipping - discount;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'warning');
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        amount: subtotal
      });
      setAppliedCoupon(response.data.data);
      showToast('Coupon applied successfully!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid coupon code', 'error');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to continue', 'warning');
      navigate('/login');
      return;
    }

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
        couponCode: appliedCoupon?.code,
      };

      const response = await axios.post('/api/orders', orderData);
      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate(`/account?order=${response.data.data._id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error placing order', 'error');
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

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Please login to checkout</h2>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '800',
        marginBottom: '2rem',
        textTransform: 'uppercase'
      }}>
        Checkout
      </h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
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
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal:</span>
              <span>RM{subtotal.toFixed(2)}</span>
            </div>
            
            {/* Coupon Section */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
              {!appliedCoupon ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn btn-outline"
                    disabled={validatingCoupon}
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: '#e8f5e9',
                  borderRadius: '4px'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>
                    Coupon: {appliedCoupon.code} (-RM{discount.toFixed(2)})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f44336',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="cart-summary-row" style={{ marginTop: '1rem' }}>
              <span>Tax:</span>
              <span>RM{tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping:</span>
              <span>RM{shipping.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="cart-summary-row" style={{ color: '#4CAF50' }}>
                <span>Discount:</span>
                <span>-RM{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary-row cart-summary-total">
              <span>Total:</span>
              <span>RM{total.toFixed(2)}</span>
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
