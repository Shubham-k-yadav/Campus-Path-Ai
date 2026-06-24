const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  category: {
    type: String,
    enum: ['Fullstack', 'Frontend', 'Backend', 'DSA', 'DevOps', 'AI', 'Other'],
    default: 'Other'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Auto-expire after 24 hours — MongoDB TTL index will delete the document
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 hours
  },
  // Room vibe sets the animated background style for attendees
  vibe: {
    type: String,
    enum: ['default', 'lofi', 'cyber', 'space', 'forest'],
    default: 'default'
  },
  // Session goal pinned for all attendees to see
  sessionGoal: {
    type: String,
    default: '',
    maxLength: 200
  }
});

// MongoDB TTL index — auto-deletes the document when expiresAt is reached
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Room', roomSchema);

