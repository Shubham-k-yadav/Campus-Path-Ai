import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { roadmapAPI, jobsAPI } from '@/api/client';
import { RefreshCw, Zap, Check, Gift, Brain, Target, Compass, Award, Rocket, Flame, Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl p-3 shadow-lg font-sans">
      <p className="text-muted-foreground text-[10px] font-black mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-primary font-black text-xs">{payload[0].value} tasks completed</p>
    </div>
  );
};

const PIE_COLORS = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#7699d4', '#07c592'];

export default function Progress() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        if (data.roadmaps && data.roadmaps.length > 0) {
          const roadmap = data.roadmaps[0];
          setActiveRoadmap(roadmap);

          // Build dynamic milestones from roadmap progress
          const claimedSet = new Set((user?.milestones || []).filter(m => m.claimed).map(m => m.id));
          const tasksCompleted = roadmap.weeks.reduce((s, w) => s + w.tasks.filter(t => t.completed).length, 0);
          const weeksWithAllDone = roadmap.weeks.filter(w => w.tasks.length > 0 && w.tasks.every(t => t.completed));

          const dynamicMilestones = [
            { id: 'global_1', title: 'First Steps', desc: 'Complete your first task', xp: 50, icon: Rocket, ready: tasksCompleted >= 1, claimed: claimedSet.has('global_1') },
            { id: 'global_2', title: 'Consistent Coder', desc: `Maintain a 3-day streak (currently: ${user?.streak || 0} days)`, xp: 350, icon: Flame, ready: (user?.streak || 0) >= 3, claimed: claimedSet.has('global_2') },
            { id: 'global_3', title: 'Module Master', desc: 'Complete an entire week module', xp: 250, icon: Brain, ready: weeksWithAllDone.length >= 1, claimed: claimedSet.has('global_3') },
            ...roadmap.weeks.filter(w => w.isRepoVerified).slice(0, 5).map((w) => ({
              id: `week_${w.weekNumber}`,
              title: `${w.topic?.split(' ').slice(0, 3).join(' ')} Specialist`,
              desc: `Verified GitHub repo for Week ${w.weekNumber}`,
              xp: 500 + (w.weekNumber * 50),
              icon: Trophy,
              ready: true,
              claimed: claimedSet.has(`week_${w.weekNumber}`)
            }))
          ];
          setMilestones(dynamicMilestones);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
  }, [user]);

  const claimMilestone = async (id) => {
    try {
      const { data } = await jobsAPI.claimMilestone(id);
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, claimed: true } : m));
      
      // Update global user milestones array in context and localStorage
      const updatedMilestones = [...(user?.milestones || [])];
      const existingIdx = updatedMilestones.findIndex(m => m.id === id);
      if (existingIdx >= 0) {
        updatedMilestones[existingIdx].claimed = true;
        updatedMilestones[existingIdx].claimedAt = new Date();
      } else {
        updatedMilestones.push({ id, claimed: true, claimedAt: new Date() });
      }
      updateUser({ milestones: updatedMilestones, xp: data.newXP, streak: data.streak });
      
      toast.success(`🎉 +${data.xpGained} XP! Streak: ${data.streak} days 🔥`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim milestone.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw size={32} className="animate-spin text-primary" />
    </div>
  );

  if (!activeRoadmap) return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-[2rem] mt-8 mx-4 shadow-sm">
      <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 border border-primary/20">
        <Brain size={40} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4 font-sans tracking-tight">No Active Roadmap Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Progress Tracker requires an active learning path to monitor your velocity. Let's build your first career roadmap!
      </p>
      <button
        className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
        onClick={() => window.location.href = '/dashboard'}
      >
        <Compass size={18} /> Go to Dashboard
      </button>
    </div>
  );

  // Dynamic Data Calculation Engine
  const totalWeeks = activeRoadmap.weeks.length;
  const tasksCompleted = activeRoadmap.weeks.reduce((sum, w) => sum + w.tasks.filter(t => t.completed).length, 0);
  const avgVelocity = (tasksCompleted / totalWeeks).toFixed(1);

  // Recharts Map
  const velocityData = activeRoadmap.weeks.map(w => ({
    week: `Week ${w.weekNumber}`,
    tasks: w.tasks.filter(t => t.completed).length
  }));

  // Generating pseudo-distribution based on roadmap skills or topics for the pie chart
  const skillDistributionMap = {};
  activeRoadmap.weeks.forEach(w => {
    const primarySkill = w.skills && w.skills[0] ? w.skills[0] : w.topic.split(' ')[0];
    if (primarySkill) {
      skillDistributionMap[primarySkill] = (skillDistributionMap[primarySkill] || 0) + w.tasks.length;
    }
  });

  const skillPieData = Object.entries(skillDistributionMap)
    .sort((a, b) => b[1] - a[1]) // Sort largest to smallest
    .slice(0, 5) // Top 5 skills
    .map(([name, value]) => ({
      name,
      value: Math.round((value / activeRoadmap.weeks.reduce((sum, w) => sum + w.tasks.length, 0)) * 100) || 10,
    }));

  // Use real XP from DB if available, else calculate from milestones + tasks
  const totalXP = user?.xp || (milestones.filter(m => m.claimed).reduce((sum, m) => sum + m.xp, 0) + (tasksCompleted * 10));

  return (
    <div className="animate-in fade-in duration-500 pb-4 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-1">Progress Tracker</h1>
        <p className="text-xs font-medium text-muted-foreground">Monitor your learning velocity and milestone achievements on path to <span className="text-foreground font-bold">{activeRoadmap.targetRole}</span></p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks Completed', value: tasksCompleted, color: 'text-primary' },
          { label: 'Total XP Earned', value: totalXP.toLocaleString(), color: 'text-[#34A853]' },
          { label: 'Milestones', value: `${milestones.filter(m => m.claimed).length}/${milestones.length}`, color: 'text-primary' },
          { label: 'Avg Velocity', value: `${avgVelocity}/wk`, color: 'text-primary' },
        ].map(({ label, value, color }, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.01 }}
            key={label}
            className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-300"
          >
            <div className={`text-3xl font-black font-sans mb-1.5 ${color}`}>{value}</div>
            <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Area Chart */}
        <div className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-5 shadow-sm">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-sm font-bold text-foreground">Learning Velocity</h3>
              <p className="text-xs text-muted-foreground font-medium">Tasks completed per week over your module timeline</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-muted/60 border border-border/50 px-3 py-1.5 rounded-xl text-foreground">
              <Target size={12} className="text-primary" /> Active Timeline
            </div>
          </div>

          <div className="-ml-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="velGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.5} />
                <XAxis dataKey="week" tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10, fontWeight: 700 }} tickFormatter={w => w.replace('Week ', 'W')} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'var(--color-muted-foreground)', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tasks" stroke="var(--color-primary)" fill="url(#velGrad)" strokeWidth={2.5} dot={{ fill: 'var(--color-background)', stroke: 'var(--color-primary)', strokeWidth: 2, r: 4 }} activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: 'var(--color-background)' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground">Skill Mastery</h3>
            <p className="text-xs text-muted-foreground font-medium">Curriculum distribution</p>
          </div>

          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillPieData}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {skillPieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <RechartsTooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-auto">
            {skillPieData.map(({ name, value }, idx) => (
              <div key={name} className="flex items-center gap-3 text-xs font-semibold">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-muted-foreground flex-1 truncate">{name}</span>
                <span className="text-foreground font-black">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Award className="text-primary" /> Milestone Timeline
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Claim rewards for completing key achievements</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-inner">
            <Zap size={13} className="animate-pulse" /> {totalXP.toLocaleString()} Total XP
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {milestones.map((m) => {
            const isClaimed = m.claimed;
            const isReady = !isClaimed && m.ready === true;

            return (
              <motion.div
                whileHover={{ scale: 1.01 }}
                key={m.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border transition-all ${
                  isClaimed 
                    ? 'bg-[#34A853]/5 border-[#34A853]/25' 
                    : isReady 
                      ? 'bg-primary/5 border-primary/30 shadow-[0_0_15px_rgba(26,115,232,0.05)]' 
                      : 'bg-card/40 border-border/40 opacity-60'
                }`}
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border shadow-inner ${
                  isClaimed 
                    ? 'bg-[#34A853]/10 border-[#34A853]/25 text-[#34A853]' 
                    : isReady 
                      ? 'bg-primary/15 border-primary/20 text-primary' 
                      : 'bg-muted/40 border-border/40 text-muted-foreground/60'
                }`}>
                  {(() => {
                    const Icon = m.icon;
                    return <Icon size={24} className={isReady ? 'animate-pulse' : ''} />;
                  })()}
                </div>

                <div className="flex-1">
                  <div className="font-bold text-foreground text-sm mb-1">{m.title}</div>
                  <div className="text-muted-foreground text-xs font-semibold leading-relaxed">{m.desc}</div>
                  {m.date && <div className="text-primary text-[9px] uppercase tracking-widest font-black mt-2">Earned {m.date}</div>}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 sm:gap-2 shrink-0">
                  <div className={`font-black text-base ${isClaimed ? 'text-[#34A853]' : isReady ? 'text-primary' : 'text-muted-foreground'}`}>
                    +{m.xp} XP
                  </div>

                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-[9px] font-black text-[#34A853] bg-[#34A853]/10 px-2.5 py-1 rounded-lg border border-[#34A853]/20 uppercase tracking-wider">
                      <Check size={12} /> CLAIMED
                    </div>
                  ) : isReady ? (
                    <button
                      onClick={() => claimMilestone(m.id)}
                      className="flex items-center gap-1.5 text-[9px] font-black text-primary-foreground bg-primary hover:bg-primary-dark px-4 py-2 rounded-xl shadow-md shadow-primary/10 transition-all hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      <Gift size={12} /> CLAIM REWARD
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[8px] font-black text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg uppercase tracking-wider border border-border/50">
                      LOCKED
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
