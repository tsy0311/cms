import React, { useState, useEffect } from 'react';
import './AgeVerification.css';

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const ageVerified = localStorage.getItem('ageVerified');
    if (!ageVerified) {
      setShowModal(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('ageVerified', 'true');
    setShowModal(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showModal) return null;

  return (
    <div className="age-verification-overlay">
      <div className="age-verification-modal">
        <div className="age-verification-content">
          <h1>ADULTS ONLY</h1>
          <p className="age-verification-message">
            WEBSITE CONTAINS AGE-RESTRICTED CONTENTS.<br />
            YOU MUST BE 18 YEARS OLD OR OLDER TO ACCESS THIS WEBSITE.
          </p>
          <div className="age-verification-buttons">
            <button 
              className="btn btn-primary age-verify-btn"
              onClick={handleConfirm}
            >
              I'M OVER 18
            </button>
            <button 
              className="btn btn-secondary age-exit-btn"
              onClick={handleExit}
            >
              EXIT WEBSITE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

