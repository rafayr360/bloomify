// src/pages/Library.jsx
import React, { useState, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import PlantCard from '../components/PlantCard';

export default function Library({ navigateTo, favorites, toggleFavorite, plants, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sunlightFilter, setSunlightFilter] = useState('all');

  const filteredPlants = useMemo(() => {
    return (plants || []).filter(plant => {
      const matchesSearch = 
        (plant.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.scientificName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.commonPests || []).some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || plant.category === categoryFilter;
      const matchesSunlight = sunlightFilter === 'all' || plant.sunlight === sunlightFilter;

      return matchesSearch && matchesCategory && matchesSunlight;
    });
  }, [plants, searchTerm, categoryFilter, sunlightFilter]);

  if (isLoading) {
    return (
      <div className="page-container library-page">
        <header className="page-header">
          <h1 className="page-title">Plant Encyclopedia</h1>
          <p className="page-subtitle">
            Explore botanical care guides, sunlight requirements, watering schedules, and common pests.
          </p>
        </header>
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading plant data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container library-page">
      <header className="page-header">
        <h1 className="page-title">Plant Encyclopedia</h1>
        <p className="page-subtitle">
          Explore botanical care guides, sunlight requirements, watering schedules, and common pests.
        </p>
      </header>

      <FilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        sunlightFilter={sunlightFilter}
        setSunlightFilter={setSunlightFilter}
      />

      <div className="results-count">
        Showing <strong>{filteredPlants.length}</strong> {filteredPlants.length === 1 ? 'plant' : 'plants'}
      </div>

      {filteredPlants.length > 0 ? (
        <div className="plant-grid">
          {filteredPlants.map(plant => (
            <PlantCard 
              key={plant.id}
              plant={plant}
              navigateTo={navigateTo}
              isFavorite={favorites.includes(plant.id)}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🌿</div>
          <h3>No plants match your search</h3>
          <p>Try clearing your filters or searching for another species like "Rose", "Tomato", or "Lavender".</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setSunlightFilter('all');
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
