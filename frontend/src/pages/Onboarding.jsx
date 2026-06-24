import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authAPI, roadmapAPI } from '@/api/client';
import { Zap, ChevronRight, ChevronLeft, Check, User, Clock, Code, Globe, Flame, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AILoader from '@/components/common/AILoader';

const HOURS = [5, 10, 15, 20, 30];
const TECHS = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'Ruby', 'PHP', 'Kotlin', 'Swift', 'Dart'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const URGENCY = [
  { value: 'Exploring', label: 'Exploring', desc: 'Just browsing, no rush', icon: '🌱' },
  { value: 'Active', label: 'Actively Looking', desc: 'Job hunting in 3-6 months', icon: '🚀' },
  { value: 'Urgent', label: 'Urgent', desc: 'Need a job ASAP', icon: '🔥' },
];

const ROADMAP_OPTIONS = {
  roles: [
    'Frontend', 'Backend', 'Full Stack', 'DevOps', 'DevSecOps', 'Data Analyst',
    'AI Engineer', 'AI and Data Scientist', 'Data Engineer', 'Android',
    'Machine Learning', 'PostgreSQL', 'iOS', 'Blockchain', 'QA',
    'Software Architect', 'Cyber Security', 'UX Design', 'Technical Writer',
    'Game Developer', 'Server Side Game Developer', 'MLOps', 'Product Manager',
    'Engineering Manager', 'Developer Relations', 'BI Analyst'
  ],
  skills: [
    'SQL', 'Computer Science', 'React', 'Vue', 'Angular', 'JavaScript',
    'TypeScript', 'Node.js', 'Python', 'System Design', 'Java', 'ASP.NET Core',
    'API Design', 'Spring Boot', 'Flutter', 'C++', 'Rust', 'Go Roadmap',
    'Design and Architecture', 'GraphQL', 'React Native', 'Design System',
    'Prompt Engineering', 'MongoDB', 'Linux', 'Kubernetes', 'Docker',
    'AWS', 'Terraform', 'Data Structures & Algorithms', 'Redis',
    'Git and GitHub', 'PHP', 'Cloudflare', 'AI Red Teaming', 'AI Agents',
    'Next.js', 'Code Review', 'Kotlin', 'HTML', 'CSS', 'Swift & Swift UI',
    'Shell / Bash', 'Laravel', 'Elasticsearch', 'WordPress', 'Django',
    'Ruby', 'Ruby on Rails', 'Claude Code', 'Vibe Coding', 'Scala'
  ]
};

const STEPS = [
  { id: 1, title: 'Target Role', subtitle: 'What kind of developer do you want to be?', icon: User },
  { id: 2, title: 'Weekly Time', subtitle: 'How many hours can you commit per week?', icon: Clock },
  { id: 3, title: 'Tech Stack', subtitle: 'Which technologies are you already comfortable with?', icon: Code },
  { id: 4, title: 'Skill Level', subtitle: 'How would you rate your current overall proficiency?', icon: Globe },
  { id: 5, title: 'Career Urgency', subtitle: 'How soon are you looking to land a role?', icon: Flame },
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [data, setData] = useState({
    targetRole: '',
    weeklyHours: 10,
    techStack: [],
    proficiency: 'Intermediate',
    careerUrgency: 'Active',
    githubUsername: user?.githubUsername || '',
  });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const toggleTech = (tech) => {
    setData(p => ({
      ...p,
      techStack: p.techStack.includes(tech) ? p.techStack.filter(t => t !== tech) : [...p.techStack, tech],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: res } = await authAPI.updateProfile({ ...data, onboardingComplete: true });
      updateUser(res.user);

      toast.info('🤖 Analyzing your GitHub & generating AI roadmap...');
      try {
        await roadmapAPI.generate({ 
          githubUsername: data.githubUsername, 
          targetRole: data.targetRole,
          manualSkills: data.techStack 
        });
        toast.success('🎯 Roadmap generated successfully!');
      } catch (rmErr) {
        console.warn('Initial roadmap generation failed:', rmErr.message);
        toast.info('You can generate your roadmap manually from the dashboard.');
      }

      toast.success('🎉 Profile setup complete!');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return data.targetRole !== '';
    if (step === 2) return data.weeklyHours > 0;
    return true;
  };

  // Dynamic Step Accent Colors coordinating with the Landing Page brand modules
  const getStepColorClasses = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return {
          text: 'text-[#4285F4]',
          bg: 'bg-[#4285F4]',
          lightBg: 'bg-[#4285F4]/10',
          border: 'border-[#4285F4]',
          lightBorder: 'border-[#4285F4]/20',
          ring: 'focus:ring-[#4285F4]/50',
          shadowGlow: 'hover:shadow-[#4285F4]/5'
        };
      case 2:
        return {
          text: 'text-[#EA4335]',
          bg: 'bg-[#EA4335]',
          lightBg: 'bg-[#EA4335]/10',
          border: 'border-[#EA4335]',
          lightBorder: 'border-[#EA4335]/20',
          ring: 'focus:ring-[#EA4335]/50',
          shadowGlow: 'hover:shadow-[#EA4335]/5'
        };
      case 3:
        return {
          text: 'text-[#FBBC05] dark:text-[#FBBC05]',
          bg: 'bg-[#FBBC05]',
          lightBg: 'bg-[#FBBC05]/10',
          border: 'border-[#FBBC05]',
          lightBorder: 'border-[#FBBC05]/20',
          ring: 'focus:ring-[#FBBC05]/50',
          shadowGlow: 'hover:shadow-[#FBBC05]/5'
        };
      case 4:
        return {
          text: 'text-[#34A853]',
          bg: 'bg-[#34A853]',
          lightBg: 'bg-[#34A853]/10',
          border: 'border-[#34A853]',
          lightBorder: 'border-[#34A853]/20',
          ring: 'focus:ring-[#34A853]/50',
          shadowGlow: 'hover:shadow-[#34A853]/5'
        };
      case 5:
        return {
          text: 'text-[#4285F4]',
          bg: 'bg-[#4285F4]',
          lightBg: 'bg-[#4285F4]/10',
          border: 'border-[#4285F4]',
          lightBorder: 'border-[#4285F4]/20',
          ring: 'focus:ring-[#4285F4]/50',
          shadowGlow: 'hover:shadow-[#4285F4]/5'
        };
      default:
        return {
          text: 'text-[#4285F4]',
          bg: 'bg-[#4285F4]',
          lightBg: 'bg-[#4285F4]/10',
          border: 'border-[#4285F4]',
          lightBorder: 'border-[#4285F4]/20',
          ring: 'focus:ring-[#4285F4]/50',
          shadowGlow: 'hover:shadow-[#4285F4]/5'
        };
    }
  };

  const activeColor = getStepColorClasses(step);

  // Google Brand theme configuration matching other pages
  const colors = {
    bg: 'bg-background',
    text: 'text-foreground',
    mutedText: 'text-muted-foreground',
    card: 'bg-card border border-border shadow-sm',
    cardHover: isDark ? 'hover:border-[#4285F4]/50' : 'hover:border-primary hover:shadow-md hover:shadow-primary/5',
    divider: 'border-border',
    gradientText: isDark 
      ? 'bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-[#1A73E8] via-[#EA4335] via-[#FF9100] to-[#00C853] bg-clip-text text-transparent',
    shadow: isDark ? 'shadow-lg shadow-black/40' : 'shadow-lg shadow-primary/5 border-border',
    glowShadow: isDark ? 'shadow-2xl shadow-[#4285F4]/10' : 'shadow-2xl shadow-primary/8',
    hoverGlowShadow: isDark ? 'hover:shadow-2xl hover:shadow-[#4285F4]/15' : 'hover:shadow-2xl hover:shadow-primary/12',
    
    // Form Inputs
    inputBg: 'bg-background border border-border',
    inputFocus: 'focus:ring-2 focus:ring-[#4285F4]/50',
    btnPrimary: isDark 
      ? 'bg-[#4285F4] hover:bg-[#357AE8] text-white hover:shadow-[#4285F4]/20' 
      : 'bg-[#1A73E8] hover:bg-[#1557B0] text-white hover:shadow-[#1A73E8]/20',
    btnMuted: isDark 
      ? 'bg-[#181B28]/50 border-[#2E313D] hover:bg-[#181B28]' 
      : 'bg-card border border-border hover:bg-muted'
  };

  if (loading) {
    return <AILoader targetRole={data.targetRole} githubUsername={data.githubUsername} />;
  }

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} relative flex items-center justify-center p-4 sm:p-6 overflow-hidden transition-colors duration-300`}>
      
      {/* Background Decorative Elements - Performance-Optimized Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu hidden md:block">
        <div className={`absolute top-[-5%] right-[-5%] w-[50%] h-[50%] md:w-[40%] md:h-[40%] rounded-full blur-[70px] md:blur-[130px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#4285F4]/8' : 'bg-[#1A73E8]/12'}`} style={{ animationDuration: '8s' }} />
        <div className={`absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] md:w-[35%] md:h-[35%] rounded-full blur-[60px] md:blur-[110px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#34A853]/4' : 'bg-[#34A853]/8'}`} style={{ animationDuration: '10s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10 my-4"
      >
        {/* Header Content */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${activeColor.lightBg} border ${activeColor.lightBorder} ${activeColor.text} text-xs font-bold uppercase tracking-widest mb-4`}
          >
            <Zap size={14} className="animate-pulse" /> Step {step} of {STEPS.length}
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-sans text-[#000000] dark:text-foreground mb-2">
            {STEPS[step - 1].title}
          </h1>
          <p className={`text-sm sm:text-base ${colors.mutedText} max-w-lg mx-auto font-semibold`}>
            {STEPS[step - 1].subtitle}
          </p>
        </div>

        {/* Brand Theme Progress Bar */}
        <div className="mb-8 mx-auto max-w-2xl px-4">
          <div className="flex justify-between mb-4 relative z-10">
            {STEPS.map(s => (
              <div 
                key={s.id} 
                className={twMerge(
                  clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 border",
                    s.id < step ? "bg-[#34A853] text-white border-transparent shadow-sm" : 
                    s.id === step ? `bg-background dark:bg-[#0D0F17] ${activeColor.border} border-2 ${activeColor.text} font-black scale-110 shadow-md` : 
                    `text-muted-foreground ${isDark ? 'bg-[#181B28] border-[#2E313D]' : 'bg-[#FFFFFF] border-[#E2E8F0]'}`
                  )
                )}
              >
                {s.id < step ? <Check size={14} strokeWidth={3} /> : s.id}
              </div>
            ))}
          </div>
          <div className={`h-1.5 rounded-full ${isDark ? 'bg-[#181B28]' : 'bg-[#E2E8F0]'} overflow-hidden relative w-full z-0`}>
             <motion.div 
               className={`h-full ${activeColor.bg}`}
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 0.4, ease: "easeOut" }}
             />
          </div>
        </div>

        {/* Main Content Card Container */}
        <div className={`p-6 sm:p-10 rounded-2xl relative overflow-hidden ${colors.card} ${colors.shadow}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/5 to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {/* Step 1: Target Role */}
              {step === 1 && (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column (Options Grid) */}
                  <div className="flex-1 max-h-[45vh] overflow-y-auto pr-1 lg:pr-4 scrollbar-thin">
                    <div className="sticky top-0 z-10 pb-4 bg-background/50 dark:bg-[#181B28]/50 backdrop-blur-sm">
                      <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search roles or technical skills..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className={`w-full ${colors.inputBg} rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 ${activeColor.ring} transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45`}
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                       <div className="w-full flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Common Roles</span>
                          <div className={`h-px flex-1 ${colors.divider}`} />
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {ROADMAP_OPTIONS.roles.filter(r => r.toLowerCase().includes(searchTerm.toLowerCase())).map(role => (
                           <button 
                             key={role} 
                             onClick={() => { setData(p => ({ ...p, targetRole: role })); setShowCustomInput(false); }}
                             className={twMerge(
                               clsx(
                                 "text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between font-semibold cursor-pointer shadow-sm",
                                 data.targetRole === role 
                                    ? `${activeColor.border} ${activeColor.lightBg} ${activeColor.text} font-bold ring-1 ${activeColor.border}` 
                                    : `border-[#E2E8F0] dark:border-[#2E313D] bg-[#FFFFFF] dark:bg-[#0B0D17]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#181B28]/60 text-foreground ${activeColor.shadowGlow}`
                               )
                             )}
                           >
                             <span className="truncate mr-2">{role}</span>
                             {data.targetRole === role && <Check size={12} strokeWidth={3} className={`shrink-0 ${activeColor.text}`} />}
                           </button>
                         ))}
                       </div>
                    </div>

                    <div>
                       <div className="w-full flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Technologies</span>
                          <div className={`h-px flex-1 ${colors.divider}`} />
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {ROADMAP_OPTIONS.skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).map(skill => (
                           <button 
                             key={skill} 
                             onClick={() => { setData(p => ({ ...p, targetRole: skill })); setShowCustomInput(false); }}
                             className={twMerge(
                               clsx(
                                 "text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between font-semibold shadow-sm cursor-pointer",
                                 data.targetRole === skill 
                                    ? `${activeColor.border} ${activeColor.lightBg} ${activeColor.text} font-bold ring-1 ${activeColor.border}` 
                                    : `border-[#E2E8F0] dark:border-[#2E313D] bg-[#FFFFFF] dark:bg-[#0B0D17]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#181B28]/60 text-foreground ${activeColor.shadowGlow}`
                               )
                             )}
                           >
                             <span className="truncate mr-2">{skill}</span>
                             {data.targetRole === skill && <Check size={12} strokeWidth={3} className={`shrink-0 ${activeColor.text}`} />}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* Right Column (Custom & Github) */}
                  <div className="lg:w-1/3 flex flex-col gap-4">
                     <div className={`p-4 rounded-xl border border-[#E2E8F0] dark:border-[#2E313D] bg-[#F8FAFC] dark:bg-[#0D0F17]/40`}>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Custom entry</div>
                        <button 
                          onClick={() => setShowCustomInput(!showCustomInput)}
                          className="w-full p-2.5 rounded-xl border border-dashed border-border text-muted-foreground hover:bg-background transition-colors flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer"
                        >
                          <Plus size={14} /> {showCustomInput ? 'Cancel' : 'Enter Custom'}
                        </button>
                        <AnimatePresence>
                          {showCustomInput && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-3"
                            >
                               <input 
                                 type="text" 
                                 placeholder="e.g. AI Researcher" 
                                 value={data.targetRole} 
                                 onChange={e => setData(p => ({ ...p, targetRole: e.target.value }))}
                                 className={`w-full ${colors.inputBg} rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 ${activeColor.ring} transition-all font-semibold text-xs text-foreground`}
                                 autoFocus 
                               />
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>

                     <div className={`p-4 rounded-xl border border-[#E2E8F0] dark:border-[#2E313D] bg-[#4285F4]/5`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Globe size={14} className="text-[#4285F4]" />
                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">GitHub Handle</span>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Your GitHub username" 
                          value={data.githubUsername}
                          onChange={e => setData(p => ({ ...p, githubUsername: e.target.value }))} 
                          className={`w-full ${colors.inputBg} rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 ${activeColor.ring} transition-all font-semibold text-xs text-foreground`} 
                        />
                        <p className="text-[9px] text-muted-foreground mt-2.5 leading-relaxed font-bold">
                          We will scan your repos and tech stack to customize your career path.
                        </p>
                     </div>

                     {data.targetRole && (
                       <motion.div 
                         initial={{ scale: 0.98, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         className={`mt-auto ${activeColor.bg} p-4 rounded-xl shadow-md text-white border-transparent`}
                       >
                         <div className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">Current Goal</div>
                         <div className="text-sm font-black truncate">{data.targetRole}</div>
                       </motion.div>
                     )}
                  </div>
                </div>
              )}

              {/* Step 2: Weekly Hours */}
              {step === 2 && (
                <div className="max-w-md mx-auto py-4">
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 text-center">Available Time</div>
                  <div className="grid gap-3">
                    {HOURS.map(h => (
                      <button 
                        key={h} 
                        onClick={() => setData(p => ({ ...p, weeklyHours: h }))}
                        className={twMerge(
                          clsx(
                             "w-full flex items-center justify-between p-4 rounded-xl border transition-all group shadow-sm font-semibold cursor-pointer",
                             data.weeklyHours === h 
                                ? `${activeColor.border} ${activeColor.lightBg} ${activeColor.text} shadow-md font-bold`
                                : `border-[#E2E8F0] dark:border-[#2E313D] bg-[#FFFFFF] dark:bg-[#0B0D17]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#181B28]/60 text-foreground ${activeColor.shadowGlow}`
                          )
                        )}
                      >
                        <span className="font-extrabold">{h} hours per week</span>
                        <span className={clsx(
                          "text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md transition-colors",
                          data.weeklyHours === h ? `${activeColor.bg} text-white` : "bg-muted text-muted-foreground"
                        )}>
                          {h <= 5 ? 'Light' : h <= 10 ? 'Medium' : h <= 20 ? 'Professional' : 'Full-time'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Tech Stack */}
              {step === 3 && (
                <div className="max-w-2xl mx-auto py-4">
                  <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-6 text-center">Knowledge Base</div>
                  <div className="flex flex-wrap gap-2.5 justify-center">
                    {TECHS.map(tech => (
                      <button 
                         key={tech} 
                         onClick={() => toggleTech(tech)}
                         className={twMerge(
                           clsx(
                             "px-4 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer",
                             data.techStack.includes(tech) 
                                ? `${activeColor.border} ${activeColor.bg} text-white shadow-md scale-105` 
                                : `border-[#E2E8F0] dark:border-[#2E313D] bg-[#FFFFFF] dark:bg-[#0B0D17]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#181B28]/60 text-[#222222] dark:text-[#9AA0A6] ${activeColor.shadowGlow}`
                           )
                         )}
                      >
                        {data.techStack.includes(tech) && <Check size={12} strokeWidth={3} />}
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Skill Level */}
              {step === 4 && (
                <div className="max-w-md mx-auto grid gap-3 py-4">
                  {LEVELS.map((level, i) => (
                    <button 
                       key={level} 
                       onClick={() => setData(p => ({ ...p, proficiency: level }))}
                       className={twMerge(
                         clsx(
                            "w-full text-left p-5 rounded-xl border transition-all shadow-sm cursor-pointer",
                            data.proficiency === level 
                               ? `${activeColor.border} ${activeColor.lightBg} shadow-md` 
                               : `border-[#E2E8F0] dark:border-[#2E313D] bg-[#FFFFFF] dark:bg-[#0B0D17]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#181B28]/60 text-foreground ${activeColor.shadowGlow}`
                         )
                       )}
                    >
                      <div className={clsx("font-extrabold text-base mb-1", data.proficiency === level ? activeColor.text : "text-[#000000] dark:text-foreground")}>{level}</div>
                      <div className="text-xs text-muted-foreground font-semibold">
                        {i === 0 ? 'Learning basics. Looking for foundational guidance.' :
                         i === 1 ? 'Practical experience. Ready to build production apps.' :
                         'Experienced. Seeking architectural and high-level mastery.'}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 5: Urgency */}
              {step === 5 && (
                <div className="max-w-md mx-auto grid gap-3 py-4">
                  {URGENCY.map(({ value, label, desc, icon }) => (
                    <button 
                       key={value} 
                       onClick={() => setData(p => ({ ...p, careerUrgency: value }))}
                       className={twMerge(
                         clsx(
                            "w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 shadow-sm cursor-pointer",
                            data.careerUrgency === value 
                               ? `${activeColor.border} ${activeColor.lightBg} shadow-md` 
                               : `border-[#E2E8F0] dark:border-[#2E313D] bg-[#FFFFFF] dark:bg-[#0B0D17]/40 hover:bg-[#F8FAFC] dark:hover:bg-[#181B28]/60 text-foreground ${activeColor.shadowGlow}`
                         )
                       )}
                    >
                      <div className={clsx(
                        "w-12 h-12 shrink-0 flex items-center justify-center text-xl rounded-xl bg-muted dark:bg-[#181B28] border border-border",
                        data.careerUrgency === value && `${activeColor.lightBg} border ${activeColor.lightBorder}`
                      )}>
                        {icon}
                      </div>
                      <div>
                        <div className={clsx("font-extrabold text-sm", data.careerUrgency === value ? activeColor.text : "text-[#000000] dark:text-foreground")}>{label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Action Footer */}
          <div className={`flex gap-3 mt-10 border-t ${colors.divider} pt-6`}>
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)} 
                className={`flex-1 py-2.5 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 border text-sm shadow-sm cursor-pointer ${colors.btnMuted}`}
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            
            {step < STEPS.length ? (
              <button 
                onClick={() => setStep(s => s + 1)} 
                disabled={!canNext()} 
                className={clsx(
                  "flex-1 py-2.5 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer transition-colors",
                  canNext() 
                    ? `${activeColor.bg} hover:opacity-90 text-white` 
                    : "bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-60"
                )}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                 onClick={handleComplete} 
                 disabled={loading} 
                 className={clsx(
                   "flex-1 py-2.5 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer",
                   loading 
                     ? "bg-muted text-muted-foreground cursor-wait border border-border opacity-70" 
                     : `${activeColor.bg} hover:opacity-90 text-white hover:shadow-lg ${activeColor.shadowGlow}`
                 )}
              >
                {loading ? 'Initializing...' : <><Zap size={16} /> Complete Setup</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
