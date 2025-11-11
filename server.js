// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000; // Render utilise 10000 par défaut

app.use(cors());
app.use(express.static('public'));

const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.error('❌ ERREUR : Ajoute ta clé OpenWeather dans Render → Environment Variables');
  process.exit(1);
}

// === ROUTES API ===
app.get('/api/geo', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Ville requise (paramètre "q").' });
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Ville non trouvée.' });
  }
});

app.get('/api/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Coordonnées requises.' });
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Impossible de déterminer la ville.' });
  }
});

app.get('/api/weather', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Coordonnées (lat/lon) requises.' });
  try {
    const current = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );
    const forecast = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`
    );
    res.json({ current: current.data, forecast: forecast.data });
  } catch (err) {
    res.status(500).json({ error: 'Données météo indisponibles.' });
  }
});

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});