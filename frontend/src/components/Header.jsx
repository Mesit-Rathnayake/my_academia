import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <h1 className="logo">my Academia</h1>
      <div className="auth-buttons">
        <button className="auth-button secondary">Sign Up</button>
        <button className="auth-button primary">Log In</button>
      </div>
    </header>
  );
};

export default Header;