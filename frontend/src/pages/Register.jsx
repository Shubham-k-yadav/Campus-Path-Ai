import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const { register, loginWithToken } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle OAuth callback token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setLoading(true);
      loginWithToken(token)
        .then(() => navigate('/onboarding'))
        .catch(() => setError('Social login failed. Please try again.'))
        .finally(() => setLoading(false));
    }
  }, [loginWithToken, navigate]);

  const handleOAuth = (provider) => {
    const backendUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Brand theme configuration matching Landing, About & Login pages
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

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.text} relative flex items-center justify-center p-4 overflow-hidden py-12 transition-colors duration-300`}>
      
      {/* Background Decorative Elements - Performance-Optimized Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transform-gpu hidden md:block">
        <div className={`absolute top-[-5%] right-[-5%] w-[50%] h-[50%] md:w-[40%] md:h-[40%] rounded-full blur-[70px] md:blur-[130px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#4285F4]/8' : 'bg-[#1A73E8]/12'}`} style={{ animationDuration: '8s' }} />
        <div className={`absolute bottom-[20%] left-[-5%] w-[45%] h-[45%] md:w-[35%] md:h-[35%] rounded-full blur-[60px] md:blur-[110px] md:animate-pulse transform-gpu will-change-[filter,transform] ${isDark ? 'bg-[#34A853]/4' : 'bg-[#34A853]/8'}`} style={{ animationDuration: '10s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 outline-none group">
            <div className="w-12 h-12 bg-[#4285F4] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4285F4]/20 group-hover:scale-105 transition-transform duration-500">
              <Zap size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="font-sans font-bold text-2xl text-foreground tracking-tight">
              CampusPath <span className="text-[#4285F4]">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold font-sans mt-8 text-[#000000] dark:text-foreground tracking-tight">
            Create your account
          </h1>
          <p className={`text-sm sm:text-base ${colors.mutedText} mt-2 font-semibold`}>
            Start engineering your career today — free forever
          </p>
        </div>

        {/* Register Card */}
        <div className={`p-6 md:p-10 relative overflow-hidden rounded-2xl ${colors.card} ${colors.shadow}`}>
          {/* Subtle glow border */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4285F4]/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            
            {/* Social Auth */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button 
                onClick={() => handleOAuth('github')} 
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${colors.btnMuted}`}
              >
                {/* Custom Github Logo SVG */}
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                GitHub
              </button>
              
              <button 
                onClick={() => handleOAuth('google')} 
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${colors.btnMuted}`}
              >
                {/* Custom Google Logo SVG */}
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className={`h-px flex-1 ${colors.divider}`} />
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">or email</span>
              <div className={`h-px flex-1 ${colors.divider}`} />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="p-3.5 mb-5 bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335] rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" /> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Full name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className={`w-full ${colors.inputBg} rounded-xl py-3 pl-11 pr-4 focus:outline-none ${colors.inputFocus} transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 hover:bg-background/20`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className={`w-full ${colors.inputBg} rounded-xl py-3 pl-11 pr-4 focus:outline-none ${colors.inputFocus} transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 hover:bg-background/20`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#000000] dark:text-foreground tracking-widest uppercase ml-1 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className={`w-full ${colors.inputBg} rounded-xl py-3 pl-11 pr-12 focus:outline-none ${colors.inputFocus} transition-all font-semibold text-sm text-foreground placeholder:text-muted-foreground/45 hover:bg-background/20`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground font-semibold px-1 leading-relaxed mt-4">
                By creating an account, you agree to our <span className="text-[#4285F4] hover:underline cursor-pointer font-bold">Terms of Service</span> and <span className="text-[#4285F4] hover:underline cursor-pointer font-bold">Privacy Policy</span>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 sm:py-3 mt-2 ${colors.btnPrimary} font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md hover:shadow-lg disabled:opacity-70 disabled:pointer-events-none cursor-pointer text-sm`}
              >
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6 text-muted-foreground font-semibold text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4285F4] dark:text-[#4285F4] font-extrabold hover:underline underline-offset-4">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
