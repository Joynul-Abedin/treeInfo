// routes/speciesRoutes.js
const express = require('express');
const router = express.Router();
const { getSpecies, translateAndStore, fetchTreeWikiInfo } = require('../controllers/speciesController');

router.get('/', getSpecies);
router.get('/bangla', translateAndStore);
router.get('/plantinfo')

module.exports = router;
