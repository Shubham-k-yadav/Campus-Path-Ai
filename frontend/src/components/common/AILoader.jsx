import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Sparkles, Database, Shield, CheckCircle, Circle, RefreshCw, Terminal, GitBranch } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Initialize AI Core', desc: 'Connecting to Gemini Neural Network...', icon: Cpu },
  { id: 2, label: 'Profile Synthesis', desc: 'Extracting onboarding parameters & skill markers...', icon: Brain },
  { id: 3, label: 'GitHub DNA Scan', desc: 'Analyzing repository footprint & codebase languages...', icon: Database },
  { id: 4, label: 'Construct Curriculum', desc: 'Structuring weekly learning nodes & timelines...', icon: GitBranch },
  { id: 5, label: 'Inject Challenges', desc: 'Building repository verification benchmarks...', icon: Shield },
  { id: 6, label: 'Curate Resources', desc: 'Mapping official documentation & video guides...', icon: Sparkles },
  { id: 7, label: 'Finalizing Blueprint', desc: 'Synthesizing your personalized learning journey...', icon: CheckCircle }
];

const TERMINAL_LOGS = [
  'INITIALIZING SYSTEM CONNECT...',
  'GET /api/v1/gemini/handshake [200 OK]',
  'MODEL: gemini-3.5-flash-v1',
  'TEMP: 0.2 | TOP_P: 0.95',
  'RESOLVING CORE PROFILE TOKENS...',
  'EXTRACTING TARGET PATH OBJECTS...',
  'FETCHING GITHUB METADATA (API)...',
  'GITHUB FOOTPRINT VERIFIED.',
  'RUNNING CLUSTERING ALGORITHM ON REPOS...',
  'LANGUAGES IDENTIFIED: JS, TS, Python, Go...',
  'MATCHING CAREER BENCHMARKS...',
  'CONSTRUCTING ROADMAP NODE INDEX...',
  'GENERATING WEEK 1: Core Fundamentals...',
  'GENERATING WEEK 2: Advanced Design Patterns...',
  'GENERATING WEEK 3: Database & Production Prep...',
  'GENERATING WEEK 4: Scaling & DevOps Setup...',
  'MAPPING YOUTUBE API TO LESSON TOPICS...',
  'CURATING OFFICIAL DOCUMENTATION LINKS...',
  'COMPUTING EXPECTED REPO NAME MATCHES...',
  'GENERATING VERIFICATION CHECKSUM...',
  'ROADMAP DATA STRUCTURE: VALIDATED',
  'COMPRESSING PAYLOAD FOR TRANSLATION...',
  'SUCCESS: PROFILE ONBOARDING COMPLETE.',
  'COMPILING BLUEPRINT ENGINE RENDERING...'
];

export default function AILoader({ targetRole = 'Software Engineer', githubUsername = '' }) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [logs, setLogs] = useState([]);
  const [logIdx, setLogIdx] = useState(0);

  // Auto-advance steps up to step 6 (index 5)
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < 5) return prev + 1; // Stay on "Curate Resources" until finished
        return prev;
      });
    }, 2800);

    return () => clearInterval(stepInterval);
  }, []);

  // Simulating terminal log outputs
  useEffect(() => {
    const logInterval = setInterval(() => {
      setLogIdx((prevIdx) => {
        const nextIdx = (prevIdx + 1) % TERMINAL_LOGS.length;
        setLogs((prevLogs) => {
          const updated = [...prevLogs, TERMINAL_LOGS[prevIdx]];
          // Keep last 6 logs
          if (updated.length > 6) updated.shift();
          return updated;
        });
        return nextIdx;
      });
    }, 900);

    return () => clearInterval(logInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] bg-[#070913] text-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden font-sans select-none">
      
      {/* Background Futuristic Grid Lines & Glowing Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[#4285F4]/30 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-[#34A853]/20 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center relative z-10">
        
        {/* Left Column: Holographic Glowing Spinner/Core & Info */}
        <div className="flex-1 flex flex-col items-center text-center lg:text-left lg:items-start space-y-6">
          
          {/* Neural Network Glowing Icon Sphere */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Spinning glowing outer border */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#4285F4]/30"
            />
            {/* Orbiting particles */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-dotted border-[#34A853]/40"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#34A853] shadow-md shadow-[#34A853]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#4285F4] shadow-md shadow-[#4285F4]" />
            </motion.div>

            {/* Glowing Inner Core */}
            <motion.div 
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#4285F4]/20 via-[#EA4335]/20 to-[#FBBC05]/20 border border-white/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(66,133,244,0.15)]"
            >
              <div className="absolute inset-0 rounded-full bg-[#4285F4]/5 filter blur-md" />
              <Brain className="w-10 h-10 text-[#4285F4] relative z-10 animate-pulse" />
            </motion.div>
          </div>

          {/* Heading Description */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#4285F4]/10 border border-[#4285F4]/30 text-[#4285F4] leading-none">
              <Sparkles size={11} className="animate-spin text-[#FBBC05]" /> AI Engine Active
            </span>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white/90 to-[#9AA0A6] bg-clip-text text-transparent">
              Mapping your <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent">{targetRole}</span> career path
            </h2>
            
            <p className="text-xs sm:text-sm text-[#9AA0A6] max-w-md font-semibold leading-relaxed">
              {githubUsername 
                ? `Syncing repositories for "${githubUsername}" and generating a personalized, Git-verified roadmap blueprint.`
                : `Analyzing skill parameters and constructing a custom week-by-week curriculum.`
              }
            </p>
          </div>

          {/* Interactive Live Status Indicator */}
          <div className="w-full max-w-sm flex items-center gap-3 p-3.5 rounded-2xl bg-[#0F1222] border border-white/5 shadow-inner">
            <RefreshCw size={15} className="animate-spin text-[#4285F4] shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[10px] font-black text-[#5F6368] uppercase tracking-wider">Current Operation</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs font-bold text-[#F8FAFC] truncate"
                >
                  {STEPS[currentStepIdx].desc}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Steps Progress Checklist & Live Terminal Output */}
        <div className="w-full lg:w-[420px] flex flex-col gap-5 shrink-0">
          
          {/* Steps Progress Check List */}
          <div className="p-5 rounded-2xl bg-[#0F1222] border border-white/5 shadow-md flex flex-col gap-4">
            <div className="text-[10px] font-black text-[#5F6368] uppercase tracking-widest border-b border-white/5 pb-2.5">
              Synthesis Progression
            </div>
            
            <div className="flex flex-col gap-3">
              {STEPS.map((s, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                const Icon = s.icon;
                
                return (
                  <div 
                    key={s.id} 
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      isCompleted ? 'opacity-50' : isActive ? 'opacity-100 scale-[1.02]' : 'opacity-30'
                    }`}
                  >
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[#34A853]/10 border border-[#34A853]/40 flex items-center justify-center text-[#34A853] shrink-0 shadow-sm shadow-[#34A853]/5">
                        <CheckCircle size={12} strokeWidth={3} />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/60 flex items-center justify-center text-[#4285F4] shrink-0 animate-pulse shadow-sm shadow-[#4285F4]/5">
                        <Circle size={10} fill="currentColor" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#5F6368] shrink-0">
                        <Circle size={8} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className={isActive ? 'text-[#4285F4]' : isCompleted ? 'text-[#34A853]' : 'text-[#5F6368]'} />
                        <span className={`text-[11px] font-black uppercase tracking-wider ${
                          isActive ? 'text-white' : 'text-[#F8FAFC]'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulated Terminal Output box */}
          <div className="p-4 rounded-2xl bg-[#090B15] border border-white/5 shadow-inner flex flex-col font-mono text-[9px]">
            <div className="flex items-center justify-between text-[#5F6368] border-b border-white/5 pb-2 mb-2 font-bold select-none">
              <span className="flex items-center gap-1.5 uppercase tracking-wide">
                <Terminal size={10} className="text-[#FBBC05]" /> Console Logs
              </span>
              <span>LIVE</span>
            </div>
            
            <div className="space-y-1 text-left min-h-[90px] font-semibold text-[#80868B] select-text selection:bg-[#4285F4]/30 selection:text-white overflow-hidden">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={`${i}-${log}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`truncate ${
                      log.includes('SUCCESS') ? 'text-[#34A853]' : 
                      log.includes('INITIALIZING') ? 'text-[#4285F4]' :
                      log.includes('MODEL') ? 'text-[#FBBC05]' : 
                      'text-[#80868B]'
                    }`}
                  >
                    <span className="text-[#3c4043] select-none mr-1.5">&gt;</span>
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
