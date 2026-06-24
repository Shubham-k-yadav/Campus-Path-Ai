import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import AppLayout from '@/components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import PlatformTour from '@/components/common/PlatformTour';

// Public pages
import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';

// App pages
import Dashboard from '@/pages/Dashboard';
import RoadmapViewer from '@/pages/RoadmapViewer';
import Progress from '@/pages/Progress';
import Projects from '@/pages/Projects';
import GitHubDNA from '@/pages/GitHubDNA';
import Jobs from '@/pages/Jobs';
import Portfolio from '@/pages/Portfolio';
import PortfolioBuilder from '@/pages/PortfolioBuilder';
import Achievements from '@/pages/Achievements';
import Community from '@/pages/Community';
import FocusRooms from '@/pages/FocusRooms';
import SettingsPage from '@/pages/Settings';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children, useLayout = true }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 blur-[100px] animate-pulse" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center relative z-10 shadow-2xl shadow-primary/20"
      >
        <div className="w-8 h-8 rounded-full bg-primary shadow-lg" />
      </motion.div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse relative z-10">Initializing Neural Link</p>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return useLayout ? <AppLayout>{children}</AppLayout> : children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/portfolio/:userId" element={<Portfolio />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><RoadmapViewer /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
      <Route path="/github" element={<ProtectedRoute><GitHubDNA /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute useLayout={false}><Portfolio /></ProtectedRoute>} />
      <Route path="/portfolio-builder" element={<ProtectedRoute><PortfolioBuilder /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/focus" element={<ProtectedRoute><FocusRooms /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    const handleStartTour = () => setIsTourOpen(true);
    window.addEventListener('start-campuspath-tour', handleStartTour);

    // Auto-trigger for first-time visitors
    const hasCompleted = localStorage.getItem('campuspath_tour_completed');
    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1500);
      return () => {
        window.removeEventListener('start-campuspath-tour', handleStartTour);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('start-campuspath-tour', handleStartTour);
    };
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="fixed inset-0 pointer-events-none z-[-1]">
              <div className="absolute inset-0 bg-background" />
            </div>
            <AppContent />
            <PlatformTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
