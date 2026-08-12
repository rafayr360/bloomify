// src/components/PlantCard.jsx
import React from 'react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&auto=format&fit=crop";

export default function PlantCard({ plant, navigateTo, isFavorite, toggleFavorite }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <div className="plant-card">
      <div className="card-image-container" onClick={() => navigateTo('detail', plant.id)}>
        <img 
          src={plant.imageUrl} 
          alt={plant.name} 
          className="card-image" 
          loading="lazy" 
          onError={handleImageError}
        />
        <div className="card-badges">
          <span className={`badge badge-${plant.category}`}>
            {plant.category}
          </span>
          {plant.edible && (
            <span className="badge badge-edible" title="Edible plant">
              🌱 Edible
            </span>
          )}
        </div>
        <button 
          className={`favorite-heart-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(plant.id);
          }}
          title={isFavorite ? "Remove from Garden Journal" : "Save to Garden Journal"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "currentColor"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="card-body" onClick={() => navigateTo('detail', plant.id)}>
        <div className="card-header">
          <h3 className="plant-title">{plant.name}</h3>
          <span className="scientific-name">{plant.scientificName}</span>
        </div>

        <p className="card-description">{plant.description}</p>

        <div className="card-meta">
          <div className="meta-item" title="Sunlight Requirement">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
            </svg>
            <span>{plant.sunlight}</span>
          </div>

          <div className="meta-item" title="Watering Needs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
            <span>{plant.waterFrequency} Water</span>
          </div>

          <div className="meta-item" title="Growth Difficulty">
            <span className="dot" style={{ backgroundColor: getDifficultyColor(plant.difficulty) }}></span>
            <span>{plant.difficulty}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
