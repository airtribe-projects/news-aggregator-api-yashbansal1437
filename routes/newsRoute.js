const express = require('express');
const router = express.Router();
const { getNewsForUser } = require('../controllers/newsControllers');
const { verifyUser } = require('../middleware/authMiddleware');

router.get('/', verifyUser, async (req, res) => {
  try {
    await getNewsForUser(req, res);
  } catch (err) {
    console.error('Unexpected error in /news route:', err);
    res.status(500).json({ success: false, status: 500, message: 'Server error' });
  }
});

module.exports = router;
