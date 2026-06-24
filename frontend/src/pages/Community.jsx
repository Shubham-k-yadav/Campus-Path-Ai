import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { communityAPI } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  ThumbsUp, MessageSquare, Share2, Send, TrendingUp, Flame, User,
  Zap, Trophy, ArrowRight, X, Users, BarChart2, Star, RefreshCw,
  ChevronDown, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TAG COLORS ───────────────────────────────────────────────────────────────
const TAG_COLORS = {
  Tip:        { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/20' },
  Resource:   { bg: 'bg-purple-500/10',  text: 'text-purple-500',  border: 'border-purple-500/20' },
  Win:        { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' },
  Question:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20' },
  Discussion: { bg: 'bg-primary/10',     text: 'text-primary',     border: 'border-primary/20' },
};
const RANK_COLORS = [
  { color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  { color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
  { color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20' },
];

// ─── NEURAL SYNC MODAL ────────────────────────────────────────────────────────
function NeuralSyncModal({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityAPI.getStats()
      .then(res => setStats(res.data.stats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Neural Sync</h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Community Intelligence</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 size={28} className="text-primary animate-spin" />
                <p className="text-xs font-medium text-muted-foreground">Syncing community data...</p>
              </div>
            ) : !stats ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Could not load community stats. Try again later.
              </div>
            ) : (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Users, label: 'Total Members', value: stats.totalMembers.toLocaleString(), color: 'text-blue-500' },
                    { icon: Zap,   label: 'Active This Week', value: stats.weeklyActive.toLocaleString(), color: 'text-emerald-500' },
                    { icon: BarChart2, label: 'Posts This Week', value: stats.weeklyPosts.toLocaleString(), color: 'text-purple-500' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-muted/30 border border-border rounded-xl p-3 text-center">
                      <Icon size={16} className={`${color} mx-auto mb-1`} />
                      <div className={`text-base font-black ${color}`}>{value}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-tight mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Trending Skills */}
                {stats.trendingSkills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-primary" /> Trending Skills This Week
                    </p>
                    <div className="space-y-1.5">
                      {stats.trendingSkills.map((s, i) => (
                        <div key={s.skill} className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-muted-foreground w-4">{i + 1}</span>
                          <div className="flex-1 bg-muted/30 rounded-full h-5 overflow-hidden">
                            <div
                              className="h-full bg-primary/30 rounded-full flex items-center px-2 transition-all duration-700"
                              style={{ width: `${Math.max(s.percent, 10)}%` }}
                            >
                              <span className="text-[9px] font-black text-primary truncate">{s.skill}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground w-8 text-right">{s.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User's rank */}
                {stats.userRank && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
                    <Star size={16} className="text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        You are ranked <span className="text-primary">#{stats.userRank}</span> in the community
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {stats.userXp} XP total · Keep posting and completing tasks to climb!
                      </p>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-muted/20 border border-border rounded-xl p-3 space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">💡 How to Gain Market Value</p>
                  {[
                    'Share tips & resources → earn XP per post',
                    'Get upvotes on posts → earn bonus XP',
                    'Engage with peers daily → maintain your streak',
                  ].map(tip => (
                    <p key={tip} className="text-[11px] font-medium text-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">→</span> {tip}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="px-5 pb-5">
            <button onClick={onClose} className="w-full btn-primary py-2.5 text-xs font-bold">
              Got It — Start Engaging!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── MAIN COMMUNITY COMPONENT ─────────────────────────────────────────────────
export default function Community() {
  const toast = useToast();
  const { user } = useAuth();

  const [posts, setPosts]           = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newPost, setNewPost]       = useState('');
  const [selectedTag, setSelectedTag] = useState('Tip');
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const fetchPosts = useCallback(() => {
    setLoadingPosts(true);
    communityAPI.getPosts()
      .then(res => setPosts(res.data.posts || []))
      .catch(() => toast.error('Could not load community posts'))
      .finally(() => setLoadingPosts(false));
  }, [toast]);

  // ── Fetch leaderboard ──────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(() => {
    setLoadingBoard(true);
    communityAPI.getLeaderboard()
      .then(res => setLeaderboard(res.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoadingBoard(false));
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchLeaderboard();
  }, [fetchPosts, fetchLeaderboard]);

  // ── Toggle upvote ──────────────────────────────────────────────────────────
  const toggleUpvote = async (id) => {
    if (!user) return toast.error('Login to upvote!');
    try {
      const res = await communityAPI.toggleUpvote(id);
      setPosts(prev => prev.map(p =>
        p._id === id
          ? { ...p, upvoteCount: res.data.upvoteCount, hasUpvoted: res.data.hasUpvoted }
          : p
      ));
    } catch {
      toast.error('Could not upvote. Try again.');
    }
  };

  // ── Submit new post ────────────────────────────────────────────────────────
  const submitPost = async () => {
    if (!newPost.trim()) return;
    if (!user) return toast.error('Login to post!');
    setSubmitting(true);
    try {
      const res = await communityAPI.createPost({ content: newPost.trim(), tag: selectedTag });
      setPosts(prev => [res.data.post, ...prev]);
      setNewPost('');
      toast.success('Post published! +10 XP earned 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not publish post');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helper: initials from name ─────────────────────────────────────────────
  const getInitial = (name = '') => name[0]?.toUpperCase() || 'U';

  // ── Format relative time ───────────────────────────────────────────────────
  const relTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const tags = ['Tip', 'Resource', 'Win', 'Question', 'Discussion'];

  return (
    <div className="animate-in fade-in duration-500 space-y-5 pb-4">
      {/* Neural Sync Modal */}
      {showSyncModal && <NeuralSyncModal onClose={() => setShowSyncModal(false)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            Community Collective
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">LIVE</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Connect with developers and share technical intelligence.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPosts}
            className="bg-card border border-border px-3 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:border-primary/40 transition-colors text-xs font-bold text-muted-foreground"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-bold text-foreground">
              {leaderboard.length > 0 ? `${leaderboard.length} Active Users` : 'Community'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Main Feed ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Composer */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary border border-primary/20">
                {user ? getInitial(user.name) : <User size={18} className="text-muted-foreground opacity-50" />}
              </div>
              <textarea
                className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:outline-none text-sm resize-none min-h-[80px] font-medium pt-2"
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder={user ? "Share technical insights, wins, or resources..." : "Login to share with the community..."}
                disabled={!user}
              />
            </div>
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-wrap justify-between items-center gap-2">
              {/* Tag selector */}
              <div className="flex gap-1 flex-wrap">
                {tags.map(tag => {
                  const c = TAG_COLORS[tag];
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest transition-all ${
                        selectedTag === tag ? `${c.bg} ${c.text} ${c.border}` : 'bg-muted/20 text-muted-foreground border-border hover:border-primary/30'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={submitPost}
                disabled={!newPost.trim() || !user || submitting}
                className="btn-primary py-1.5 px-5 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Broadcast
              </button>
            </div>
          </div>

          {/* Posts List */}
          {loadingPosts ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-primary animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Users size={36} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-bold text-foreground">No posts yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first to share something with the community!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const tagColors = TAG_COLORS[post.tag] || TAG_COLORS.Tip;
                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl shadow-sm p-4 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-sm text-sm"
                        style={{ background: 'var(--color-primary)' }}
                      >
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} className="w-full h-full object-cover rounded-lg" alt="" />
                        ) : getInitial(post.authorName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-bold text-sm text-foreground truncate">{post.authorName}</span>
                            <span className="text-[8px] text-muted-foreground font-bold uppercase">{post.authorRole}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${tagColors.bg} ${tagColors.text} ${tagColors.border}`}>
                              {post.tag}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap shrink-0">{relTime(post.createdAt)}</span>
                        </div>
                        <p className="text-[13px] text-foreground/90 font-medium leading-relaxed mb-4">{post.content}</p>
                        <div className="flex items-center gap-5 pt-3 border-t border-border">
                          <button
                            onClick={() => toggleUpvote(post._id)}
                            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                              post.hasUpvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            }`}
                          >
                            <ThumbsUp size={14} fill={post.hasUpvoted ? 'currentColor' : 'none'} />
                            {post.upvoteCount ?? 0}
                          </button>
                          <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all">
                            <MessageSquare size={14} />
                            {post.commentCount ?? 0}
                          </button>
                          <button
                            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-500 transition-all ml-auto opacity-0 group-hover:opacity-100"
                          >
                            <Share2 size={14} /> Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Leaderboard */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-widest text-foreground">Top Velocity</h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">By XP</span>
            </div>
            <div className="p-2 space-y-1">
              {loadingBoard ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={20} className="text-primary animate-spin" />
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">No users yet</p>
              ) : (
                leaderboard.map((member, idx) => {
                  const rc = RANK_COLORS[idx] || { color: 'text-muted-foreground', bg: 'bg-muted/30', border: 'border-border' };
                  const isYou = user && member._id?.toString() === user._id?.toString();
                  return (
                    <div
                      key={member._id || idx}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isYou ? 'bg-primary/5 border border-primary/20 shadow-sm' : 'hover:bg-muted/50'}`}
                    >
                      <span className="text-[10px] font-bold text-muted-foreground w-5 text-center">#{member.rank}</span>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${rc.bg} ${rc.border} border ${rc.color}`}>
                        {getInitial(member.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isYou ? 'text-primary' : 'text-foreground'}`}>
                          {member.name}{isYou ? ' (You)' : ''}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{member.role}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-primary">{member.xp} XP</p>
                        <div className="text-[9px] text-amber-500 flex items-center gap-1 justify-end font-bold">
                          <Flame size={10} fill="currentColor" /> {member.streak}d
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Neural Sync Card */}
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4 group hover:border-primary/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                <Trophy size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-foreground">Collective Goal</h4>
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Neural Sync</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              See trending skills, community stats, and your rank — engage more to boost your market value score.
            </p>
            <button
              onClick={() => setShowSyncModal(true)}
              className="w-full btn-primary py-2 text-xs flex items-center justify-center gap-2"
            >
              Synchronize Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
