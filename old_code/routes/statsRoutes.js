// routes/mentionRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Route to add a mention
router.post('/add-stat', statsController.addStat);
router.get('/get-all-stats', statsController.getAllStats)
router.post('/get-specific-stat', async (req, res) => {
  try {
    const interactionData = await statsController.fetchInteractionData(req.body);
    res.json(interactionData);
  } catch (err) {
    console.error('Error fetching interaction data:', err);
    res.status(500).json({ error: 'Failed to fetch interaction data' });
  }
});
module.exports = router;
