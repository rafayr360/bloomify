// src/components/Navbar.jsx
import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ currentPage, navigateTo, favoriteCount, currentUser, onLogout, theme, toggleTheme }) {
  const getFirstName = () => {
    if (!currentUser) return '';
    if (currentUser.displayName) {
      return currentUser.displayName.split(' ')[0];
    }
    if (currentUser.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Gardener';
  };

  return (
    <header className="navbar">
      <div className="navbar-brand" onClick={() => navigateTo('library')}>
        <div className="logo-icon bloomify-brand-logo">
          <img src="/bloomify-logo.png" alt="Bloomify Logo" className="brand-logo-img" />
        </div>
        <span className="logo-text">Bloomify</span>
      </div>

      <nav className="nav-links">
        <button 
          className={`nav-item ${currentPage === 'library' ? 'active' : ''}`}
          onClick={() => navigateTo('library')}
        >
          Encyclopedia
        </button>
        <button 
          className={`nav-item ${currentPage === 'favorites' ? 'active' : ''}`}
          onClick={() => navigateTo('favorites')}
        >
          Garden Journal
        </button>
        <button 
          className={`nav-item ai-btn ${currentPage === 'ai' ? 'active' : ''}`}
          onClick={() => navigateTo('ai')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4z"/>
          </svg>
          Help Me Choose
        </button>
      </nav>

      <div className="navbar-actions">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        {currentUser ? (
          <div className="user-nav-profile">
            <div className="user-badge" title={currentUser.email}>
              <span className="user-avatar-initial">{getFirstName().charAt(0).toUpperCase()}</span>
              <span className="user-name">{getFirstName()}</span>
            </div>
            <button 
              className="btn btn-secondary logout-btn" 
              onClick={onLogout}
              title="Sign out of your account"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary nav-login-btn"
            onClick={() => navigateTo('login')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Log In
          </button>
        )}
      </div>
    </header>
  );
}
