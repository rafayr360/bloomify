const pool = require('../config/db');

// POST /api/recommend
// Body: { description: "small balcony, low light, I forget to water" }
exports.getRecommendations = async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'A "description" of the space is required.' });
  }

  if (!process.env.AI_API_KEY) {
    return res.status(500).json({ error: 'AI_API_KEY is not configured on the server.' });
  }

  try {
    // 1. Pull the real plant catalog so the AI can only recommend
    //    plants that actually exist in our database.
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

    // 2. Build a compact catalog summary for the prompt (keeps tokens down)
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

    const userPrompt = `User's space: "${description.trim()}"

Plant catalog:
${JSON.stringify(catalogForPrompt)}`;

    // 3. Call the Gemini API
    const model = 'gemini-2.5-flash';
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.AI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            { role: 'user', parts: [{ text: userPrompt }] }
          ],
          generationConfig: {
            // Ask Gemini to guarantee valid JSON output
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('Gemini API error:', aiResponse.status, errText);
      return res.status(502).json({ error: 'AI provider request failed.' });
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // 4. Parse the AI's JSON response (strip accidental code fences just in case)
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', rawText);
      return res.status(502).json({ error: 'AI response was not valid JSON.' });
    }

    // 5. Map slugs back to full plant records from our own DB
    //    (never trust the AI to return full/accurate plant data itself)
    const results = (parsed.recommendations || [])
      .map(rec => {
        const plant = catalog.find(p => p.slug === rec.slug);
        if (!plant) return null; // AI hallucinated a slug not in our catalog
        return { ...plant, reason: rec.reason };
      })
      .filter(Boolean);

    res.json({ recommendations: results });
  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ error: err.message });
  }
};