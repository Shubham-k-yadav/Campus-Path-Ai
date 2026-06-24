import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      <Sidebar />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
