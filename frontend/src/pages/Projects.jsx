import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { roadmapAPI } from '@/api/client';
import { RefreshCw, GitBranch, ExternalLink, Play, Zap, Filter, Brain, Check, Folder, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Projects() {
  const { user } = useAuth();
  const toast = useToast();
  const [filter, setFilter] = useState('All');
  const FILTERS = ['All', 'In Progress', 'Completed', 'Upcoming'];

  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjectsData = async () => {
      try {
        const { data } = await roadmapAPI.getAll();
        if (data.roadmaps && data.roadmaps.length > 0) {
          const roadmap = data.roadmaps[0];
          setActiveRoadmap(roadmap);

          // Map backend roadmap weeks into "Projects"
          const mappedProjects = roadmap.weeks.map(w => {
            const totalTasks = w.tasks.length || 1;
            const completedTasks = w.tasks.filter(t => t.completed).length;
            const progress = Math.round((completedTasks / totalTasks) * 100);

            let status = 'Upcoming';
            if (w.isRepoVerified || progress === 100) status = 'Completed';
            else if (progress > 0) status = 'In Progress';
            else if (w.weekNumber === 1 || roadmap.weeks[w.weekNumber - 2]?.isRepoVerified) status = 'In Progress'; // Unlock logic

            return {
              id: w.weekNumber,
              title: (w.expectedRepoName || "").replace('cp-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || `Week ${w.weekNumber} Challenge`,
              description: w.projectBrief || `Develop a ${w.topic} focused module for your portfolio.`,
              status,
              week: w.weekNumber,
              stack: (w.skills && w.skills.slice(0, 4)) || [w.topic.split(' ')[0]],
              progress,
              repoName: w.expectedRepoName,
              isVerified: w.isRepoVerified
            };
          });

          setProjects(mappedProjects);
        }
      } catch (err) {
        console.error("Failed to fetch roadmap projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsData();
  }, []);

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  const STATUS_STYLES = {
    'Completed': { text: 'text-[#34A853]', bg: 'bg-[#34A853]/10', border: 'border-[#34A853]/25', bar: '#34A853' },
    'In Progress': { text: 'text-[#4285F4]', bg: 'bg-[#4285F4]/10', border: 'border-[#4285F4]/25', bar: '#4285F4' },
    'Upcoming': { text: 'text-muted-foreground', bg: 'bg-muted/55', border: 'border-border/60', bar: '#5F6368' },
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <RefreshCw size={32} className="animate-spin text-primary" />
    </div>
  );

  if (!activeRoadmap) return (
    <div className="text-center p-16 bg-card border border-border rounded-2xl mx-8 shadow-sm">
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Brain size={32} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">No Active Roadmap Found</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Project Forge generates coding projects based on your AI learning path. Generate a roadmap to unlock your projects.
      </p>
      <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</button>
    </div>
  );

  return (
    <div className="pb-4 animate-in fade-in duration-300 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Project Forge</h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">AI portfolio projects mapped directly to your <span className="text-foreground font-bold">{activeRoadmap.targetRole}</span> track</p>
        </div>
        <div className="flex overflow-x-auto no-scrollbar max-w-full flex-nowrap gap-1 bg-card/60 backdrop-blur-md p-1 rounded-xl border border-border/60 shadow-sm shrink-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 sm:px-4 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, color: 'text-primary' },
          { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: 'text-[#34A853]' },
          { label: 'Upcoming', value: projects.filter(p => p.status === 'Upcoming').length, color: 'text-muted-foreground' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
            <div className="text-muted-foreground text-[10px] uppercase tracking-widest font-black">{label}</div>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project, idx) => {
          const { text, bg, border, bar } = STATUS_STYLES[project.status];
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-primary/30 transition-all flex flex-col group relative overflow-hidden"
            >
              {/* Folder tab shape overlay for active/completed projects */}
              <div className="absolute top-0 right-0 w-24 h-6 bg-muted/30 border-l border-b border-border/50 rounded-bl-xl flex items-center justify-center">
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">W{project.week} STACK</span>
              </div>

              <div className="flex items-start justify-between mb-4 mt-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${bg} ${text} border ${border}`}>
                      {project.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-muted/65 text-muted-foreground border border-border/60">
                      Week {project.week}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Folder size={18} className={`${project.status === 'Completed' ? 'text-[#34A853]' : 'text-primary'} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-bold text-foreground text-base truncate group-hover:text-primary transition-colors pr-2">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed mb-5 flex-1 line-clamp-3 font-medium">
                {project.description}
              </p>

              {/* Tech Stack Badge Row */}
              <div className="flex flex-wrap gap-1.5 mb-5 min-h-[22px]">
                {project.stack.map(tech => (
                  <span key={tech} className="bg-muted/70 text-foreground border border-border/40 px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Progress velocity indicator */}
              <div className="mb-5 bg-muted/20 border border-border/40 p-3 rounded-xl">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">TASKS VERIFIED</span>
                  <span className="text-xs font-black" style={{ color: bar }}>{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${project.progress}%`, backgroundColor: bar }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-auto">
                {project.status === 'Completed' ? (
                  <>
                    <button
                      className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 font-bold cursor-pointer rounded-xl transition-all"
                      onClick={() => window.open(`https://github.com/${user.githubUsername}/${project.repoName}`, '_blank')}
                    >
                      <GitBranch size={13} /> View Repo
                    </button>
                    <button
                      className="flex-1 text-xs flex items-center justify-center gap-1.5 py-2 font-black cursor-default rounded-xl bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30"
                    >
                      <Check size={13} /> Verified
                    </button>
                  </>
                ) : project.status === 'In Progress' ? (
                  <button
                    className="flex-1 btn-primary text-xs flex items-center justify-center gap-1.5 py-2.5 font-bold cursor-pointer rounded-xl w-full"
                    onClick={() => toast.info('Navigating to specific week walkthrough...')}
                  >
                    <Play size={13} /> Resume Week {project.week}
                  </button>
                ) : (
                  <button
                    className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 font-bold rounded-xl w-full opacity-40 cursor-not-allowed"
                    disabled
                  >
                    <Zap size={13} /> Locked (Complete previous)
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
