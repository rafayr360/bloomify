// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BotanicalBackground from './components/BotanicalBackground';
import Library from './pages/Library';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import AIRecommendations from './pages/AIRecommendations';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import { 
  auth, 
  onAuthStateChanged, 
  logoutUser, 
  getUserProfile, 
  syncUserFavorites, 
  syncUserCareLogs 
} from './firebase';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('library');
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [guestAuthModal, setGuestAuthModal] = useState(false);

  // Persistence for user favorites & care logs
  const [favorites, setFavorites] = useState([]);
  const [careLogs, setCareLogs] = useState({});

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Load user-specific profile & data from Firestore
        const profile = await getUserProfile(user.uid);
        if (profile) {
          if (profile.favorites) setFavorites(profile.favorites);
          if (profile.careLogs) setCareLogs(profile.careLogs);
        } else {
          // Fallback initial values
          setFavorites(['lavender', 'strawberry', 'cherry-tomato']);
        }
      } else {
        setCurrentUser(null);
        // Reset to guest local state
        const savedFavs = localStorage.getItem('bloomify_guest_favorites');
        setFavorites(savedFavs ? JSON.parse(savedFavs) : ['lavender', 'strawberry']);
      }
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (page, options = null) => {
    if (options && typeof options === 'object') {
      if (options.email) setVerifyEmail(options.email);
    } else if (typeof options === 'string') {
      setSelectedPlantId(options);
    }

    // Require login for Garden Journal
    if (page === 'favorites' && !currentUser) {
      setGuestAuthModal(true);
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onLoginSuccess = (user) => {
    setCurrentUser(user);
    setGuestAuthModal(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setFavorites([]);
    setCurrentPage('library');
  };

  const toggleFavorite = (plantId) => {
    if (!currentUser) {
      setGuestAuthModal(true);
      return;
    }

    setFavorites(prev => {
      const updated = prev.includes(plantId) 
        ? prev.filter(id => id !== plantId) 
        : [...prev, plantId];
      
      // Sync with Firestore for authenticated user
      if (currentUser) {
        syncUserFavorites(currentUser.uid, updated);
      }
      return updated;
    });
  };

  const addCareLog = (plantId, log) => {
    if (!currentUser) {
      setGuestAuthModal(true);
      return;
    }

    setCareLogs(prev => {
      const plantLogs = prev[plantId] || [];
      const updated = {
        ...prev,
        [plantId]: [log, ...plantLogs]
      };
      if (currentUser) {
        syncUserCareLogs(currentUser.uid, updated);
      }
      return updated;
    });
  };

  const deleteCareLog = (plantId, logId) => {
    if (!currentUser) return;

    setCareLogs(prev => {
      const plantLogs = prev[plantId] || [];
      const updated = {
        ...prev,
        [plantId]: plantLogs.filter(log => log.id !== logId)
      };
      if (currentUser) {
        syncUserCareLogs(currentUser.uid, updated);
      }
      return updated;
    });
  };

  const isAuthPage = ['login', 'signup', 'verify'].includes(currentPage);

  return (
    <div className="app-container">
      {/* Native Botanical Background with SVG leaf line art & glowing neon orbs */}
      <BotanicalBackground />

      <Navbar 
        currentPage={currentPage} 
        navigateTo={navigateTo} 
        favoriteCount={favorites.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Guest Authentication Modal */}
      {guestAuthModal && (
        <div className="modal-overlay" onClick={() => setGuestAuthModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setGuestAuthModal(false)}>✕</button>
            <div className="guest-modal-header">
              <div className="auth-logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-2.5 3.5-3 7-3 10 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3-0.5-6.5-3-10z" fill="rgba(16, 185, 129, 0.4)" stroke="#10b981" strokeWidth="1.8" />
                  <path d="M12 3c2.5 3.5 3 7 3 10 0 3.3-2.7 6-6 6s-6-2.7-6-6c0-3 0.5-6.5 3-10z" fill="rgba(255, 184, 0, 0.4)" stroke="#ffb800" strokeWidth="1.8" />
                </svg>
              </div>
              <h3>Save Your Botanical Garden</h3>
              <p>Log in or create a free account to personalize your Garden Journal, save favorite plants, and keep custom care logs.</p>
            </div>
            <div className="guest-modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setGuestAuthModal(false);
                  navigateTo('login');
                }}
              >
                Log In
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setGuestAuthModal(false);
                  navigateTo('signup');
                }}
              >
                Register New Account
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={isAuthPage ? "main-content auth-main-full" : "main-content"}>
        {currentPage === 'library' && (
          <Library 
            navigateTo={navigateTo} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
          />
        )}

        {currentPage === 'favorites' && (
          <Favorites 
            navigateTo={navigateTo} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
          />
        )}

        {currentPage === 'ai' && (
          <AIRecommendations 
            navigateTo={navigateTo} 
          />
        )}

        {currentPage === 'detail' && (
          <Detail 
            plantId={selectedPlantId} 
            navigateTo={navigateTo} 
            toggleFavorite={toggleFavorite} 
            isFavorite={favorites.includes(selectedPlantId)}
            careLogs={careLogs[selectedPlantId] || []}
            addCareLog={addCareLog}
            deleteCareLog={deleteCareLog}
          />
        )}

        {currentPage === 'login' && (
          <Login 
            navigateTo={navigateTo}
            onLoginSuccess={onLoginSuccess}
          />
        )}

        {currentPage === 'signup' && (
          <Signup 
            navigateTo={navigateTo}
          />
        )}

        {currentPage === 'verify' && (
          <VerifyEmail 
            email={verifyEmail}
            navigateTo={navigateTo}
            onVerifiedSuccess={() => onLoginSuccess(auth.currentUser)}
          />
        )}
      </main>
    </div>
  );
}
