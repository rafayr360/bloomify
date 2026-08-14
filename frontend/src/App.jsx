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
import { auth, onAuthStateChanged, ensureUserProfile, syncUserFavorites, syncUserCareLogs, logoutUser, syncUserTheme } from './firebase';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('library');
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bloomify_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [verifyEmail, setVerifyEmail] = useState('');
  const [guestAuthModal, setGuestAuthModal] = useState(false);

  // Persistence for user favorites & care logs
  const [favorites, setFavorites] = useState([]);
  const [careLogs, setCareLogs] = useState({});
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch plants from backend database (Neon DB)
  useEffect(() => {
    const fetchPlants = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${baseUrl}/api/plants`);
        if (!res.ok) throw new Error("HTTP error " + res.status);
        const data = await res.json();
        
        const getCommonPests = (category) => {
          switch (category?.toLowerCase()) {
            case 'flower': return ['Aphids', 'Spider Mites', 'Thrips'];
            case 'fruit': return ['Fruit Flies', 'Birds', 'Codling Moths'];
            case 'vegetable': return ['Cutworms', 'Slugs', 'Caterpillars'];
            case 'herb': return ['Whiteflies', 'Spider Mites'];
            default: return ['Aphids', 'Gnats'];
          }
        };

        const mappedPlants = data.map(dbPlant => {
          const features = (dbPlant.features || []).filter(Boolean);
          const category = (dbPlant.type || dbPlant.category || 'flower').toLowerCase();
          return {
            id: dbPlant.slug || dbPlant.id.toString(),
            name: dbPlant.common_name || dbPlant.name,
            scientificName: dbPlant.scientific_name || dbPlant.biological_name || '',
            category: category,
            sunlight: dbPlant.sunlight || 'Full Sun',
            waterFrequency: dbPlant.water_frequency || 'Moderate',
            soilType: dbPlant.soil_type || 'Well-draining',
            bloomSeason: dbPlant.bloom_season || 'Summer',
            edible: dbPlant.edible !== undefined ? dbPlant.edible : features.includes('Edible'),
            difficulty: dbPlant.difficulty || 'Easy',
            commonPests: getCommonPests(category),
            description: dbPlant.description || '',
            imageUrl: dbPlant.image_url || '/lavender.jpg'
          };
        });

        setPlants(mappedPlants);
      } catch (err) {
        console.error("Failed to fetch plants from backend database:", err);
        setFetchError("Unable to connect to database. Make sure the backend server is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Manage user-specific themes
  const [theme, setTheme] = useState(() => {
    const savedUser = localStorage.getItem('bloomify_current_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const key = user ? `bloomify_theme_${user.uid}` : 'bloomify_theme_guest';
    return localStorage.getItem(key) || 'light';
  });

  // Apply theme and save it when changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const key = currentUser ? `bloomify_theme_${currentUser.uid}` : 'bloomify_theme_guest';
    localStorage.setItem(key, theme);
    localStorage.setItem('theme', theme); // Compatibility fallback
    
    // Sync theme to Firestore if logged in
    if (currentUser) {
      syncUserTheme(currentUser.uid, theme).catch(err => {
        console.warn("Theme sync failed:", err);
      });
    }
  }, [theme, currentUser]);

  // Sync state when user logs in/out via Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user profile in Firestore
        const profile = await ensureUserProfile(firebaseUser);
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified,
          firstName: profile?.firstName || firebaseUser.displayName?.split(' ')[0] || 'Gardener',
          lastName: profile?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          phone: profile?.phone || '',
          ...profile
        };
        setCurrentUser(userData);
        localStorage.setItem('bloomify_current_user', JSON.stringify(userData));

        if (profile) {
          setFavorites(profile.favorites || []);
          setCareLogs(profile.careLogs || {});
          if (profile.theme) {
            setTheme(profile.theme);
          }
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('bloomify_current_user');
        
        // Load guest state from local storage
        const savedFavs = localStorage.getItem('bloomify_guest_favorites');
        const savedLogs = localStorage.getItem('bloomify_guest_care_logs');
        setFavorites(savedFavs ? JSON.parse(savedFavs) : ['lavender', 'strawberry']);
        setCareLogs(savedLogs ? JSON.parse(savedLogs) : {});
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync user favorites to Firestore or local storage
  const saveUserFavorites = async (updatedFavs) => {
    if (auth.currentUser) {
      await syncUserFavorites(auth.currentUser.uid, updatedFavs);
    } else {
      localStorage.setItem('bloomify_guest_favorites', JSON.stringify(updatedFavs));
    }
  };

  // Sync user care logs to Firestore or local storage
  const saveUserCareLogs = async (updatedLogs) => {
    if (auth.currentUser) {
      await syncUserCareLogs(auth.currentUser.uid, updatedLogs);
    } else {
      localStorage.setItem('bloomify_guest_care_logs', JSON.stringify(updatedLogs));
    }
  };

  const navigateTo = (page, options = null) => {
    if (options && typeof options === 'object') {
      if (options.email) setVerifyEmail(options.email);
    } else if (typeof options === 'string') {
      setSelectedPlantId(options);
    }

    // Require login for Garden Journal & AI advice pages
    if ((page === 'favorites' || page === 'ai') && !currentUser) {
      setGuestAuthModal(true);
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onLoginSuccess = (user) => {
    // onAuthStateChanged will handle updating state, but update local state immediately for responsiveness
    setCurrentUser(user);
    setGuestAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Failed to sign out from Firebase:", err);
    }
    localStorage.setItem('bloomify_theme_guest', 'light');
    setTheme('light');
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
      saveUserFavorites(updated);
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
      saveUserCareLogs(updated);
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
      saveUserCareLogs(updated);
      return updated;
    });
  };

  const isAuthPage = ['login', 'signup', 'verify'].includes(currentPage);

  return (
    <div className={`app-container ${isAuthPage ? 'force-light-auth' : ''}`}>
      {/* Native Botanical Background with SVG leaf line art & glowing neon orbs */}
      <BotanicalBackground />

      <Navbar 
        currentPage={currentPage} 
        navigateTo={navigateTo} 
        favoriteCount={favorites.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {fetchError && (
        <div className="offline-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {fetchError}
        </div>
      )}

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
              <h3>Personalize Your Botanical Garden</h3>
              <p>Log in or create a free account to save favorite plants, use our AI Botanical Assistant, and keep custom care logs.</p>
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
            plants={plants}
            isLoading={isLoading}
          />
        )}

        {currentPage === 'favorites' && (
          <Favorites 
            navigateTo={navigateTo} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
            plants={plants}
          />
        )}

        {currentPage === 'ai' && (
          <AIRecommendations 
            navigateTo={navigateTo} 
            plants={plants}
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
            currentUser={currentUser}
            plants={plants}
            isLoading={isLoading}
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
            onVerifiedSuccess={() => onLoginSuccess({
              uid: 'demo_user_123',
              email: verifyEmail || 'user@example.com',
              displayName: (verifyEmail || 'Gardener').split('@')[0],
              emailVerified: true
            })}
          />
        )}
      </main>
    </div>
  );
}
