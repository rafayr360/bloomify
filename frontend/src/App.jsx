// src/App.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Library from './pages/Library';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import AIRecommendations from './pages/AIRecommendations';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('library');
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  
  // Persistence for user favorites & care logs
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('bloomify_favorites');
    return saved ? JSON.parse(saved) : ['lavender', 'strawberry', 'cherry-tomato'];
  });

  const [careLogs, setCareLogs] = useState(() => {
    const saved = localStorage.getItem('bloomify_care_logs');
    return saved ? JSON.parse(saved) : {
      lavender: [
        { id: 1, action: 'Watered', note: 'Soaked deeply in morning sun', loggedAt: 'Aug 10, 2026' }
      ]
    };
  });

  const navigateTo = (page, plantId = null) => {
    setCurrentPage(page);
    if (plantId) setSelectedPlantId(plantId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (plantId) => {
    setFavorites(prev => {
      const updated = prev.includes(plantId) 
        ? prev.filter(id => id !== plantId) 
        : [...prev, plantId];
      localStorage.setItem('bloomify_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const addCareLog = (plantId, log) => {
    setCareLogs(prev => {
      const plantLogs = prev[plantId] || [];
      const updated = {
        ...prev,
        [plantId]: [log, ...plantLogs]
      };
      localStorage.setItem('bloomify_care_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteCareLog = (plantId, logId) => {
    setCareLogs(prev => {
      const plantLogs = prev[plantId] || [];
      const updated = {
        ...prev,
        [plantId]: plantLogs.filter(log => log.id !== logId)
      };
      localStorage.setItem('green_almanac_care_logs', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="app-container">
      <Navbar 
        currentPage={currentPage} 
        navigateTo={navigateTo} 
        favoriteCount={favorites.length} 
      />

      <main className="main-content">
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
      </main>
    </div>
  );
}
