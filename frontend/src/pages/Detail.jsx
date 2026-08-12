// src/pages/Detail.jsx
import React, { useState } from 'react';
import { plantsData } from '../mockData';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&auto=format&fit=crop";

export default function Detail({ plantId, navigateTo, toggleFavorite, isFavorite, careLogs, addCareLog, deleteCareLog }) {
  const plant = plantsData.find(p => p.id === plantId) || plantsData[0];
  const [logNote, setLogNote] = useState('');
  const [logAction, setLogAction] = useState('Watered');

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logNote.trim()) return;

    const newLog = {
      id: Date.now(),
      action: logAction,
      note: logNote,
      loggedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    addCareLog(plant.id, newLog);
    setLogNote('');
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  return (
    <div className="page-container detail-page">
      <button className="back-btn" onClick={() => navigateTo('library')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back to Encyclopedia
      </button>

      <div className="detail-hero">
        <div className="detail-image-wrapper">
          <img 
            src={plant.imageUrl} 
            alt={plant.name} 
            className="detail-image" 
            onError={handleImageError}
          />
          <button 
            className={`favorite-action-btn ${isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(plant.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "#ef4444" : "none"} stroke={isFavorite ? "#ef4444" : "currentColor"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {isFavorite ? 'Saved in Garden Journal' : 'Save to Garden Journal'}
          </button>
        </div>

        <div className="detail-header-info">
          <div className="detail-badges">
            <span className={`badge badge-${plant.category}`}>{plant.category}</span>
            <span className="badge badge-difficulty">{plant.difficulty} Care</span>
            {plant.edible && <span className="badge badge-edible">🌱 Edible</span>}
          </div>

          <h1 className="detail-title">{plant.name}</h1>
          <p className="detail-latin">{plant.scientificName}</p>
          <p className="detail-description">{plant.description}</p>

          <div className="care-specs-grid">
            <div className="spec-card">
              <div className="spec-icon">☀️</div>
              <div className="spec-content">
                <span className="spec-label">Sunlight</span>
                <span className="spec-value">{plant.sunlight}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">💧</div>
              <div className="spec-content">
                <span className="spec-label">Watering</span>
                <span className="spec-value">{plant.waterFrequency} Schedule</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">🪴</div>
              <div className="spec-content">
                <span className="spec-label">Soil Type</span>
                <span className="spec-value">{plant.soilType}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">🌸</div>
              <div className="spec-content">
                <span className="spec-label">Bloom Season</span>
                <span className="spec-value">{plant.bloomSeason}</span>
              </div>
            </div>
          </div>

          <div className="pests-section">
            <h4>Common Pests & Diseases</h4>
            <div className="pest-tags">
              {plant.commonPests.map(pest => (
                <span key={pest} className="pest-tag">🐛 {pest}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Care Log & History */}
      <section className="care-log-section">
        <h2 className="section-title">Care Journal for {plant.name}</h2>
        <p className="section-desc">Record watering dates, pruning notes, and fertilizing schedules.</p>

        <form onSubmit={handleLogSubmit} className="care-log-form">
          <div className="form-row">
            <select 
              value={logAction} 
              onChange={(e) => setLogAction(e.target.value)}
              className="log-select"
            >
              <option value="Watered">💧 Watered</option>
              <option value="Fertilized">🌱 Fertilized</option>
              <option value="Pruned">✂️ Pruned</option>
              <option value="Repotted">🪴 Repotted</option>
              <option value="Pest Treated">🛡️ Pest Treated</option>
            </select>
            <input 
              type="text"
              placeholder="e.g. Added liquid seaweed fertilizer, soil felt dry..."
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              className="log-input"
              required
            />
            <button type="submit" className="btn btn-primary">
              Log Action
            </button>
          </div>
        </form>

        <div className="care-timeline">
          {careLogs.length > 0 ? (
            careLogs.map(log => (
              <div key={log.id} className="timeline-item">
                <div className="timeline-bullet"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-action">{log.action}</span>
                    <div className="timeline-meta">
                      <span className="timeline-date">{log.loggedAt}</span>
                      <button 
                        className="delete-log-btn"
                        onClick={() => deleteCareLog(plant.id, log.id)}
                        title="Delete log entry"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="timeline-note">{log.note}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="timeline-empty">
              No care logs recorded yet for this plant. Add your first entry above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
