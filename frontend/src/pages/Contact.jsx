import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Mail, Linkedin, Send, MapPin, Clock, ArrowRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import api from '@/api/client';

export default function Contact() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/contact', form);
      if (response.data.success) {
        setSent(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setErrorMsg(response.data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Brand theme configuration matching Landing & About pages
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

  const infoBlocks = [
    { 
      icon: Mail, 
      label: 'Email', 
      value: 'shubhamyk6369@gmail.com', 
      color: isDark ? 'text-[#EA4335]' : 'text-[#D93025]', 
      bg: isDark ? 'bg-[#EA4335]/10' : 'bg-[#D93025]/10', 
      border: isDark ? 'border-[#EA4335]/20' : 'border-[#D93025]/20' 
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      value: 'shubham-kumar-yadav-6369s', 
      url: 'https://www.linkedin.com/in/shubham-kumar-yadav-6369s/',
      color: isDark ? 'text-[#4285F4]' : 'text-[#1A73E8]', 
      bg: isDark ? 'bg-[#4285F4]/10' : 'bg-[#1A73E8]/10', 
      border: isDark ? 'border-[#4285F4]/20' : 'border-[#1A73E8]/20' 
    },
    { 
      icon: MapPin, 
      label: 'Location', 
      value: 'Noida, Uttar Pradesh, India', 
      color: isDark ? 'text-[#34A853]' : 'text-[#1E8E3E]', 
      bg: isDark ? 'bg-[#34A853]/10' : 'bg-[#1E8E3E]/10', 
      border: isDark ? 'border-[#34A853]/20' : 'border-[#1E8E3E]/20' 
    },
    { 
      icon: Clock, 
      label: 'Response Time', 
      value: 'Within 24 hours', 
      color: isDark ? 'text-[#FBBC05]' : 'text-[#F29900]', 
      bg: isDark ? 'bg-[#FBBC05]/10' : 'bg-[#F29900]/10', 
      border: isDark ? 'border-[#FBBC05]/20' : 'border-[#F29900]/20' 
    },
  ];

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} relative overflow-x-hidden flex flex-col transition-colors duration-300`}>
      <Navbar />
      
      {/* Background Decorative Elements - Performance-Optimized Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu hidden md:block">
        <div className={`absolute top-[-5%] right-[-5%] w-[50%] h-[50%] md:w-[40%] md:h-[40%] rounded-full blur-[70px] md:blur-[130px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#4285F4]/8' : 'bg-[#1A73E8]/12'}`} style={{ animationDuration: '8s' }} />
        <div className={`absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] md:w-[35%] md:h-[35%] rounded-full blur-[60px] md:blur-[110px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#34A853]/4' : 'bg-[#34A853]/8'}`} style={{ animationDuration: '10s' }} />
      </div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-32 pb-24 md:pt-40 flex-1 flex flex-col justify-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold font-sans text-[#000000] dark:text-foreground mb-4 tracking-tight">
            Get in <span className={colors.gradientText}>Touch</span>
          </h1>
          <p className={`text-base sm:text-lg ${colors.mutedText} max-w-2xl mx-auto font-semibold leading-relaxed`}>
            Have questions or feedback? I read every message and usually respond within 24 hours.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch justify-center">
          
          {/* Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex-1 w-full max-w-2xl mx-auto p-6 md:p-10 relative overflow-hidden rounded-2xl ${colors.card} ${colors.shadow}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/5 to-transparent pointer-events-none" />

            {sent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20 rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-lg shadow-[#34A853]/10">
                  <Send size={32} className="ml-1 mt-0.5" />
                </div>
                <h3 className="text-2xl font-black text-[#000000] dark:text-foreground mb-2">Message Sent!</h3>
                <p className="text-[#34A853] font-bold text-base">I will get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Your Name</label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                      placeholder="Alex Johnson" 
                      required 
                      className="w-full bg-background/50 dark:bg-[#0B0D17]/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 hover:bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Email Address</label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
                      placeholder="you@example.com" 
                      required 
                      className="w-full bg-background/50 dark:bg-[#0B0D17]/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 hover:bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Subject</label>
                  <input 
                    value={form.subject} 
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} 
                    placeholder="How can I help?" 
                    required 
                    className="w-full bg-background/50 dark:bg-[#0B0D17]/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 hover:bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Message</label>
                  <textarea 
                    rows={5} 
                    value={form.message} 
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))} 
                    placeholder="Tell me what's on your mind..." 
                    className="w-full bg-background/50 dark:bg-[#0B0D17]/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 resize-none hover:bg-background" 
                    required 
                  />
                </div>
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#EA4335] text-xs font-bold rounded-xl text-center">
                    {errorMsg}
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`mt-2 w-full py-2.5 sm:py-3 bg-[#4285F4] hover:bg-[#357AE8] text-white text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:shadow-[#4285F4]/20 hover:scale-[1.01] active:scale-[0.99] group cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Sending...' : 'Send Message'} 
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            )}
          </motion.div>

          {/* Info Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[350px] flex flex-col gap-4 justify-between"
          >
            {infoBlocks.map(({ icon: Icon, label, value, url, color, bg, border }) => {
              const content = (
                <>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${bg} ${border} ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">{label}</div>
                    <div className="text-xs sm:text-sm font-bold text-foreground truncate">{value}</div>
                  </div>
                </>
              );

              return url ? (
                <motion.a 
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  key={label} 
                  className={`p-4 flex items-center gap-4 rounded-xl cursor-pointer transition-all duration-300 ${colors.card} ${colors.cardHover} ${colors.shadow}`}
                >
                  {content}
                </motion.a>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.03, y: -2 }}
                  key={label} 
                  className={`p-4 flex items-center gap-4 rounded-xl cursor-default transition-all duration-300 ${colors.card} ${colors.shadow}`}
                >
                  {content}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
