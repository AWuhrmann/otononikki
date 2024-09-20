// routes/mentionRoutes.js
const express = require('express');
const router = express.Router();
const mentionController = require('../controllers/mentionController');

// Route to add a mention
router.post('/add-mention', mentionController.addMention);

module.exports = router;
