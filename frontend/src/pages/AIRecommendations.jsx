// src/pages/AIRecommendations.jsx
import React, { useState } from 'react';
import PlantCard from '../components/PlantCard';

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE_URL = rawApiUrl.replace(/\/api\/?$/, '');

export default function AIRecommendations({ navigateTo, plants = [] }) {
  const [lightLevel, setLightLevel] = useState('Full Sun');
  const [waterHabit, setWaterHabit] = useState('Low');
  const [spaceType, setSpaceType] = useState('Balcony');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [aiProvider, setAiProvider] = useState(null);
  const [error, setError] = useState(null);

  const lightLabels = {
    'Full Sun': 'Direct Sunlight (Full Sun)',
    'Partial Shade': 'Indirect Sunlight (Partial Shade)',
    'Full Shade': 'Low Sunlight (Full Shade / Indoors)'
  };

  const waterLabels = {
    Low: 'Low maintenance, I often forget to water',
    Moderate: 'Regular watering, about once a week',
    High: 'High attention, willing to water daily'
  };

  const spaceLabels = {
    Balcony: 'Outdoor balcony / patio',
    Indoor: 'Indoor bedroom / living room',
    Garden: 'Outdoor garden bed'
  };

  const handleRecommend = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setRecommendations(null);
    setError(null);

    // Combine the structured dropdowns AND the free-text description
    // into one plain-language prompt so nothing the user types gets ignored.
    const description = [
      `Sunlight: ${lightLabels[lightLevel]}.`,
      `Watering habits: ${waterLabels[waterHabit]}.`,
      `Environment: ${spaceLabels[spaceType]}.`,
      customPrompt.trim() ? `Additional details from the user: "${customPrompt.trim()}"` : ''
    ].filter(Boolean).join(' ');

    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong getting recommendations.');
      }

      // Match backend returned recommendations against frontend plants array
      const matched = (data.recommendations || [])
        .map(rec => {
          // Find matching plant by slug, string ID, integer ID, or common name
          const fullPlant = (plants || []).find(p =>
            p.id === rec.slug ||
            p.id === rec.id ||
            String(p.id) === String(rec.id) ||
            p.id === String(rec.slug) ||
            (p.name && rec.common_name && p.name.toLowerCase() === rec.common_name.toLowerCase())
          ) || {
            id: rec.slug || rec.id || Math.random().toString(),
            name: rec.common_name || rec.name || 'Recommended Plant',
            scientificName: rec.scientific_name || '',
            category: (rec.category || 'flower').toLowerCase(),
            sunlight: rec.sunlight || 'Full Sun',
            waterFrequency: rec.water_frequency || 'Moderate',
            soilType: rec.soil_type || 'Well-draining',
            difficulty: rec.difficulty || 'Easy',
            description: rec.description || '',
            imageUrl: rec.image_url || '/lavender.jpg'
          };

          return { ...fullPlant, aiReason: rec.reason };
        })
        .filter(Boolean);

      setRecommendations(matched);
      setAiProvider(data.provider || 'gemini');
    } catch (err) {
      console.error('Recommendation error:', err);
      setError(err.message || 'Unable to get recommendations right now. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
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

          {!isAnalyzing && error && (
            <div className="ai-error">
              <div className="ai-icon">⚠️</div>
              <h3>Couldn't get recommendations</h3>
              <p>{error}</p>
              <p className="results-reasoning">
                Make sure the backend server is running and your AI_API_KEY is set correctly.
              </p>
            </div>
          )}

          {!isAnalyzing && !error && recommendations && recommendations.length > 0 && (
            <div className="ai-results">
              <div className="results-header-bar">
                <h2>Tailored Recommendations ({recommendations.length})</h2>
                {aiProvider && (
                  <span className={`provider-badge provider-${aiProvider}`}>
                    {aiProvider === 'gemini' ? '✨ Powered by Google Gemini AI' : '🌿 Botanical Matching Engine'}
                  </span>
                )}
              </div>
              <p className="results-reasoning">
                Based on your space and preferences, here are the top plants for you:
              </p>

              <div className="plant-grid">
                {recommendations.map(plant => (
                  <div key={plant.id}>
                    <PlantCard
                      plant={plant}
                      navigateTo={navigateTo}
                      isFavorite={false}
                      toggleFavorite={() => {}}
                    />
                    {plant.aiReason && (
                      <p className="ai-reason">💡 {plant.aiReason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isAnalyzing && !error && recommendations && recommendations.length === 0 && (
            <div className="ai-placeholder">
              <div className="ai-icon">🤔</div>
              <h3>No matches found</h3>
              <p>Try adjusting your space parameters or description and try again.</p>
            </div>
          )}

          {!isAnalyzing && !error && !recommendations && (
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