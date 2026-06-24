const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  toggleUpvote,
  addComment,
  getLeaderboard,
  getCommunityStats,
} = require('../controllers/communityController');

// Middleware that optionally attaches user (for public reads with personalised data)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {}
  next();
};

// Public (with optional auth to check hasUpvoted)
router.get('/posts', optionalAuth, getPosts);
router.get('/leaderboard', getLeaderboard);
router.get('/stats', optionalAuth, getCommunityStats);

// Protected
router.post('/posts', protect, createPost);
router.post('/posts/:id/upvote', protect, toggleUpvote);
router.post('/posts/:id/comments', protect, addComment);

module.exports = router;
