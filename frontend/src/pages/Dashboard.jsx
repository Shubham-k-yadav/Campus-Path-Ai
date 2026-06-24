import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { roadmapAPI, githubAPI } from '@/api/client';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import {
  Zap, Target, Flame, Trophy, ArrowRight, RefreshCw, Brain,
  CheckCircle, Circle, BookOpen, Code, ExternalLink, Clock, Sparkles, Terminal, ShieldAlert,
  GitPullRequest, Star, Layers, Activity, LayoutGrid, Calendar, Play, Check, ShieldCheck, Cpu, GitBranch
} from 'lucide-react';
import ContributionHeatmap from '@/components/features/github/ContributionHeatmap';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 pb-6 pr-1 font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-2">
          <div className="h-8 w-60 bg-muted rounded-xl" />
          <div className="h-4 w-40 bg-muted rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted rounded-xl" />
          <div className="h-10 w-40 bg-muted rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-muted rounded-3xl" />
        <div className="h-[400px] bg-muted rounded-3xl" />
      </div>
    </div>
  );
}

function buildRadarFromRoadmap(roadmap) {
  if (!roadmap || !Array.isArray(roadmap.weeks) || roadmap.weeks.length === 0) return null;
  
  const taughtSkills = {};
  roadmap.weeks.forEach((w) => {
    (w.skills || []).forEach(s => {
      taughtSkills[s] = (taughtSkills[s] || 0) + Math.round(100 / roadmap.weeks.length);
    });
  });

  const entries = Object.entries(taughtSkills).slice(0, 6);
  if (entries.length < 3) return null;

  return entries.map(([skill, roadmapWeight]) => ({
    skill: skill.length > 12 ? skill.slice(0, 10) + '…' : skill,
    roadmap: Math.min(100, roadmapWeight),
    industry: 75 + Math.floor(Math.random() * 20),
  }));
}

const INSIGHTS = [
  { text: 'Completing your Docker module will put you in the top 10% of junior candidates.', category: 'Market Value', icon: Zap },
  { text: 'Focusing on Generics this week will solve 40% of your current TypeScript errors.', category: 'Skill Boost', icon: Brain },
  { text: 'Senior roles in your area are increasingly requiring PostgreSQL expertise.', category: 'Career Trend', icon: Target },
  { text: 'Your commit velocity is 20% higher than last week. Keep it up!', category: 'Momentum', icon: Flame },
];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [missionIdx] = useState(() => Math.floor(Math.random() * INSIGHTS.length));
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);

  useEffect(() => {
    setLoadingRoadmaps(true);
    roadmapAPI.getAll()
      .then(r => setRoadmaps(r?.data?.roadmaps || []))
      .catch((err) => { console.error('Dashboard fetch error:', err); })
      .finally(() => setLoadingRoadmaps(false));
  }, []);

  if (loadingRoadmaps) return <DashboardSkeleton />;

  const activeRoadmap = Array.isArray(roadmaps) ? roadmaps[0] : null;
  const readiness = activeRoadmap?.completionPercentage ?? 0;

  const tasksDone = (activeRoadmap && activeRoadmap.weeks)
    ? activeRoadmap.weeks.reduce((s, w) => s + (w.tasks || []).filter(t => t.completed).length, 0)
    : 0;
  const tasksLeft = (activeRoadmap && activeRoadmap.weeks)
    ? activeRoadmap.weeks.reduce((s, w) => s + (w.tasks || []).filter(t => !t.completed).length, 0)
    : 0;
  const tasksTotal = tasksDone + tasksLeft;
  const tasksDonePct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  const dailyInsight = INSIGHTS[missionIdx];
  const github = user?.githubData || null;

  const activeWeek = activeRoadmap && Array.isArray(activeRoadmap.weeks)
    ? activeRoadmap.weeks.find(w => Array.isArray(w.tasks) && w.tasks.some(t => !t.completed)) || activeRoadmap.weeks[0]
    : null;

  const activeWeekTasksDone = activeWeek?.tasks?.filter(t => t.completed).length || 0;
  const activeWeekTasksTotal = activeWeek?.tasks?.length || 0;
  const activeWeekProgress = activeWeekTasksTotal > 0 ? Math.round((activeWeekTasksDone / activeWeekTasksTotal) * 100) : 0;

  const radarData = activeRoadmap ? buildRadarFromRoadmap(activeRoadmap) : null;

  const syncGithub = async () => {
    if (!user?.githubUsername) { toast.error('Please connect GitHub first'); return; }
    setSyncing(true);
    try {
      const { data } = await githubAPI.analyze(user.githubUsername);
      updateUser({ githubData: data.data, lastGithubSync: new Date() });
      toast.success('GitHub metrics synced successfully!');
    } catch (err) {
      toast.error('Sync failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const generateRoadmap = async () => {
    if (!user?.targetRole) { toast.error('Please complete onboarding first.'); navigate('/onboarding'); return; }
    setGenerating(true);
    toast.info('🤖 Analyzing your GitHub & generating AI roadmap...');
    try {
      await roadmapAPI.generate({ githubUsername: user.githubUsername, targetRole: user.targetRole, manualSkills: user.techStack });
      toast.success('🎯 Personalized roadmap generated!');
      const r = await roadmapAPI.getAll();
      setRoadmaps(r.data.roadmaps || []);
      navigate('/roadmap');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Roadmap generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Helper to parse checklist titles and output styled technical icon/tags strictly using Google Brand colors
  const getTaskTag = (taskText) => {
    const text = (taskText || '').toLowerCase();
    if (text.includes('code') || text.includes('build') || text.includes('implement') || text.includes('write')) {
      return { tag: 'SRC', color: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20', icon: Code };
    }
    if (text.includes('read') || text.includes('study') || text.includes('learn') || text.includes('docs')) {
      return { tag: 'DOC', color: 'text-[#FBBC05] dark:text-[#FDD663] bg-[#FBBC05]/10 border-[#FBBC05]/20', icon: BookOpen };
    }
    if (text.includes('test') || text.includes('verify') || text.includes('audit') || text.includes('run')) {
      return { tag: 'TST', color: 'text-[#EA4335] dark:text-[#F28B82] bg-[#EA4335]/10 border-[#EA4335]/20', icon: Terminal };
    }
    return { tag: 'RUN', color: 'text-[#34A853] bg-[#34A853]/10 border-[#34A853]/20', icon: Cpu };
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8 pr-1 font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      
      {/* Pilot Command Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/80 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Developer'}</span> <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
            <span className="text-primary font-semibold uppercase tracking-wider">{activeRoadmap ? activeRoadmap.targetRole : user?.targetRole || 'Software Engineer'}</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{activeRoadmap ? `${activeRoadmap.totalWeeks} modules sequence` : `${user?.weeklyHours || 10}h weekly`}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={syncGithub}
            disabled={syncing}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-card border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all disabled:opacity-70 shadow-sm rounded-lg cursor-pointer hover:border-primary/40 duration-200"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin text-primary' : 'text-primary'} />
            {syncing ? 'Syncing...' : 'Sync GitHub'}
          </button>
          
          <button
            onClick={generateRoadmap}
            disabled={generating}
            className="flex items-center justify-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-70 disabled:pointer-events-none rounded-lg cursor-pointer duration-200"
          >
            {generating ? (
              <><RefreshCw size={13} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Brain size={13} /> {activeRoadmap ? 'Regenerate Path' : 'Generate AI Roadmap'}</>
            )}
          </button>
        </div>
      </div>

      {/* Bento Grid Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bento Cell 1: Active Focus Card (Spans 2 columns) - Google Blue accent */}
        <div className="lg:col-span-2 bg-card border border-border/80 border-t-4 border-t-[#4285F4] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[350px]">
          {activeWeek ? (
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#4285F4]/10 border border-[#4285F4]/20 text-primary">
                      CURRENT WEEK {activeWeek.weekNumber}
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/60 border border-border/40 px-2 py-0.5 rounded">
                      ACTIVE TARGET
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight leading-snug">
                    {activeWeek.topic}
                  </h2>
                </div>
                <div className="bg-[#4285F4]/5 border border-[#4285F4]/20 px-3.5 py-2 rounded-xl text-right">
                  <div className="text-xl font-bold text-primary leading-none">{activeWeekProgress}%</div>
                  <div className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest mt-1">WEEK VELOCITY</div>
                </div>
              </div>

              {/* Unique Task Rows with Tech Tags and Visual Icons */}
              <div className="space-y-2.5 mb-6">
                {activeWeek.tasks?.slice(0, 3).map((task, i) => {
                  const data = getTaskTag(task.text);
                  const Icon = data.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/70 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Task Icon wrapper */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${data.color}`}>
                          <Icon size={14} />
                        </div>
                        <span className={`text-xs font-medium truncate ${task.completed ? 'text-muted-foreground line-through opacity-65' : 'text-foreground'}`}>
                          {task.text}
                        </span>
                      </div>
                      
                      {/* Check badge/Indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${data.color}`}>
                          {data.tag}
                        </span>
                        {task.completed ? (
                          <div className="w-5 h-5 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center text-[#34A853]">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/30 group-hover:border-primary/50 group-hover:text-primary transition-all">
                            <Play size={8} fill="currentColor" className="ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Slider */}
              <div className="border-t border-border/50 pt-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex-1 w-full space-y-1.5">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${activeWeekProgress}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>{activeWeekTasksDone} tasks verified</span>
                    <span>{activeWeekTasksTotal - activeWeekTasksDone} tasks remaining</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/roadmap')}
                  className="w-full sm:w-auto px-4 py-2 bg-card border border-border hover:bg-muted text-foreground font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer duration-200"
                >
                  Jump to Workspace <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Brain size={24} className="animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">AI Agent Navigation Offline</h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-6">
                Build your personalized roadmap to index required skills and view weekly modules.
              </p>
              <button onClick={generateRoadmap} className="btn-primary py-2.5 px-6 rounded-lg text-xs font-semibold shadow-sm hover:scale-[1.01]">
                Initialize AI Guide
              </button>
            </div>
          )}
        </div>

        {/* Bento Cell 2: Concentric HUD Diagnostic Ring (Square) - Google Green accent */}
        <div className="bg-card border border-border/80 border-t-4 border-t-[#34A853] rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center hover:shadow-md transition-all duration-200 min-h-[350px]">
          <div className="w-full text-left">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]">
              HUD METRICS
            </span>
            <h3 className="font-bold text-foreground text-sm tracking-tight mt-1.5">Concentric Diagnostics</h3>
          </div>

          {/* Futuristic Nested concentric rings */}
          <div className="relative w-36 h-36 my-4 flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="rotate-90">
              {/* Outer Ring: Roadmap progress percentage (Green) */}
              <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-border)" strokeWidth="6" opacity="0.2" />
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="#34A853"
                strokeWidth="6"
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * readiness) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Ring: Tasks completion ratio (Blue) */}
              <circle cx="60" cy="60" r="36" fill="none" stroke="var(--color-border)" strokeWidth="6" opacity="0.2" />
              <circle
                cx="60"
                cy="60"
                r="36"
                fill="none"
                stroke="#4285F4"
                strokeWidth="6"
                strokeDasharray="226.2"
                strokeDashoffset={226.2 - (226.2 * tasksDonePct) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="text-2xl font-bold text-foreground leading-none">{readiness}%</span>
              <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">READINESS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-border/40 text-left text-[10px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 border-r border-border/40 pl-2">
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">ROADMAP</span>
                <span className="font-bold text-foreground text-xs">{readiness}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pl-4">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">TASKS</span>
                <span className="font-bold text-foreground text-xs">{tasksDonePct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Cell 3: Technical Profile (Square) - Google Red accent */}
        <div className="bg-card border border-border/80 border-t-4 border-t-[#EA4335] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[350px]">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]">
              RADAR
            </span>
            <h3 className="font-bold text-foreground text-sm tracking-tight mt-1.5">Technical Profile</h3>
          </div>

          <div className="flex-1 -mx-4 min-h-[180px] my-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={radarData || [
                  { skill: 'React', roadmap: 35, industry: 90 },
                  { skill: 'Node.js', roadmap: 30, industry: 85 },
                  { skill: 'TypeScript', roadmap: 25, industry: 80 },
                  { skill: 'Docker', roadmap: 15, industry: 75 },
                  { skill: 'Testing', roadmap: 30, industry: 85 },
                  { skill: 'Design', roadmap: 20, industry: 80 },
                ]}
                margin={{ top: 5, right: 30, bottom: 5, left: 30 }}
              >
                <PolarGrid stroke="var(--color-border)" opacity={0.5} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--color-foreground)', fontSize: 9, fontWeight: 600 }} />
                <Radar name="Coverage" dataKey="roadmap" stroke="#EA4335" fill="#EA4335" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Industry" dataKey="industry" stroke="var(--color-muted-foreground)" fill="var(--color-muted-foreground)" fillOpacity={0.02} strokeDasharray="3 3" strokeWidth={1} />
                <RechartsTooltip
                  contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 pt-3.5 border-t border-border/40">
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" /> Roadmap
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="w-2 h-0.5 border-t border-dashed border-muted-foreground/60" /> Industry
            </div>
          </div>
        </div>

        {/* Bento Cell 4: Engine Analytics (Wide - spans 2 columns) - Google Yellow accent */}
        <div className="lg:col-span-2 bg-card border border-border/80 border-t-4 border-t-[#FBBC05] rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[350px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FBBC05]/10 border border-[#FBBC05]/20 text-[#B06000] dark:text-[#FDD663]">
                WORKSPACE
              </span>
              <h3 className="font-bold text-foreground text-sm tracking-tight mt-1.5">Engine Metrics</h3>
            </div>
            {user?.lastGithubSync && (
              <span className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-widest border border-border/60 px-3 py-1 rounded-xl">
                SYNC OK
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Commits', value: github?.totalCommits || 0, icon: Flame, color: 'text-[#EA4335]', bg: 'bg-[#EA4335]/5', border: 'border-[#EA4335]/15' },
              { label: 'Repository Stars', value: github?.totalStars || 0, icon: Star, color: 'text-[#FBBC05]', bg: 'bg-[#FBBC05]/5', border: 'border-[#FBBC05]/15' },
              { label: 'Target Niche', value: user?.niche || 'SaaS & Web', icon: Target, color: 'text-[#34A853]', bg: 'bg-[#34A853]/5', border: 'border-[#34A853]/15' },
              { label: 'Languages used', value: github?.languages?.length || 0, icon: Code, color: 'text-[#4285F4]', bg: 'bg-[#4285F4]/5', border: 'border-[#4285F4]/15' },
            ].map(({ label, value, icon: Icon, color, bg, border }) => (
              <div key={label} className="bg-muted/50 border border-border/40 p-4 rounded-xl flex flex-col justify-between h-22 hover:bg-muted/75 transition-all">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} border ${border} ${color}`}>
                  <Icon size={14} />
                </div>
                <div>
                  <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{label}</div>
                  <div className="text-base font-bold text-foreground leading-none">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/40 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-muted-foreground/60" />
              <span className="text-[10px] font-medium text-muted-foreground">Syncing live workspace updates every 24h</span>
            </div>
            <button
              onClick={syncGithub}
              disabled={syncing}
              className="px-3.5 py-1.5 bg-card border border-border text-foreground font-semibold text-xs rounded-lg flex items-center gap-1.5 hover:bg-muted transition-all cursor-pointer"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> Synchronize Now
            </button>
          </div>
        </div>

      </div>

      {/* Row 2: Heatmap & AI Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contribution DNA */}
        <div className="lg:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Terminal size={14} className="text-primary" />
            <h3 className="font-bold text-foreground text-sm tracking-tight">Contribution DNA</h3>
          </div>
          {user?.githubUsername ? (
            <div className="overflow-x-auto no-scrollbar scrollbar-thin py-2 -mx-2 px-2">
              <ContributionHeatmap username={user.githubUsername} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 border border-dashed border-border/60 rounded-xl p-6">
              <GitBranch size={22} className="text-primary mb-2.5" />
              <h4 className="text-xs font-bold text-foreground mb-1">GitHub Account Not Connected</h4>
              <p className="text-[11px] text-muted-foreground max-w-sm mb-4">
                Connect your GitHub profile in settings to analyze your repositories, track contributions, and customize your AI roadmap.
              </p>
              <button
                onClick={() => navigate('/settings')}
                className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white text-[11px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Go to Settings
              </button>
            </div>
          )}
        </div>

        {/* AI Career Navigator - Left Slanted Chat Bubble with typing sparks */}
        <div className="bg-card border border-border/80 border-t-4 border-t-[#4285F4] rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200 min-h-[220px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Brain size={18} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">AI Navigator</h3>
                <p className="text-[8px] font-bold text-primary tracking-widest uppercase">System Guidance</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </div>

          {/* Clean panel with solid left-accent line */}
          <div className="bg-muted/50 border-l-4 border-l-[#4285F4] border-y border-r border-border/50 p-4.5 rounded-r-xl flex-1 mb-4 flex flex-col justify-center relative">
            <div className="absolute top-2 right-2 text-primary/40 animate-pulse">
              <Sparkles size={14} />
            </div>
            <div className="flex items-center gap-1.5 mb-1.5 text-primary">
              <dailyInsight.icon size={12} />
              <span className="text-[8px] font-bold uppercase tracking-wider leading-none">{dailyInsight.category}</span>
            </div>
            <p className="text-xs font-semibold text-foreground leading-relaxed italic">
              "{dailyInsight.text}"
            </p>
          </div>

          <button onClick={() => navigate('/roadmap')} className="w-full py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 text-xs shadow-sm transition-all cursor-pointer">
            Refine My Path <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Roadmap sequence slider */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm relative overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-border/40 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-foreground text-sm">Roadmap Sequence</h3>
              {activeRoadmap?.isAI && (
                <span className="text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                  AI PILOT
                </span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              {activeRoadmap ? `${activeRoadmap.targetRole} · ${activeRoadmap.totalWeeks} MODULES` : 'Personalized curriculum'}
            </p>
          </div>
          <button onClick={() => navigate('/roadmap')} className="text-xs font-semibold bg-card hover:bg-muted text-foreground px-4 py-2 rounded-lg border border-border/60 flex items-center gap-1.5 transition-all cursor-pointer">
            Full View <ArrowRight size={13} />
          </button>
        </div>

        {activeRoadmap ? (
          <div className="space-y-5">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 scrollbar-thin">
              {Array.isArray(activeRoadmap.weeks) && activeRoadmap.weeks.map(week => {
                const taskCount = Array.isArray(week.tasks) ? week.tasks.length : 0;
                const completed = taskCount > 0 ? week.tasks.filter(t => t.completed).length : 0;
                const progress = taskCount > 0 ? Math.round((completed / taskCount) * 100) : 0;
                const status = progress === 100 ? 'done' : progress > 0 ? 'active' : 'upcoming';
                const isExpanded = expandedWeek === week.weekNumber;

                return (
                  <div
                    key={week.weekNumber}
                    onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                    className={twMerge(
                      clsx(
                        "min-w-[220px] max-w-[240px] p-4.5 rounded-xl cursor-pointer border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-36 select-none",
                        isExpanded
                          ? "ring-2 ring-primary border-transparent shadow bg-card"
                          : status === 'done'
                            ? "bg-card border-[#34A853]/25 hover:border-[#34A853]/60"
                            : status === 'active'
                              ? "bg-primary/5 border-primary/40 hover:border-primary/60"
                              : "bg-card border-border/60 hover:bg-muted/20"
                      )
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-bold tracking-widest text-muted-foreground uppercase opacity-85">Module {week.weekNumber}</span>
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        status === 'done' ? "bg-[#34A853]" : status === 'active' ? "bg-primary animate-pulse" : "bg-muted"
                      )} />
                    </div>

                    <h4 className="font-bold text-foreground text-xs leading-snug line-clamp-2 mt-2 flex-1">{week.topic}</h4>

                    <div className="mt-4 bg-muted/50 border border-border/40 p-2 rounded-lg">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-1.5">
                        <div className={clsx("h-full rounded-full transition-all duration-1000", status === 'done' ? 'bg-[#34A853]' : 'bg-primary')} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                        <span>{progress}%</span>
                        <span>{completed}/{taskCount} Done</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {expandedWeek && (() => {
                const week = Array.isArray(activeRoadmap.weeks) ? activeRoadmap.weeks.find(w => w.weekNumber === expandedWeek) : null;
                if (!week) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 bg-muted/50 border border-border/50 rounded-xl p-5 mt-4 overflow-hidden"
                  >
                    {/* Tasks List */}
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-widest">
                        <CheckCircle size={13} className="text-[#34A853]" /> Module Checklist
                      </h4>
                      <div className="space-y-2 pr-1 max-h-[220px] overflow-y-auto scrollbar-thin">
                        {Array.isArray(week.tasks) && week.tasks.map((task, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card/80 border-border/40 shadow-sm transition-all hover:bg-card hover:border-primary/20">
                            {task.completed ? <CheckCircle size={13} className="text-[#34A853] shrink-0 mt-0.5" /> : <Circle size={13} className="text-muted-foreground/40 shrink-0 mt-0.5" />}
                            <span className={`text-xs font-medium ${task.completed ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}>{task.text || 'Untitled Task'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar details */}
                    <div className="space-y-5 border-t md:border-t-0 md:border-l border-border/40 pt-5 md:pt-0 md:pl-5">
                      {week.resources?.length > 0 && (
                        <div>
                          <h4 className="flex items-center gap-1.5 text-[9px] font-bold text-foreground uppercase tracking-widest mb-3">
                            <BookOpen size={13} className="text-primary" /> Study Resources
                          </h4>
                          <div className="space-y-2">
                            {Array.isArray(week.resources) && week.resources.map((res, i) => (
                              <a key={i} href={res.url || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg bg-card border border-border/60 hover:bg-muted transition-all text-[11px] font-semibold text-foreground group">
                                <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary shrink-0" />
                                <span className="truncate flex-1">{res.title || 'Resource'}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {week.projectBrief && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 shadow-sm space-y-1.5">
                          <h4 className="text-[8px] font-bold text-primary uppercase tracking-widest">Workspace Brief</h4>
                          <p className="text-[10px] text-foreground leading-relaxed font-semibold opacity-90">{week.projectBrief}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/50 border border-dashed border-border/60 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
              <Brain size={22} className="animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Roadmap Inactive</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
              Initialize a custom AI roadmap tailored to your experience and skills to begin.
            </p>
            <button onClick={generateRoadmap} className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg cursor-pointer">
              Deploy AI Pilot
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
