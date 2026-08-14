-- Failed query:
-- -- Run this in Neon's SQL Editor to create all tables
-- -- CORRECTED to match plants.controller.js, types.controller.js,
-- -- features.controller.js, and seedPlants.js
-- --
-- -- NOTE: users / favorites / care_logs are intentionally NOT included.
-- -- This project uses Firebase Auth + Firestore for accounts, favorites,
-- and care logs. This Postgres DB only stores plant catalog data.

-- Drop in dependency order if re-running on a dirty DB
DROP TABLE IF EXISTS plant_features;
DROP TABLE IF EXISTS plants;
DROP TABLE IF EXISTS features;
DROP TABLE IF EXISTS plant_types;

-- category lookup table (flower / fruit / vegetable / herb)
CREATE TABLE plant_types (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- tag lookup table (Edible, Low Maintenance, Drought Tolerant, etc.)
CREATE TABLE features (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE plants (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  common_name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  type_id INTEGER REFERENCES plant_types(id),
  sunlight TEXT,
  water_frequency TEXT,
  soil_type TEXT,
  bloom_season TEXT,
  difficulty TEXT,
  description TEXT,
  image_url TEXT
);

-- many-to-many: a plant can have several features
CREATE TABLE plant_features (
  plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE,
  feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
  PRIMARY KEY (plant_id, feature_id)
);

-- Lookup data. IDs are fixed (1..4 / 1..7) because seedPlants.js
-- references type_id and featureIds by these exact numbers.
INSERT INTO plant_types (id, name) VALUES
  (1, 'flower'),
  (2, 'fruit'),
  (3, 'vegetable'),
  (4, 'herb');

INSERT INTO features (id, name) VALUES
  (1, 'Edible'),
  (2, 'Low Maintenance'),
  (3, 'Drought Tolerant'),
  (4, 'Pet Safe'),
  (5, 'Fragrant'),
  (6, 'Fast Growing'),
  (7, 'Attracts Pollinators');

-- Keep the sequences in sync since we inserted explicit IDs above
SELECT setval('plant_types_id_seq', (SELECT MAX(id) FROM plant_types));
SELECT setval('features_id_seq', (SELECT MAX(id) FROM features));