import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { roadmapAPI } from '@/api/client';
import {
  Zap, Flame, Shield, Star, Trophy, Target,
  Lock, RefreshCw, Sparkles, Copy, ChevronRight,
  ShieldCheck, Brain, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Achievements() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    roadmapProgress: 0,
    githubImpact: 0,
    nextMilestoneProgress: 0,
    nextMilestoneName: "Rising Star"
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        let dynamicBadges = [];
        let hasRoadmap = data.roadmaps && data.roadmaps.length > 0;

        let completedWeeks = 0;
        let totalWeeks = 0;
        let completedTasksCount = 0;

        if (hasRoadmap) {
          data.roadmaps[0].weeks.forEach((w) => {
            if (w.tasks) {
              w.tasks.forEach((tk) => {
                if (tk.completed) completedTasksCount++;
              });
            }
          });
        }

        const baseBadges = [
          { id: 'global_1', name: 'Alpha Pioneer', desc: 'Joined the CampusPath AI initial cohort.', icon: Zap, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', unlocked: true, xp: 200 },
          { id: 'global_2', name: 'Inferno Streak', desc: 'Maintained 7 consecutive days of code.', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', unlocked: (user?.streak || 0) >= 7, xp: 350 },
          { id: 'global_3', name: 'Visionary', desc: 'Architected your first AI learning path.', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', unlocked: hasRoadmap, xp: 150 },
          { id: 'global_4', name: 'Elite Hired', desc: 'Secured a professional position.', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', unlocked: false, xp: 2000 },
        ];

        const taskBadges = [
          { 
            id: 'task_1', 
            name: 'First Contact', 
            desc: `Completed your first roadmap task. (Progress: ${completedTasksCount}/1)`, 
            icon: Target, 
            color: 'text-pink-500', 
            bg: 'bg-pink-500/10', 
            border: 'border-pink-500/20', 
            unlocked: completedTasksCount >= 1, 
            xp: 100 
          },
          { 
            id: 'task_2', 
            name: 'Iron Dev', 
            desc: `Completed 5 roadmap tasks. (Progress: ${completedTasksCount}/5)`, 
            icon: Brain, 
            color: 'text-purple-500', 
            bg: 'bg-purple-500/10', 
            border: 'border-purple-500/20', 
            unlocked: completedTasksCount >= 5, 
            xp: 250 
          },
          { 
            id: 'task_3', 
            name: 'Sprint Master', 
            desc: `Completed 15 roadmap tasks. (Progress: ${completedTasksCount}/15)`, 
            icon: Trophy, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10', 
            border: 'border-amber-500/20', 
            unlocked: completedTasksCount >= 15, 
            xp: 500 
          },
          { 
            id: 'task_4', 
            name: 'Legendary Runner', 
            desc: `Completed 30 roadmap tasks. (Progress: ${completedTasksCount}/30)`, 
            icon: Sparkles, 
            color: 'text-cyan-500', 
            bg: 'bg-cyan-500/10', 
            border: 'border-cyan-500/20', 
            unlocked: completedTasksCount >= 30, 
            xp: 1000 
          },
        ];

        if (hasRoadmap) {
          const roadmap = data.roadmaps[0];
          totalWeeks = roadmap.weeks.length;

          roadmap.weeks.forEach((w) => {
            const isFinished = w.isRepoVerified || (w.tasks && w.tasks.every(t => t.completed) && w.tasks.length > 0);
            if (isFinished) completedWeeks++;

            let badgeTitle = w.topic.split(' ').slice(0, 2).join(' ');

            dynamicBadges.push({
              id: `week_${w.weekNumber}`,
              name: `${badgeTitle} Specialist`,
              desc: `Completed the ${w.topic} module.`,
              icon: Shield,
              color: 'text-blue-600',
              bg: 'bg-blue-600/10',
              border: 'border-blue-600/20',
              unlocked: isFinished,
              xp: 500 + (w.weekNumber * 50)
            });
          });
        }

        const roadmapPerc = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;
        const githubPerc = user?.githubData ? Math.min(100, (user.githubData.publicRepos * 5) + (user.githubData.totalStars * 10)) : 0;

        let nextM = "Rising Star";
        let nextMPerc = 0;
        if (roadmapPerc < 30) { nextM = "Foundation Master"; nextMPerc = (roadmapPerc / 30) * 100; }
        else if (roadmapPerc < 70) { nextM = "Core Architect"; nextMPerc = ((roadmapPerc - 30) / 40) * 100; }
        else { nextM = "Career Ready"; nextMPerc = ((roadmapPerc - 70) / 30) * 100; }

        setStats({
          roadmapProgress: roadmapPerc,
          githubImpact: githubPerc,
          nextMilestoneName: nextM,
          nextMilestoneProgress: Math.min(100, Math.round(nextMPerc))
        });

        setBadges([...baseBadges, ...taskBadges, ...dynamicBadges]);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [user]);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalXP = user?.xp || badges.filter(b => b.unlocked).reduce((s, b) => s + b.xp, 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <RefreshCw size={24} className="animate-spin text-primary opacity-50" />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8 pr-1 font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      
      {/* Pilot-style Header Command Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/85 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        {/* Subtle glow backdrop inside command bar */}
        <div className="absolute inset-0 bg-primary/5 blur-[80px] pointer-events-none animate-pulse" />
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Achievements & <span className="text-primary">Milestones</span> <Trophy size={20} className="text-yellow-500 animate-bounce" />
          </h1>
          <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
            <span className="text-primary font-semibold uppercase tracking-wider">{unlockedCount} / {badges.length} Unlocked</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>Rank: {stats.nextMilestoneName}</span>
          </p>
        </div>
        <div className="bg-card border border-border px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-sm relative z-10 hover:border-primary/30 transition-all">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Zap size={16} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">TOTAL IMPACT</div>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-lg font-bold text-foreground">{totalXP.toLocaleString()}</span>
              <span className="text-[9px] font-black text-primary uppercase tracking-wider">XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Colorful Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Unlocked - Green Top Accent */}
        <div className="bg-card border border-border/80 border-t-4 border-t-[#34A853] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">BADGES UNLOCKED</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-foreground">
              {unlockedCount} <span className="text-xs text-muted-foreground">/ {badges.length}</span>
            </p>
            <div className="w-10 h-10 rounded-xl bg-[#34A853]/10 border border-[#34A853]/20 flex items-center justify-center text-[#34A853] shadow-inner shadow-[#34A853]/5">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        {/* Card 2: Readiness - Blue Top Accent */}
        <div className="bg-card border border-border/80 border-t-4 border-t-[#4285F4] p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">READINESS SCORE</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-foreground">{Math.round(stats.roadmapProgress)}%</p>
            <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] shadow-inner shadow-[#4285F4]/5">
              <Target size={20} />
            </div>
          </div>
        </div>

        {/* Card 3: Next Milestone - Yellow Top Accent */}
        <div className="bg-card border border-border/80 border-t-4 border-t-[#FBBC05] p-5 rounded-2xl shadow-sm md:col-span-2 flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">NEXT MILESTONE</p>
            <span className="text-xs font-bold text-[#B06000] dark:text-[#FDD663]">{stats.nextMilestoneName}</span>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FBBC05] to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${stats.nextMilestoneProgress}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-foreground">{stats.nextMilestoneProgress}%</span>
            </div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
              <span>Curriculum module integration progress</span>
              <span>{stats.nextMilestoneProgress === 100 ? 'Rank Max' : 'Level Up Soon'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Badges Grid Panel */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = badge.icon;
              const isUnlocked = badge.unlocked;
              
              // Dynamic colors mapping for hover effect
              let glowColor = "hover:shadow-primary/5 hover:border-primary/45";
              if (badge.color?.includes('orange')) glowColor = "hover:shadow-orange-500/5 hover:border-orange-500/40";
              if (badge.color?.includes('blue')) glowColor = "hover:shadow-blue-500/5 hover:border-blue-500/40";
              if (badge.color?.includes('emerald')) glowColor = "hover:shadow-emerald-500/5 hover:border-emerald-500/40";
              if (badge.color?.includes('pink')) glowColor = "hover:shadow-pink-500/5 hover:border-pink-500/40";
              if (badge.color?.includes('purple')) glowColor = "hover:shadow-purple-500/5 hover:border-purple-500/40";
              if (badge.color?.includes('amber')) glowColor = "hover:shadow-amber-500/5 hover:border-amber-500/40";
              if (badge.color?.includes('cyan')) glowColor = "hover:shadow-cyan-500/5 hover:border-cyan-500/40";
              
              return (
                <motion.div
                  whileHover={isUnlocked ? { y: -3 } : {}}
                  transition={{ duration: 0.2 }}
                  key={badge.id}
                  onClick={() => isUnlocked && setSelectedBadge(badge)}
                  className={`bg-card border p-5 rounded-2xl shadow-sm transition-all cursor-pointer group flex flex-col h-[170px] relative overflow-hidden select-none ${
                    isUnlocked 
                      ? `border-border/80 ${glowColor} hover:shadow-md` 
                      : "border-dashed border-border/50 opacity-30 grayscale hover:opacity-40"
                  }`}
                >
                  {/* Subtle color flare in the card background */}
                  {isUnlocked && (
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-10 pointer-events-none ${badge.bg}`} />
                  )}

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-all group-hover:scale-105 duration-200 ${
                      isUnlocked 
                        ? `${badge.bg} ${badge.border} ${badge.color}` 
                        : 'bg-muted border-border text-muted-foreground'
                    }`}>
                      {isUnlocked ? <Icon size={20} className="group-hover:rotate-6 duration-200" /> : <Lock size={18} />}
                    </div>
                    {isUnlocked ? (
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.bg} ${badge.border} ${badge.color}`}>
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted/65 border border-border text-muted-foreground/50">
                        Locked
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-bold text-foreground mb-1 truncate relative z-10 group-hover:text-primary transition-colors">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed relative z-10 flex-1">
                    {isUnlocked ? badge.desc : "Complete learning path sequence requirements to unlock this achievement."}
                  </p>
                  
                  <div className="pt-3 border-t border-border/40 mt-3 flex justify-between items-center relative z-10">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isUnlocked ? badge.color : 'text-muted-foreground/60'}`}>
                      {isUnlocked ? `+${badge.xp} XP` : 'Locked'}
                    </span>
                    {isUnlocked && (
                      <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 duration-200">
                        <ChevronRight size={13} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Badge Detail Panel */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm sticky top-5 overflow-hidden transition-all duration-200">
            {/* Dynamic color accent top bar */}
            {selectedBadge && (
              <div 
                className="absolute top-0 inset-x-0 h-1.5 transition-all duration-300"
                style={{ 
                  backgroundColor: 
                    selectedBadge.color?.includes('orange') ? '#f97316' : 
                    selectedBadge.color?.includes('blue') ? '#3b82f6' : 
                    selectedBadge.color?.includes('emerald') ? '#10b981' : 
                    selectedBadge.color?.includes('pink') ? '#ec4899' : 
                    selectedBadge.color?.includes('purple') ? '#a855f7' : 
                    selectedBadge.color?.includes('amber') ? '#f59e0b' : 
                    selectedBadge.color?.includes('cyan') ? '#06b6d4' : 
                    '#4285F4' 
                }} 
              />
            )}

            <AnimatePresence mode="wait">
              {selectedBadge ? (
                <motion.div 
                  key={selectedBadge.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }} 
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-md relative overflow-hidden ${selectedBadge.bg} ${selectedBadge.border} ${selectedBadge.color}`}>
                      <div className="absolute inset-0 bg-white/5 opacity-40" />
                      <selectedBadge.icon size={26} className="relative z-10" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-foreground truncate leading-snug">{selectedBadge.name}</h3>
                      <p className="text-[9px] font-black text-primary tracking-widest uppercase mt-0.5">Awarded Milestone</p>
                    </div>
                  </div>

                  {/* Left Accent Speech Bubble Card */}
                  <div className="bg-muted/50 border-l-4 border-l-primary border-y border-r border-border/50 p-4.5 rounded-r-xl relative overflow-hidden flex flex-col justify-center min-h-[90px]">
                    <div className="absolute top-2 right-2 text-primary/30 animate-pulse">
                      <Sparkles size={12} />
                    </div>
                    <p className="text-xs font-semibold text-foreground leading-relaxed italic text-center">
                      "{selectedBadge.desc}"
                    </p>
                  </div>

                  {/* Stats Table */}
                  <div className="grid grid-cols-2 gap-2 bg-muted/40 border border-border/50 rounded-xl p-3.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex flex-col pl-1">
                      <span className="text-[7.5px] text-muted-foreground/60 tracking-widest leading-none mb-1">REWARD</span>
                      <span className={`text-sm font-black ${selectedBadge.color}`}>{selectedBadge.xp} XP</span>
                    </div>
                    <div className="flex flex-col border-l border-border/50 pl-3">
                      <span className="text-[7.5px] text-muted-foreground/60 tracking-widest leading-none mb-1">STATUS</span>
                      <span className="text-xs font-black text-[#34A853]">VERIFIED</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`I unlocked the "${selectedBadge.name}" milestone on CampusPath AI! 🚀`);
                        toast.success('Achievement share text copied to clipboard!');
                      }} 
                      className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg shadow-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy size={13} /> Share Achievement
                    </button>
                    <button 
                      onClick={() => setSelectedBadge(null)} 
                      className="w-full py-2.5 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                      Dismiss View
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center">
                    <Award size={32} className="text-muted-foreground opacity-30 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Select a Milestone</h3>
                    <p className="text-[11px] text-muted-foreground max-w-[210px] mt-1.5 leading-relaxed font-medium">
                      Click on any unlocked milestone block to load its credentials, verification data, and sharing keys.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
