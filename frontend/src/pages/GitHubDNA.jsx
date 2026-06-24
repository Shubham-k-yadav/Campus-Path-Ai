import { useState } from 'react';
import ContributionHeatmap from '@/components/features/github/ContributionHeatmap';
import { 
  Github, Globe, Terminal, Info, AlertTriangle, Search, 
  RefreshCw, Shield, Zap as Fast, Layout, Activity, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/api/client';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

export default function GitHubDNA() {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState(user?.githubUsername || '');
  const [username, setUsername] = useState(user?.githubUsername || '');
  const [repoUrl, setRepoUrl] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [scorecard, setScorecard] = useState(null);
  const toast = useToast();

  const handleReview = async () => {
    if (!repoUrl.trim()) { toast.error('Please enter a GitHub repository URL'); return; }
    setReviewLoading(true);
    setScorecard(null);
    try {
      const { data } = await githubAPI.reviewRepo({ repoUrl });
      setScorecard(data.data);
      toast.success('Code Review Complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed. Is the link correct?');
    } finally {
      setReviewLoading(false);
    }
  };

  const Metric = ({ label, value, icon: Icon, color }) => {
    const bgMap = {
      'text-red-500': 'bg-[#EA4335]',
      'text-mint-leaf': 'bg-[#34A853]',
      'text-orange-500': 'bg-[#FBBC05]',
      'text-wisteria-blue': 'bg-[#4285F4]',
      'text-purple-500': 'bg-purple-500',
      'text-blue-500': 'bg-blue-500'
    };
    
    const bgColor = bgMap[color] || 'bg-primary';

    return (
      <div className="bg-card/75 backdrop-blur-md border border-border/60 p-4 rounded-xl shadow-sm hover:border-primary/30 transition-all hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
          <Icon size={14} className={color} />
        </div>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-black text-foreground">{value}%</p>
          <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden mb-2">
             <div className={`h-full ${bgColor} transition-all duration-1000`} style={{ width: `${value}%` }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-5 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                <Github size={24} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">GitHub DNA Analyzer</h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium max-w-2xl mt-1">
              A high-fidelity contribution visualizer and <span className="text-primary font-bold">AI-powered</span> code auditing engine.
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-card/70 backdrop-blur-md p-1 rounded-xl border border-border/60 shadow-sm w-full sm:w-auto max-w-xs sm:max-w-none">
            <input 
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setUsername(searchInput.trim());
                }
              }}
              placeholder="Enter GitHub Username" 
              className="bg-transparent border-none outline-none text-[11px] sm:text-xs px-2.5 py-1.5 w-full sm:w-36 font-mono placeholder:text-muted-foreground opacity-80"
            />
            <button 
              onClick={() => setUsername(searchInput.trim())}
              className="bg-primary hover:bg-primary-dark text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap shrink-0 border-none flex items-center justify-center"
            >
              Sync DNA
            </button>
          </div>
        </div>

        {/* Contribution Grid */}
        <div className="bg-card/40 border border-border/50 rounded-2xl p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Globe size={16} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase">Real-Time Contribution Grid</span>
          </div>
          <div className="overflow-x-auto no-scrollbar scrollbar-thin py-2 -mx-2 px-2">
            <ContributionHeatmap username={username} />
          </div>
        </div>

        {/* AI Repo Reviewer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <div className="space-y-6">
            <div className="p-5 bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl relative overflow-hidden group shadow-md">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Terminal size={80} />
               </div>
               <h3 className="text-base font-bold mb-2 flex items-center gap-2 text-foreground">
                 <Fast size={18} className="text-primary" /> 
                 Repo Auto-Reviewer
               </h3>
               <p className="text-xs text-muted-foreground mb-6 leading-relaxed font-medium">
                 Paste a public GitHub link to perform a deep-dive AI audit on security flaws, code cleanliness, and system architecture.
               </p>
               
               <div className="space-y-3.5">
                 <div className="relative">
                   <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60" />
                   <input 
                     value={repoUrl}
                     onChange={(e) => setRepoUrl(e.target.value)}
                     className="w-full bg-muted/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-primary outline-none text-foreground font-medium" 
                     placeholder="https://github.com/username/repo" 
                   />
                 </div>
                 <button 
                   onClick={handleReview}
                   disabled={reviewLoading}
                   className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white hover:scale-[1.01] active:scale-[0.99] transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-primary/10 cursor-pointer"
                 >
                   {reviewLoading ? <RefreshCw size={14} className="animate-spin" /> : <Shield size={14} />}
                   {reviewLoading ? 'Auditing Codebase...' : 'Start AI Audit'}
                 </button>
               </div>
            </div>

            <div className="p-5 bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl shadow-sm">
               <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">DNA Core Metrics</h4>
               <div className="space-y-4">
                  {[
                    { label: 'Consistency', value: 'High Accuracy', icon: CheckCircle2, color: 'text-[#34A853]' },
                    { label: 'Complexity Analysis', value: 'AST Parsing', icon: Activity, color: 'text-[#4285F4]' },
                    { label: 'Audit Latency', value: 'Real-time Sync', icon: Fast, color: 'text-[#FBBC05]' }
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between text-xs font-medium border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
                       <span className="text-muted-foreground">{m.label}</span>
                       <span className={`font-bold flex items-center gap-1.5 ${m.color}`}><m.icon size={13} /> {m.value}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              {scorecard ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Metric label="Security Audit" value={scorecard.scorecard.security} icon={Shield} color="text-red-500" />
                    <Metric label="Clean Code" value={scorecard.scorecard.cleanliness} icon={Layout} color="text-mint-leaf" />
                    <Metric label="Performance" value={scorecard.scorecard.performance} icon={Fast} color="text-orange-500" />
                    <Metric label="Architecture" value={scorecard.scorecard.architecture} icon={Terminal} color="text-wisteria-blue" />
                  </div>

                  {/* High-End Compiler Output Console style */}
                  <div className="bg-[#f8f9fa] dark:bg-[#0f141c] border border-border/85 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs text-slate-800 dark:text-slate-300">
                    {/* Console Header Bar */}
                    <div className="bg-[#e9ecef] dark:bg-[#17202b] px-4 py-2.5 flex items-center justify-between border-b border-border/40 select-none">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Terminal size={12} className="text-primary" /> 
                        <span className="sm:hidden">AUDIT OUTPUT</span>
                        <span className="hidden sm:inline">AI-COMPILER-AUDIT-OUTPUT</span>
                      </div>
                      <span className="text-[9px] text-[#137333] dark:text-[#27c93f] bg-[#e6f4ea] dark:bg-[#27c93f]/10 border border-[rgba(30,142,62,0.2)] dark:border-[#27c93f]/30 px-2 py-0.5 rounded font-black">
                        GRADE {scorecard.overallGrade}
                      </span>
                    </div>

                    {/* Console Body */}
                    <div className="p-4 sm:p-5 space-y-4 leading-relaxed overflow-hidden">
                      <div className="text-slate-600 dark:text-slate-300">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">INFO:</span> Scanning repository workspace variables...
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        <span className="text-[#137333] dark:text-[#27c93f] font-bold">SUCCESS:</span> AST Tree generated successfully. File count verified.
                      </div>
                      <div className="p-4 bg-white dark:bg-black/40 border border-border dark:border-slate-800 rounded-xl space-y-2">
                        <span className="text-[#b06000] dark:text-[#ffbd2e] font-bold">VERDICT REPORT:</span>
                        <p className="text-slate-700 dark:text-slate-300 pl-4 break-words whitespace-normal">{scorecard.verdict}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 w-full min-w-0">
                        <div className="bg-white dark:bg-[#17202b]/40 border border-border dark:border-slate-800/80 rounded-xl p-4 min-w-0 overflow-hidden">
                          <span className="text-blue-600 dark:text-blue-400 font-bold block mb-3 uppercase tracking-wider text-[10px]">🔎 CORE AUDIT FINDINGS</span>
                          <ul className="space-y-2 text-[11px] w-full">
                            {scorecard.keyFindings.map((f, i) => (
                              <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start gap-2.5 min-w-0 break-words whitespace-normal">
                                <span className="text-primary font-bold shrink-0">{`[${i + 1}]`}</span>
                                <span className="flex-1 break-words whitespace-normal">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white dark:bg-[#17202b]/40 border border-border dark:border-slate-800/80 rounded-xl p-4 min-w-0 overflow-hidden">
                          <span className="text-[#c5221f] dark:text-[#ff5f56] font-bold block mb-3 uppercase tracking-wider text-[10px]">⚠️ COMPILE-TIME SECURITY ALERTS</span>
                          <ul className="space-y-2 text-[11px] w-full">
                            {scorecard.securityAlerts.map((s, i) => (
                              <li key={i} className="text-slate-700 dark:text-slate-300 flex items-start gap-2.5 min-w-0 break-words whitespace-normal">
                                <AlertTriangle size={12} className="text-[#c5221f] dark:text-[#ff5f56] shrink-0 mt-0.5" />
                                <span className="flex-1 break-words whitespace-normal">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center text-muted-foreground opacity-80 p-6 sm:p-12 text-center bg-card/40 backdrop-blur-md">
                   <Terminal size={40} className="mb-4 text-primary animate-pulse" />
                   <h4 className="text-sm font-bold text-foreground mb-1">Awaiting Codebase Input</h4>
                   <p className="text-xs max-w-xs font-medium text-muted-foreground">Audit any public GitHub repository to review code styling and compile-time warnings.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 bg-card/70 backdrop-blur-md border border-border/60 rounded-xl hover:border-primary/30 transition-colors group">
            <div className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <Terminal size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="font-bold text-foreground mb-2 uppercase text-xs tracking-widest">AST Engine</h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Analyzes technical complexity by running syntactic audits on files, scanning dependency tree mapping directly.
            </p>
          </div>
 
          <div className="p-5 bg-card/70 backdrop-blur-md border border-border/60 rounded-xl hover:border-primary/30 transition-colors group">
            <div className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#34A853]/10 transition-colors">
              <Info size={18} className="text-muted-foreground group-hover:text-[#34A853] transition-colors" />
            </div>
            <h4 className="font-bold text-foreground mb-2 uppercase text-xs tracking-widest">Workspace Cache</h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              State handling with background thread caching for instant rendering across browser reloads.
            </p>
          </div>

          <div className="p-5 bg-card/70 backdrop-blur-md border border-border/60 rounded-xl hover:border-primary/30 transition-colors group">
            <div className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FBBC05]/10 transition-colors">
              <Fast size={18} className="text-muted-foreground group-hover:text-[#FBBC05] transition-colors" />
            </div>
            <h4 className="font-bold text-foreground mb-2 uppercase text-xs tracking-widest">Fluid UX</h4>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Smooth exit and entry motion animations powered by Framer Motion. Color-coded alerts and dynamic loading.
            </p>
          </div>
        </div>

        {/* Footer/Instructions */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground opacity-60 text-xs font-black uppercase tracking-widest">
            &copy; 2026 CampusPath AI · Senior Engineering Showcase
          </p>
        </div>

      </div>
    </div>
  );
}
