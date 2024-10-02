// routes/mentionRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Route to add a mention
router.post('/add-stat', statsController.addStat);
router.get('/get-all-stats', statsController.getAllStats)
module.exports = router;
