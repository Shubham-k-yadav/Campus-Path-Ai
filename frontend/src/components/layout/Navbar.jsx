import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Zap, Menu, X, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDark = theme === 'dark';

  // Dynamic Google Brand theme configuration
  const brand = {
    primaryText: isDark ? 'text-[#4285F4]' : 'text-[#1A73E8]',
    primaryBg: isDark ? 'bg-[#4285F4]' : 'bg-[#1A73E8]',
    primaryHoverBg: isDark ? 'hover:bg-[#357AE8]' : 'hover:bg-[#1557B0]',
    linkHover: isDark ? 'hover:text-[#4285F4]' : 'hover:text-[#1A73E8]',
    
    // Navbar specific colors matching Google Space palette
    navBg: isDark ? 'bg-[#181B28]/90' : 'bg-card/90',
    navBorder: isDark ? 'border-[#2E313D]' : 'border-border'
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-[200] flex justify-center transition-all duration-500 ${
        scrolled ? 'pt-0 px-0' : 'pt-5 px-5 md:px-10'
      }`}
    >
      <div 
        className={`${brand.navBg} backdrop-blur-md border ${brand.navBorder} shadow-sm flex items-center justify-between transition-all duration-500 ${
          scrolled 
            ? 'w-full max-w-none !rounded-none border-x-0 border-t-0 px-6 md:px-12 h-14' 
            : 'w-full max-w-6xl px-6 rounded-xl h-16'
        }`}
      >
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group outline-none">
          <div className={`w-8 h-8 ${brand.primaryBg} flex items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105`}>
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <span className="font-sans font-bold text-base text-foreground tracking-tight">
            CampusPath <span className={brand.primaryText}>AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link 
              key={to} 
              to={to} 
              className={`text-xs font-semibold text-muted-foreground ${brand.linkHover} transition-colors`}
            >
              {label}
            </Link>
          ))}
          <button 
            onClick={() => window.dispatchEvent(new Event('start-campuspath-tour'))}
            className={`text-xs font-semibold text-muted-foreground ${brand.linkHover} transition-colors outline-none cursor-pointer`}
          >
            Quick Tour
          </button>
        </nav>

        {/* Action Group */}
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <ThemeToggle />
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className={`px-4 py-1.5 ${brand.primaryBg} ${brand.primaryHoverBg} text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md`}>
                Dashboard <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className={`text-xs font-bold text-foreground ${brand.linkHover} transition-colors`}>
                  Sign In
                </Link>
                <Link to="/register" className={`px-4 py-1.5 ${brand.primaryBg} ${brand.primaryHoverBg} text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md`}>
                  Join <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center bg-muted border border-border text-foreground transition-colors outline-none hover:bg-muted/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-[calc(100%+0.5rem)] left-4 right-4 ${brand.navBg} border ${brand.navBorder} p-5 rounded-xl shadow-lg md:hidden flex flex-col gap-6`}
            >
              <div className="flex flex-col gap-4 text-left">
                {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
                  <Link 
                    key={to} 
                    to={to} 
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm font-bold text-foreground ${brand.linkHover} transition-colors`}
                  >
                    {label}
                  </Link>
                ))}
                <button 
                  onClick={() => {
                    setMobileOpen(false);
                    window.dispatchEvent(new Event('start-campuspath-tour'));
                  }}
                  className={`text-sm font-bold text-foreground ${brand.linkHover} transition-colors text-left outline-none cursor-pointer`}
                >
                  Quick Tour
                </button>
              </div>
              
              <div className={`h-px w-full ${isDark ? 'bg-[#2E313D]' : 'bg-[#DADCE0]'}`} />
              
              <div className="flex flex-col gap-3">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className={`w-full py-2.5 ${brand.primaryBg} ${brand.primaryHoverBg} text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm shadow-md`}>
                    Dashboard <ChevronRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-2.5 bg-muted border border-border text-foreground font-bold rounded-lg flex items-center justify-center text-sm">
                      Sign In
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className={`w-full py-2.5 ${brand.primaryBg} ${brand.primaryHoverBg} text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm shadow-md`}>
                      Get Started <ChevronRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
