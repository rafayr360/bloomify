-- Run this in Neon's SQL Editor to create all tables

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plants (
  id SERIAL PRIMARY KEY,
  common_name TEXT NOT NULL,
  biological_name TEXT NOT NULL,
  category TEXT NOT NULL,          -- flower / fruit / vegetable / herb
  region TEXT,
  sunlight TEXT,
  water_frequency TEXT,
  soil_type TEXT,
  growth_habit TEXT,
  growth_environment TEXT,
  bloom_season TEXT,
  edible BOOLEAN DEFAULT FALSE,
  specialty TEXT,
  care_notes TEXT,
  difficulty TEXT,
  image_url TEXT
);

CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE
);

CREATE TABLE care_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE,
  note TEXT,
  logged_at TIMESTAMP DEFAULT NOW()
);
