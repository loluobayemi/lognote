import React from 'react';
import { View, Role, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  view: View;
  role: Role;
  user: User | null;
  onViewChange: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, view, role, user, onViewChange }) => {
  if (view === 'login') return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-header shadow-sm w-full">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-indigo-900">menu</span>
            </button>
            <h1 className="font-headline font-extrabold tracking-tighter text-indigo-950 text-xl cursor-pointer" onClick={() => onViewChange('dashboard')}>
              The Academic Curator
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => onViewChange('dashboard')}
                className={`font-headline tracking-tight text-sm ${view === 'dashboard' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Dashboard
              </button>
              <button className="text-slate-500 hover:text-indigo-600 font-headline tracking-tight text-sm">Logs</button>
              <button className="text-slate-500 hover:text-indigo-600 font-headline tracking-tight text-sm">Reviews</button>
              <button 
                onClick={() => onViewChange('profile')}
                className={`font-headline tracking-tight text-sm ${view === 'profile' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-indigo-600'}`}
              >
                Profile
              </button>
            </nav>
            {user && (
              <div 
                className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 ring-2 ring-indigo-50 cursor-pointer"
                onClick={() => onViewChange('profile')}
              >
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-header flex justify-around items-center px-4 pb-6 pt-3 z-50 rounded-t-3xl shadow-[0_-4px_24px_-4px_rgba(26,28,28,0.06)]">
        <button 
          onClick={() => onViewChange('dashboard')}
          className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500'}`}
        >
          <span className={`material-symbols-outlined ${view === 'dashboard' ? 'fill-1' : ''}`} style={{ fontVariationSettings: view === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
          <span className="font-body text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
        </button>
        <button 
          onClick={() => onViewChange('new-log')}
          className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all ${view === 'new-log' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500'}`}
        >
          <span className={`material-symbols-outlined ${view === 'new-log' ? 'fill-1' : ''}`} style={{ fontVariationSettings: view === 'new-log' ? "'FILL' 1" : "'FILL' 0" }}>history_edu</span>
          <span className="font-body text-[11px] font-semibold tracking-wide uppercase mt-1">Logs</span>
        </button>
        <button className="flex flex-col items-center justify-center px-5 py-2 text-slate-500">
          <span className="material-symbols-outlined">rate_review</span>
          <span className="font-body text-[11px] font-semibold tracking-wide uppercase mt-1">Reviews</span>
        </button>
        <button 
          onClick={() => onViewChange('profile')}
          className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all ${view === 'profile' ? 'bg-indigo-50 text-indigo-900' : 'text-slate-500'}`}
        >
          <span className={`material-symbols-outlined ${view === 'profile' ? 'fill-1' : ''}`} style={{ fontVariationSettings: view === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
          <span className="font-body text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
};
