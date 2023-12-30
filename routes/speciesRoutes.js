// routes/speciesRoutes.js
const express = require('express');
const router = express.Router();
const { getSpecies, translateAndStore, fetchTreeWikiInfo, translate } = require('../controllers/speciesController');

// Endpoint to test the API
router.get('/ping', (req, res) => {
    res.send('pong');
});

router.get('/', getSpecies);
router.get('/bangla', translateAndStore);
router.get('/plantinfo', fetchTreeWikiInfo);
router.get('/translate', translate);

module.exports = router;
