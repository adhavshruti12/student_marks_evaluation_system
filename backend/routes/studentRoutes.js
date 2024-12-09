const express = require('express');
const router = express.Router();
const { addMarks, addProfile } = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected route for adding/updating marks
router.post('/marks', authMiddleware, addMarks);

// Protected route for adding/updating student profile
router.post('/profile', authMiddleware, addProfile);

module.exports = router;
