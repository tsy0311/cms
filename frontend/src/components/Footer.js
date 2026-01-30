import React from 'react';

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
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '700' }}>
            6IXTY8IGHT
          </h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6' }}>
            Fun, casual fashion and lingerie for the modern woman.
          </p>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
            Shop
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Lingerie</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Nightwear</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Loungewear</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Apparel</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
            Help
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Shipping Info</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Returns</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Size Guide</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Contact Us</li>
          </ul>
        </div>
        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
            Connect
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Instagram</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Facebook</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Twitter</li>
            <li style={{ marginBottom: '0.5rem', opacity: 0.8 }}>Newsletter</li>
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
        <p>&copy; 2024 6IXTY8IGHT. All rights reserved.</p>
      </div>
    </footer>
  );
}

