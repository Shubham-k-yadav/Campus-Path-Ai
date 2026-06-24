import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { roadmapAPI } from '@/api/client';
import {
  Globe, Layout, Code, Server, Database, ShieldCheck, Cloud, Award,
  Check, ChevronRight, ExternalLink, BookOpen, Play, X, RefreshCw, Map, Brain, Github, Video,
  Clock, CheckCircle2, Lock, Unlock, PlayCircle, Sparkles, ArrowLeft, Terminal, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export default function RoadmapViewer() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // null means show Overview Grid
  const [weeks, setWeeks] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    try {
      const r = await roadmapAPI.getAll();
      const rm = r.data.roadmaps?.[0];
      if (rm) {
        setRoadmap(rm);
        setWeeks(rm.weeks);
      } else {
        setWeeks([]);
      }
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
      toast.error('Failed to fetch roadmap data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const generateRoadmap = async () => {
    if (!user?.targetRole) { toast.error('Please complete onboarding first.'); navigate('/onboarding'); return; }
    setGenerating(true);
    toast.info('🤖 Generating your AI roadmap...');
    try {
      await roadmapAPI.generate({ githubUsername: user.githubUsername, targetRole: user.targetRole });
      toast.success('🎯 Roadmap generated!');
      fetchRoadmap();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (weekIndex, taskIndex) => {
    const newWeeks = weeks.map((w, wi) => wi !== weekIndex ? w : {
      ...w,
      tasks: w.tasks.map((t, ti) => ti !== taskIndex ? t : { ...t, completed: !t.completed }),
    });
    setWeeks(newWeeks);
    
    // Update local selected state to sync workspace UI
    if (selected && selected.weekNumber === weeks[weekIndex].weekNumber) {
      setSelected(newWeeks[weekIndex]);
    }

    if (roadmap) {
      try {
        await roadmapAPI.updateTask(roadmap._id, {
          weekNumber: weeks[weekIndex].weekNumber,
          taskIndex,
          completed: !weeks[weekIndex].tasks[taskIndex].completed,
        });
        toast.success('Task updated!');
      } catch { 
        toast.error('Sync failed'); 
      }
    }
  };

  const handleVerify = async (weekNumber) => {
    if (!roadmap) return;
    setVerifying(true);
    try {
      const res = await roadmapAPI.verifyMilestone(roadmap._id, weekNumber);
      if (res.data.verified) {
        toast.success(res.data.message || 'Milestone verified successfully!');
        fetchRoadmap();
      } else {
        toast.info(res.data.message || 'Repository not found yet. Make sure the name matches perfectly.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification check failed.');
    } finally {
      setVerifying(false);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return null;

    // If it's already an embed link, return it
    if (url.includes('youtube.com/embed/')) return url;

    // Handle search links - DO NOT EMBED
    if (url.includes('/results') || url.includes('search_query') || !url.includes('v=')) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) return null;
    }

    let videoId = '';
    try {
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split(/[&?#]/)[0];
      }
    } catch (e) {
      console.error('YouTube URL parsing failed:', e);
      return null;
    }

    return (videoId && videoId.length >= 10) ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const calculateOverallProgress = () => {
    if (!weeks || weeks.length === 0) return 0;
    let totalTasks = 0;
    let completedTasks = 0;
    weeks.forEach(w => {
      const taskList = w.tasks || [];
      totalTasks += taskList.length;
      completedTasks += taskList.filter(t => t.completed).length;
    });
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const getGroupedWeeks = () => {
    const total = weeks.length;
    const groups = {};
    weeks.forEach(w => {
      let phaseName = 'Phase 1: Core Fundamentals';
      const ratio = w.weekNumber / total;
      if (ratio > 0.35 && ratio <= 0.7) {
        phaseName = 'Phase 2: Core Engineering & Projects';
      } else if (ratio > 0.7) {
        phaseName = 'Phase 3: Production & Scaling';
      }
      
      if (!groups[phaseName]) groups[phaseName] = [];
      groups[phaseName].push(w);
    });
    return groups;
  };

  const getWeekProgress = (week) => {
    const taskList = week.tasks || [];
    if (taskList.length === 0) return 0;
    const completed = taskList.filter(t => t.completed).length;
    return Math.round((completed / taskList.length) * 100);
  };

  const handleContinueLearning = () => {
    if (!weeks || weeks.length === 0) return;
    const firstIncomplete = weeks.find(w => {
      const completedTasks = (w.tasks || []).filter(t => t.completed).length;
      return completedTasks < (w.tasks || []).length;
    });
    setSelected(firstIncomplete || weeks[0]);
  };

  // Helper to parse checklist titles and output styled technical icon/tags strictly matching Dashboard
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

  const renderSingleDayModal = () => {
    if (!selectedDay) return null;
    const embedUrl = getYouTubeEmbedUrl(selectedDay.videoLink);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-card border border-border shadow-lg rounded-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
          >
            <div className="p-5 md:p-7 flex-1 overflow-y-auto no-scrollbar">
              <button
                onClick={() => setSelectedDay(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors z-10 shadow-sm cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="text-[10px] font-bold tracking-wider text-primary uppercase mb-1.5">Day {selectedDay.dayNumber}</div>
              <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight pr-12">{selectedDay.topic}</h2>
              <h3 className="text-sm font-semibold text-muted-foreground mb-5 pr-12">{selectedDay.subtopic}</h3>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-6 text-foreground/80 font-medium leading-relaxed text-sm">
                  <p>{selectedDay.description}</p>
                </div>

                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-black border border-border/80 shadow-inner">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#34A853] mb-3">
                      <Video size={14} /> Video Lesson
                    </h4>

                    {embedUrl ? (
                      <div className="space-y-3">
                        <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/50 border border-white/10">
                          <iframe
                            width="100%" height="100%"
                            src={embedUrl}
                            title="YouTube Lesson"
                            className="border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <button
                          onClick={() => window.open(`https://www.youtube.com/results?search_query=${selectedDay.topic}+${roadmap?.targetRole || ''}+tutorial`, '_blank')}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-muted/30 hover:bg-primary/10 text-muted-foreground hover:text-primary text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all border border-transparent hover:border-primary/20 cursor-pointer"
                        >
                          <Play size={10} /> Video not working? Search instead
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-lg flex flex-col items-center justify-center bg-muted/40 border border-border/60 mb-4 p-5 text-center group">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <Play size={18} className="text-primary ml-0.5" />
                        </div>
                        <p className="text-xs text-foreground font-bold mb-1">Direct Video Unavailable</p>
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mb-4 leading-none">
                          {selectedDay.videoLink?.includes('results') ? 'AI suggested a search fallback' : 'Video might be restricted'}
                        </p>
                        <button
                          onClick={() => window.open(`https://www.youtube.com/results?search_query=${selectedDay.topic}+${roadmap?.targetRole || ''}+tutorial`, '_blank')}
                          className="px-4 py-2 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer"
                        >
                          Search Now
                        </button>
                      </div>
                    )}

                    {selectedDay.videoLink ? (
                      <a
                        href={selectedDay.videoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#34A853]/10 hover:bg-[#34A853]/25 border border-[#34A853]/30 text-[#34A853] text-xs font-bold rounded-xl transition-all active:scale-95 group mt-3"
                      >
                        <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        Watch on YouTube
                      </a>
                    ) : (
                      <div className="text-[10px] text-muted-foreground font-bold uppercase text-center py-2">No link available</div>
                    )}
                  </div>

                  {selectedDay.docLink && (
                    <a
                      href={selectedDay.docLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary hover:text-primary/90 transition-colors group shadow-inner"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen size={18} />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider leading-none mb-1">Official Guide</div>
                          <div className="text-sm font-bold">Read Docs</div>
                        </div>
                      </div>
                      <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="animate-spin text-primary" size={32} /></div>;

  if (weeks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
          <Map size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2 font-sans tracking-tight">No Roadmap Yet</h2>
        <p className="text-xs text-muted-foreground font-medium mb-6">Your personalized career path hasn't been mapped. Generate one now using AI.</p>
        <button
          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
          onClick={generateRoadmap}
          disabled={generating}
        >
          {generating ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : <><Brain size={14} /> Generate AI Roadmap</>}
        </button>
      </div>
    );
  }

  const groupedWeeks = getGroupedWeeks();

  return (
    <div className="animate-in fade-in duration-500 space-y-6 pb-8 pr-1 font-sans selection:bg-primary/20 selection:text-primary relative">
      
      {/* Pilot Command Bar (Matches Dashboard layout exactly) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/80 p-6 rounded-2xl shadow-sm relative overflow-hidden shrink-0">
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Map size={22} className="text-primary" /> Learning Journey
          </h1>
          <p className="text-xs font-semibold text-muted-foreground flex flex-wrap items-center gap-2">
            <span className="text-primary font-semibold uppercase tracking-wider">{user?.targetRole || 'Software Engineer'} Blueprint</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{weeks.length} modules sequence</span>
          </p>
        </div>
      </div>

      {/* Main content viewport */}
      <div className="relative rounded-2xl border border-border bg-card shadow-sm">
        <div className="no-scrollbar">
          
          {/* ── OVERVIEW GRID MODE (selected is null) ──────────────────────────── */}
          {!selected ? (
            <div className="p-6 space-y-8 animate-in fade-in duration-300">
              
              {/* Header dashboard stats */}
              <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Award size={100} />
                </div>
                <div className="space-y-2 text-center md:text-left flex-1">
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Your Career Blueprint Map</h3>
                  <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                    Below is the chronological sequence of learning milestones drafted by your AI Career Co-Pilot. Track your weekly target checklists and git challenges.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0 w-full md:w-auto">
                  <div className="text-center bg-muted/40 border border-border/60 px-5 py-3 rounded-2xl w-full sm:w-28 shadow-sm">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block leading-none mb-1.5">Completeness</span>
                    <span className="text-base font-bold text-primary">{calculateOverallProgress()}%</span>
                  </div>
                  <button
                    onClick={handleContinueLearning}
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlayCircle size={14} /> Continue Study Path
                  </button>
                </div>
              </div>

              {/* Phases grid lists */}
              {Object.keys(groupedWeeks).map(phaseName => (
                <div key={phaseName} className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2 pl-1 border-l-2 border-primary/50">
                    <Sparkles size={14} className="text-[#FBBC05]" />
                    {phaseName}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedWeeks[phaseName].map(week => {
                      const weekProgress = getWeekProgress(week);
                      const isWeekDone = weekProgress === 100 && (week.tasks || []).length > 0;
                      const isWeekActive = weekProgress > 0 && weekProgress < 100;
                      
                      return (
                        <div
                          key={week.weekNumber}
                          onClick={() => { setSelected(week); }}
                          className="group bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className={clsx(
                                "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                isWeekDone
                                  ? "bg-[#34A853]/10 border-[#34A853]/20 text-[#34A853]"
                                  : "bg-[#4285F4]/10 border-[#4285F4]/20 text-primary"
                              )}>
                                Module {week.weekNumber}
                              </span>
                              {isWeekDone ? (
                                <CheckCircle2 size={16} className="text-[#34A853]" />
                              ) : isWeekActive ? (
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              ) : (
                                <Lock size={12} className="text-muted-foreground/50" />
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                                {week.topic}
                              </h4>
                              <p className="text-xs text-muted-foreground/80 font-medium line-clamp-2 leading-relaxed mt-1">
                                {week.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 space-y-3 pt-3 border-t border-border/40">
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className={clsx(
                                  "h-full rounded-full transition-all duration-500",
                                  isWeekDone ? "bg-[#34A853]" : "bg-primary"
                                )}
                                style={{ width: `${weekProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                              <span>{week.estimatedHours}h Estimated</span>
                              <span>{weekProgress}% Done</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            
            // ── DETAILED WORKSPACE MODE (selected is NOT null) ───────────────────
            <div className="animate-in fade-in duration-300">
              
              {/* Workspace navigation Header */}
              <div className="p-5 md:p-6 border-b border-border/50 bg-card sticky top-0 z-10">
                <button 
                  onClick={() => { setSelected(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4285F4] mb-3 hover:underline cursor-pointer"
                >
                  <ArrowLeft size={13} strokeWidth={3} /> Back to Learning Blueprint Map
                </button>

                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#4285F4]/10 border border-[#4285F4]/20 text-primary">
                        WEEK {selected.weekNumber} DETAIL MODULE
                      </span>
                      {getWeekProgress(selected) === 100 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853] flex items-center gap-1">
                          <CheckCircle2 size={10} /> Completed
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight">{selected.topic}</h2>
                    <p className="text-xs text-muted-foreground font-semibold mt-1 leading-relaxed max-w-3xl">{selected.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-muted/40 border border-border/60 px-4 py-2 rounded-2xl text-center">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block leading-none mb-1">Time Goal</span>
                      <span className="text-sm font-bold text-foreground">{selected.estimatedHours} Hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace columns layout (Fully responsive column stack) */}
              <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left side column: 7-Day Plan (takes 2/3 space on large viewports) */}
                <div className="lg:col-span-2 space-y-6">
                  {selected.days && selected.days.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground px-1">
                        <BookOpen size={15} className="text-[#4285F4]" />
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">7-Day Learning Blueprint</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selected.days.map((day, di) => (
                          <div
                            key={di}
                            onClick={() => { setSelectedDay(day); }}
                            className="group relative bg-card border border-border/80 rounded-2xl p-5 hover:border-primary/40 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-center mb-3">
                                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#4285F4] bg-[#4285F4]/10 px-2 py-0.5 rounded-lg">
                                  Day {day.dayNumber}
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                              </div>
                              <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors leading-snug">
                                {day.topic}
                              </h4>
                              <p className="text-xs text-muted-foreground/80 font-medium line-clamp-2 leading-relaxed mb-4">
                                {day.subtopic || day.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-primary mt-auto">
                              <PlayCircle size={14} /> Explore Lesson Materials
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side column: Quest boxes & Checklist checklist */}
                <div className="space-y-6">
                  
                  {/* Skills Box */}
                  <div className="bg-card border border-border/80 border-t-4 border-t-[#FBBC05] rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Target Competencies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(selected.skills || []).map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project quest verify */}
                  {selected.expectedRepoName && (
                    <div className="bg-card border border-border/80 border-t-4 border-t-[#4285F4] rounded-2xl p-5 shadow-sm overflow-hidden relative">
                      <div className="flex items-center gap-2 mb-3">
                        <Github size={16} className="text-[#4285F4]" />
                        <h4 className="text-xs font-bold text-[#4285F4] uppercase tracking-wider">GitHub Repository Challenge</h4>
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold leading-relaxed mb-4">
                        Deploy your weekly progress by creating a public GitHub repository named exactly:
                      </p>
                      <div className="bg-muted border border-border/80 px-3 py-2.5 rounded-xl font-mono text-xs text-foreground font-bold mb-4 break-all flex items-center justify-between">
                        <span>{selected.expectedRepoName}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selected.expectedRepoName);
                            toast.success('Repository name copied!');
                          }}
                          className="text-[10px] text-primary hover:underline font-sans font-bold uppercase tracking-wide cursor-pointer pl-2 shrink-0 border-none bg-transparent"
                        >
                          Copy
                        </button>
                      </div>
                      {selected.isRepoVerified ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#34A853] bg-[#34A853]/10 py-3 rounded-xl border border-[#34A853]/20">
                          <Check size={16} strokeWidth={3} /> Repository Verified & Synced
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(selected.weekNumber)}
                          disabled={verifying}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[#4285F4] hover:bg-[#357AE8] text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none cursor-pointer border-none"
                        >
                          {verifying ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                          {verifying ? 'Checking Repository...' : 'Verify on GitHub'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Task checklist (Themed layout with category tags like Dashboard) */}
                  {selected.tasks && selected.tasks.length > 0 && (
                    <div className="bg-card border border-border/80 border-t-4 border-t-[#34A853] rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Terminal size={15} className="text-[#34A853]" />
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tasks Milestone Checklist</h4>
                      </div>
                      
                      <div className="space-y-2.5">
                        {selected.tasks.map((task, ti) => {
                          const weekIndex = weeks.findIndex(w => w.weekNumber === selected.weekNumber);
                          const data = getTaskTag(task.text);
                          const Icon = data.icon;
                          
                          return (
                            <div
                              key={ti}
                              onClick={() => toggleTask(weekIndex, ti)}
                              className={clsx(
                                "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all duration-200",
                                task.completed 
                                  ? "bg-[#34A853]/5 border-[#34A853]/20" 
                                  : "bg-muted/50 border-border/50 hover:bg-muted/70 shadow-sm"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${data.color}`}>
                                  <Icon size={14} />
                                </div>
                                <span className={clsx(
                                  "text-xs font-semibold truncate leading-normal",
                                  task.completed ? "text-muted-foreground line-through opacity-70" : "text-foreground/90"
                                )}>
                                  {task.text}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0 pl-2">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${data.color}`}>
                                  {data.tag}
                                </span>
                                {task.completed ? (
                                  <div className="w-5 h-5 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center text-[#34A853]">
                                    <Check size={10} strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground/30 hover:border-primary/50 hover:text-primary transition-all">
                                    <Play size={8} fill="currentColor" className="ml-0.5" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {renderSingleDayModal()}
    </div>
  );
}
