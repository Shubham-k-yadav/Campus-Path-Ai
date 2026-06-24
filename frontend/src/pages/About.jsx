import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Target, Zap, ArrowRight, Code2, Users, Rocket, Brain, GitBranch, ShieldCheck, Check, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const TECH = [
  { name: 'React 19', category: 'Frontend', logo: 'react' },
  { name: 'Vite', category: 'Frontend', logo: 'vite' },
  { name: 'Tailwind CSS v4', category: 'Frontend', logo: 'tailwind' },
  { name: 'Framer Motion', category: 'Frontend', logo: 'framer' },
  { name: 'Recharts', category: 'Frontend', logo: 'recharts' },
  { name: 'Node.js', category: 'Backend', logo: 'node' },
  { name: 'Express.js', category: 'Backend', logo: 'express' },
  { name: 'MongoDB', category: 'Backend', logo: 'mongodb' },
  { name: 'Gemini AI', category: 'AI', logo: 'gemini' },
  { name: 'GitHub API', category: 'Integration', logo: 'github' },
  { name: 'JWT Auth', category: 'Security', logo: 'jwt' },
];

const renderTechLogo = (logoName) => {
  switch (logoName) {
    case 'react':
      return (
        <svg viewBox="0 0 100 100" className="w-9 h-9 animate-[spin_20s_linear_infinite]" fill="none" stroke="#61DAFB" strokeWidth="2.5">
          <ellipse cx="50" cy="50" rx="8" ry="20" transform="rotate(0 50 50)" />
          <ellipse cx="50" cy="50" rx="8" ry="20" transform="rotate(60 50 50)" />
          <ellipse cx="50" cy="50" rx="8" ry="20" transform="rotate(120 50 50)" />
          <circle cx="50" cy="50" r="4.5" fill="#61DAFB" />
        </svg>
      );
    case 'vite':
      return (
        <svg viewBox="0 0 32 32" className="w-[30px] h-[30px]">
          <defs>
            <linearGradient id="vite-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#41D1FF" />
              <stop offset="100%" stopColor="#BD34FE" />
            </linearGradient>
            <linearGradient id="vite-bolt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC837" />
              <stop offset="100%" stopColor="#FF8008" />
            </linearGradient>
          </defs>
          <path d="M30 6L16 30L2 6h28z" fill="url(#vite-grad)" />
          <path d="M19 2L10 16h6l-3 11L24 12h-6l5-10z" fill="url(#vite-bolt)" />
        </svg>
      );
    case 'tailwind':
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#38BDF8">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 14.881 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 15.121 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C7.666 17.818 8.881 19 12 19c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 9.121 12 6.001 12z" />
        </svg>
      );
    case 'framer':
      return (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="url(#framer-grad)">
          <defs>
            <linearGradient id="framer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF007A" />
              <stop offset="50%" stopColor="#7B00FF" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>
          </defs>
          <path d="M0 0h24v12H12L0 0zm0 12h12l12 12H0V12z" />
        </svg>
      );
    case 'recharts':
      return (
        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#378ADD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      );
    case 'node':
      return (
        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px]" fill="#68A063">
          <path d="M12 2L2 7.8v11.4L12 22l10-5.8V7.8L12 2zm-1 14.7l-4.5-2.6v-5.2l4.5 2.6v5.2zm2 0V11.5l4.5-2.6v5.2l-4.5 2.6z" />
        </svg>
      );
    case 'express':
      return (
        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px]" fill="currentColor">
          <rect width="24" height="24" rx="6" fill="#3B3B3B" />
          <text x="12" y="17" fill="#FFFFFF" fontSize="9" fontWeight="black" fontFamily="monospace" textAnchor="middle">ex</text>
        </svg>
      );
    case 'mongodb':
      return (
        <svg viewBox="0 0 24 24" className="w-[34px] h-[34px]" fill="#47A248">
          <path d="M12 1.5c-.3 0-.5.2-.6.4C10.2 4.7 8 10 8 13.5c0 2.5 1.8 4.5 4 4.5s4-2 4-4.5c0-3.5-2.2-8.8-3.4-11.6-.1-.2-.3-.4-.6-.4zM12 17c-1.7 0-3-1.3-3-3 0-2.2 1.7-6 3-9.2 1.3 3.2 3 7 3 9.2 0 1.7-1.3 3-3 3z" />
          <path d="M12 19v3.5c0 .3.2.5.5.5s.5-.2.5-.5V19h-1z" />
        </svg>
      );
    case 'gemini':
      return (
        <svg viewBox="0 0 24 24" className="w-[34px] h-[34px]" fill="url(#gemini-sparkle-tech)">
          <defs>
            <linearGradient id="gemini-sparkle-tech" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9BC5FF" />
              <stop offset="50%" stopColor="#2F80ED" />
              <stop offset="100%" stopColor="#9B51E0" />
            </linearGradient>
          </defs>
          <path d="M12 2a1 1 0 00-1 .9C10.5 7.6 7.6 10.5 2.9 11a1 1 0 000 2c4.7.5 7.6 3.4 8.1 8.1a1 1 0 002 0c.5-4.7 3.4-7.6 8.1-8.1a1 1 0 000-2c-4.7-.5-7.6-3.4-8.1-8.1A1 1 0 0012 2z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px]" fill="currentColor">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
        </svg>
      );
    case 'jwt':
      return (
        <svg viewBox="0 0 24 24" className="w-[30px] h-[30px]" fill="none" stroke="#A32D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="2.5" fill="#A32D2D" />
          <path d="M12 13.5V17" strokeWidth="3" />
        </svg>
      );
    default:
      return null;
  }
};

const STEPS = [
  {
    step: '01',
    tab: '1. GitHub DNA',
    title: 'Scan & Audit Your Code DNA',
    desc: 'Connect your GitHub profile. Our parser scans your repositories to analyze framework weights, commit patterns, and code quality, building your pre-existing Developer DNA.',
    icon: GitBranch,
    color: 'text-[#4285F4]',
    bg: 'bg-[#4285F4]/10',
    border: 'border-[#4285F4]/20',
    bullets: [
      'Secured via GitHub OAuth 2.0 protocol',
      'Audits language distributions & framework weights',
      'Extracts pre-existing mastery to prevent redundant lessons'
    ]
  },
  {
    step: '02',
    tab: '2. AI Roadmap',
    title: 'Generate Personalized Trajectory',
    desc: 'Gemini AI evaluates your parsed DNA against your target engineering role, automatically skipping topics you have already mastered, and schedules a week-by-week node-graph roadmap.',
    icon: Brain,
    color: 'text-[#EA4335]',
    bg: 'bg-[#EA4335]/10',
    border: 'border-[#EA4335]/20',
    bullets: [
      '100% personalized weekly milestones',
      'Direct curated tutorials & practice repository assignments',
      'Visual node pathways showing locked/active status'
    ]
  },
  {
    step: '03',
    tab: '3. Code Verification',
    title: 'AST Automated Code Checkers',
    desc: 'Submit your module tasks to GitHub and trigger validation. Our AST (Abstract Syntax Tree) scanner tests logic file paths and syntax correctness, ensuring true code mastery.',
    icon: Rocket,
    color: 'text-[#FBBC05]',
    bg: 'bg-[#FBBC05]/10',
    border: 'border-[#FBBC05]/20',
    bullets: [
      'Tests actual repository code functionality',
      'Ensures industry-standard syntax patterns',
      'Rewards verified, resume-grade achievement badges'
    ]
  },
  {
    step: '04',
    tab: '4. Focus Rooms',
    title: 'Real-time Pomodoro Co-working',
    desc: 'Enter live WebSocket study rooms to share logs, coordinate timers, and work alongside other students working on matching roadmap milestones.',
    icon: Users,
    color: 'text-[#34A853]',
    bg: 'bg-[#34A853]/10',
    border: 'border-[#34A853]/20',
    bullets: [
      'WebSocket-powered live chats & online count',
      'Integrated Pomodoro focus cycle controls',
      'Boosts visual accountability & group studies'
    ]
  },
  {
    step: '05',
    tab: '5. Portfolio Builder',
    title: 'Auto-Generated Showcase Sites',
    desc: 'Build a premium developer portfolio webpage highlighting your verified badges, completed roadmap trees, and actual repository project history in one click.',
    icon: Zap,
    color: 'text-[#4285F4]',
    bg: 'bg-[#4285F4]/10',
    border: 'border-[#4285F4]/20',
    bullets: [
      'Transforms achievements into visual portfolios',
      'Lists live repository links and badges',
      'Hosted directly for recruiters to verify'
    ]
  },
  {
    step: '06',
    tab: '6. Job Match Engine',
    title: 'DNA-based Direct Placements',
    desc: 'Our matching algorithm checks company job criteria against your audited developer DNA profile, listing matching roles with precise percentage scores.',
    icon: ShieldCheck,
    color: 'text-[#EA4335]',
    bg: 'bg-[#EA4335]/10',
    border: 'border-[#EA4335]/20',
    bullets: [
      'Calculates skills overlap matching score',
      'Direct application using verified coding DNA',
      'Filters out unqualified requirements automatically'
    ]
  },
  {
    step: '07',
    tab: '7. Community Chat',
    title: 'Collaborative Learning Network',
    desc: 'Connect with peers on the same learning track, clear code blocks, share resources, and participate in peer-review circles to accelerate development.',
    icon: Target,
    color: 'text-[#FBBC05]',
    bg: 'bg-[#FBBC05]/10',
    border: 'border-[#FBBC05]/20',
    bullets: [
      'Connects developers sharing identical tracks',
      'Help channels to debug compile issues',
      'Peer-to-peer review feedback circles'
    ]
  }
];



export default function About() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const isDark = theme === 'dark';

  // Google Brand theme configuration matching Landing page
  const colors = {
    bg: 'bg-background',
    text: 'text-foreground',
    mutedText: 'text-muted-foreground',
    card: 'bg-card border border-border shadow-sm',
    cardHover: isDark ? 'hover:border-[#4285F4]/50' : 'hover:border-primary hover:shadow-md hover:shadow-primary/5',
    alternateSection: 'bg-muted border-y border-border',
    divider: 'border-border',
    gradientText: isDark 
      ? 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-[#1A73E8] via-[#EA4335] via-[#FF9100] to-[#00C853] bg-clip-text text-transparent',
    shadow: isDark ? 'shadow-lg shadow-black/40' : 'shadow-lg shadow-primary/5 border-border',
    glowShadow: isDark ? 'shadow-2xl shadow-[#4285F4]/10' : 'shadow-2xl shadow-primary/8',
    hoverGlowShadow: isDark ? 'hover:shadow-2xl hover:shadow-[#4285F4]/15' : 'hover:shadow-2xl hover:shadow-primary/12'
  };



  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} selection:bg-[#4285F4]/30 selection:text-white transition-colors duration-300 flex flex-col`}>
      <Navbar />
      
      {/* Background Decorative Elements - Animated Google Brand Palette Accents (Optimized for Mobile Performance) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transform-gpu hidden md:block">
        <div className={`absolute top-[-5%] right-[-5%] w-[50%] h-[50%] md:w-[40%] md:h-[40%] rounded-full blur-[70px] md:blur-[130px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#4285F4]/8' : 'bg-[#1A73E8]/12'}`} style={{ animationDuration: '8s' }} />
        <div className={`absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] md:w-[35%] md:h-[35%] rounded-full blur-[60px] md:blur-[110px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#34A853]/4' : 'bg-[#34A853]/8'}`} style={{ animationDuration: '10s' }} />
        <div className={`absolute top-[35%] left-[25%] w-[30%] h-[30%] md:w-[20%] md:h-[20%] rounded-full blur-[50px] md:blur-[100px] transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#EA4335]/4' : 'bg-[#EA4335]/8'}`} />
        <div className={`absolute bottom-[5%] right-[15%] w-[35%] h-[35%] md:w-[25%] md:h-[25%] rounded-full blur-[65px] md:blur-[120px] transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#FBBC05]/4' : 'bg-[#FBBC05]/8'}`} />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-40 flex-1">
        
        {/* Hero Section */}
        <section className="text-center mb-16 md:mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-sans text-4xl sm:text-5xl md:text-7xl font-extrabold text-[#000000] dark:text-foreground mb-6 leading-[1.1] tracking-tight"
          >
            Built by Engineer,<br />
            <span className={colors.gradientText}>For Engineers</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-base sm:text-lg md:text-xl ${colors.mutedText} max-w-3xl mx-auto leading-relaxed font-semibold`}
          >
            CampusPath AI was born from a simple frustration: the gap between knowing how to code
            and knowing which skills actually get you hired is enormous — and nobody was solving it intelligently.
          </motion.p>
        </section>
 
        {/* Mission Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className={`p-6 md:p-12 mb-20 relative overflow-hidden group ${colors.card} ${colors.shadow} rounded-2xl`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#4285F4] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#4285F4]/20 group-hover:scale-105 transition-transform duration-500">
              <Target size={36} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-sans text-[#000000] dark:text-foreground mb-4">Our Mission</h2>
              <p className={`text-sm sm:text-base ${colors.mutedText} leading-relaxed font-semibold`}>
                To eliminate skill gap ambiguity for every developer on earth. We treat career development
                as an engineering problem — with measurable inputs, adaptive algorithms, and verifiable outputs.
                No more generic playlists. Just precision-targeted growth, guided by AI.
              </p>
            </div>
          </div>
        </motion.div>

        {/* How it Works Section - Interactive Split Viewport */}
        <section className={`py-12 border-t border-b ${colors.divider} my-16 relative overflow-hidden text-center`}>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold font-sans text-[#000000] dark:text-foreground mb-4 flex items-center justify-center gap-3">
                <ShieldCheck className="text-[#34A853]" size={28} /> How CampusPath <span className={colors.gradientText}>Works</span>
              </h2>
              <p className={`text-base sm:text-lg ${colors.mutedText} max-w-xl mx-auto font-semibold`}>
                Interact with the tabs below to explore our step-by-step developer acceleration pipeline.
              </p>
            </div>

            {/* Tab Selection Row */}
            <div className="flex flex-wrap justify-center gap-2 mb-10 border-b border-border/40 pb-4">
              {STEPS.map((step, idx) => (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(idx)}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 outline-none cursor-pointer ${
                    activeStep === idx
                      ? `${step.bg} ${step.color} border ${step.border} shadow-sm scale-102`
                      : `text-muted-foreground hover:text-black dark:text-foreground hover:bg-[#181B28]/20`
                  }`}
                >
                  {step.tab}
                </button>
              ))}
            </div>

            {/* Interactive Split Viewport */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
              
              {/* Left Column: Interactive Steps Details */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${STEPS[activeStep].bg} ${STEPS[activeStep].color} border ${STEPS[activeStep].border}`}>
                    {(() => {
                      const Icon = STEPS[activeStep].icon;
                      return <Icon size={24} />;
                    })()}
                  </div>
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${STEPS[activeStep].color}`}>Step {STEPS[activeStep].step}</span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#000000] dark:text-foreground">{STEPS[activeStep].title}</h3>
                  </div>
                </div>

                <p className={`text-sm sm:text-base ${colors.mutedText} leading-relaxed font-semibold`}>
                  {STEPS[activeStep].desc}
                </p>

                {/* Bullet Features Checklist */}
                <ul className="space-y-2.5">
                  {STEPS[activeStep].bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#000000] dark:text-foreground">
                      <Check size={16} className={`${STEPS[activeStep].color} shrink-0 mt-0.5`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-[#4285F4] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#357AE8] hover:shadow-lg hover:shadow-[#4285F4]/20 transition-all flex items-center gap-2 group w-full sm:w-fit justify-center shadow-md cursor-pointer"
                >
                  Get Started Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right Column: Dynamic Visual Showcase Mockups */}
              <div className={`lg:col-span-7 rounded-2xl p-6 flex items-center justify-center ${colors.card} ${colors.shadow} border border-border/80 transition-all min-h-[360px]`}>
                
                {/* Case 1: GitHub DNA Analyze */}
                {activeStep === 0 && (
                  <div className="w-full space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4285F4]">Scanning Repositories</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4285F4]/10 text-[#4285F4] animate-pulse">Syncing...</span>
                    </div>

                    {/* Simulated Repo List Scanning */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-3">
                          <GitBranch size={16} className="text-[#34A853]" />
                          <span className="text-xs font-mono font-bold">ecommerce-api-backend</span>
                        </div>
                        <span className="text-[10px] text-[#34A853] font-bold">Audited (100%)</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border">
                        <div className="flex items-center gap-3">
                          <GitBranch size={16} className="text-[#4285F4]" />
                          <span className="text-xs font-mono font-bold">react-admin-dashboard</span>
                        </div>
                        <span className="text-[10px] text-[#4285F4] font-bold">Audited (100%)</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-[#4285F4]/30 animate-pulse">
                        <div className="flex items-center gap-3">
                          <GitBranch size={16} className="text-[#FBBC05]" />
                          <span className="text-xs font-mono font-bold">serverless-auth-handler</span>
                        </div>
                        <span className="text-[10px] text-[#FBBC05] font-bold">Parsing AST...</span>
                      </div>
                    </div>

                    {/* Language distribution mock */}
                    <div className="pt-2 border-t border-border/40 flex justify-between text-[11px] font-mono font-bold">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" /> TypeScript (65%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" /> JavaScript (25%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" /> Go (10%)</span>
                    </div>
                  </div>
                )}

                {/* Case 2: AI Roadmap Generator */}
                {activeStep === 1 && (
                  <div className="w-full space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#EA4335]">Gemini AI Trajectory Planning</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EA4335]/10 text-[#EA4335]">Map Active</span>
                    </div>

                    {/* Interactive Nodes Mock */}
                    <div className="flex flex-col items-center gap-4 py-2 relative">
                      <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#34A853] via-[#4285F4] to-border/40 -translate-x-1/2" />
                      
                      {/* Node 1 */}
                      <div className="relative z-10 flex items-center gap-3 bg-background/80 border border-[#34A853]/50 rounded-xl px-4 py-2 w-full max-w-[280px]">
                        <div className="w-4 h-4 rounded-full bg-[#34A853] flex items-center justify-center text-[10px] text-white">✓</div>
                        <div>
                          <span className="text-xs font-bold text-black dark:text-foreground">React Hooks & State</span>
                          <div className="text-[9px] text-muted-foreground">Mastery Audited (Skipped)</div>
                        </div>
                      </div>

                      {/* Node 2 */}
                      <div className="relative z-10 flex items-center gap-3 bg-background/80 border border-[#4285F4]/60 rounded-xl px-4 py-2 w-full max-w-[280px] animate-pulse">
                        <div className="w-4 h-4 rounded-full bg-[#4285F4] flex items-center justify-center text-[10px] text-white animate-pulse" />
                        <div>
                          <span className="text-xs font-bold text-black dark:text-foreground">Docker Containerization</span>
                          <div className="text-[9px] text-[#4285F4] font-bold">12 Tasks Remaining</div>
                        </div>
                      </div>

                      {/* Node 3 */}
                      <div className="relative z-10 flex items-center gap-3 bg-background/80 border border-border rounded-xl px-4 py-2 w-full max-w-[280px] opacity-50">
                        <div className="w-4 h-4 rounded-full bg-border flex items-center justify-center text-[10px] text-white" />
                        <div>
                          <span className="text-xs font-bold text-black dark:text-foreground">CI/CD Pipeline Deployments</span>
                          <div className="text-[9px] text-muted-foreground">Locked Node</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 3: Code Verification */}
                {activeStep === 2 && (
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC05] font-mono">AST Verification Runner</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBBC05]/10 text-[#FBBC05] animate-pulse">Running</span>
                    </div>

                    <div className="p-4 rounded-xl bg-black text-green-400 font-mono text-[10px] sm:text-xs leading-relaxed space-y-2 overflow-hidden border border-gray-800">
                      <div>$ node verify-assignment.js --repo=react-auth</div>
                      <div className="text-gray-400">Comparing repo commits... done.</div>
                      <div>Parsing AST structure... <span className="text-blue-400">Found 3 Custom Hooks</span></div>
                      <div>Testing suite output: <span className="text-green-500">15/15 tests passed.</span></div>
                      <div className="h-px bg-gray-800 my-1" />
                      <div className="text-[#FBBC05] font-bold flex items-center gap-1.5 animate-pulse">
                        <Zap size={12} fill="currentColor" /> Skill verified! Awarded: React Auth Badge.
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 4: Focus Study Rooms */}
                {activeStep === 3 && (
                  <div className="w-full space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#34A853]">Co-working Focus Room</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34A853]/10 text-[#34A853] animate-pulse">3 Active</span>
                    </div>

                    {/* Pomodoro Timer Dial */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center py-2">
                      <div className="w-28 h-28 rounded-full border-4 border-[#34A853] flex flex-col items-center justify-center bg-background shadow-lg shadow-[#34A853]/10">
                        <span className="text-2xl font-black font-mono text-black dark:text-foreground">24:59</span>
                        <span className="text-[8px] uppercase tracking-widest text-[#34A853] font-black font-sans">Focus Mode</span>
                      </div>

                      {/* Pulsing Active Avatars Grid */}
                      <div className="space-y-2.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wide block ${colors.mutedText}`}>Online Co-workers</span>
                        <div className="flex gap-2">
                          <div className="relative w-8 h-8 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[10px] text-[#4285F4] font-bold">
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#34A853] border-2 border-background rounded-full" />
                            SK
                          </div>
                          <div className="relative w-8 h-8 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/30 flex items-center justify-center text-[10px] text-[#EA4335] font-bold animate-pulse">
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#34A853] border-2 border-background rounded-full animate-ping" />
                            SS
                          </div>
                          <div className="relative w-8 h-8 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center text-[10px] text-[#34A853] font-bold">
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#34A853] border-2 border-background rounded-full" />
                            MS
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold italic flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" /> 25h focus logs shared today
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 5: Portfolio Builder */}
                {activeStep === 4 && (
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4285F4]">Portfolio Site Generator</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4285F4]/10 text-[#4285F4]">Live Preview</span>
                    </div>

                    <div className={`p-4 rounded-xl bg-background border border-border shadow-md space-y-3`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] flex items-center justify-center text-white font-extrabold text-sm">
                          SK
                        </div>
                        <div>
                          <div className="text-xs font-bold text-black dark:text-foreground">Shubham Kumar Yadav</div>
                          <div className="text-[9px] text-muted-foreground font-semibold">Verified Full Stack Developer</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                        Adaptive developer portfolio generated dynamically. Powered by verified code DNA logs and repository data.
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold">★ React Hook Expert</span>
                        <span className="text-[8px] bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 px-1.5 py-0.2 rounded font-bold">★ Docker Certified</span>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">★ 15 Verified repos</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 6: Job Match Engine */}
                {activeStep === 5 && (
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#EA4335]">AI Placement Engine</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EA4335]/10 text-[#EA4335] font-bold">Ready</span>
                    </div>

                    {/* Match Engine Results Panel */}
                    <div className={`p-4 rounded-xl bg-background/80 border border-border/80 ${colors.shadow} space-y-3`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-black text-black dark:text-foreground">Junior Cloud Architect</div>
                          <div className={`text-[10px] ${colors.mutedText} font-semibold font-sans`}>Google Cloud Platform</div>
                        </div>
                        <div className="w-10 h-10 rounded-full border-4 border-[#34A853] flex items-center justify-center font-black text-xs text-[#34A853] bg-background shadow-md">
                          94%
                        </div>
                      </div>

                      <div className="h-px bg-border/40" />

                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 font-mono">React Verified</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20 font-mono">REST API</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 font-mono">MongoDB</span>
                      </div>

                      <button className="w-full py-2 bg-[#EA4335] hover:bg-[#D93025] text-white text-[11px] font-extrabold rounded-lg transition-all shadow-sm">
                        Apply With DNA Profile
                      </button>
                    </div>
                  </div>
                )}

                {/* Case 7: Developer Community */}
                {activeStep === 6 && (
                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-border/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FBBC05] font-mono">Community Peer Chat</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FBBC05]/10 text-[#FBBC05] animate-pulse">#react-roadmap</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-background/50 border border-border text-[10px] sm:text-xs">
                        <span className="font-bold text-[#4285F4]">Shubham Yadav</span>: Just solved Node API validation node!
                      </div>
                      <div className="p-2.5 rounded-lg bg-background/50 border border-border text-[10px] sm:text-xs">
                        <span className="font-bold text-[#EA4335]">Satyam Shukla</span>: Congrats! I am working on the Docker node now, join Room 102?
                      </div>
                      <div className="p-2.5 rounded-lg bg-background/50 border border-border text-[10px] sm:text-xs text-muted-foreground italic">
                        <span className="font-bold text-[#34A853] not-italic text-black dark:text-foreground">Madhur Sharma</span> joined Pomodoro Room 102.
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        </section>

        {/* Meet the Creator / Developer Section */}
        <section className="py-12 my-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-extrabold font-sans text-[#000000] dark:text-foreground mb-4 flex items-center justify-center gap-3">
              <Users className="text-[#4285F4]" size={28} /> Meet the Developer
            </h2>
            <p className={`text-sm sm:text-base ${colors.mutedText} font-semibold max-w-xl mx-auto`}>
              The engineering mind behind the CampusPath AI ecosystem.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className={`max-w-3xl mx-auto p-6 md:p-10 relative overflow-hidden group ${colors.card} ${colors.shadow} rounded-2xl border ${colors.divider}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/5 via-[#34A853]/2 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-10">
              {/* Creator Avatar Photo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC05] shadow-xl flex items-center justify-center shrink-0 select-none relative group-hover:scale-105 transition-transform duration-500 z-10 overflow-hidden">
                <img 
                  src="/shubham.jpg" 
                  alt="Shubham Kumar Yadav" 
                  className="w-full h-full object-cover rounded-full p-[3px] bg-background dark:bg-[#0B0D17]"
                />
              </div>

              {/* Developer Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-[#000000] dark:text-foreground mb-1">Shubham Kumar Yadav</h3>
                  <div className="text-sm font-bold uppercase tracking-widest text-[#4285F4]">Creator & Lead Developer</div>
                </div>

                <p className={`text-sm sm:text-base ${colors.mutedText} leading-relaxed font-semibold`}>
                  I am a BTech student and software engineer who conceptualized, designed, and developed the entire 
                  CampusPath AI ecosystem. Passionate about bridging the gap between theoretical learning and industry 
                  competency, I engineered the Gemini AI trajectory mapping engine, integrated the AST-based code 
                  verification systems, and built the live WebSocket co-working focus rooms to accelerate growth 
                  for developers globally.
                </p>

                {/* Social links */}
                <div className="flex justify-center md:justify-start gap-4 pt-2">
                  <a
                    href="https://www.linkedin.com/in/shubham-kumar-yadav-6369s/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-background/50 border border-border text-foreground hover:text-[#1A73E8] hover:border-[#1A73E8]/40 hover:shadow-md transition-all duration-300 outline-none`}
                  >
                    <Linkedin size={20} />
                  </a>
                  <a
                    href="mailto:shubhamyk6369@gmail.com"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-background/50 border border-border text-foreground hover:text-[#EA4335] hover:border-[#EA4335]/40 hover:shadow-md transition-all duration-300 outline-none`}
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tech Stack */}
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-[#000000] dark:text-foreground mb-2 flex items-center justify-center gap-3">
              <Code2 className="text-[#4285F4]" size={28} /> Open Tech Stack
            </h2>
            <p className={`text-sm sm:text-base ${colors.mutedText} font-semibold mb-10`}>Built with best-in-class open source technologies</p>
          </motion.div>
 
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-x-12 gap-y-10 max-w-5xl mx-auto px-4"
          >
            {TECH.map(({ name, logo }, idx) => {
              return (
                <motion.div 
                  key={name}
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      duration: 3.5,
                      ease: "easeInOut",
                      delay: (idx % 4) * 0.45
                    }
                  }}
                  whileHover={{ scale: 1.15, y: -16, transition: { duration: 0.2 } }}
                  className="flex flex-col items-center justify-center text-center cursor-pointer select-none group w-24"
                >
                  {/* Floating Icon Container without border box */}
                  <div className="w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-300">
                    {renderTechLogo(logo)}
                  </div>
                  
                  {/* Technology Label */}
                  <span className="mt-3 font-extrabold text-xs text-[#000000] dark:text-foreground leading-tight tracking-tight opacity-85 group-hover:opacity-100 transition-opacity">
                    {name}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
 

 
        {/* Refined CTA Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className={`p-8 sm:p-12 md:p-16 inline-flex flex-col items-center relative overflow-hidden group border-[#2E313D]/20 ${colors.card} ${colors.glowShadow} rounded-2xl max-w-2xl w-full`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/10 to-transparent pointer-events-none group-hover:from-[#4285F4]/20 transition-colors" />
            
            <div className={`w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 shadow-md relative z-10 text-[#4285F4]`}>
              <Rocket size={24} />
            </div>
 
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-foreground mb-6 relative z-10">Want to join the mission?</h2>
            
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="px-5 py-2.5 sm:px-7 sm:py-3.5 w-full sm:w-auto bg-[#4285F4] hover:bg-[#357AE8] text-white text-sm sm:text-base font-extrabold rounded-lg shadow-sm hover:shadow-lg hover:shadow-[#4285F4]/20 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center justify-center gap-3 relative z-10"
            >
              <Zap size={16} className="text-white" /> 
              Start Your Journey 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
 
      </div>
    </div>
  );
}
