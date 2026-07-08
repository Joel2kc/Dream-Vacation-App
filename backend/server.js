const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const COUNTRIES_API_BASE_URL = process.env.COUNTRIES_API_BASE_URL || 'https://restcountries.com/v3.1';

app.get('/api/destinations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/destinations', async (req, res) => {
  const { country } = req.body;
  try {
    const capitalRes = await axios.post('https://countriesnow.space/api/v0.1/countries/capital', {
      country: country
    });

    if (capitalRes.data.error) {
      return res.status(404).json({ error: 'Country not found. Please check the spelling and try again.' });
    }

    const countryData = capitalRes.data.data;
    const capital = countryData.capital;

    const regionRes = await axios.get(`https://api.first.org/data/v1/countries?q=${country}`);
    const regionData = Object.values(regionRes.data.data || {})[0];
    const region = regionData ? regionData.region : null;

    const result = await pool.query(
      'INSERT INTO destinations (country, capital, population, region) VALUES ($1, $2, $3, $4) RETURNING *',
      [country, capital, null, region]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/destinations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM destinations WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
