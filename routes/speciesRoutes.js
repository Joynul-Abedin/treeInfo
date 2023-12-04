// routes/speciesRoutes.js
const express = require('express');
const router = express.Router();
const { getSpecies, translateAndStore, fetchTreeWikiInfo, translate } = require('../controllers/speciesController');

router.get('/', getSpecies);
router.get('/bangla', translateAndStore);
router.get('/plantinfo', fetchTreeWikiInfo);
router.get('/translate', translate);

module.exports = router;
