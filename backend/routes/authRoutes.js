const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Auth routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);
router.get('/profile', auth, authController.getUserProfile);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router; 