import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authAPI } from '@/api/client';
import {
  Github, ExternalLink, Globe, Mail, Linkedin,
  MapPin, Award, Rocket, Code, Share2, Copy, User, ArrowLeft,
  Terminal, Shield, Zap, Coffee, BookOpen, GraduationCap, Quote,
  Twitter, Globe2, FileCode2, BarChart3, Settings, Monitor,
  Search, Grid, Sparkles, Activity, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER Component
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
   PREVIEWS & TEMPLATES RENDER FOR PUBLIC PORTFOLIO
   ═══════════════════════════════════════════════════════════ */
export default function Portfolio() {
  const { user } = useAuth();
  const { userId } = useParams();
  const toast = useToast();

  const [publicUser, setPublicUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      authAPI.getPublicPortfolio(userId)
        .then((res) => {
          setPublicUser(res.data.user);
        })
        .catch((err) => {
          console.error('Failed to load public portfolio:', err);
          toast.error(err.response?.data?.message || 'Failed to fetch public portfolio.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center relative z-10 shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full bg-primary" />
        </motion.div>
      </div>
    );
  }

  const activeUser = userId ? publicUser : user;
  const portfolio = activeUser?.portfolioData;
  const content = portfolio?.content;
  const template = portfolio?.template || 'minimal';
  const accentHex = portfolio?.accentHex || '#3b82f6';

  const sharePortfolio = () => {
    const targetUserId = userId || user?._id;
    if (!targetUserId) {
      toast.error('Identity context missing.');
      return;
    }
    const shareUrl = `${window.location.origin}/portfolio/${targetUserId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('🔗 Portfolio URL copied to clipboard!');
  };

  // If no portfolio built yet, show a beautiful "Build it" state
  if (!portfolio || !content) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl opacity-30 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl opacity-20 pointer-events-none" />
        
        <div className="w-24 h-24 bg-primary/15 border border-primary/25 rounded-3xl flex items-center justify-center mb-6 shadow-xl relative z-10 animate-bounce duration-1000">
          <Rocket size={42} className="text-primary" />
        </div>
        <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-4 relative z-10">
          {userId ? 'Portfolio Offline' : 'No Portfolio Published'}
        </h2>
        <p className="text-muted-foreground max-w-md mb-8 font-medium relative z-10 leading-relaxed text-sm">
          {userId 
            ? "This developer hasn't published their portfolio website yet." 
            : "Your professional identity is waiting to be built. Create an elite developer portfolio website in seconds with our builder."}
        </p>
        {userId ? (
          <Link to="/" className="px-8 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 relative z-10">
            Visit Campus Path AI
          </Link>
        ) : (
          <Link to="/portfolio-builder" className="px-8 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20 relative z-10">
            Build My Identity
          </Link>
        )}
      </div>
    );
  }

  // Formatting helpers
  const d = content;
  const t = template;
  const aHex = accentHex;
  const a = {
    hex: accentHex,
    glow: accentHex + '80'
  };

  const getSocialLink = (platform, value) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    if (platform === 'email') return `mailto:${value}`;
    if (platform === 'github') return `https://github.com/${value}`;
    if (platform === 'linkedin') {
      if (value.includes('linkedin.com')) return `https://${value.replace(/^https?:\/\//, '')}`;
      return `https://linkedin.com/in/${value}`;
    }
    if (platform === 'twitter') return `https://twitter.com/${value}`;
    if (platform === 'website') return `https://${value}`;
    if (platform === 'leetcode') return `https://leetcode.com/${value}`;
    return value;
  };

  const previewBg = t === 'cyber' ? 'bg-[#060a12]' : t === 'devdark' ? 'bg-[#030712]' : t === 'glass' ? 'bg-slate-950 text-white' : 'bg-background';
  const previewText = (t === 'cyber' || t === 'devdark' || t === 'glass') ? 'text-slate-100' : 'text-foreground';
  const previewCard = t === 'cyber' ? 'bg-slate-900/60 border-cyan-500/15' : t === 'devdark' ? 'bg-slate-900/40 border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300' : t === 'glass' ? 'bg-white/5 backdrop-blur-xl border-white/10 shadow-lg shadow-black/10' : t === 'bento' ? 'bg-card/45 border-border/50 shadow-sm' : 'bg-card/30 border-border/40';
  const previewFont = t === 'cyber' ? '"JetBrains Mono", monospace' : '"Poppins", "Inter", sans-serif';

  // Render the specific layout based on the template selection
  const renderTemplateView = () => {
    // 1. MINIMAL TEMPLATE
    if (t === 'minimal') {
      return (
        <div className="min-h-screen bg-background text-foreground py-8 sm:py-16">
          <div className="flex flex-col max-w-4xl mx-auto px-4 sm:px-8 space-y-12 w-full">
            {/* Hero */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-4 border-b border-border/45 pb-6">
              <div className="space-y-2 min-w-0 flex-1">
                <h2 className="text-2xl font-black tracking-tight text-foreground break-words">{d.hero.name}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] break-words" style={{ color: a.hex }}>{d.hero.role}</p>
                <p className="text-xs text-muted-foreground italic font-medium break-words">"{d.hero.tagline}"</p>
              </div>
            {d.hero.profileImage && (
              <div className="w-16 h-16 rounded-full overflow-hidden border border-border shadow-sm flex-shrink-0">
                <img src={d.hero.profileImage} className="w-full h-full object-cover" alt={d.hero.name} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-10">
            <div className="space-y-10">
              {/* Biography */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Biography</h4>
                <p className="text-xs leading-relaxed font-medium text-foreground">{d.about.bio}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[10px] text-muted-foreground font-semibold">
                  <div>Experience: <span className="text-foreground font-black block sm:inline">{d.about.experience}</span></div>
                  <div>Domain: <span className="text-foreground font-black block sm:inline">{d.about.niche}</span></div>
                  <div>Location: <span className="text-foreground font-black block sm:inline">{d.about.location || 'Remote'}</span></div>
                </div>
              </section>

              {/* Projects */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Selected Work</h4>
                <div className="space-y-4">
                  {d.projects.map((p, idx) => (
                    <div key={idx} className="group border-l border-border/50 pl-4 py-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black group-hover:text-primary transition-colors break-words">{p.name}</span>
                        <div className="flex gap-2 shrink-0">
                          {p.github && <a href={getSocialLink('github', p.github)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Github size={11} /></a>}
                          {p.link && <a href={getSocialLink('website', p.link)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink size={11} /></a>}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed break-words">{p.desc}</p>
                      <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-wider break-words">{p.tech}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Work Experience */}
              {d.experience?.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Experience</h4>
                  <div className="space-y-4">
                    {d.experience.map((exp, idx) => (
                      <div key={idx} className="text-xs flex flex-col sm:flex-row gap-1 sm:gap-4">
                        <span className="w-24 text-[9px] font-black uppercase tracking-wider shrink-0" style={{ color: a.hex }}>{exp.duration}</span>
                        <div className="space-y-1">
                          <div className="font-black text-foreground">{exp.company}</div>
                          <div className="text-[10px] text-muted-foreground font-bold">{exp.role}</div>
                          {exp.desc && <div className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">{exp.desc}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {d.education?.length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Education</h4>
                  <div className="space-y-3">
                    {d.education.map((edu, idx) => (
                      <div key={idx} className="text-xs flex flex-col sm:flex-row gap-1 sm:gap-4">
                        <span className="w-24 text-[9px] font-black uppercase tracking-wider shrink-0" style={{ color: a.hex }}>{edu.year}</span>
                        <div className="space-y-0.5">
                          <div className="font-black text-foreground">{edu.institution}</div>
                          <div className="text-[10px] text-muted-foreground font-bold">{edu.degree} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</div>
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
                <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Stack</h4>
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
              {d.achievements && Object.keys(d.achievements).length > 0 && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Metrics</h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {Object.entries(d.achievements).map(([k, v]) => (
                      <div key={k} className="p-2.5 border border-border/40 rounded-xl bg-card/10">
                        <div className="text-xs font-black text-foreground"><AnimatedCounter value={v} /></div>
                        <div className="text-[7px] text-muted-foreground uppercase mt-0.5">{k}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certs */}
              {d.certifications?.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Credentials</h4>
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
                  <h4 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase tracking-[0.2em]">// Endorsement</h4>
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
          <div className="border-t border-border/40 pt-6 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-wider text-muted-foreground break-words">
            {d.contact.email && <a href={getSocialLink('email', d.contact.email)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground break-all"><Mail size={10} style={{ color: a.hex }} /> {d.contact.email}</a>}
            {d.contact.github && <a href={getSocialLink('github', d.contact.github)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground break-all"><Github size={10} style={{ color: a.hex }} /> {d.contact.github}</a>}
            {d.contact.linkedin && <a href={getSocialLink('linkedin', d.contact.linkedin)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground break-all"><Linkedin size={10} style={{ color: a.hex }} /> {d.contact.linkedin}</a>}
            {d.contact.twitter && <a href={getSocialLink('twitter', d.contact.twitter)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground break-all"><Twitter size={10} style={{ color: a.hex }} /> {d.contact.twitter}</a>}
            {d.contact.website && <a href={getSocialLink('website', d.contact.website)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground break-all"><Globe size={10} style={{ color: a.hex }} /> {d.contact.website}</a>}
            {d.contact.leetcode && <a href={getSocialLink('leetcode', d.contact.leetcode)} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-foreground"><Hash size={10} style={{ color: a.hex }} /> LeetCode</a>}
          </div>
          </div>
        </div>
      );
    }

    // 2. CYBERPUNK TEMPLATE
    if (t === 'cyber') {
      return (
        <div className="min-h-screen bg-[#060a12] text-cyan-400 py-8 sm:py-16 relative overflow-hidden font-mono">
          <div className="flex flex-col max-w-4xl mx-auto px-4 sm:px-8 space-y-8 relative z-10 w-full">
          {/* Glitch CRT Scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10 opacity-30" />

          {/* Header */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-4 border-b border-cyan-500/20 pb-4">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="text-[9px] opacity-40">SYSTEM://PORTFOLIO_NODE</div>
              <h2 className="text-xl font-black tracking-widest uppercase text-white break-words" style={{ textShadow: `0 0 10px ${a.glow}` }}>{d.hero.name}</h2>
              <div className="text-[9px] font-bold uppercase tracking-widest animate-pulse break-words" style={{ color: a.hex }}>&gt; {d.hero.role}</div>
            </div>
            {d.hero.profileImage ? (
              <div className="w-12 h-12 border-2 relative shrink-0" style={{ borderColor: a.hex, boxShadow: `0 0 10px ${a.glow}` }}>
                <img src={d.hero.profileImage} className="w-full h-full object-cover grayscale brightness-125 hover:grayscale-0 transition-all duration-300" alt="" />
                <div className="absolute inset-0 border border-black/40" />
              </div>
            ) : (
              <div className="w-10 h-10 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 shrink-0">[0x{d.hero.name[0]}]</div>
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
            {d.achievements && Object.keys(d.achievements).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(d.achievements).map(([k, v]) => (
                  <div key={k} className="p-2 border border-cyan-500/15 bg-slate-950/60 rounded text-center">
                    <div className="text-white text-xs font-black"><AnimatedCounter value={v} /></div>
                    <div className="text-[7.5px] opacity-40 uppercase tracking-wider mt-0.5">{k}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            <section className="space-y-2">
              <div className="text-[10px] text-white/50 uppercase tracking-widest">// ls core_modules/</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                  <div key={idx} className="p-2.5 border border-cyan-500/20 bg-slate-950/60 rounded flex justify-between items-start gap-4 min-w-0">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-[10.5px] font-bold text-white flex flex-wrap items-center gap-1.5 break-words">
                        <Terminal size={10} className="shrink-0" style={{ color: a.hex }} />
                        {p.name}
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-normal break-words">{p.desc}</p>
                      <div className="text-[7.5px] font-black uppercase text-cyan-500/70 break-words">{p.tech}</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {p.github && <a href={getSocialLink('github', p.github)} target="_blank" rel="noreferrer" className="p-1 hover:bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded"><Github size={10} /></a>}
                      {p.link && <a href={getSocialLink('website', p.link)} target="_blank" rel="noreferrer" className="p-1 hover:bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 rounded"><ExternalLink size={10} /></a>}
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
                  <div key={idx} className="text-[10px] space-y-0.5 border-l border-cyan-500/20 pl-3 mt-3">
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
          <div className="border-t border-cyan-500/20 pt-4 text-[9.5px] opacity-75 break-words">
            <div className="break-all">developer@campuspath:~$ mail -s "inquiry" {d.contact.email}</div>
            <div className="mt-1 flex flex-wrap gap-4 text-cyan-300">
              {d.contact.email && <a href={getSocialLink('email', d.contact.email)} target="_blank" rel="noreferrer" className="hover:underline break-all">Mail: {d.contact.email}</a>}
              {d.contact.github && <a href={getSocialLink('github', d.contact.github)} target="_blank" rel="noreferrer" className="hover:underline break-all">GitHub: {d.contact.github}</a>}
              {d.contact.linkedin && <a href={getSocialLink('linkedin', d.contact.linkedin)} target="_blank" rel="noreferrer" className="hover:underline break-all">LinkedIn: {d.contact.linkedin}</a>}
              {d.contact.twitter && <a href={getSocialLink('twitter', d.contact.twitter)} target="_blank" rel="noreferrer" className="hover:underline break-all">Twitter: {d.contact.twitter}</a>}
              {d.contact.website && <a href={getSocialLink('website', d.contact.website)} target="_blank" rel="noreferrer" className="hover:underline break-all">Web: {d.contact.website}</a>}
            </div>
          </div>
          </div>
        </div>
      );
    }

    // 3. BENTO GRID TEMPLATE
    if (t === 'bento') {
      return (
        <div className="min-h-screen bg-background text-foreground py-6">
          <div className="flex flex-col max-w-5xl mx-auto px-3 sm:px-6 space-y-3 w-full">
          {/* Row 1: Hero + Avatar side by side */}
          <div className="flex flex-col sm:flex-row gap-3">
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
            <div className={`w-full sm:w-32 h-28 sm:h-auto flex-shrink-0 p-3 rounded-2xl border flex items-center justify-center relative overflow-hidden ${previewCard}`}>
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
            {/* Box 3: About Bio - full width */}
            <div className={`col-span-1 sm:col-span-2 lg:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-2.5 ${previewCard}`}>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                <User size={10} style={{ color: a.hex }} /> About Profile
              </div>
              <p className="text-xs sm:text-[10px] leading-relaxed font-medium text-foreground">{d.about.bio}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
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
            {d.achievements && Object.keys(d.achievements).length > 0 && (
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
            )}

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
                      {p.github && <a href={getSocialLink('github', p.github)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Github size={12} /></a>}
                      {p.link && <a href={getSocialLink('website', p.link)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><ExternalLink size={12} /></a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 7: Experience Timeline */}
            {d.experience?.length > 0 && (
              <div className={`col-span-1 sm:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-3 ${previewCard}`}>
                <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Work Log</span>
                <div className="space-y-3">
                  {d.experience.map((exp, idx) => (
                    <div key={idx} className="relative pl-4 border-l border-border/50">
                      <div className="absolute top-1.5 left-[-3.5px] w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.hex }} />
                      <div className="text-xs sm:text-[10px] font-black text-foreground">{exp.company} — <span className="text-muted-foreground font-medium">{exp.role}</span></div>
                      <div className="text-[9px] sm:text-[7.5px] font-black uppercase mt-0.5" style={{ color: a.hex }}>{exp.duration}</div>
                      {exp.desc && <p className="text-[10px] sm:text-[9.5px] text-muted-foreground mt-1 leading-normal">{exp.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 8: Education */}
            {d.education?.length > 0 && (
              <div className={`p-4 rounded-2xl border space-y-3 ${previewCard}`}>
                <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Education</span>
                <div className="space-y-2.5">
                  {d.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="font-black text-xs text-foreground truncate">{edu.institution}</div>
                      <div className="text-muted-foreground text-[9px] sm:text-[8px] mt-0.5 truncate">{edu.degree}</div>
                      <div className="text-muted-foreground text-[8px] sm:text-[7.5px]">{edu.year} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 9: Certs */}
            {d.certifications?.length > 0 && (
              <div className={`p-4 rounded-2xl border space-y-3 ${previewCard}`}>
                <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Certs</span>
                <div className="space-y-2.5">
                  {d.certifications.map((c, idx) => (
                    <div key={idx}>
                      <span className="font-black text-xs text-foreground block truncate">{c.name}</span>
                      <span className="text-muted-foreground text-[9px] sm:text-[7.5px] block">{c.issuer} · {c.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 10: Testimonials */}
            {d.testimonials?.length > 0 && d.testimonials[0]?.quote && (
              <div className={`col-span-1 sm:col-span-2 p-4 sm:p-5 rounded-2xl border space-y-3 ${previewCard}`}>
                <span className="text-[10px] sm:text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">Endorsements</span>
                <div className="space-y-2.5">
                  {d.testimonials.filter(t => t.quote).map((t, idx) => (
                    <div key={idx} className="text-xs sm:text-[9.5px] leading-relaxed text-muted-foreground italic">
                      "{t.quote}" <span className="font-bold text-foreground not-italic text-[9px] sm:text-[8px] uppercase">— {t.name} ({t.designation})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 11: Contacts footer - full width */}
            <div className={`col-span-1 sm:col-span-2 lg:col-span-3 p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 sm:gap-4 text-[10px] font-black uppercase tracking-widest items-start sm:items-center justify-between ${previewCard}`}>
              <span className="whitespace-nowrap">BENTO LABS IDENTITY</span>
              <div className="flex flex-wrap gap-3">
                {d.contact.email && <a href={getSocialLink('email', d.contact.email)} target="_blank" rel="noreferrer" className="hover:underline break-all">{d.contact.email}</a>}
                {d.contact.github && <a href={getSocialLink('github', d.contact.github)} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
                {d.contact.linkedin && <a href={getSocialLink('linkedin', d.contact.linkedin)} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>}
                {d.contact.twitter && <a href={getSocialLink('twitter', d.contact.twitter)} target="_blank" rel="noreferrer" className="hover:underline">Twitter</a>}
                {d.contact.website && <a href={getSocialLink('website', d.contact.website)} target="_blank" rel="noreferrer" className="hover:underline">Website</a>}
              </div>
            </div>
          </div>
          </div>
        </div>
      );
    }

    // 4. GLASSMORPHISM TEMPLATE
    if (t === 'glass') {
      return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden py-8 sm:py-16 px-4 sm:px-8">
          {/* Neon Floating blur spheres */}
          <div className="absolute top-10 left-10 w-28 h-28 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-36 h-36 rounded-full bg-violet-600/25 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          {/* Translucent Glass page card */}
          <div className={`max-w-4xl mx-auto p-4 sm:p-8 rounded-2xl sm:rounded-3xl border w-full flex flex-col justify-between relative z-10 ${previewCard}`}>
            <div className="space-y-6">
              {/* Header profile */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/10 w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {d.hero.profileImage ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/20 flex-shrink-0">
                      <img src={d.hero.profileImage} className="w-full h-full object-cover" alt="" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs flex-shrink-0">{d.hero.name[0]}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-black text-white break-words">{d.hero.name}</h3>
                    <span className="text-[8.5px] uppercase tracking-wider block break-words" style={{ color: a.hex }}>{d.hero.role}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {d.contact.github && <a href={getSocialLink('github', d.contact.github)} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white"><Github size={11} /></a>}
                  {d.contact.linkedin && <a href={getSocialLink('linkedin', d.contact.linkedin)} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white"><Linkedin size={11} /></a>}
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
                  {d.experience?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Experience</span>
                      <div className="space-y-3">
                        {d.experience.map((exp, idx) => (
                          <div key={idx} className="relative pl-3 border-l border-white/10 text-[9.5px]">
                            <div className="absolute top-1 left-[-2px] w-1.5 h-1.5 rounded-full bg-white" />
                            <div className="font-bold text-white">{exp.company} — {exp.role}</div>
                            <div className="text-[8px] opacity-60 mt-0.5">{exp.duration}</div>
                            {exp.desc && <p className="text-[8.5px] text-white/70 mt-1 leading-normal">{exp.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {d.education?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Education</span>
                      <div className="space-y-2">
                        {d.education.map((edu, idx) => (
                          <div key={idx} className="text-[9.5px]">
                            <div className="font-bold text-white">{edu.institution}</div>
                            <div className="text-[8px] opacity-60">{edu.degree} · {edu.year} {edu.gpa ? `· GPA: ${edu.gpa}` : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side */}
                <div className="space-y-4">
                  {/* Metrics */}
                  {d.achievements && Object.keys(d.achievements).length > 0 && (
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
                  )}

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
                            <div className="text-[7.5px] text-white/60">{c.issuer} · {c.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Projects Full Width */}
                <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/40">Selected Projects</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {d.projects.map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5 flex flex-col justify-between min-h-[75px] hover:border-white/15 transition-all min-w-0">
                        <div className="flex justify-between items-start min-w-0">
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="text-[9.5px] font-black text-white break-words">{p.name}</div>
                            <p className="text-[8.5px] text-white/60 line-clamp-1 mt-0.5 break-words">{p.desc}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0 mt-0.5">
                            {p.github && <a href={getSocialLink('github', p.github)} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white"><Github size={10} /></a>}
                            {p.link && <a href={getSocialLink('website', p.link)} target="_blank" rel="noreferrer" className="text-white/60 hover:text-white"><ExternalLink size={10} /></a>}
                          </div>
                        </div>
                        <span className="text-[7px] font-bold text-white/40 uppercase mt-2 break-all">{p.tech}</span>
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
                          <span className="font-bold text-white not-italic text-[8px] uppercase block mt-1">— {t.name} ({t.designation})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-[7.5px] text-white/30 uppercase tracking-widest mt-6 pt-4 border-t border-white/5 flex justify-between items-center flex-wrap gap-3">
              <span>DESIGNED IN GLASS LAB</span>
              <div className="flex flex-wrap gap-3">
                {d.contact.email && <a href={getSocialLink('email', d.contact.email)} target="_blank" rel="noreferrer" className="hover:text-white">Email</a>}
                {d.contact.github && <a href={getSocialLink('github', d.contact.github)} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>}
                {d.contact.linkedin && <a href={getSocialLink('linkedin', d.contact.linkedin)} target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>}
                {d.contact.twitter && <a href={getSocialLink('twitter', d.contact.twitter)} target="_blank" rel="noreferrer" className="hover:text-white">Twitter</a>}
              </div>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      );
    }

    // 5) MIDNIGHT AURORA TEMPLATE
    if (t === 'devdark') {
      return (
        <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden py-8 sm:py-16 px-4 sm:px-8 font-sans">
          {/* Glowing Radial Aurora Mesh Backdrops */}
          <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[35%] left-[25%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />

          {/* Main content container centered */}
          <div className="max-w-4xl mx-auto space-y-8 relative z-10 w-full">

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
                    <div key={idx} className="p-5 rounded-3xl bg-slate-900/40 border border-white/[0.04] backdrop-blur-xl hover:border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px] min-w-0">
                      <div className="min-w-0">
                        <div className="flex justify-between items-start gap-2 min-w-0">
                          <h4 className="text-xs font-black text-white break-words min-w-0 flex-1">{p.name}</h4>
                          <span className="text-[8px] font-bold text-cyan-400/80 uppercase bg-cyan-500/5 px-2 py-0.5 rounded-full border border-cyan-500/10 shrink-0">{(p.tech || '').split(',')[0]}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed mt-2 line-clamp-2 break-words">{p.desc}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/[0.03] mt-4 font-mono min-w-0 gap-2">
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[65%]" title={p.tech}>{p.tech}</span>
                        <div className="flex gap-2 shrink-0">
                          {p.github && (
                            <a href={getSocialLink('github', p.github)} target="_blank" rel="noreferrer" className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white transition-colors">
                              <Github size={11} />
                            </a>
                          )}
                          {p.link && (
                            <a href={getSocialLink('website', p.link)} target="_blank" rel="noreferrer" className="p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white transition-colors">
                              <ExternalLink size={11} />
                            </a>
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
              {d.contact.email && <a href={getSocialLink('email', d.contact.email)} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">Email</a>}
              {d.contact.github && <a href={getSocialLink('github', d.contact.github)} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">GitHub</a>}
              {d.contact.linkedin && <a href={getSocialLink('linkedin', d.contact.linkedin)} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>}
              {d.contact.twitter && <a href={getSocialLink('twitter', d.contact.twitter)} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">Twitter</a>}
            </div>
          </div>
          </div>
        </div>
      );
    }
  };

  const FolderIcon = () => (
    <svg className="w-4 h-4 text-[#d19a66]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );

  return (
    <div className={`min-h-screen ${previewBg} ${previewText} overflow-x-hidden w-full relative pb-24`} style={{ fontFamily: previewFont }}>
      {/* Actions / Floating Nav */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 sm:gap-3 bg-card/85 backdrop-blur-xl border border-border/70 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-2xl w-[90%] sm:w-auto max-w-sm sm:max-w-none justify-center">
        {userId ? (
          <Link to="/" className="flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-3 bg-muted/65 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap">
            <Zap size={12} className="text-primary" /> Build Your Own
          </Link>
        ) : (
          <Link to="/portfolio-builder" className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted/65 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card transition-all">
            <ArrowLeft size={14} className="sm:size-4" />
          </Link>
        )}
        <button onClick={sharePortfolio} className="flex items-center gap-1.5 px-3 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/20 whitespace-nowrap" style={{ backgroundColor: aHex }}>
          <Share2 size={12} /> Share Portfolio
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full min-h-screen"
      >
        {renderTemplateView()}
      </motion.div>
    </div>
  );
}
