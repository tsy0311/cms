import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'USA'
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, activeTab, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error loading orders', 'error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/users/profile', profileData);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '800',
        marginBottom: '2rem',
        textTransform: 'uppercase'
      }}>
        My Account
      </h1>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ 
          minWidth: '200px',
          borderRight: '2px solid #ddd',
          paddingRight: '2rem'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              Order History
            </button>
          </nav>
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <h2 style={{ marginBottom: '1.5rem' }}>Profile Information</h2>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Address</h3>
              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  value={profileData.address.street}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    address: { ...profileData.address, street: e.target.value }
                  })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>City</label>
                  <input
                    type="text"
                    value={profileData.address.city}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>State</label>
                  <input
                    type="text"
                    value={profileData.address.state}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={profileData.address.zipCode}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, zipCode: e.target.value }
                    })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>Order History</h2>
              {orders.length === 0 ? (
                <p>No orders yet. Start shopping!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      style={{
                        border: '1px solid #ddd',
                        padding: '1.5rem',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                          <strong>Order #{order.orderNumber}</strong>
                          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong>${order.total.toFixed(2)}</strong>
                          <p style={{ 
                            color: order.orderStatus === 'delivered' ? '#4CAF50' : '#FF9800',
                            fontSize: '0.9rem',
                            marginTop: '0.25rem',
                            textTransform: 'capitalize'
                          }}>
                            {order.orderStatus}
                          </p>
                        </div>
                      </div>
                      <div>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            gap: '1rem',
                            marginBottom: '0.5rem',
                            paddingBottom: '0.5rem',
                            borderBottom: idx < order.items.length - 1 ? '1px solid #eee' : 'none'
                          }}>
                            <img
                              src={item.image || '/placeholder.jpg'}
                              alt={item.name}
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: '600' }}>{item.name}</p>
                              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.trackingNumber && (
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

