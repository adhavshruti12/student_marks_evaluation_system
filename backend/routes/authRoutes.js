const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/authController');

router.post('/signup', signup);  // Handle signup
router.post('/signin', signin);  // Handle signin

module.exports = router;
