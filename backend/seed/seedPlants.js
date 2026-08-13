const pool = require('../src/config/db');

const plantsToSeed = [
  // --- FLOWERS ---
  {
    slug: 'english-lavender',
    common_name: 'English Lavender',
    scientific_name: 'Lavandula angustifolia',
    type_id: 1,
    sunlight: 'Full Sun',
    water_frequency: 'Low',
    soil_type: 'Sandy, Well-draining',
    bloom_season: 'Summer',
    difficulty: 'Easy',
    description: 'An aromatic evergreen shrub prized for its soothing fragrance, purple flower spikes, and essential oil production.',
    image_url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600',
    featureIds: [1, 2, 3, 5, 7] // Edible, Low Maint, Drought, Fragrant, Pollinators
  },
  {
    slug: 'peace-lily',
    common_name: 'Peace Lily',
    scientific_name: 'Spathiphyllum wallisii',
    type_id: 1,
    sunlight: 'Full Shade',
    water_frequency: 'Moderate',
    soil_type: 'Loamy, Moist',
    bloom_season: 'Spring',
    difficulty: 'Easy',
    description: 'A popular tropical houseplant with glossy dark green leaves and elegant white spathes.',
    image_url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?w=600',
    featureIds: [2] // Low Maintenance
  },
  {
    slug: 'golden-sunflower',
    common_name: 'Golden Sunflower',
    scientific_name: 'Helianthus annuus',
    type_id: 1,
    sunlight: 'Full Sun',
    water_frequency: 'Moderate',
    soil_type: 'Rich, Well-draining',
    bloom_season: 'Summer',
    difficulty: 'Easy',
    description: 'Fast-growing annual with vibrant yellow flower heads that track the sun across the sky.',
    image_url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600',
    featureIds: [1, 6, 7] // Edible, Fast Growing, Pollinators
  },
  {
    slug: 'moth-orchid',
    common_name: 'Moth Orchid',
    scientific_name: 'Phalaenopsis',
    type_id: 1,
    sunlight: 'Partial Shade',
    water_frequency: 'Low',
    soil_type: 'Bark Chips, Sphagnum',
    bloom_season: 'Winter',
    difficulty: 'Moderate',
    description: 'Stunning long-lasting bloomer featuring delicate moth-shaped blossoms in various hues.',
    image_url: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600',
    featureIds: [5] // Fragrant
  },
  {
    slug: 'hybrid-tea-rose',
    common_name: 'Hybrid Tea Rose',
    scientific_name: 'Rosa x hybrida',
    type_id: 1,
    sunlight: 'Full Sun',
    water_frequency: 'Moderate',
    soil_type: 'Rich Clay-Loam',
    bloom_season: 'Spring',
    difficulty: 'Hard',
    description: 'Classic fragrant garden bloomer with intricate layered petals and sharp thorns.',
    image_url: 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=600',
    featureIds: [1, 5, 7] // Edible, Fragrant, Pollinators
  },
  {
    slug: 'french-marigold',
    common_name: 'French Marigold',
    scientific_name: 'Tagetes patula',
    type_id: 1,
    sunlight: 'Full Sun',
    water_frequency: 'Low',
    soil_type: 'Any Well-draining',
    bloom_season: 'Summer',
    difficulty: 'Easy',
    description: 'Bright golden-orange annual flower excellent for companion planting to repel garden pests.',
    image_url: 'https://images.unsplash.com/photo-1568656458567-d6d729a8f4c4?w=600',
    featureIds: [1, 2, 6, 7] // Edible, Low Maint, Fast, Pollinators
  },

  // --- FRUITS ---
  {
    slug: 'garden-strawberry',
    common_name: 'Garden Strawberry',
    scientific_name: 'Fragaria x ananassa',
    type_id: 2,
    sunlight: 'Full Sun',
    water_frequency: 'High',
    soil_type: 'Slightly Acidic Loam',
    bloom_season: 'Spring',
    difficulty: 'Moderate',
    description: 'Popular groundcover fruit plant producing sweet red conical berries packed with Vitamin C.',
    image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600',
    featureIds: [1, 4, 6] // Edible, Pet Safe, Fast Growing
  },
  {
    slug: 'meyer-lemon',
    common_name: 'Meyer Lemon',
    scientific_name: 'Citrus x meyeri',
    type_id: 2,
    sunlight: 'Full Sun',
    water_frequency: 'Moderate',
    soil_type: 'Sandy Loam',
    bloom_season: 'Year-round',
    difficulty: 'Hard',
    description: 'Compact patio citrus bearing fragrant white flowers and sweet, low-acid lemons.',
    image_url: 'https://images.unsplash.com/photo-1534531141161-e41d1341d1de?w=600',
    featureIds: [1, 5] // Edible, Fragrant
  },
  {
    slug: 'highbush-blueberry',
    common_name: 'Highbush Blueberry',
    scientific_name: 'Vaccinium corymbosum',
    type_id: 2,
    sunlight: 'Full Sun',
    water_frequency: 'High',
    soil_type: 'Acidic Peat, Well-draining',
    bloom_season: 'Spring',
    difficulty: 'Moderate',
    description: 'Deciduous shrub yielding clusters of deep blue antioxidant-rich summer berries.',
    image_url: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600',
    featureIds: [1, 4, 7] // Edible, Pet Safe, Pollinators
  },

  // --- VEGETABLES ---
  {
    slug: 'cherry-tomato',
    common_name: 'Cherry Tomato',
    scientific_name: 'Solanum lycopersicum var. cerasiforme',
    type_id: 3,
    sunlight: 'Full Sun',
    water_frequency: 'High',
    soil_type: 'Rich, Well-draining Loam',
    bloom_season: 'Summer',
    difficulty: 'Easy',
    description: 'Prolific vine producing clusters of bite-sized sweet red fruits throughout summer.',
    image_url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600',
    featureIds: [1, 6] // Edible, Fast Growing
  },
  {
    slug: 'sweet-bell-pepper',
    common_name: 'Sweet Bell Pepper',
    scientific_name: 'Capsicum annuum',
    type_id: 3,
    sunlight: 'Full Sun',
    water_frequency: 'Moderate',
    soil_type: 'Warm, Well-draining Loam',
    bloom_season: 'Summer',
    difficulty: 'Easy',
    description: 'Crisp, sweet garden vegetable ripening from green to vibrant red, yellow, or orange.',
    image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600',
    featureIds: [1] // Edible
  },

  // --- HERBS ---
  {
    slug: 'sweet-basil',
    common_name: 'Sweet Basil',
    scientific_name: 'Ocimum basilicum',
    type_id: 4,
    sunlight: 'Full Sun',
    water_frequency: 'Moderate',
    soil_type: 'Moist, Well-draining',
    bloom_season: 'Summer',
    difficulty: 'Easy',
    description: 'Essential culinary herb with fragrant green leaves perfect for pesto and Italian dishes.',
    image_url: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600',
    featureIds: [1, 5, 6] // Edible, Fragrant, Fast Growing
  },
  {
    slug: 'rosemary',
    common_name: 'Rosemary',
    scientific_name: 'Salvia rosmarinus',
    type_id: 4,
    sunlight: 'Full Sun',
    water_frequency: 'Low',
    soil_type: 'Dry, Sandy',
    bloom_season: 'Spring',
    difficulty: 'Easy',
    description: 'Woody perennial herb with needle-like leaves and strong pine-like aroma.',
    image_url: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=600',
    featureIds: [1, 2, 3, 5] // Edible, Low Maint, Drought, Fragrant
  }
];

async function seed() {
  try {
    console.log("Seeding plants into Neon Database...");

    for (const plant of plantsToSeed) {
      // Upsert plant row
      const res = await pool.query(`
        INSERT INTO plants (slug, common_name, scientific_name, type_id, sunlight, water_frequency, soil_type, bloom_season, difficulty, description, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE SET
          common_name = EXCLUDED.common_name,
          scientific_name = EXCLUDED.scientific_name,
          type_id = EXCLUDED.type_id,
          sunlight = EXCLUDED.sunlight,
          water_frequency = EXCLUDED.water_frequency,
          soil_type = EXCLUDED.soil_type,
          bloom_season = EXCLUDED.bloom_season,
          difficulty = EXCLUDED.difficulty,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url
        RETURNING id;
      `, [
        plant.slug,
        plant.common_name,
        plant.scientific_name,
        plant.type_id,
        plant.sunlight,
        plant.water_frequency,
        plant.soil_type,
        plant.bloom_season,
        plant.difficulty,
        plant.description,
        plant.image_url
      ]);

      const plantId = res.rows[0].id;

      // Link feature IDs in plant_features
      for (const featureId of plant.featureIds) {
        await pool.query(`
          INSERT INTO plant_features (plant_id, feature_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [plantId, featureId]);
      }

      console.log(`Seeded plant: ${plant.common_name} (ID: ${plantId})`);
    }

    console.log("Seeding complete! All plants linked to database features.");
  } catch (err) {
    console.error("Error seeding plants:", err);
  } finally {
    await pool.end();
  }
}

seed();
