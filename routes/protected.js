const express = require('express');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/protected', authenticateToken, (req, res) => {
    console.log('testtt');
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;