
const express = require('express');
const router = express.Router();
const {
  getUserByUsername,
  updateProfile,
  followUser,
  getPopularUsers
} = require('../controllers/usersController');
const { protect } = require('../middleware/auth');

// Get user profile by username
router.get('/profile/:username', getUserByUsername);

// Update user profile
router.put('/profile', protect, updateProfile);

// Follow/unfollow user
router.put('/follow/:id', protect, followUser);

// Get popular users
router.get('/popular', getPopularUsers);

module.exports = router;
