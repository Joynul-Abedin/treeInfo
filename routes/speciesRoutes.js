// routes/speciesRoutes.js
const express = require('express');
const router = express.Router();
const { getSpecies, translateAndStore } = require('../controllers/speciesController');

router.get('/', getSpecies);
router.get('/bangla', translateAndStore);

module.exports = router;
