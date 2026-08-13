// src/pages/AIRecommendations.jsx
import React, { useState } from 'react';
import PlantCard from '../components/PlantCard';

export default function AIRecommendations({ navigateTo, plants }) {
  const [lightLevel, setLightLevel] = useState('Full Sun');
  const [waterHabit, setWaterHabit] = useState('Low');
  const [spaceType, setSpaceType] = useState('Balcony');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const handleRecommend = (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setRecommendations(null);

    // Simulate AI LLM recommendation logic against seeded dataset
    setTimeout(() => {
      let filtered = plants.filter(plant => {
        if (lightLevel === 'Full Sun' && plant.sunlight !== 'Full Sun') return false;
        if (lightLevel === 'Full Shade' && plant.sunlight !== 'Full Shade') return false;
        if (waterHabit === 'Low' && plant.waterFrequency === 'High') return false;
        return true;
      });

      // If text prompt was entered, filter further by keywords
      if (customPrompt.trim()) {
        const query = customPrompt.toLowerCase();
        const promptMatches = plants.filter(plant => 
          plant.name.toLowerCase().includes(query) ||
          plant.scientificName.toLowerCase().includes(query) ||
          plant.description.toLowerCase().includes(query) ||
          plant.category.toLowerCase().includes(query) ||
          (query.includes('forget') || query.includes('easy')) && plant.difficulty === 'Easy'
        );
        if (promptMatches.length > 0) {
          filtered = promptMatches;
        }
      }

      // Fallback: pick top 3 matches if filter is empty
      if (filtered.length === 0) {
        filtered = plants.slice(0, 3);
      }

      setRecommendations(filtered.slice(0, 6));
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="page-container ai-page">
      <header className="page-header">
        <div className="ai-badge">✨ AI Botanical Assistant</div>
        <h1 className="page-title">Help Me Choose</h1>
        <p className="page-subtitle">
          Describe your living space or growth conditions, and our AI will recommend plants tailored to your environment.
        </p>
      </header>

      <div className="ai-layout">
        <form onSubmit={handleRecommend} className="ai-form-card">
          <h3>Space Parameters</h3>

          <div className="form-group">
            <label>Sunlight Exposure</label>
            <select value={lightLevel} onChange={(e) => setLightLevel(e.target.value)}>
              <option value="Full Sun">☀️ Direct Sunlight (Full Sun)</option>
              <option value="Partial Shade">⛅ Indirect Sunlight (Partial Shade)</option>
              <option value="Full Shade">☁️ Low Sunlight (Full Shade / Indoors)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Watering Habits</label>
            <select value={waterHabit} onChange={(e) => setWaterHabit(e.target.value)}>
              <option value="Low">🌵 Low Maintenance (I often forget to water)</option>
              <option value="Moderate">💧 Regular (Water once a week)</option>
              <option value="High">🌊 High Attention (Water daily)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Environment</label>
            <select value={spaceType} onChange={(e) => setSpaceType(e.target.value)}>
              <option value="Balcony">Outdoor Balcony / Patio</option>
              <option value="Indoor">Indoor Bedroom / Living Room</option>
              <option value="Garden">Outdoor Garden Bed</option>
            </select>
          </div>

          <div className="form-group">
            <label>Describe your space (Optional)</label>
            <textarea 
              rows="3"
              placeholder="e.g., 'Small balcony with afternoon heat, looking for low-maintenance edible herbs...'"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing Environment...' : '✨ Get Recommendations'}
          </button>
        </form>

        <div className="ai-results-wrapper">
          {isAnalyzing && (
            <div className="ai-loading">
              <div className="spinner"></div>
              <p>Analyzing space parameters and finding optimal plant species...</p>
            </div>
          )}

          {!isAnalyzing && recommendations && (
            <div className="ai-results">
              <h2>Tailored Recommendations ({recommendations.length})</h2>
              <p className="results-reasoning">
                Based on your preference for <strong>{lightLevel}</strong> and <strong>{waterHabit} watering</strong>, here are the top plants for your space:
              </p>

              <div className="plant-grid">
                {recommendations.map(plant => (
                  <PlantCard 
                    key={plant.id}
                    plant={plant}
                    navigateTo={navigateTo}
                    isFavorite={false}
                    toggleFavorite={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {!isAnalyzing && !recommendations && (
            <div className="ai-placeholder">
              <div className="ai-icon">🤖🌱</div>
              <h3>Ready to recommend your ideal plants</h3>
              <p>Adjust the space parameters on the left and click <strong>Get Recommendations</strong>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
