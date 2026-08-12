// src/components/FilterBar.jsx
import React from 'react';

export default function FilterBar({ 
  searchTerm, 
  setSearchTerm, 
  categoryFilter, 
  setCategoryFilter,
  sunlightFilter,
  setSunlightFilter 
}) {
  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search by name, scientific name, or disease..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
        )}
      </div>

      <div className="filter-chips">
        <div className="chip-group">
          <span className="chip-label">Category:</span>
          {['all', 'flower', 'fruit', 'vegetable'].map(cat => (
            <button
              key={cat}
              className={`chip ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === 'all' ? 'All Plants' : cat + 's'}
            </button>
          ))}
        </div>

        <div className="chip-group">
          <span className="chip-label">Sunlight:</span>
          {['all', 'Full Sun', 'Partial Shade', 'Full Shade'].map(sun => (
            <button
              key={sun}
              className={`chip ${sunlightFilter === sun ? 'active' : ''}`}
              onClick={() => setSunlightFilter(sun)}
            >
              {sun === 'all' ? 'Any Light' : sun}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
