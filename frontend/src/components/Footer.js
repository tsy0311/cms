import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ 
      background: '#000', 
      color: 'white', 
      padding: '3rem 2rem',
      marginTop: '4rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '2px' }}>
            ADAM
          </h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6', marginBottom: '1rem' }}>
            Malaysia's trusted adult toy store since 2014, offering body-safe pleasure products with fast, plain-box delivery.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Categories
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/products" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>
                All Products
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>For Man</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>For Women</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>For Couple</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Lingerie</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link to="/" style={{ color: 'white', opacity: 0.8, textDecoration: 'none' }}>Home</Link>
            </li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>About</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Products</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Contact</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>FAQ</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Contact Us
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.8' }}>
            <li style={{ marginBottom: '0.5rem' }}>+60 18-209 7226</li>
            <li style={{ marginBottom: '0.5rem' }}>adammalaysia2014@gmail.com</li>
            <li style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              D1 Medalla Suite, Pusat Korporate Oasis,<br />
              2 Jalan Pju 1a/2, Ara Damansara<br />
              47301 Petaling Jaya Selangor
            </li>
          </ul>
        </div>
      </div>
      <div style={{ 
        borderTop: '1px solid #333', 
        paddingTop: '2rem', 
        textAlign: 'center',
        fontSize: '0.9rem',
        opacity: 0.7
      }}>
        <p>Copyright © 2025 Adam Group. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

