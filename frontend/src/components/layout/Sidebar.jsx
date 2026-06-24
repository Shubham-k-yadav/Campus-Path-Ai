import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Map, TrendingUp, FolderGit2, GitBranch, Briefcase,
  Globe, Wrench, Trophy, Users, Settings, LogOut, Zap, Menu, X
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/projects', icon: FolderGit2, label: 'Projects' },
  { to: '/github', icon: GitBranch, label: 'GitHub DNA' },
  { to: '/jobs', icon: Briefcase, label: 'Job Match' },
  { to: '/portfolio', icon: Globe, label: 'Portfolio' },
  { to: '/portfolio-builder', icon: Wrench, label: 'Builder' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/focus', icon: Zap, label: 'Focus Rooms' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* =========================================================================
          1. DESKTOP SIDEBAR (md and up)
          ========================================================================= */}
      <aside className="hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-40 p-4 font-sans">
        
        <div className="space-y-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 px-3 py-2 shrink-0 group outline-none">
            <div className="w-8 h-8 shrink-0 bg-primary flex items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="font-sans font-bold text-base text-foreground tracking-tight">
              CampusPath <span className="text-primary">AI</span>
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] no-scrollbar pr-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => twMerge(
                  clsx(
                    "flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all relative group outline-none",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                  )
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Profile and Settings Action Box */}
        <div className="pt-4 border-t border-sidebar-border space-y-4">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs font-semibold text-sidebar-foreground">Theme</span>
            <ThemeToggle />
          </div>
          
          {user && (
            <div className="flex items-center justify-between bg-sidebar-accent/50 border border-sidebar-border/40 p-3 rounded-xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary overflow-hidden">
                  {user.githubUsername ? (
                    <img src={`https://github.com/${user.githubUsername}.png`} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
                  <span className="text-[9px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors cursor-pointer outline-none"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          2. MOBILE HEADER BAR (under md)
          ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border z-40 flex items-center justify-between px-4 md:hidden font-sans">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 outline-none">
          <div className="w-8 h-8 shrink-0 bg-primary flex items-center justify-center rounded-lg shadow-sm">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <span className="font-sans font-bold text-base text-foreground tracking-tight">
            CampusPath <span className="text-primary">AI</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary transition-colors outline-none"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. MOBILE SLIDE-OUT DRAWER OVERLAY
          ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border z-50 p-4 flex flex-col justify-between md:hidden shadow-2xl font-sans"
            >
              <div className="space-y-6">
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-3 border-b border-sidebar-border">
                  <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5 outline-none">
                    <div className="w-8 h-8 shrink-0 bg-primary flex items-center justify-center rounded-lg">
                      <Zap size={16} className="text-white" fill="currentColor" />
                    </div>
                    <span className="font-sans font-bold text-base text-foreground tracking-tight">
                      CampusPath <span className="text-primary">AI</span>
                    </span>
                  </NavLink>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-sidebar-accent text-sidebar-foreground outline-none"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile navigation links */}
                <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar pr-1">
                  {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => twMerge(
                        clsx(
                          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all relative group outline-none",
                          isActive 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                        )
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* Bottom profile and settings inside drawer */}
              <div className="pt-4 border-t border-sidebar-border space-y-4">
                <div className="flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-sidebar-foreground">Theme</span>
                  <ThemeToggle />
                </div>

                {user && (
                  <div className="flex items-center justify-between bg-sidebar-accent/50 border border-sidebar-border/40 p-3 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary overflow-hidden">
                        {user.githubUsername ? (
                          <img src={`https://github.com/${user.githubUsername}.png`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name?.[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
                        <span className="text-[9px] text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors cursor-pointer outline-none"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}