// src/pages/Favorites.jsx
import React from 'react';
import PlantCard from '../components/PlantCard';
import { plantsData } from '../mockData';

export default function Favorites({ navigateTo, favorites, toggleFavorite }) {
  const savedPlants = plantsData.filter(plant => favorites.includes(plant.id));

  return (
    <div className="page-container favorites-page">
      <header className="page-header">
        <h1 className="page-title">My Garden Journal</h1>
        <p className="page-subtitle">
          Your personal collection of saved plants, customized care schedules, and favorite botanicals.
        </p>
      </header>

      {savedPlants.length > 0 && (
        <div className="journal-stats">
          <div className="stat-card">
            <span className="stat-number">{savedPlants.length}</span>
            <span className="stat-label">Total Saved Plants</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {savedPlants.filter(p => p.category === 'flower').length}
            </span>
            <span className="stat-label">Flowers</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {savedPlants.filter(p => p.category === 'fruit').length}
            </span>
            <span className="stat-label">Fruits</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {savedPlants.filter(p => p.category === 'vegetable').length}
            </span>
            <span className="stat-label">Vegetables</span>
          </div>
        </div>
      )}

      {savedPlants.length > 0 ? (
        <div className="plant-grid">
          {savedPlants.map(plant => (
            <PlantCard 
              key={plant.id}
              plant={plant}
              navigateTo={navigateTo}
              isFavorite={true}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h3>Your Garden Journal is Empty</h3>
          <p>Click the heart icon on any plant in the encyclopedia to save it to your personal journal.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigateTo('library')}
          >
            Browse Encyclopedia
          </button>
        </div>
      )}
    </div>
  );
}
