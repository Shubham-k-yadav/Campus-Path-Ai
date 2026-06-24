const Post = require('../models/Post');
const User = require('../models/User');

// ─── GET ALL POSTS ────────────────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Attach upvoteCount and whether the current user has upvoted
    const userId = req.user?._id?.toString();
    const enriched = posts.map(p => ({
      ...p,
      upvoteCount: p.upvotes.length,
      hasUpvoted: userId ? p.upvotes.some(id => id.toString() === userId) : false,
      commentCount: p.comments.length,
    }));

    const total = await Post.countDocuments();
    res.json({ success: true, posts: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CREATE POST ─────────────────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { content, tag } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required' });

    const post = await Post.create({
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar || '',
      authorRole: req.user.targetRole || 'Developer',
      content: content.trim(),
      tag: tag || 'Tip',
    });

    // Award XP for posting
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });

    res.status(201).json({ success: true, post: { ...post.toJSON(), upvoteCount: 0, hasUpvoted: false, commentCount: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── TOGGLE UPVOTE ────────────────────────────────────────────────────────────
exports.toggleUpvote = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = req.user._id;
    const alreadyUpvoted = post.upvotes.some(id => id.toString() === userId.toString());

    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter(id => id.toString() !== userId.toString());
    } else {
      post.upvotes.push(userId);
      // Award XP to post author for receiving an upvote
      if (post.author.toString() !== userId.toString()) {
        await User.findByIdAndUpdate(post.author, { $inc: { xp: 5 } });
      }
    }

    await post.save();
    res.json({ success: true, upvoteCount: post.upvotes.length, hasUpvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Comment content required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = {
      author: req.user._id,
      authorName: req.user.name,
      authorAvatar: req.user.avatar || '',
      content: content.trim(),
    };

    post.comments.push(comment);
    await post.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 5 } });

    res.status(201).json({ success: true, comment: post.comments[post.comments.length - 1], commentCount: post.comments.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ onboardingComplete: true })
      .select('name targetRole xp streak avatar')
      .sort({ xp: -1 })
      .limit(10)
      .lean();

    const leaderboard = users.map((u, idx) => ({
      rank: idx + 1,
      name: u.name,
      role: u.targetRole || 'Developer',
      xp: u.xp || 0,
      streak: u.streak || 0,
      avatar: u.avatar || u.name[0]?.toUpperCase() || 'U',
      _id: u._id,
    }));

    res.json({ success: true, leaderboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── COMMUNITY STATS (for Neural Sync) ───────────────────────────────────────
exports.getCommunityStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ onboardingComplete: true });

    // Active this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActive = await User.countDocuments({
      onboardingComplete: true,
      lastActiveDate: { $gte: oneWeekAgo },
    });

    // Trending tech stacks across all users
    const users = await User.find({ onboardingComplete: true }).select('techStack programmingLanguages xp').lean();
    const skillCount = {};
    users.forEach(u => {
      [...(u.techStack || []), ...(u.programmingLanguages || [])].forEach(skill => {
        if (skill) skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });
    const trendingSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count, percent: Math.round((count / Math.max(totalMembers, 1)) * 100) }));

    // Current user's rank
    let userRank = null;
    if (req.user) {
      const higherCount = await User.countDocuments({ xp: { $gt: req.user.xp || 0 }, onboardingComplete: true });
      userRank = higherCount + 1;
    }

    // Posts this week
    const weeklyPosts = await Post.countDocuments({ createdAt: { $gte: oneWeekAgo } });

    res.json({
      success: true,
      stats: {
        totalMembers,
        weeklyActive,
        weeklyPosts,
        trendingSkills,
        userRank,
        userXp: req.user?.xp || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
