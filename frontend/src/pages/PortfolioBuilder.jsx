import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authAPI, aiAPI } from '@/api/client';
import {
  Monitor, Smartphone, Palette, Eye,
  RefreshCw, Github, ExternalLink, Sparkles, Layout, Settings,
  Globe, Share2, Rocket, Code, Terminal, Check, User, Briefcase,
  Mail, Linkedin, Link as LinkIcon, Plus, Trash2, GraduationCap,
  Award, Quote, BarChart3, Twitter, Globe2, FileCode2, Wand2,
  Heart, Star, Zap, Coffee, Download, ChevronLeft, ChevronRight,
  BookOpen, Shield, Hash, MapPin, Search, Grid, EyeOff, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   TEMPLATES & ACCENTS
   ═══════════════════════════════════════════════════════════ */
const TEMPLATES = [
  { id: 'minimal', icon: Monitor, label: 'Minimal', desc: 'Elegant & typography-focused' },
  { id: 'cyber', icon: Terminal, label: 'Cyber', desc: 'Neon command line terminal' },
  { id: 'bento', icon: Grid, label: 'Bento', desc: 'Premium responsive grid blocks' },
  { id: 'glass', icon: Globe2, label: 'Glass', desc: 'Frosted double-blur glassmorphism' },
  { id: 'devdark', icon: Sparkles, label: 'Midnight Aurora', desc: 'Sleek dark glass & colorful aurora glow' },
];

const ACCENTS = [
  { name: 'Azure', hex: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
  { name: 'Emerald', hex: '#10b981', glow: 'rgba(16,185,129,0.5)' },
  { name: 'Rose', hex: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
  { name: 'Amber', hex: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
  { name: 'Violet', hex: '#8b5cf6', glow: 'rgba(139,92,246,0.5)' },
  { name: 'Cyan', hex: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
];

const TABS = [
  { id: 'hero', label: 'Hero Banner', icon: Rocket },
  { id: 'about', label: 'About Me', icon: User },
  { id: 'skills', label: 'Tech Stack', icon: Code },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'experience', label: 'Experience', icon: GraduationCap },
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'certifications', label: 'Certs', icon: Shield },
  { id: 'achievements', label: 'Stats', icon: BarChart3 },
  { id: 'testimonials', label: 'Testimonials', icon: Quote },
  { id: 'contact', label: 'Contact Info', icon: Mail },
];

/* ═══════════════════════════════════════════════════════════
   REUSABLE FIELD COMPONENT
   ═══════════════════════════════════════════════════════════ */
function Field({ label, children, icon: Icon }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={10} className="text-muted-foreground group-focus-within:text-primary transition-colors" />}
        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">{label}</label>
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-card/40 border border-border/50 rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/35 shadow-sm";
const textareaCls = `${inputCls} resize-none leading-relaxed`;

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════ */
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const num = parseInt(value) || 0;
    let frame = 0;
    const totalFrames = 30;
    const timer = setInterval(() => {
      frame++;
      setCount(Math.round((frame / totalFrames) * num));
      if (frame >= totalFrames) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}{suffix}</>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN PORTFOLIO BUILDER
   ═══════════════════════════════════════════════════════════ */
export default function PortfolioBuilder() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const tabsRef = useRef(null);
  const previewRef = useRef(null);

  const [template, setTemplate] = useState('minimal');
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [publishing, setPublishing] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('hero');
  
  // 3D tilt perspective for preview container
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const [portfolioData, setPortfolioData] = useState({
    hero: {
      name: user?.name || 'Developer Name',
      role: user?.targetRole || 'Fullstack Engineer',
      tagline: 'Building digital experiences that matter.',
      ctaPrimary: 'View Projects',
      ctaSecondary: 'Contact Me',
      profileImage: null,
    },
    about: {
      bio: 'I architect high-performance web applications with a focus on clean code and elegant user experiences. Currently exploring distributed systems and AI integration.',
      experience: '2+ Years',
      niche: 'SaaS & Fintech',
      location: 'Remote',
    },
    skills: {
      frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      backend: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL'],
      tools: ['Git', 'Docker', 'AWS', 'Figma'],
    },
    projects: [
      { name: 'AI Roadmap Architect', desc: 'A MERN stack platform that leverages Gemini AI to generate personalized learning paths for developers.', tech: 'React, Node, Gemini', link: '#', github: '#' },
      { name: 'Crypto Pulse Dashboard', desc: 'Real-time cryptocurrency tracking dashboard with live candlestick charts and portfolio analytics.', tech: 'TypeScript, Recharts, WebSocket', link: '#', github: '#' },
    ],
    experience: [
      { company: 'Tech Corp', role: 'Fullstack Developer', duration: '2023 — Present', desc: 'Building high-performance APIs and pixel-perfect frontends for enterprise SaaS products.' }
    ],
    education: [
      { institution: 'University of Technology', degree: 'B.Tech Computer Science', year: '2020 — 2024', gpa: '8.5/10' }
    ],
    certifications: [
      { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', link: '#' }
    ],
    achievements: {
      projects: '12',
      commits: '1200',
      hackathons: '5',
      coffees: '99',
    },
    testimonials: [
      { quote: 'An exceptional developer with a keen eye for detail and performance.', name: 'Jane Smith', designation: 'Tech Lead, StartupCo' }
    ],
    contact: {
      email: user?.email || 'hello@dev.com',
      linkedin: 'linkedin.com/in/username',
      github: user?.githubUsername || 'github.com/username',
      twitter: '',
      website: '',
      leetcode: '',
    }
  });

  // Calculate completeness score based on entries filled
  const calculateCompleteness = () => {
    let score = 0;
    if (portfolioData.hero.name && portfolioData.hero.name !== 'Developer Name') score += 10;
    if (portfolioData.hero.role && portfolioData.hero.role !== 'Fullstack Engineer') score += 10;
    if (portfolioData.about.bio && portfolioData.about.bio.length > 25) score += 10;
    
    const skillsCount = 
      (portfolioData.skills.frontend?.length || 0) + 
      (portfolioData.skills.backend?.length || 0) + 
      (portfolioData.skills.tools?.length || 0);
    if (skillsCount >= 6) score += 15;
    else if (skillsCount >= 3) score += 10;
    else if (skillsCount > 0) score += 5;
    
    if (portfolioData.projects?.length > 1) score += 15;
    else if (portfolioData.projects?.length > 0) score += 10;
    
    if (portfolioData.experience?.length > 0) score += 10;
    if (portfolioData.education?.length > 0) score += 10;
    if (portfolioData.certifications?.length > 0) score += 5;
    
    const achCount = Object.values(portfolioData.achievements).filter(v => v && v !== '0' && v !== '').length;
    if (achCount >= 2) score += 5;
    
    if (portfolioData.contact.email) score += 5;
    const hasSocial = portfolioData.contact.github || portfolioData.contact.linkedin || portfolioData.contact.twitter || portfolioData.contact.website;
    if (hasSocial) score += 5;
    
    return score;
  };

  const completeness = calculateCompleteness();

  // Load saved data
  useEffect(() => {
    if (user?.portfolioData?.content) {
      const saved = user.portfolioData.content;
      setPortfolioData(prev => ({
        ...prev,
        ...saved,
        education: saved.education || prev.education,
        certifications: saved.certifications || prev.certifications,
        achievements: saved.achievements || prev.achievements,
        testimonials: saved.testimonials || prev.testimonials,
        contact: { ...prev.contact, ...(saved.contact || {}) },
        about: { ...prev.about, ...(saved.about || {}) },
      }));
      setTemplate(user.portfolioData.template || 'minimal');
      const savedAccent = ACCENTS.find(a => a.name === user.portfolioData.accentName);
      if (savedAccent) setAccent(savedAccent);
    }
  }, [user]);

  // Image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioData(prev => ({ ...prev, hero: { ...prev.hero, profileImage: reader.result } }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Publish
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await authAPI.updatePortfolio({
        portfolioData: { template, accentName: accent.name, accentHex: accent.hex, content: portfolioData }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Portfolio published successfully! 🚀');
      }
    } catch (err) {
      console.error('Publish failed:', err);
      toast.error('Failed to publish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  // Typewriter effect simulation for AI Generated text
  const typeText = (text) => {
    let index = 0;
    const timer = setInterval(() => {
      setPortfolioData(prev => ({
        ...prev,
        about: { ...prev.about, bio: text.substring(0, index) }
      }));
      index += 2;
      if (index > text.length) {
        clearInterval(timer);
        setPortfolioData(prev => ({
          ...prev,
          about: { ...prev.about, bio: text }
        }));
      }
    }, 15);
  };

  // AI Bio
  const handleGenerateBio = async () => {
    setGeneratingBio(true);
    try {
      const allSkills = [...portfolioData.skills.frontend, ...portfolioData.skills.backend, ...portfolioData.skills.tools];
      const { data } = await aiAPI.generateBio({
        role: portfolioData.hero.role,
        skills: allSkills,
        experience: portfolioData.about.experience,
        niche: portfolioData.about.niche,
      });
      if (data.success && data.bio) {
        typeText(data.bio);
        toast.success('AI bio generated with Gemini! ✨');
      }
    } catch {
      toast.error('Could not generate bio. Try again.');
    } finally {
      setGeneratingBio(false);
    }
  };

  // List helpers
  const addItem = (section, item) => setPortfolioData(prev => ({ ...prev, [section]: [...prev[section], item] }));
  const removeItem = (section, idx) => setPortfolioData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== idx) }));
  const updateItem = (section, idx, key, val) => {
    setPortfolioData(prev => {
      const arr = [...prev[section]];
      arr[idx] = { ...arr[idx], [key]: val };
      return { ...prev, [section]: arr };
    });
  };
  const addSkill = (cat) => {
    const skill = prompt('Enter skill name:');
    if (skill?.trim()) {
      setPortfolioData(prev => ({ ...prev, skills: { ...prev.skills, [cat]: [...prev.skills[cat], skill.trim()] } }));
    }
  };
  const removeSkill = (cat, idx) => {
    setPortfolioData(prev => ({ ...prev, skills: { ...prev.skills, [cat]: prev.skills[cat].filter((_, i) => i !== idx) } }));
  };

  // Tab scroll
  const scrollTabs = (dir) => {
    tabsRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  // 3D Hover tilt handler
  const handleMouseMove = (e) => {
    if (previewMode !== 'desktop') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 5, y: y * -5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER — EDITOR TABS
     ═══════════════════════════════════════════════════════════ */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'hero': return (
        <div className="space-y-4">
          <div className="flex items-center gap-5 p-4 bg-muted/20 rounded-2xl border border-dashed border-border/60 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border flex items-center justify-center group shadow-sm shrink-0 transition-transform duration-300 hover:scale-105">
              {portfolioData.hero.profileImage ? (
                <img src={portfolioData.hero.profileImage} className="w-full h-full object-cover animate-fade-in" alt="Profile" />
              ) : (
                <User size={28} className="text-muted-foreground/30" />
              )}
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Plus size={18} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="z-10">
              <div className="text-[10px] font-black uppercase text-foreground tracking-wider">Profile Avatar Image</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Recommended square JPG/PNG format</div>
            </div>
          </div>
          <Field label="Full Name" icon={User}>
            <input type="text" value={portfolioData.hero.name} onChange={e => setPortfolioData(p => ({ ...p, hero: { ...p.hero, name: e.target.value } }))} className={inputCls} placeholder="e.g. Shubham Yadav" />
          </Field>
          <Field label="Role / Title" icon={Briefcase}>
            <input type="text" value={portfolioData.hero.role} onChange={e => setPortfolioData(p => ({ ...p, hero: { ...p.hero, role: e.target.value } }))} className={inputCls} placeholder="e.g. Lead Dev & AI Engineer" />
          </Field>
          <Field label="Tagline" icon={Rocket}>
            <textarea rows={2} value={portfolioData.hero.tagline} onChange={e => setPortfolioData(p => ({ ...p, hero: { ...p.hero, tagline: e.target.value } }))} className={textareaCls} placeholder="Tell users what you build..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary CTA" icon={Check}>
              <input type="text" value={portfolioData.hero.ctaPrimary} onChange={e => setPortfolioData(p => ({ ...p, hero: { ...p.hero, ctaPrimary: e.target.value } }))} className={inputCls} />
            </Field>
            <Field label="Secondary CTA" icon={Mail}>
              <input type="text" value={portfolioData.hero.ctaSecondary} onChange={e => setPortfolioData(p => ({ ...p, hero: { ...p.hero, ctaSecondary: e.target.value } }))} className={inputCls} />
            </Field>
          </div>
        </div>
      );

      case 'about': return (
        <div className="space-y-4">
          <div className="relative">
            <Field label="Professional Bio" icon={User}>
              <textarea rows={6} value={portfolioData.about.bio} onChange={e => setPortfolioData(p => ({ ...p, about: { ...p.about, bio: e.target.value } }))} className={textareaCls} placeholder="Write a short summary about your background and achievements..." />
            </Field>
            {generatingBio && (
              <div className="absolute inset-0 bg-background/80 border border-violet-500/30 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 z-10 backdrop-blur-[2px]">
                <motion.div animate={{ y: [-45, 45] }} transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }} className="w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent shadow-[0_0_12px_#8b5cf6]" />
                <span className="text-[9px] font-black tracking-widest uppercase text-violet-500 dark:text-violet-400 animate-pulse flex items-center gap-1.5"><Sparkles size={11} className="animate-spin" /> Gemini AI Scanning Profile...</span>
              </div>
            )}
          </div>
          
          <button onClick={handleGenerateBio} disabled={generatingBio} className="w-full group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/25 hover:border-violet-500/50 text-violet-500 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all cursor-pointer disabled:opacity-50 select-none overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-500/20 to-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            {generatingBio ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} className="text-violet-500 group-hover/btn:animate-pulse" />}
            {generatingBio ? 'Syncing with Gemini...' : 'Draft Bio with Gemini AI'}
          </button>
          
          <div className="grid grid-cols-3 gap-3">
            <Field label="Experience" icon={Briefcase}>
              <input type="text" value={portfolioData.about.experience} onChange={e => setPortfolioData(p => ({ ...p, about: { ...p.about, experience: e.target.value } }))} className={inputCls} />
            </Field>
            <Field label="Domain" icon={Code}>
              <input type="text" value={portfolioData.about.niche} onChange={e => setPortfolioData(p => ({ ...p, about: { ...p.about, niche: e.target.value } }))} className={inputCls} />
            </Field>
            <Field label="Location" icon={MapPin}>
              <input type="text" value={portfolioData.about.location || ''} onChange={e => setPortfolioData(p => ({ ...p, about: { ...p.about, location: e.target.value } }))} className={inputCls} />
            </Field>
          </div>
        </div>
      );

      case 'skills': return (
        <div className="space-y-5">
          {['frontend', 'backend', 'tools'].map(cat => (
            <div key={cat} className="space-y-2 p-3 bg-muted/10 border border-border/30 rounded-xl">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5" style={{ color: accent.hex }}>
                {cat === 'frontend' ? <Monitor size={10} /> : cat === 'backend' ? <Code size={10} /> : <Settings size={10} />}
                {cat} Core
              </label>
              <div className="flex flex-wrap gap-1.5">
                {portfolioData.skills[cat].map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-card/65 text-[10px] font-bold border border-border/50 flex items-center gap-1.5 text-foreground group shadow-sm transition-transform hover:-translate-y-[1px]">
                    {s}
                    <button onClick={() => removeSkill(cat, i)} className="text-rose-500/60 hover:text-rose-500 transition-opacity text-xs leading-none cursor-pointer">×</button>
                  </span>
                ))}
                <button onClick={() => addSkill(cat)} className="px-2.5 py-1 rounded-lg bg-primary/8 text-primary text-[10px] font-black border border-dashed border-primary/25 hover:bg-primary/15 transition-all cursor-pointer flex items-center gap-1">
                  <Plus size={10} /> Add Tag
                </button>
              </div>
            </div>
          ))}
        </div>
      );

      case 'projects': return (
        <div className="space-y-3">
          {portfolioData.projects.map((p, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card/45 border border-border/50 space-y-2.5 relative group shadow-sm">
              <button onClick={() => removeItem('projects', i)} className="absolute top-2.5 right-2.5 text-muted-foreground/40 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
              <input type="text" value={p.name} onChange={e => updateItem('projects', i, 'name', e.target.value)} placeholder="Project Title" className="bg-transparent font-black text-foreground outline-none text-xs w-[90%] border-b border-transparent focus:border-border/30 pb-0.5" />
              <textarea value={p.desc} rows={2} onChange={e => updateItem('projects', i, 'desc', e.target.value)} placeholder="Explain the project value, features..." className="bg-transparent text-muted-foreground outline-none text-[10px] w-full resize-none leading-relaxed placeholder:text-muted-foreground/35" />
              <input type="text" value={p.tech} onChange={e => updateItem('projects', i, 'tech', e.target.value)} placeholder="Stack: e.g. Node, React, Redis" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold w-full text-foreground" />
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-muted/25 border border-border/40 rounded-lg px-2 py-1">
                  <LinkIcon size={10} className="text-muted-foreground shrink-0" />
                  <input type="text" value={p.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} placeholder="Demo URL" className="bg-transparent text-[9px] font-semibold outline-none w-full text-foreground" />
                </div>
                <div className="flex items-center gap-1.5 bg-muted/25 border border-border/40 rounded-lg px-2 py-1">
                  <Github size={10} className="text-muted-foreground shrink-0" />
                  <input type="text" value={p.github} onChange={e => updateItem('projects', i, 'github', e.target.value)} placeholder="GitHub URL" className="bg-transparent text-[9px] font-semibold outline-none w-full text-foreground" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => addItem('projects', { name: 'Interactive Hub Project', desc: 'Detailed case study details...', tech: 'React, Node.js', link: '#', github: '#' })} className="w-full py-3 border border-dashed border-border/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5 flex items-center justify-center gap-1.5 select-none">
            <Plus size={12} /> Add Project card
          </button>
        </div>
      );

      case 'experience': return (
        <div className="space-y-3">
          {portfolioData.experience.map((exp, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card/45 border border-border/50 space-y-2 relative shadow-sm">
              <button onClick={() => removeItem('experience', i)} className="absolute top-2.5 right-2.5 text-muted-foreground/40 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
              <input type="text" value={exp.company} onChange={e => updateItem('experience', i, 'company', e.target.value)} placeholder="Company / Enterprise" className="bg-transparent font-black text-foreground outline-none text-xs w-[90%] border-b border-transparent focus:border-border/30 pb-0.5" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={exp.role} onChange={e => updateItem('experience', i, 'role', e.target.value)} placeholder="e.g. Lead Engineer" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
                <input type="text" value={exp.duration} onChange={e => updateItem('experience', i, 'duration', e.target.value)} placeholder="e.g. 2024 — Present" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
              </div>
              <textarea value={exp.desc || ''} rows={2} onChange={e => updateItem('experience', i, 'desc', e.target.value)} placeholder="Highlight contributions, features built, performance improvements..." className="bg-transparent text-muted-foreground outline-none text-[10px] w-full resize-none leading-relaxed" />
            </div>
          ))}
          <button onClick={() => addItem('experience', { company: 'Google Inc.', role: 'Senior Engineer', duration: '2025 — Present', desc: '' })} className="w-full py-3 border border-dashed border-border/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5 flex items-center justify-center gap-1.5 select-none">
            <Plus size={12} /> Add Experience
          </button>
        </div>
      );

      case 'education': return (
        <div className="space-y-3">
          {portfolioData.education.map((edu, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card/45 border border-border/50 space-y-2 relative shadow-sm">
              <button onClick={() => removeItem('education', i)} className="absolute top-2.5 right-2.5 text-muted-foreground/40 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
              <input type="text" value={edu.institution} onChange={e => updateItem('education', i, 'institution', e.target.value)} placeholder="Academy / University" className="bg-transparent font-black text-foreground outline-none text-xs w-[90%] border-b border-transparent focus:border-border/30 pb-0.5" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={edu.degree} onChange={e => updateItem('education', i, 'degree', e.target.value)} placeholder="e.g. Master of Computer Applications" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
                <input type="text" value={edu.year} onChange={e => updateItem('education', i, 'year', e.target.value)} placeholder="e.g. 2021 — 2025" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
              </div>
              <input type="text" value={edu.gpa || ''} onChange={e => updateItem('education', i, 'gpa', e.target.value)} placeholder="GPA / Marks: e.g. 9.2 CGPA" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground w-full" />
            </div>
          ))}
          <button onClick={() => addItem('education', { institution: 'IIT Delhi', degree: 'B.Tech CSE', year: '2022 — 2026', gpa: '' })} className="w-full py-3 border border-dashed border-border/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5 flex items-center justify-center gap-1.5 select-none">
            <Plus size={12} /> Add Education log
          </button>
        </div>
      );

      case 'certifications': return (
        <div className="space-y-3">
          {portfolioData.certifications.map((cert, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card/45 border border-border/50 space-y-2 relative shadow-sm">
              <button onClick={() => removeItem('certifications', i)} className="absolute top-2.5 right-2.5 text-muted-foreground/40 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
              <input type="text" value={cert.name} onChange={e => updateItem('certifications', i, 'name', e.target.value)} placeholder="Certification / Skill Badge" className="bg-transparent font-black text-foreground outline-none text-xs w-[90%] border-b border-transparent focus:border-border/30 pb-0.5" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={cert.issuer} onChange={e => updateItem('certifications', i, 'issuer', e.target.value)} placeholder="Issuer (e.g. AWS, Coursera)" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
                <input type="text" value={cert.date} onChange={e => updateItem('certifications', i, 'date', e.target.value)} placeholder="Date Issued" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
              </div>
              <div className="flex items-center gap-1.5 bg-muted/25 border border-border/40 rounded-lg px-2 py-1">
                <LinkIcon size={10} className="text-muted-foreground shrink-0" />
                <input type="text" value={cert.link || ''} onChange={e => updateItem('certifications', i, 'link', e.target.value)} placeholder="Verification Badge Link" className="bg-transparent text-[9px] font-semibold outline-none w-full text-foreground" />
              </div>
            </div>
          ))}
          <button onClick={() => addItem('certifications', { name: 'AWS Cloud Solutions Architect', issuer: 'Amazon Web Services', date: '2025', link: '' })} className="w-full py-3 border border-dashed border-border/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5 flex items-center justify-center gap-1.5 select-none">
            <Plus size={12} /> Add Certification
          </button>
        </div>
      );

      case 'achievements': return (
        <div className="space-y-4">
          <p className="text-[9.5px] text-muted-foreground font-semibold uppercase tracking-wider">Metrics and Achievement Data</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'projects', label: 'Projects Built', icon: Briefcase },
              { key: 'commits', label: 'Total Commits', icon: Github },
              { key: 'hackathons', label: 'Hackathons won', icon: Zap },
              { key: 'coffees', label: 'Coffees Consumed', icon: Coffee },
            ].map(({ key, label, icon: Icon }) => (
              <Field key={key} label={label}>
                <div className="flex items-center gap-2 bg-card/40 border border-border/50 rounded-xl px-3 py-1 text-foreground focus-within:border-primary transition-colors shadow-sm">
                  <Icon size={12} className="text-muted-foreground shrink-0" />
                  <input type="text" value={portfolioData.achievements[key]} onChange={e => setPortfolioData(p => ({ ...p, achievements: { ...p.achievements, [key]: e.target.value } }))} className="bg-transparent border-0 outline-none w-full text-xs font-black" />
                </div>
              </Field>
            ))}
          </div>
        </div>
      );

      case 'testimonials': return (
        <div className="space-y-3">
          {portfolioData.testimonials.map((t, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card/45 border border-border/50 space-y-2 relative shadow-sm">
              <button onClick={() => removeItem('testimonials', i)} className="absolute top-2.5 right-2.5 text-muted-foreground/40 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
              <textarea value={t.quote} rows={2} onChange={e => updateItem('testimonials', i, 'quote', e.target.value)} placeholder="Recommendation / testimonial from teammate or lead..." className="bg-transparent text-foreground outline-none text-[10px] w-full resize-none leading-relaxed italic" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={t.name} onChange={e => updateItem('testimonials', i, 'name', e.target.value)} placeholder="Recommender Name" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
                <input type="text" value={t.designation} onChange={e => updateItem('testimonials', i, 'designation', e.target.value)} placeholder="e.g. PM, Google" className="bg-muted/40 border border-border/40 rounded-lg px-2.5 py-1 text-[9px] font-bold text-foreground" />
              </div>
            </div>
          ))}
          <button onClick={() => addItem('testimonials', { quote: '', name: '', designation: '' })} className="w-full py-3 border border-dashed border-border/50 rounded-xl text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer bg-muted/5 flex items-center justify-center gap-1.5 select-none">
            <Plus size={12} /> Add Recommendation
          </button>
        </div>
      );

      case 'contact': return (
          <div className="space-y-3.5">
          {[
            { icon: Mail, key: 'email', label: 'Primary Contact Email' },
            { icon: Linkedin, key: 'linkedin', label: 'LinkedIn Username (e.g. user-name)' },
            { icon: Github, key: 'github', label: 'GitHub Username (e.g. user-name)' },
            { icon: Twitter, key: 'twitter', label: 'Twitter / X Handle' },
            { icon: Globe2, key: 'website', label: 'Personal Website URL' },
            { icon: Hash, key: 'leetcode', label: 'LeetCode Handle' },
          ].map(({ icon: Icon, key, label }) => (
            <div key={key} className="flex items-center gap-3 bg-card/45 border border-border/50 rounded-xl px-3.5 py-1 group shadow-sm focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <Icon size={14} className="text-muted-foreground group-focus-within:text-primary transition-colors shrink-0" />
              <input type="text" value={portfolioData.contact[key] || ''} onChange={e => setPortfolioData(p => ({ ...p, contact: { ...p.contact, [key]: e.target.value } }))} placeholder={label} className="bg-transparent border-0 outline-none w-full text-xs py-2 text-foreground font-semibold placeholder:text-muted-foreground/35" />
            </div>
          ))}
        </div>
      );
      default: return null;
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER — LIVE PREVIEW TEMPLATES
     ═══════════════════════════════════════════════════════════ */
  const d = portfolioData;
  const t = template;
  const a = accent;

  const previewCard = t === 'cyber' ? 'bg-slate-900/60 border-cyan-500/15' : t === 'devdark' ? 'bg-slate-900/40 border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300' : t === 'glass' ? 'bg-white/5 backdrop-blur-xl border-white/10 shadow-lg shadow-black/10' : t === 'bento' ? 'bg-card/45 border-border/50 shadow-sm' : 'bg-card/30 border-border/40';

  const renderPreview = () => {
    // 1) MINIMAL TEMPLATE
    if (t === 'minimal') {
      return (
        <div className="flex flex-col min-h-[750px] p-8 space-y-12 bg-background text-foreground">
          {/* Hero */}
          <div className="flex justify-between items-start border-b border-border/40 pb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">{d.hero.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: a.hex }}>{d.hero.role}</p>
              <p className="text-xs text-muted-foreground italic font-medium">"{d.hero.tagline}"</p>
            </div>
            {d.hero.profileImage && (
              <div className="w-16 h-16 rounded-full overflow-hidden border border-border shadow-sm">
                <img src={d.hero.profileImage} className="w-full h-full object-cover" alt="" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-10">
            <div className="space-y-10">
              {/* About Bio */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Biography</h4>
                <p className="text-xs leading-relaxed font-medium text-foreground">{d.about.bio}</p>
                <div className="grid grid-cols-3 gap-2.5 pt-2 text-[10px] text-muted-foreground font-semibold">
                  <div>Experience: <span className="text-foreground font-black">{d.about.experience}</span></div>
                  <div>Domain: <span className="text-foreground font-black">{d.about.niche}</span></div>
                  <div>Location: <span className="text-foreground font-black">{d.about.location || 'Remote'}</span></div>
                </div>
              </section>

              {/* Projects */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Selected Work</h4>
                <div className="space-y-4">
                  {d.projects.map((p, idx) => (
                    <div key={idx} className="group border-l border-border/50 pl-4 py-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black group-hover:text-primary transition-colors">{p.name}</span>
                        <div className="flex gap-2">
                          {p.github && <a href={p.github} className="text-muted-foreground hover:text-foreground"><Github size={10} /></a>}
                          {p.link && <a href={p.link} className="text-muted-foreground hover:text-foreground"><ExternalLink size={10} /></a>}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{p.desc}</p>
                      <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider">{p.tech}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Experience */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Experience</h4>
                <div className="space-y-4">
                  {d.experience.map((exp, idx) => (
                    <div key={idx} className="text-xs flex gap-4">
                      <span className="w-24 text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5" style={{ color: a.hex }}>{exp.duration}</span>
                      <div className="space-y-1">
                        <div className="font-black text-foreground">{exp.company}</div>
                        <div className="text-[10px] text-muted-foreground font-bold">{exp.role}</div>
                        {exp.desc && <div className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">{exp.desc}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              {d.education?.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Education</h4>
                  <div className="space-y-3">
                    {d.education.map((edu, idx) => (
                      <div key={idx} className="text-xs flex gap-4">
                        <span className="w-24 text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5" style={{ color: a.hex }}>{edu.year}</span>
                        <div className="space-y-0.5">
                          <div className="font-black text-foreground">{edu.institution}</div>
                          <div className="text-[10px] text-muted-foreground font-bold">{edu.degree} {edu.gpa ? `· ${edu.gpa}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-10">
              {/* Skills */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Stack</h4>
                {Object.entries(d.skills).map(([cat, list]) => (
                  <div key={cat} className="space-y-1.5">
                    <div className="text-[8px] font-black uppercase text-foreground/60 tracking-wider">{cat}</div>
                    <div className="flex flex-wrap gap-1">
                      {list.map((s, idx) => (
                        <span key={idx} className="text-[9px] font-semibold text-muted-foreground bg-muted/40 border border-border/30 px-1.5 py-0.5 rounded-lg">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* Achievements stats */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {Object.entries(d.achievements).map(([k, v]) => (
                    <div key={k} className="p-2.5 border border-border/40 rounded-xl bg-card/10">
                      <div className="text-xs font-black text-foreground"><AnimatedCounter value={v} /></div>
                      <div className="text-[7px] text-muted-foreground uppercase mt-0.5">{k}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certs */}
              {d.certifications?.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Credentials</h4>
                  <div className="space-y-2">
                    {d.certifications.map((c, idx) => (
                      <div key={idx} className="text-[9.5px] border-b border-border/30 pb-1.5">
                        <span className="font-black text-foreground">{c.name}</span>
                        <div className="text-muted-foreground text-[8px] mt-0.5">{c.issuer} · {c.date}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Testimonials */}
              {d.testimonials?.length > 0 && d.testimonials[0]?.quote && (
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">// Endorsement</h4>
                  <div className="space-y-2">
                    {d.testimonials.filter(t => t.quote).map((t, idx) => (
                      <div key={idx} className="text-[9px] bg-muted/20 border border-border/30 p-2.5 rounded-xl italic leading-relaxed text-muted-foreground">
                        "{t.quote}"
                        <div className="text-[8px] font-black uppercase text-foreground not-italic mt-1.5">— {t.name}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Footer Contact */}
          <div className="border-t border-border/40 pt-6 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
            {d.contact.email && <span className="flex items-center gap-1"><Mail size={10} style={{ color: a.hex }} /> {d.contact.email}</span>}
            {d.contact.github && <span className="flex items-center gap-1"><Github size={10} style={{ color: a.hex }} /> {d.contact.github}</span>}
            {d.contact.linkedin && <span className="flex items-center gap-1"><Linkedin size={10} style={{ color: a.hex }} /> {d.contact.linkedin}</span>}
          </div>
        </div>
      );
    }

    // 2) CYBERPUNK TERMINAL TEMPLATE
    if (t === 'cyber') {
      return (
        <div className="flex flex-col min-h-[750px] p-8 font-mono text-cyan-400 space-y-8 relative overflow-hidden bg-[#060a12]">
          {/* Glitch CRT Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-30" />

          {/* Header */}
          <div className="flex justify-between items-start border-b border-cyan-500/20 pb-4">
            <div className="space-y-1">
              <div className="text-[9px] opacity-40">SYSTEM://PORTFOLIO_NODE</div>
              <h2 className="text-xl font-black tracking-widest uppercase text-white" style={{ textShadow: `0 0 10px ${a.glow}` }}>{d.hero.name}</h2>
              <div className="text-[9px] font-bold uppercase tracking-widest animate-pulse" style={{ color: a.hex }}>&gt; {d.hero.role}</div>
            </div>
            {d.hero.profileImage ? (
              <div className="w-12 h-12 border-2 relative shrink-0" style={{ borderColor: a.hex, boxShadow: `0 0 10px ${a.glow}` }}>
                <img src={d.hero.profileImage} className="w-full h-full object-cover grayscale brightness-125 hover:grayscale-0 transition-all duration-300" alt="" />
                <div className="absolute inset-0 border border-black/40" />
              </div>
            ) : (
              <div className="w-10 h-10 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400">[0x{d.hero.name[0]}]</div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 text-[10px] text-cyan-300 leading-relaxed font-semibold">
              <span className="text-pink-500 font-bold">INFO: </span>"{d.hero.tagline}"
            </div>

            {/* Biography */}
            <section className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-widest">// cat biography.txt</div>
              <p className="text-[10.5px] leading-relaxed text-slate-300">{d.about.bio}</p>
            </section>

            {/* Achievements Grid */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(d.achievements).map(([k, v]) => (
                <div key={k} className="p-2 border border-cyan-500/15 bg-slate-950/60 rounded text-center">
                  <div className="text-white text-xs font-black"><AnimatedCounter value={v} /></div>
                  <div className="text-[7.5px] opacity-40 uppercase tracking-wider mt-0.5">{k}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <section className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-widest">// ls core_modules/</div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(d.skills).map(([cat, list]) => (
                  <div key={cat} className="space-y-1.5 border border-cyan-500/10 p-2.5 rounded bg-slate-950/40">
                    <span className="text-[8px] font-black uppercase text-pink-500">{cat}</span>
                    <div className="flex flex-wrap gap-1">
                      {list.map((s, idx) => (
                        <span key={idx} className="text-[8.5px] px-1 bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="space-y-2.5">
              <div className="text-[10px] text-white/50 uppercase tracking-widest">// sh execute_exploits.sh</div>
              <div className="space-y-2">
                {d.projects.map((p, idx) => (
                  <div key={idx} className="p-2.5 border border-cyan-500/20 bg-slate-950/60 rounded flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="text-[10.5px] font-bold text-white flex items-center gap-1.5">
                        <Terminal size={10} style={{ color: a.hex }} />
                        {p.name}
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-normal">{p.desc}</p>
                      <div className="text-[7.5px] font-black uppercase text-cyan-500/70">{p.tech}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {p.github && <a href={p.github} className="p-1 hover:bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded"><Github size={10} /></a>}
                      {p.link && <a href={p.link} className="p-1 hover:bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded"><ExternalLink size={10} /></a>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline (Experience + Education) */}
            <section className="space-y-2.5">
              <div className="text-[10px] text-white/50 uppercase tracking-widest">// cat chronological_logs.db</div>
              <div className="space-y-3.5 border border-cyan-500/10 p-3 rounded bg-slate-950/40">
                {/* Exp */}
                {d.experience.map((exp, idx) => (
                  <div key={idx} className="text-[10px] space-y-0.5 border-l border-cyan-500/20 pl-3">
                    <div className="text-white font-bold">{exp.company} &lt;{exp.role}&gt;</div>
                    <div className="text-[8.5px] text-pink-500 font-black">{exp.duration}</div>
                    {exp.desc && <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">{exp.desc}</p>}
                  </div>
                ))}
                {/* Edu */}
                {d.education.map((edu, idx) => (
                  <div key={idx} className="text-[10px] space-y-0.5 border-l border-cyan-500/20 pl-3">
                    <div className="text-white font-bold">{edu.institution} &lt;{edu.degree}&gt;</div>
                    <div className="text-[8.5px] text-pink-500 font-black">{edu.year} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {d.certifications?.length > 0 && (
              <section className="space-y-2">
                <div className="text-[10px] text-white/50 uppercase tracking-widest">// check security_credentials.sha256</div>
                <div className="flex flex-wrap gap-2">
                  {d.certifications.map((c, idx) => (
                    <div key={idx} className="px-2.5 py-1.5 border border-cyan-500/15 bg-slate-950/60 rounded text-[9px]">
                      <span className="text-white font-bold">{c.name}</span> · <span className="opacity-70">{c.issuer}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Testimonials */}
            {d.testimonials?.length > 0 && d.testimonials[0]?.quote && (
              <section className="space-y-2">
                <div className="text-[10px] text-white/50 uppercase tracking-widest">// read peer_recommendations.md</div>
                <div className="space-y-2">
                  {d.testimonials.filter(t => t.quote).map((t, idx) => (
                    <div key={idx} className="p-3 border border-cyan-500/10 rounded bg-slate-950/40 text-[9.5px] text-slate-300">
                      "{t.quote}"
                      <div className="text-[8.5px] font-black text-pink-500 uppercase mt-1">— {t.name} ({t.designation})</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Contact Prompt */}
          <div className="border-t border-cyan-500/20 pt-4 text-[9.5px] opacity-75">
            <div>developer@campuspath:~$ mail -s "inquiry" {d.contact.email}</div>
            <div className="mt-1 flex gap-4 text-cyan-300">
              {d.contact.github && <span>GitHub: {d.contact.github}</span>}
              {d.contact.linkedin && <span>LinkedIn: {d.contact.linkedin}</span>}
            </div>
          </div>
        </div>
      );
    }

    // 3) BENTO GRID TEMPLATE
    if (t === 'bento') {
      return (
        <div className="flex flex-col min-h-screen p-3 sm:p-6 space-y-3 bg-background text-foreground">
          {/* Row 1: Hero + Avatar side by side on all screens */}
          <div className="flex gap-3">
            {/* Box 1: Hero - takes up most space */}
            <div className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl border flex flex-col justify-between ${previewCard}`}>
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[8px] font-black uppercase tracking-[0.25em]" style={{ color: a.hex }}>Identity Node</span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground leading-tight">{d.hero.name}</h2>
                <div className="text-[10px] sm:text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{d.hero.role}</div>
              </div>
              <p className="text-xs sm:text-[10px] text-muted-foreground font-medium leading-relaxed mt-3">"{d.hero.tagline}"</p>
            </div>
            {/* Box 2: Avatar */}
            <div className={`w-24 sm:w-32 flex-shrink-0 p-3 rounded-2xl border flex items-center justify-center relative overflow-hidden ${previewCard}`}>
              {d.hero.profileImage ? (
                <img src={d.hero.profileImage} className="absolute inset-0 w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ backgroundColor: a.hex }}>
                  {d.hero.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* All remaining boxes in responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Box 3: About Bio */}
            <div className={`col-span-1 sm:col-span-2 lg:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-2.5 ${previewCard}`}>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                <User size={10} style={{ color: a.hex }} /> About Profile
              </div>
              <p className="text-xs sm:text-[10px] leading-relaxed font-medium text-foreground">{d.about.bio}</p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { l: 'Experience', v: d.about.experience },
                  { l: 'Niche', v: d.about.niche },
                  { l: 'Location', v: d.about.location || 'Remote' }
                ].map(item => (
                  <div key={item.l} className="p-2 bg-muted/20 border border-border/30 rounded-xl">
                    <span className="text-[8px] font-black uppercase text-muted-foreground block">{item.l}</span>
                    <span className="font-bold text-xs sm:text-[9px] text-foreground block mt-0.5 truncate">{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 4: Metrics achievements */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between ${previewCard}`}>
              <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Pulse Stats</span>
              <div className="grid grid-cols-2 gap-2 text-center py-2">
                {Object.entries(d.achievements).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-sm sm:text-xs font-black text-foreground"><AnimatedCounter value={v} /></div>
                    <div className="text-[8px] sm:text-[6.5px] text-muted-foreground uppercase leading-tight mt-0.5">{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 5: Skills Stack */}
            <div className={`p-4 rounded-2xl border space-y-3 ${previewCard}`}>
              <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Core Stack</span>
              <div className="space-y-2.5">
                {Object.entries(d.skills).map(([cat, list]) => (
                  <div key={cat} className="space-y-1">
                    <div className="text-[9px] font-black uppercase text-muted-foreground/80">{cat}</div>
                    <div className="flex flex-wrap gap-1">
                      {list.map((s, idx) => (
                        <span key={idx} className="text-[10px] sm:text-[8.5px] font-bold bg-muted/40 border border-border/30 px-1.5 py-0.5 rounded-lg text-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 6: Selected Projects - full width */}
            <div className={`col-span-1 sm:col-span-2 lg:col-span-3 p-4 sm:p-5 rounded-2xl border space-y-3 ${previewCard}`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Featured Exploits</span>
                <span className="text-[9px] sm:text-[8px] font-semibold text-muted-foreground/60">{d.projects.length} Total</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {d.projects.map((p, idx) => (
                  <div key={idx} className="p-3 bg-muted/15 border border-border/40 rounded-xl flex justify-between items-start hover:bg-muted/25 transition-colors">
                    <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                      <h5 className="font-black text-xs text-foreground truncate">{p.name}</h5>
                      <p className="text-[10px] sm:text-[9.5px] text-muted-foreground line-clamp-2">{p.desc}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {p.github && <a href={p.github} className="text-muted-foreground hover:text-foreground"><Github size={12} /></a>}
                      {p.link && <a href={p.link} className="text-muted-foreground hover:text-foreground"><ExternalLink size={12} /></a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 7: Experience Timeline */}
            <div className={`col-span-1 sm:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-3 ${previewCard}`}>
              <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Work Log</span>
              <div className="space-y-3">
                {d.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-4 border-l border-border/50">
                    <div className="absolute top-1.5 left-[-3.5px] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.hex }} />
                    <div className="text-xs sm:text-[10px] font-black text-foreground">{exp.company} — <span className="text-muted-foreground font-medium">{exp.role}</span></div>
                    <div className="text-[9px] sm:text-[7.5px] font-black uppercase mt-0.5" style={{ color: a.hex }}>{exp.duration}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 8: Education */}
            <div className={`p-4 rounded-2xl border space-y-3 ${previewCard}`}>
              <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Education</span>
              <div className="space-y-2.5">
                {d.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="font-black text-xs text-foreground truncate">{edu.institution}</div>
                    <div className="text-muted-foreground text-[9px] sm:text-[8px] mt-0.5 truncate">{edu.degree}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 9: Certs */}
            <div className={`p-4 rounded-2xl border space-y-3 ${previewCard}`}>
              <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Certs</span>
              <div className="space-y-2.5">
                {d.certifications.map((c, idx) => (
                  <div key={idx}>
                    <span className="font-black text-xs text-foreground block truncate">{c.name}</span>
                    <span className="text-muted-foreground text-[9px] sm:text-[7.5px] block">{c.issuer}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 10: Testimonials */}
            {d.testimonials?.length > 0 && d.testimonials[0]?.quote && (
              <div className={`col-span-1 sm:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-3 ${previewCard}`}>
                <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Endorsements</span>
                <div className="space-y-2.5">
                  {d.testimonials.filter(t => t.quote).map((t, idx) => (
                    <div key={idx} className="text-xs sm:text-[9.5px] leading-relaxed text-muted-foreground italic">
                      "{t.quote}" <span className="font-bold text-foreground not-italic text-[9px] sm:text-[8px] uppercase">— {t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 11: Contacts footer - full width */}
            <div className={`col-span-1 sm:col-span-2 lg:col-span-3 p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 sm:gap-4 text-[10px] font-black uppercase tracking-widest items-start sm:items-center justify-between ${previewCard}`}>
              <span className="whitespace-nowrap">BENTO LABS IDENTITY</span>
              <div className="flex flex-wrap gap-3">
                {d.contact.email && <span className="break-all">{d.contact.email}</span>}
                {d.contact.github && <span>GitHub</span>}
                {d.contact.linkedin && <span>LinkedIn</span>}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4) GLASSMORPHISM TEMPLATE
    if (t === 'glass') {
      return (
        <div className="flex flex-col min-h-[750px] p-6 relative overflow-hidden bg-slate-950 text-white">
          {/* Neon Floating blur spheres */}
          <div className="absolute top-10 left-10 w-28 h-28 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-36 h-36 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          {/* Translucent Glass page card */}
          <div className={`p-6 rounded-3xl border flex-1 flex flex-col justify-between ${previewCard}`}>
            <div className="space-y-6">
              {/* Header profile */}
              <div className="flex justify-between items-center pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {d.hero.profileImage ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20">
                      <img src={d.hero.profileImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs">{d.hero.name[0]}</div>
                  )}
                  <div>
                    <h3 className="text-xs font-black text-white">{d.hero.name}</h3>
                    <span className="text-[8.5px] uppercase tracking-wider block" style={{ color: a.hex }}>{d.hero.role}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {d.contact.github && <a href={`https://${d.contact.github}`} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white"><Github size={11} /></a>}
                  {d.contact.linkedin && <a href={`https://${d.contact.linkedin}`} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white"><Linkedin size={11} /></a>}
                </div>
              </div>

              {/* Tagline details */}
              <p className="text-xs leading-relaxed text-white/90 font-semibold italic">"{d.hero.tagline}"</p>

              {/* Double Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side */}
                <div className="space-y-4">
                  {/* Bio */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Bio Profile</span>
                    <p className="text-[9.5px] leading-relaxed text-white/80">{d.about.bio}</p>
                  </div>

                  {/* Work Timeline */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Experience</span>
                    <div className="space-y-3">
                      {d.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-3 border-l border-white/10 text-[9.5px]">
                          <div className="absolute top-1 left-[-2px] w-1 h-1 rounded-full bg-white" />
                          <div className="font-bold text-white">{exp.company} — {exp.role}</div>
                          <div className="text-[8px] opacity-60 mt-0.5">{exp.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Education</span>
                    <div className="space-y-2">
                      {d.education.map((edu, idx) => (
                        <div key={idx} className="text-[9.5px]">
                          <div className="font-bold text-white">{edu.institution}</div>
                          <div className="text-[8px] opacity-60">{edu.degree} · {edu.year}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="space-y-4">
                  {/* Metrics */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Metrics</span>
                    <div className="grid grid-cols-2 gap-2 text-center py-1">
                      {Object.entries(d.achievements).map(([k, v]) => (
                        <div key={k}>
                          <div className="text-xs font-black text-white"><AnimatedCounter value={v} /></div>
                          <span className="text-[6.5px] text-white/55 uppercase">{k}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills Stack */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Technical Stack</span>
                    <div className="space-y-2">
                      {Object.entries(d.skills).map(([cat, list]) => (
                        <div key={cat} className="space-y-1">
                          <span className="text-[7.5px] font-black uppercase text-white/50">{cat}</span>
                          <div className="flex flex-wrap gap-1">
                            {list.map((s, idx) => (
                              <span key={idx} className="text-[8.5px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/90 font-semibold">{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Credentials Certs */}
                  {d.certifications?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Credentials</span>
                      <div className="space-y-1.5">
                        {d.certifications.map((c, idx) => (
                          <div key={idx} className="text-[9.5px]">
                            <span className="text-white font-bold">{c.name}</span>
                            <div className="text-[7.5px] text-white/60">{c.issuer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Projects Full Width */}
                <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Selected Projects</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {d.projects.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between min-h-[75px] hover:border-white/15 transition-all">
                        <div>
                          <div className="text-[9.5px] font-black text-white">{p.name}</div>
                          <p className="text-[8.5px] text-white/60 line-clamp-1 mt-0.5">{p.desc}</p>
                        </div>
                        <span className="text-[7px] font-bold text-white/40 uppercase mt-2">{p.tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonials */}
                {d.testimonials?.length > 0 && d.testimonials[0]?.quote && (
                  <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Recommendations</span>
                    <div className="space-y-2">
                      {d.testimonials.filter(t => t.quote).map((t, idx) => (
                        <div key={idx} className="text-[9.5px] text-white/80 leading-relaxed italic border-l border-white/20 pl-3">
                          "{t.quote}"
                          <span className="font-bold text-white not-italic text-[8px] uppercase block mt-1">— {t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-[7.5px] text-white/30 uppercase tracking-widest mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
              <span>DESIGNED IN GLASS LAB</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      );
    }

    // 5) MIDNIGHT AURORA TEMPLATE
    if (t === 'devdark') {
      return (
        <div className="flex flex-col min-h-[750px] p-6 sm:p-8 space-y-8 bg-[#030712] text-slate-100 rounded-3xl overflow-hidden border border-white/[0.03] shadow-2xl relative font-sans">
          {/* Glowing Radial Aurora Mesh Backdrops */}
          <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />

          {/* Header/Hero Showcase Section */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center border-b border-white/[0.04] pb-8 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[9.5px] font-black uppercase tracking-widest text-cyan-400">
                <Sparkles size={11} className="text-cyan-400 animate-pulse" /> Midnight Aurora Space
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                {d.hero.name}
              </h2>
              <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: a.hex }}>
                {d.hero.role}
              </p>
              <p className="text-xs text-slate-400 italic max-w-xl leading-relaxed">
                "{d.hero.tagline}"
              </p>
            </div>

            {/* Glowing Avatar */}
            <div className="relative flex justify-center shrink-0">
              <div className="absolute inset-[-4px] rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 blur-md opacity-35 animate-pulse" />
              {d.hero.profileImage ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-lg">
                  <img src={d.hero.profileImage} className="w-full h-full object-cover" alt="" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#0b0f19] border border-white/10 flex items-center justify-center font-black text-xl text-white relative z-10 shadow-lg">
                  {d.hero.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Grid Layout for details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
            {/* Left Column - Bio, Timeline, Certifications */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Bio & Badges Card */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">// Biography Node</div>
                <p className="text-xs leading-relaxed text-slate-300 font-medium">{d.about.bio}</p>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-300 font-bold">
                    Experience: <span className="text-cyan-400 font-black">{d.about.experience}</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-300 font-bold">
                    Domain: <span className="text-indigo-400 font-black">{d.about.niche}</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-300 font-bold">
                    Location: <span className="text-purple-400 font-black">{d.about.location || 'Remote'}</span>
                  </span>
                </div>
              </div>

              {/* Projects Grid Section */}
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">// Selected Endeavors</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {d.projects.map((p, idx) => (
                    <div key={idx} className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black text-white">{p.name}</h4>
                          <span className="text-[8px] font-bold text-cyan-400/80 uppercase bg-cyan-500/5 px-2 py-0.5 rounded-full border border-cyan-500/10">{p.tech.split(',')[0]}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed mt-2 line-clamp-2">{p.desc}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] mt-4 font-mono">
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider">{p.tech}</span>
                        <div className="flex gap-2">
                          {p.github && (
                            <span className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white transition-colors cursor-pointer">
                              <Github size={11} />
                            </span>
                          )}
                          {p.link && (
                            <span className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white transition-colors cursor-pointer">
                              <ExternalLink size={11} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Work Experience Timeline */}
              {d.experience?.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">// Professional Timeline</div>
                  <div className="space-y-6 relative pl-4 border-l border-white/[0.05]">
                    {d.experience.map((exp, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute top-1.5 left-[-20.5px] w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 ring-4 ring-[#030712]" />
                        <div className="flex flex-wrap justify-between items-baseline gap-2">
                          <h4 className="text-xs font-black text-white">{exp.company}</h4>
                          <span className="text-[9px] font-bold text-cyan-400 font-mono">{exp.duration}</span>
                        </div>
                        <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider">{exp.role}</div>
                        {exp.desc && <p className="text-[10.5px] text-slate-400 leading-relaxed pt-1">{exp.desc}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Stats, Tech Stack, Education, Recommendations */}
            <div className="md:col-span-4 space-y-6">
              {/* Metrics Showcase */}
              <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] text-center font-mono">
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 font-sans">// Metrics Node</div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(d.achievements).map(([k, v]) => (
                    <div key={k} className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                      <div className="text-base font-black text-white"><AnimatedCounter value={v} /></div>
                      <div className="text-[7px] text-slate-500 uppercase tracking-widest mt-1 font-sans">{k}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Card */}
              <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-4">
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">// Core Stack</div>
                <div className="space-y-3.5">
                  {Object.entries(d.skills).map(([cat, list]) => (
                    <div key={cat} className="space-y-1.5">
                      <div className="text-[7.5px] font-black uppercase text-indigo-400 tracking-wider">{cat}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((s, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-slate-300 bg-white/[0.02] border border-white/[0.05] px-2 py-1 rounded-xl">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Card */}
              {d.education?.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">// Academic Logs</div>
                  <div className="space-y-3">
                    {d.education.map((edu, idx) => (
                      <div key={idx} className="text-[10px] relative pl-3 border-l border-indigo-500/30">
                        <div className="font-black text-white">{edu.institution}</div>
                        <div className="text-slate-400 mt-0.5">{edu.degree}</div>
                        <div className="text-[8.5px] text-cyan-400 font-bold mt-0.5 font-mono">{edu.year} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications Card */}
              {d.certifications?.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">// Credentials</div>
                  <div className="space-y-2">
                    {d.certifications.map((c, idx) => (
                      <div key={idx} className="text-[10px] relative pl-3 border-l border-cyan-500/30">
                        <div className="font-black text-white leading-tight">{c.name}</div>
                        <div className="text-slate-400 text-[8.5px] mt-0.5 font-mono">{c.issuer} · {c.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials/Endorsements bubble */}
              {d.testimonials?.length > 0 && d.testimonials[0]?.quote && (
                <div className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-3">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400">// Peer Feedback</div>
                  <div className="space-y-3">
                    {d.testimonials.filter(t => t.quote).map((t, idx) => (
                      <div key={idx} className="text-[10px] leading-relaxed text-slate-300 italic bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl">
                        "{t.quote}"
                        <span className="font-bold text-white not-italic text-[8px] uppercase block mt-1.5">— {t.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive footer contact options */}
          <div className="border-t border-white/[0.04] pt-6 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest items-center justify-between relative z-10">
            <span className="text-slate-500">Midnight Aurora Labs</span>
            <div className="flex gap-4">
              {d.contact.email && <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Email</span>}
              {d.contact.github && <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">GitHub</span>}
              {d.contact.linkedin && <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">LinkedIn</span>}
              {d.contact.twitter && <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Twitter</span>}
            </div>
          </div>
        </div>
      );
    }
  };

  const FolderIcon = () => (
    <svg className="w-3.5 h-3.5 text-[#d19a66]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );

  /* ═══════════════════════════════════════════════════════════
     MAIN WORKSPACE RETURN
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-[90vh] pb-10 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 overflow-hidden">
      
      {/* Mesh background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full blur-[140px] opacity-[0.14] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: accent.hex }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[140px] opacity-[0.12] pointer-events-none transition-colors duration-1000" style={{ backgroundColor: '#8b5cf6' }} />
      
      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-5 border-b border-border/30 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1.5">
            <Sparkles size={11} className="animate-pulse" style={{ color: accent.hex }} /> Developer Portfolio Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">Architect Your Identity</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-end">
          {/* Profile completeness progress wheel */}
          <div className="flex items-center gap-3 bg-card/45 backdrop-blur-md border border-border/50 px-3.5 py-1.5 rounded-2xl shadow-sm">
            <div className="relative w-8 h-8 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="16" cy="16" r="13" className="stroke-muted/40 fill-none" strokeWidth="2.5" />
                <circle cx="16" cy="16" r="13" className="stroke-primary fill-none transition-all duration-700 ease-out" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 13} strokeDashoffset={2 * Math.PI * 13 * (1 - completeness / 100)} style={{ stroke: accent.hex }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[8.5px] font-black text-foreground">{completeness}%</div>
            </div>
            <div>
              <div className="text-[8.5px] font-black uppercase text-foreground leading-none">Studio Completeness</div>
              <div className="text-[7.5px] text-muted-foreground uppercase tracking-wider mt-0.5 font-bold">{completeness === 100 ? 'Elite Ready' : completeness > 70 ? 'Professional' : 'Building Profile...'}</div>
            </div>
          </div>

          <button onClick={handlePublish} disabled={publishing} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 select-none">
            {publishing ? <RefreshCw size={13} className="animate-spin" /> : <Rocket size={13} />}
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* TWO PANEL WORKSPACE */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        
        {/* ─── EDITOR SIDEBAR ─── */}
        <div className="space-y-4 max-h-[85vh] overflow-y-auto no-scrollbar pr-1">

          {/* Theme & Palette Selector */}
          <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Palette size={14} className="text-primary animate-pulse" style={{ color: accent.hex }} /> Studio Themes
              </h3>
              <div className="flex gap-1.5">
                {ACCENTS.map(a2 => (
                  <button
                    key={a2.name}
                    onClick={() => setAccent(a2)}
                    className="relative w-4.5 h-4.5 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
                    style={{ background: a2.hex, width: 17, height: 17 }}
                    title={a2.name}
                  >
                    {accent.name === a2.name && (
                      <span className="w-2.5 h-2.5 rounded-full bg-white/90 scale-90 border border-black/10 shadow-sm animate-fade-in" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Template selector cards */}
            <div className="grid grid-cols-5 gap-2">
              {TEMPLATES.map(tmpl => {
                const isActive = template === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center select-none ${isActive ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border/80'}`}
                    style={isActive ? { borderColor: accent.hex, color: accent.hex } : {}}
                  >
                    <tmpl.icon size={15} className="mb-1" />
                    <div className="text-[7.5px] font-black uppercase tracking-wider leading-none">{tmpl.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab navigation scrolls */}
          <div className="relative">
            <button onClick={() => scrollTabs(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer xl:hidden"><ChevronLeft size={12} /></button>
            <div ref={tabsRef} className="flex gap-1.5 overflow-x-auto no-scrollbar px-7 xl:px-0 xl:flex-wrap py-1 select-none">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap shrink-0 ${isActive ? 'bg-primary border-primary text-white shadow-md' : 'bg-card/45 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}
                    style={isActive ? { backgroundColor: accent.hex, borderColor: accent.hex } : {}}
                  >
                    <tab.icon size={11} /> {tab.label}
                  </button>
                );
              })}
            </div>
            <button onClick={() => scrollTabs(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer xl:hidden"><ChevronRight size={12} /></button>
          </div>

          {/* Editor tab form block */}
          <div className="bg-card/45 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                transition={{ duration: 0.15 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ─── LIVE PREVIEW ─── */}
        <div className="space-y-4">
          
          {/* Preview Toolbar */}
          <div className="flex justify-between items-center bg-card/45 backdrop-blur-md border border-border/50 p-2.5 rounded-2xl shadow-sm sticky top-0 z-[40]">
            <div className="flex items-center gap-3 px-2 select-none">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500/30" />
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest hidden sm:inline">LIVE SIMULATION WORKSPACE</span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-xl transition-all cursor-pointer ${previewMode === 'desktop' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`} style={previewMode === 'desktop' ? { backgroundColor: accent.hex } : {}}>
                <Monitor size={14} />
              </button>
              <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-xl transition-all cursor-pointer ${previewMode === 'mobile' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`} style={previewMode === 'mobile' ? { backgroundColor: accent.hex } : {}}>
                <Smartphone size={14} />
              </button>
            </div>
          </div>

          {/* Dynamic Mockup Browser frame */}
          <div className="bg-muted/15 border border-border/30 rounded-2xl min-h-[800px] overflow-hidden flex items-start justify-center p-4 sm:p-8 no-scrollbar relative">
            <div className="absolute inset-0 bg-[radial-gradient(#80808012_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <motion.div
              ref={previewRef}
              key={template}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{
                opacity: 1,
                scale: 1,
                width: previewMode === 'desktop' ? '100%' : '360px',
                rotateX: tilt.y,
                rotateY: tilt.x,
              }}
              transition={{ duration: 0.4, rotateX: { duration: 0.1 }, rotateY: { duration: 0.1 } }}
              className={`rounded-2xl shadow-2xl overflow-hidden border border-border/40 relative min-h-[700px] flex flex-col transition-all duration-500 select-none ${
                t === 'cyber' ? 'bg-[#060a12]' : 
                t === 'devdark' ? 'bg-[#030712]' : 
                t === 'glass' ? 'bg-slate-950' : 
                'bg-card'
              }`}
              style={{
                perspective: 1000,
                borderColor: (t === 'cyber' || t === 'glass') ? `${a.hex}40` : undefined,
                boxShadow: (t === 'cyber' || t === 'glass') ? `0 25px 60px -15px ${a.glow}` : undefined,
              }}
            >
              {/* macOS browser frame chrome header */}
              <div className="flex items-center justify-between px-4 py-3.5 bg-muted/40 border-b border-border/30 select-none shrink-0 z-20">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-background/50 border border-border/40 rounded-lg text-[9px] text-muted-foreground font-mono w-full max-w-[280px] justify-center mx-auto truncate shadow-inner">
                  <Globe size={10} className="opacity-55" />
                  <span>campuspath.ai/{user?.username || 'developer'}</span>
                </div>
                <div className="w-10" />
              </div>

              {/* Render template view */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {renderPreview()}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Publishing overlay animation */}
      <AnimatePresence>
        {publishing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-background/90 backdrop-blur-3xl flex flex-col items-center justify-center p-10">
            <div className="relative w-24 h-24 mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary shadow-lg" style={{ borderTopColor: accent.hex }} />
              <div className="absolute inset-0 flex items-center justify-center"><Rocket size={34} className="animate-bounce text-primary" style={{ color: accent.hex }} /></div>
            </div>
            <h2 className="text-lg font-black text-foreground uppercase tracking-widest mb-1.5">Deploying Identity</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Publishing live on campuspath...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
