import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, GitBranch, Brain, Users, Rocket, Check, Sparkles, Clock, Zap
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function PlatformTour({ isOpen, onClose }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentStep, setCurrentStep] = useState(0);

  // If closed or not open, render nothing
  if (!isOpen) return null;

  const colors = {
    modalBg: 'bg-card border border-border shadow-xl',
    text: 'text-foreground',
    mutedText: 'text-muted-foreground',
    innerCard: 'bg-muted border border-border',
    gradientText: isDark 
      ? 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-[#1A73E8] via-[#EA4335] via-[#FF9100] to-[#00C853] bg-clip-text text-transparent',
  };

  const steps = [
    {
      title: "Welcome to CampusPath AI",
      subtitle: "Let's take a quick 1-minute visual tour to see how to use the platform to land your dream job.",
      icon: Sparkles,
      color: "text-[#4285F4]",
      bg: "bg-[#4285F4]/10",
      border: "border-[#4285F4]/20",
      renderVisual: () => (
        <div className="flex flex-col items-center justify-center h-full relative p-6 text-center">
          {/* Animated rings */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#4285F4]/30"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-dotted border-[#EA4335]/40"
            />
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4285F4] via-[#EA4335] to-[#FBBC05] flex items-center justify-center shadow-lg shadow-[#4285F4]/20"
            >
              <Zap size={28} className="text-white" fill="currentColor" />
            </motion.div>
          </div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#4285F4] mt-6 animate-pulse">
            Ready to Accelerate
          </p>
        </div>
      )
    },
    {
      title: "1. Link GitHub & Scan DNA",
      subtitle: "Connect your GitHub. Our parser scans your repositories to analyze framework weights, commit patterns, and code quality, building your pre-existing Developer DNA.",
      icon: GitBranch,
      color: "text-[#4285F4]",
      bg: "bg-[#4285F4]/10",
      border: "border-[#4285F4]/20",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col justify-between p-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4285F4]">DNA Analyzer Engine</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#4285F4]/10 text-[#4285F4] animate-pulse">Scanning repos...</span>
          </div>

          <div className="space-y-2.5 my-3">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border"
            >
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-[#34A853]" />
                <span className="text-[10px] font-mono font-bold truncate max-w-[150px]">ecommerce-backend</span>
              </div>
              <span className="text-[9px] text-[#34A853] font-bold">Audited (100%)</span>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-border"
            >
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-[#4285F4]" />
                <span className="text-[10px] font-mono font-bold truncate max-w-[150px]">react-weather-app</span>
              </div>
              <span className="text-[9px] text-[#4285F4] font-bold">Audited (100%)</span>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-background/60 border border-[#FBBC05]/40"
            >
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-[#FBBC05] animate-spin" />
                <span className="text-[10px] font-mono font-bold truncate max-w-[150px]">serverless-auth</span>
              </div>
              <span className="text-[9px] text-[#FBBC05] font-bold animate-pulse">Parsing...</span>
            </motion.div>
          </div>

          <div className="pt-2 border-t border-border/40 flex justify-between text-[9px] font-mono font-bold">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" /> TS (65%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" /> JS (25%)</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" /> Go (10%)</span>
          </div>
        </div>
      )
    },
    {
      title: "2. Generate AI Roadmap Plan",
      subtitle: "Gemini AI evaluates your parsed DNA against your target engineering role, automatically skipping topics you have already mastered, and schedules a week-by-week node-graph roadmap.",
      icon: Brain,
      color: "text-[#EA4335]",
      bg: "bg-[#EA4335]/10",
      border: "border-[#EA4335]/20",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col justify-between p-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA4335]">AI Trajectory Map</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#EA4335]/10 text-[#EA4335]">MERN Track</span>
          </div>

          <div className="flex flex-col items-center gap-3 py-2 relative my-auto">
            <div className="absolute left-1/2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#34A853] via-[#4285F4] to-border/40 -translate-x-1/2" />
            
            {/* Node 1 */}
            <div className="relative z-10 flex items-center gap-2 bg-background/80 border border-[#34A853]/50 rounded-lg px-3 py-1.5 w-full max-w-[200px]">
              <div className="w-3.5 h-3.5 rounded-full bg-[#34A853] flex items-center justify-center text-[9px] text-white">✓</div>
              <div className="text-[9px] font-bold">
                <div className="text-foreground truncate max-w-[130px]">React State Hooks</div>
                <div className="text-muted-foreground text-[8px]">Skipped (GitHub Verified)</div>
              </div>
            </div>

            {/* Node 2 */}
            <div className="relative z-10 flex items-center gap-2 bg-background/80 border border-[#4285F4]/60 rounded-lg px-3 py-1.5 w-full max-w-[200px] animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full bg-[#4285F4] flex items-center justify-center text-[9px] text-white animate-pulse" />
              <div className="text-[9px] font-bold">
                <div className="text-foreground truncate max-w-[130px]">Docker Containerization</div>
                <div className="text-[#4285F4] text-[8px]">Active Node</div>
              </div>
            </div>

            {/* Node 3 */}
            <div className="relative z-10 flex items-center gap-2 bg-background/80 border border-border rounded-lg px-3 py-1.5 w-full max-w-[200px] opacity-50">
              <div className="w-3.5 h-3.5 rounded-full bg-border flex items-center justify-center text-[9px] text-white" />
              <div className="text-[9px] font-bold">
                <div className="text-foreground truncate max-w-[130px]">CI/CD Pipelines</div>
                <div className="text-muted-foreground text-[8px]">Locked Node</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Pomodoro Focus Rooms",
      subtitle: "Enter real-time WebSocket study rooms, set Pomodoro timers, share notes, and code alongside developers working on similar milestones to boost execution.",
      icon: Users,
      color: "text-[#FBBC05]",
      bg: "bg-[#FBBC05]/10",
      border: "border-[#FBBC05]/20",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col justify-between p-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FBBC05]">Focus Room #102</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#FBBC05]/10 text-[#FBBC05] animate-pulse">4 Online</span>
          </div>

          <div className="flex gap-4 items-center justify-center my-auto">
            {/* Simple Timer Circle */}
            <div className="w-20 h-20 rounded-full border-2 border-[#FBBC05] flex flex-col items-center justify-center bg-background shadow-md shadow-[#FBBC05]/5">
              <span className="text-base font-black font-mono text-foreground">24:59</span>
              <span className="text-[7px] uppercase tracking-widest text-[#FBBC05] font-black">Focus</span>
            </div>

            {/* List of active avatars */}
            <div className="space-y-1.5 text-left">
              <span className="text-[8px] font-bold uppercase tracking-wide text-muted-foreground">Co-workers</span>
              <div className="flex gap-1.5">
                <div className="relative w-6 h-6 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[8px] text-[#4285F4] font-bold">
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#34A853] border border-background rounded-full" />
                  SK
                </div>
                <div className="relative w-6 h-6 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center justify-center text-[8px] text-[#EA4335] font-bold animate-pulse">
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#34A853] border border-background rounded-full" />
                  SS
                </div>
                <div className="relative w-6 h-6 rounded-full bg-[#34A853]/10 border border-[#34A853]/20 flex items-center justify-center text-[8px] text-[#34A853] font-bold">
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#34A853] border border-background rounded-full" />
                  MS
                </div>
              </div>
              <div className="text-[8px] text-[#34A853] font-bold flex items-center gap-1">
                <Clock size={10} /> Studying docker node
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Verify Code & Job Match",
      subtitle: "Commit your code to GitHub and click Verify. Our automated repo scanner tests your solution, awards verified skill badges, and lists active jobs matching your audited credentials.",
      icon: Rocket,
      color: "text-[#34A853]",
      bg: "bg-[#34A853]/10",
      border: "border-[#34A853]/20",
      renderVisual: () => (
        <div className="w-full h-full flex flex-col justify-between p-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#34A853]">AST Scanner & Jobs</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#34A853]/10 text-[#34A853] font-bold">Verified</span>
          </div>

          <div className="p-3 my-auto rounded-lg bg-background/60 border border-border/80 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-black text-foreground">Junior Cloud Architect</div>
                <div className="text-[8px] text-muted-foreground font-semibold">Google Cloud Platform</div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#34A853] flex items-center justify-center font-black text-[9px] text-[#34A853] bg-background">
                94%
              </div>
            </div>

            <div className="h-px bg-border/40" />

            <div className="flex flex-wrap gap-1">
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/10">React Verified</span>
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/10">REST API</span>
              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/10 font-mono">Docker</span>
            </div>
            
            <div className="text-[8px] text-muted-foreground font-bold flex gap-1 justify-center text-center">
              <span>✔ Code AST passed</span>
              <span>✔ 14/15 Test cases passed</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('campuspath_tour_completed', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Darkened backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`relative w-full max-w-2xl rounded-2xl border p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row gap-6 ${colors.modalBg} overflow-hidden`}
        >
          {/* Decorative Gradient blur element */}
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-[#4285F4]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-[#34A853]/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Close button */}
          <button 
            onClick={handleComplete}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10 outline-none"
          >
            <X size={18} />
          </button>

          {/* Left Column: Visual Showcase inside the Tour */}
          <div className={`w-full md:w-[240px] h-[180px] md:h-[220px] rounded-xl border flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner ${colors.innerCard}`}>
            {steps[currentStep].renderVisual()}
          </div>

          {/* Right Column: Information & Controls */}
          <div className="flex-1 flex flex-col justify-between min-h-[200px]">
            <div>
              {/* Step counter */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${steps[currentStep].bg} ${steps[currentStep].color}`}>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className={`text-[10px] font-bold text-muted-foreground`}>
                  Developer Acceleration Guide
                </span>
              </div>

              {/* Title & Description */}
              <h3 className={`text-xl sm:text-2xl font-black ${colors.text} leading-tight mb-2.5`}>
                {steps[currentStep].title}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${colors.mutedText} font-semibold font-sans`}>
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Stepper Controllers */}
            <div className="flex items-center justify-between pt-5 border-t border-border/40 mt-4">
              <button
                onClick={handleComplete}
                className={`text-xs font-bold text-muted-foreground hover:text-foreground transition-colors py-2`}
              >
                Skip Tour
              </button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className={`p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className={`px-4 py-2 bg-[#4285F4] hover:bg-[#357AE8] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-md`}
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
