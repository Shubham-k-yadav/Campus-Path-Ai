const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { generateToken } = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

const getMe = async (req, res, next) => {
  res.json({ success: true, user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'githubUsername', 'targetRole', 'weeklyHours', 'techStack',
      'proficiency', 'programmingLanguages', 'careerUrgency', 'onboardingComplete', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // XP increment (e.g. Pomodoro reward) — uses $inc so it's atomic
    if (req.body.xpIncrement) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: Number(req.body.xpIncrement) } });
    }

    const user = Object.keys(updates).length > 0
      ? await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      : await User.findById(req.user._id);
    
    // Sync githubUsername to roadmaps if it was updated
    if (updates.githubUsername !== undefined) {
      await Roadmap.updateMany({ userId: req.user._id }, { githubUsername: updates.githubUsername });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile Update Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Profile update failed' });
  }
};

const updatePortfolio = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { portfolioData: req.body.portfolioData },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error('Portfolio Update Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Portfolio update failed' });
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete user's roadmaps
    await Roadmap.deleteMany({ userId });

    // Delete user's focus rooms
    const Room = require('../models/Room');
    await Room.deleteMany({ createdBy: userId });

    // Delete user's community posts
    const Post = require('../models/Post');
    await Post.deleteMany({ author: userId });

    // Delete user document
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Account and associated data deleted successfully.' });
  } catch (error) {
    console.error('Delete Account Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Account deletion failed' });
  }
};

const getPublicPortfolio = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('name githubUsername avatar targetRole portfolioData xp streak badges');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get Public Portfolio Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch public portfolio' });
  }
};

module.exports = { register, login, getMe, updateProfile, updatePortfolio, deleteAccount, getPublicPortfolio };
