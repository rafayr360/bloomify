const pool = require('../config/db');

// Rule-based fallback engine if Gemini API call fails or is unconfigured
function generateFallbackRecommendations(catalog, descriptionText) {
  const text = (descriptionText || '').toLowerCase();

  const scored = catalog.map(plant => {
    let score = 0;
    const reasons = [];

    const pSunlight = (plant.sunlight || '').toLowerCase();
    const pWater = (plant.water_frequency || '').toLowerCase();
    const pCategory = (plant.category || '').toLowerCase();
    const pDiff = (plant.difficulty || '').toLowerCase();
    const pFeatures = Array.isArray(plant.features) ? plant.features.map(f => (f || '').toLowerCase()) : [];

    // Sunlight matching
    if (text.includes('full sun') || text.includes('direct sunlight')) {
      if (pSunlight.includes('full sun') || pSunlight.includes('direct')) {
        score += 4;
        reasons.push(`Thrives in full direct sunlight`);
      }
    } else if (text.includes('partial shade') || text.includes('indirect')) {
      if (pSunlight.includes('partial') || pSunlight.includes('indirect')) {
        score += 4;
        reasons.push(`Perfect for indirect or partial shade conditions`);
      }
    } else if (text.includes('full shade') || text.includes('low sunlight') || text.includes('indoor')) {
      if (pSunlight.includes('shade') || pSunlight.includes('low') || pDiff === 'easy') {
        score += 4;
        reasons.push(`Tolerates low sunlight or shaded indoor spaces`);
      }
    }

    // Water frequency matching
    if (text.includes('low maintenance') || text.includes('forget to water') || text.includes('low')) {
      if (pWater.includes('low') || pFeatures.includes('drought tolerant') || pDiff === 'easy') {
        score += 4;
        reasons.push(`Low maintenance and drought-tolerant for effortless care`);
      }
    } else if (text.includes('regular') || text.includes('once a week') || text.includes('moderate')) {
      if (pWater.includes('moderate') || pWater.includes('regular')) {
        score += 3;
        reasons.push(`Requires moderate, predictable weekly watering`);
      }
    } else if (text.includes('daily') || text.includes('high attention') || text.includes('high')) {
      if (pWater.includes('high') || pWater.includes('frequent')) {
        score += 3;
        reasons.push(`Responds well to frequent daily care and attention`);
      }
    }

    // Space / Environment matching
    if (text.includes('balcony') || text.includes('patio')) {
      if (pCategory === 'flower' || pCategory === 'herb' || pSunlight.includes('full sun')) {
        score += 3;
        reasons.push(`Great candidate for outdoor balconies and container growing`);
      }
    } else if (text.includes('indoor') || text.includes('bedroom') || text.includes('living room')) {
      if (pDiff === 'easy' || pWater.includes('low') || pSunlight.includes('shade') || pSunlight.includes('partial')) {
        score += 3;
        reasons.push(`Adaptable houseplant suitable for indoor rooms`);
      }
    } else if (text.includes('garden')) {
      if (pCategory === 'vegetable' || pCategory === 'fruit' || pCategory === 'flower') {
        score += 3;
        reasons.push(`Excellent addition to open outdoor garden beds`);
      }
    }

    // Feature & Keyword matching
    if (text.includes('edible') || text.includes('herb') || text.includes('kitchen') || text.includes('cook')) {
      if (pFeatures.includes('edible') || pCategory === 'herb' || pCategory === 'vegetable' || pCategory === 'fruit') {
        score += 3;
        reasons.push(`Provides fresh culinary harvests`);
      }
    }

    // Base score so all plants have a baseline chance
    score += Math.random() * 0.5;

    const finalReason = reasons.length > 0
      ? `${plant.common_name} ${reasons.slice(0, 2).join(' and ').toLowerCase()}.`
      : `${plant.common_name} is a versatile ${pDiff} ${pCategory} suited for your specified setup.`;

    return { ...plant, score, reason: finalReason };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}

// POST /api/recommend
exports.getRecommendations = async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'A "description" of the space is required.' });
  }

  const trimmedDescription = description.trim();

  const MAX_DESCRIPTION_LENGTH = 500;
  if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
    return res.status(400).json({
      error: `Description is too long. Please keep it under ${MAX_DESCRIPTION_LENGTH} characters.`
    });
  }

  const MIN_DESCRIPTION_LENGTH = 3;
  if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
    return res.status(400).json({ error: 'Please provide a bit more detail about your space.' });
  }  

  try {
    // 1. Pull the real plant catalog from DB
    const catalogResult = await pool.query(`
      SELECT p.id, p.slug, p.common_name, p.scientific_name, t.name AS category,
             p.sunlight, p.water_frequency, p.soil_type, p.difficulty, p.description,
             ARRAY_AGG(f.name) FILTER (WHERE f.name IS NOT NULL) AS features
      FROM plants p
      LEFT JOIN plant_types t ON p.type_id = t.id
      LEFT JOIN plant_features pf ON pf.plant_id = p.id
      LEFT JOIN features f ON f.id = pf.feature_id
      GROUP BY p.id, t.name
      ORDER BY p.common_name;
    `);

    const catalog = catalogResult.rows;

    if (catalog.length === 0) {
      return res.status(500).json({ error: 'No plants in the database to recommend from.' });
    }

    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    const isPlaceholderKey = !apiKey || apiKey.startsWith('your_') || apiKey.startsWith('YOUR_') || apiKey === 'replace_with_a_long_random_string';

    // If no valid API key is present, fallback directly to rule-based catalog recommendations
    if (isPlaceholderKey) {
      console.log('AI_API_KEY is placeholder or missing. Using smart fallback matching engine.');
      const fallbackResults = generateFallbackRecommendations(catalog, description);
      return res.json({ recommendations: fallbackResults, provider: 'fallback' });
    }

    // 2. Build compact catalog summary for prompt
    const catalogForPrompt = catalog.map(p => ({
      slug: p.slug,
      common_name: p.common_name,
      category: p.category,
      sunlight: p.sunlight,
      water_frequency: p.water_frequency,
      difficulty: p.difficulty,
      features: p.features
    }));

    const systemPrompt = `You are a plant recommendation assistant for a gardening app.
You will be given a user's description of their space and a JSON catalog of available plants.
Recommend 3-6 plants from the catalog that best fit their space and experience level.
Respond with ONLY valid JSON (no markdown fences, no preamble) in this exact shape:
{"recommendations":[{"slug":"plant-slug","reason":"one short sentence why this fits"}]}
Only use slugs that appear in the provided catalog. Do not invent plants.`;

    const userPrompt = `User's space: "${trimmedDescription}"

Plant catalog:
${JSON.stringify(catalogForPrompt)}`;

    // 3. Try Gemini API with candidate model names
    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-pro'];
    let aiResponse = null;
    let lastErrorText = '';

    for (const model of modelsToTry) {
      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                }
              ],
              generationConfig: { responseMimeType: 'application/json' }
            })
          }
        );

        if (resp.ok) {
          aiResponse = resp;
          console.log(`Gemini API success using model: ${model}`);
          break;
        } else {
          lastErrorText = await resp.text();
          console.warn(`Gemini API model ${model} failed (${resp.status}):`, lastErrorText);
        }
      } catch (e) {
        console.warn(`Fetch error with model ${model}:`, e.message);
      }
    }

    if (!aiResponse) {
      console.warn('Gemini API calls failed. Falling back to rule-based match engine.');
      const fallbackResults = generateFallbackRecommendations(catalog, description);
      return res.json({ recommendations: fallbackResults, provider: 'fallback' });
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 4. Parse the AI's JSON response
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', rawText);
      const fallbackResults = generateFallbackRecommendations(catalog, description);
      return res.json({ recommendations: fallbackResults, provider: 'fallback' });
    }

    // 5. Map slugs back to full plant records from our DB
    const results = (parsed.recommendations || [])
      .map(rec => {
        const plant = catalog.find(p => p.slug === rec.slug || String(p.id) === String(rec.slug));
        if (!plant) return null;
        return { ...plant, reason: rec.reason };
      })
      .filter(Boolean);

    if (results.length === 0) {
      const fallbackResults = generateFallbackRecommendations(catalog, description);
      return res.json({ recommendations: fallbackResults, provider: 'fallback' });
    }

    res.json({ recommendations: results, provider: 'gemini' });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ error: err.message });
  }
};
