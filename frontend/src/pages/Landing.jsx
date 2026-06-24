import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ChevronRight, Zap, GitBranch, Brain, Map, Trophy, Users,
  BarChart, ArrowRight, Star, Check, Sparkles, Code, Terminal,
  Rocket, ShieldCheck, Cpu
} from 'lucide-react';

const FEATURES = [
  { 
    icon: Brain, 
    title: 'AI Roadmap Generator', 
    desc: 'Gemini AI analyzes your GitHub and builds a hyper-personalized week-by-week roadmap for your target role.', 
    size: 'col-span-1 md:col-span-2',
    colorClass: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20',
    hoverBgClass: 'group-hover:bg-[#4285F4]'
  },
  { 
    icon: GitBranch, 
    title: 'GitHub DNA Analysis', 
    desc: 'We scan your repositories and tech stack to understand exactly what you already know.', 
    size: 'col-span-1',
    colorClass: 'text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/20',
    hoverBgClass: 'group-hover:bg-[#EA4335]'
  },
  { 
    icon: Map, 
    title: 'Interactive Roadmap', 
    desc: 'Navigate your career path with a visual node-graph. Check off tasks, and track progress.', 
    size: 'col-span-1',
    colorClass: 'text-[#FBBC05] bg-[#FBBC05]/10 border-[#FBBC05]/20',
    hoverBgClass: 'group-hover:bg-[#FBBC05]'
  },
  { 
    icon: Cpu, 
    title: 'Job Match Engine', 
    desc: 'AI-matched job listings based on your roadmap progress — see your % match score.', 
    size: 'col-span-1 md:col-span-2',
    colorClass: 'text-[#34A853] bg-[#34A853]/10 border-[#34A853]/20',
    hoverBgClass: 'group-hover:bg-[#34A853]'
  },
];

const STATS = [
  { value: '50K+', label: 'Developers', color: 'text-[#4285F4]' },
  { value: '94%', label: 'Placement Rate', color: 'text-[#EA4335]' },
  { value: '12 Wks', label: 'Hire-Ready', color: 'text-[#FBBC05]' },
  { value: '4.9★', label: 'User Rating', color: 'text-[#34A853]' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Backend @ Stripe', text: 'CampusPath AI identified exactly the 3 skills I was missing. Within 10 weeks I had my offer.', rating: 5, color: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20' },
  { name: 'Marcus Chen', role: 'Frontend @ Vercel', text: 'The GitHub DNA analysis blew my mind. It skipped basics and jumped to optimization.', rating: 5, color: 'text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/20' },
  { name: 'Aisha Patel', role: 'DevOps @ AWS', text: 'The roadmap was so precise it felt like it was written for me personally.', rating: 5, color: 'text-[#34A853] bg-[#34A853]/10 border-[#34A853]/20' },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Landing() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  // Dynamic Google Palette configuration for theme responsiveness
  const colors = {
    bg: 'bg-background',
    text: 'text-foreground',
    mutedText: 'text-muted-foreground',
    card: 'bg-card border border-border shadow-sm',
    cardHover: isDark ? 'hover:border-[#4285F4]/50' : 'hover:border-primary hover:shadow-md hover:shadow-primary/5',
    alternateSection: 'bg-muted border-y border-border',
    innerStepCard: isDark ? 'bg-[#0B0D17]/80 border-[#2E313D]' : 'bg-background/60 border border-border',
    codeBg: 'bg-background border border-border',
    codeHeader: 'border-b border-border bg-muted/80',
    codeText: 'text-foreground',
    footerBg: 'border-t border-border bg-muted',
    gradientText: isDark 
      ? 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-[#1A73E8] via-[#EA4335] via-[#FF9100] to-[#00C853] bg-clip-text text-transparent',
    
    // Code Syntax Coloring
    syntaxConst: isDark ? 'text-[#EA4335]' : 'text-[#C5221F]',
    syntaxVar: isDark ? 'text-[#E8EAED]' : 'text-[#1F2937]',
    syntaxFunc: isDark ? 'text-[#4285F4]' : 'text-[#1A73E8]',
    syntaxStr: isDark ? 'text-[#34A853]' : 'text-[#137333]',
    syntaxClass: isDark ? 'text-[#FBBC05]' : 'text-[#E37400]',

    // Volumetric Shadows
    shadow: isDark ? 'shadow-lg shadow-black/40' : 'shadow-lg shadow-[#1A73E8]/5 border-[#E2E8F0]',
    glowShadow: isDark ? 'shadow-2xl shadow-[#4285F4]/10' : 'shadow-2xl shadow-[#1A73E8]/8',
    hoverGlowShadow: isDark ? 'hover:shadow-2xl hover:shadow-[#4285F4]/15' : 'hover:shadow-2xl hover:shadow-[#1A73E8]/12'
  };

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} selection:bg-[#4285F4]/30 selection:text-white transition-colors duration-300`}>
      <Navbar />

      {/* Background Decorative Elements - Animated Google Brand Palette Accents (Optimized for Mobile Performance) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transform-gpu hidden md:block">
        <div className={`absolute top-[-5%] right-[-5%] w-[50%] h-[50%] md:w-[40%] md:h-[40%] rounded-full blur-[70px] md:blur-[130px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#4285F4]/8' : 'bg-[#1A73E8]/12'}`} style={{ animationDuration: '8s' }} />
        <div className={`absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] md:w-[35%] md:h-[35%] rounded-full blur-[60px] md:blur-[110px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#34A853]/4' : 'bg-[#34A853]/8'}`} style={{ animationDuration: '10s' }} />
        <div className={`absolute top-[35%] left-[25%] w-[30%] h-[30%] md:w-[20%] md:h-[20%] rounded-full blur-[50px] md:blur-[100px] transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#EA4335]/4' : 'bg-[#EA4335]/8'}`} />
        <div className={`absolute bottom-[5%] right-[15%] w-[35%] h-[35%] md:w-[25%] md:h-[25%] rounded-full blur-[65px] md:blur-[120px] transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#FBBC05]/4' : 'bg-[#FBBC05]/8'}`} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden md:pt-48 md:pb-32">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/20 text-[#4285F4] text-sm font-semibold mb-8"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Powering 50,000+ AI-Driven Career Paths</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-sans tracking-tight leading-[1.1] mb-6"
          >
            Architect Your Future <br />
            <span className={colors.gradientText}>
              From Your Code
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg md:text-xl ${colors.mutedText} max-w-2xl mb-10 leading-relaxed`}
          >
            Stop wasting months on tutorials you've already mastered. Link your GitHub and let AI build a surgical, week-by-week roadmap to your target role.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="px-4 py-2.5 sm:px-6 sm:py-3.5 w-full sm:w-auto bg-[#4285F4] text-white text-sm sm:text-base font-bold rounded-lg hover:bg-[#357AE8] hover:shadow-lg hover:shadow-[#4285F4]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group shadow-md"
            >
              Start Your Journey <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/about')}
              className={`px-4 py-2.5 sm:px-6 sm:py-3.5 w-full sm:w-auto ${colors.card} text-sm sm:text-base font-bold rounded-lg hover:bg-[#202436]/10 transition-all`}
            >
              How it works
            </button>
          </motion.div>

          {/* Hero Visual - High Fidelity Application Dashboard Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: [-5, 5, -5] }}
            transition={{
              opacity: { delay: 0.5, duration: 0.8 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.3 }
            }}
            className={`mt-20 w-full max-w-5xl ${colors.card} rounded-xl p-2.5 ${colors.glowShadow} relative z-10 transition-all duration-300`}
          >
            <div className={`rounded-lg overflow-hidden ${colors.codeBg} transition-all duration-300`}>
              {/* Browser Header Controls */}
              <div className={`flex items-center justify-between gap-2 p-3 sm:p-4 ${colors.codeHeader} transition-all duration-300`}>
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#EA4335]/90" />
                  <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#FBBC05]/90" />
                  <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#34A853]/90" />
                </div>
                {/* Simulated URL Bar */}
                <div className="flex-1 flex justify-center">
                  <div className={`w-full max-w-[150px] sm:max-w-md bg-background/50 border border-border text-center rounded-lg py-0.5 sm:py-1 px-2 sm:px-4 text-[10px] sm:text-xs ${colors.mutedText} font-mono truncate`}>
                    app.campuspath.ai/dashboard
                  </div>
                </div>
                {/* Live Status indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34A853] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#34A853]"></span>
                  </span>
                  <span className={`hidden xs:inline text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${colors.mutedText}`}>Live</span>
                </div>
              </div>

              {/* Main Simulated Dashboard Layout */}
              <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                
                {/* Column 1: AI Learning Trajectory (Node Map) */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4285F4]">AI Trajectory Map</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20">MERN Track</span>
                  </div>
                  
                  {/* Trajectory Nodes */}
                  <div className="relative pl-6 space-y-5">
                    {/* Connection Line */}
                    <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-[#34A853] via-[#4285F4] to-border" />
                    
                    {/* Node 1: Completed */}
                    <div className="relative flex gap-3">
                      <div className="absolute left-[-22px] w-5 h-5 rounded-full bg-[#34A853] border-4 border-background flex items-center justify-center text-white" />
                      <div>
                        <div className="text-xs font-bold text-foreground">React & State Management</div>
                        <div className={`text-[10px] ${colors.mutedText} flex items-center gap-1.5 mt-0.5`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                          Verified on GitHub (12 Repos)
                        </div>
                      </div>
                    </div>

                    {/* Node 2: Active */}
                    <div className="relative flex gap-3">
                      <div className="absolute left-[-22px] w-5 h-5 rounded-full bg-[#4285F4] border-4 border-background flex items-center justify-center animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          Node.js REST API Architecture
                          <span className="text-[8px] bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 px-1 py-0.2 rounded font-bold uppercase tracking-wide">Active</span>
                        </div>
                        <div className={`text-[10px] ${colors.mutedText} flex items-center gap-1.5 mt-0.5`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05] animate-ping" />
                          Auditing Auth logic (83%)
                        </div>
                      </div>
                    </div>

                    {/* Node 3: Locked */}
                    <div className="relative flex gap-3 opacity-60">
                      <div className="absolute left-[-22px] w-5 h-5 rounded-full bg-border border-4 border-background flex items-center justify-center" />
                      <div>
                        <div className="text-xs font-bold text-foreground">Docker & Kubernetes Pipelines</div>
                        <div className={`text-[10px] ${colors.mutedText} mt-0.5`}>Locked — Unlocks next week</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: GitHub DNA Profiler */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#EA4335]">GitHub DNA Analyzer</span>
                    <span className={`text-[10px] font-medium font-mono ${colors.mutedText}`}>commit_radar_v1.3</span>
                  </div>

                  {/* Skill Competency Bar Charts */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="font-mono">frontend/react</span>
                        <span className="text-[#4285F4]">95% (Expert)</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-[#4285F4] rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="font-mono">backend/node</span>
                        <span className="text-[#EA4335]">80% (Advanced)</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-[#EA4335] rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold mb-1">
                        <span className="font-mono">devops/docker</span>
                        <span className="text-[#FBBC05]">45% (Apprentice)</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-[#FBBC05] rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Micro Commit Grid Grid */}
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <span className={`text-[10px] font-bold uppercase tracking-wide block mb-2 ${colors.mutedText}`}>Audited Contribution Density</span>
                    <div className="flex gap-1.5">
                      {[...Array(6)].map((_, col) => (
                        <div key={col} className="flex flex-col gap-1.5">
                          {[...Array(4)].map((_, row) => {
                            // Render nice varying green shades based on mockup values
                            const intensities = ['bg-border/20', 'bg-[#34A853]/20', 'bg-[#34A853]/50', 'bg-[#34A853]', 'bg-[#34A853]/80'];
                            const randomColor = intensities[(col + row) % intensities.length];
                            return <div key={row} className={`w-3.5 h-3.5 rounded-sm ${randomColor} transition-all duration-300 hover:scale-110`} />;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Live Matching Hub (Jobs/Badges) */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#34A853]">AI Match Engine</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20">Matched Live</span>
                  </div>

                  {/* Match Card */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-[#1E2130]' : 'bg-[#F1F3F4]'} border border-border/80 ${colors.shadow} space-y-3`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-black text-foreground">Junior Cloud Architect</div>
                        <div className={`text-[10px] ${colors.mutedText} font-semibold font-sans`}>Google Cloud Platform</div>
                      </div>
                      <div className="w-10 h-10 rounded-full border-4 border-[#34A853] flex items-center justify-center font-black text-xs text-[#34A853] bg-background">
                        94%
                      </div>
                    </div>

                    <div className="h-px bg-border/40" />

                    {/* Skill Badges matched */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 font-mono">React Verified</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EA4335]/10 text-[#EA4335] border border-[#EA4335]/20 font-mono">REST API</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 font-mono">MongoDB</span>
                    </div>

                    <button className="w-full py-2 bg-[#34A853] hover:bg-[#2C8F47] text-white text-[11px] font-extrabold rounded-lg transition-all shadow-sm">
                      Apply With DNA Profile
                    </button>
                  </div>
                </div>

              </div>
            </div>
            {/* Floating decoration */}
            <div className="absolute -top-4 -right-6 w-12 h-12 bg-[#4285F4] rounded-lg flex items-center justify-center shadow-lg shadow-[#4285F4]/20 rotate-12">
              <Zap size={24} className="text-white" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 ${colors.alternateSection}`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            {STATS.map(({ value, label, color }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`text-4xl md:text-5xl font-black font-sans ${color} mb-2 tracking-tighter`}>{value}</div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-sans tracking-tight mb-4 text-foreground">
              Smarter Career <span className="bg-gradient-to-r from-[#4285F4] to-[#34A853] bg-clip-text text-transparent">Engineering</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Skip generic courses. Our platform adapts to your existing codebase history and future goals.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`${feature.size} ${colors.card} ${colors.cardHover} ${colors.shadow} ${colors.hoverGlowShadow} rounded-xl p-5 cursor-pointer transition-all duration-300 group`}
              >
                <div className={`w-12 h-12 rounded-lg ${feature.colorClass} flex items-center justify-center mb-6 ${feature.hoverBgClass} group-hover:text-white transition-all duration-300`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className={`${colors.mutedText} leading-relaxed`}>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.15 }}
                className={`p-5 rounded-xl ${colors.card} ${colors.shadow} ${colors.hoverGlowShadow} relative flex flex-col justify-between hover:border-[#4285F4]/30 transition-all duration-300`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} className="fill-[#FBBC05] text-[#FBBC05]" />)}
                </div>
                <p className="text-lg italic mb-6 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${t.color}`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className={`text-xs ${colors.mutedText} uppercase font-bold tracking-tight`}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className={`max-w-4xl mx-auto ${colors.card} ${colors.glowShadow} rounded-2xl p-12 md:p-20 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-[#4285F4]/5 -z-10" />
          <h2 className="text-4xl md:text-6xl font-black font-sans mb-6 leading-tight">Ready to stop guessing?</h2>
          <p className={`text-lg md:text-xl ${colors.mutedText} mb-10 max-w-xl mx-auto leading-relaxed`}>
            Join thousands of developers leveling up with AI-powered career paths.
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/register')}
            className="px-5 py-2.5 sm:px-8 sm:py-3.5 w-full sm:w-auto bg-[#4285F4] text-white text-sm sm:text-base md:text-lg font-bold rounded-lg shadow-sm hover:bg-[#357AE8] hover:shadow-lg hover:shadow-[#4285F4]/20 hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center justify-center gap-3"
          >
            Create Your Account <ChevronRight size={20} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${colors.footerBg} mt-12 px-6`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4285F4] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg font-sans tracking-tighter">CampusPath AI</span>
          </div>
          <div className="flex gap-5 text-sm font-medium">
            <Link to="/about" className="hover:text-[#4285F4] transition-colors">About</Link>
            <Link to="/contact" className="hover:text-[#4285F4] transition-colors">Contact</Link>
            <Link to="/terms" className="hover:text-[#4285F4] transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-[#4285F4] transition-colors">Privacy</Link>
          </div>
          <div className={`text-sm ${colors.mutedText}`}>
            © 2024 CampusPath AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

