const express = require('express');
const router = express.Router();
const {registerUser, loginUser, getUserPreferences, updateUserPreferences} = require('../controllers/usersControllers');
const {verifyUser} = require('../middleware/authMiddleware');

router.post('/signup', async (req, res) => {
    const user = {...req.body};
    try {
        const result = await registerUser(user);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error in router /signup: ",error);
        return res.status(500).json({ success: false, 
            message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const user = {...req.body};
    try {
        const result = await loginUser(user);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error in router /login: ",error);
        return res.status(500).json({ success: false, 
            message: 'Server error' });
    }
});

router.get('/preferences', verifyUser, async (req, res) => {
    const username = req.user.email;
    if (!username) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Missing username'
      });
    }
    try {
        const result = await getUserPreferences(username);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error in router /preferences: ",error);
        return res.status(500).json({ success: false, 
            message: 'Server error'});
    }
});

router.put('/preferences', verifyUser, async (req, res) => {
    const username = req.user.email;
    const preferences = req.body.preferences;
    if (!username || !preferences) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Missing username or preferences'
      });
    }
    try {
        const result = await updateUserPreferences(username, preferences);
        return res.status(result.status).json(result);
    } catch (error) {
        console.error("Error in router /preferences PUT: ",error);
        return res.status(500).json({ success: false, 
            message: 'Server error'});
    }
});

module.exports = router;
