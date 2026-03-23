import React from 'react';
import { Role } from '../types';
import { Button } from '../components/UI';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = React.useState<Role>('student');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-3xl shadow-2xl bg-surface-container-lowest">
        {/* Left Column: Branding */}
        <div className="hidden lg:flex lg:col-span-5 academic-gradient relative p-12 flex-col justify-between text-white overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <span className="material-symbols-outlined text-4xl">history_edu</span>
              <h1 className="font-headline font-extrabold text-2xl tracking-tighter">The Academic Curator</h1>
            </div>
            <h2 className="font-headline text-5xl font-extrabold tracking-tight leading-tight mb-6">
              Elevate Your <br/>Research <span className="text-on-primary-container">Exhibition.</span>
            </h2>
            <p className="text-on-primary-container text-lg leading-relaxed max-w-sm">
              Move beyond the spreadsheet. Curate your academic journey with a digital logbook designed for precision and authority.
            </p>
          </div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <p className="text-sm font-label uppercase tracking-widest text-primary-fixed mb-4">Latest Achievement</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">military_tech</span>
              </div>
              <div>
                <p className="font-bold text-white">Dean's List Logbook</p>
                <p className="text-xs text-on-primary-container">Certified curated submission 2024</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <span className="material-symbols-outlined text-[12rem]">architecture</span>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 flex flex-col p-8 md:p-16 bg-surface-container-lowest">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-12">
              <h3 className="font-headline text-3xl font-bold text-on-surface mb-2 tracking-tight">Welcome Back</h3>
              <p className="text-secondary font-medium">Continue your academic curation.</p>
            </div>

            <div className="mb-10">
              <label className="block text-xs font-label uppercase tracking-widest text-secondary mb-4 font-bold">Select Your Identity</label>
              <div className="grid grid-cols-3 gap-3">
                {(['student', 'supervisor', 'admin'] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95 border-2 ${
                      selectedRole === role 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-surface-container-low text-secondary border-transparent hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined mb-2" style={{ fontVariationSettings: selectedRole === role ? "'FILL' 1" : "'FILL' 0" }}>
                      {role === 'student' ? 'school' : role === 'supervisor' ? 'supervisor_account' : 'admin_panel_settings'}
                    </span>
                    <span className="text-xs font-bold capitalize">{role}</span>
                  </button>
                ))}
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(selectedRole); }}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface" htmlFor="email">University Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">alternate_email</span>
                  <input 
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all text-on-surface outline-none placeholder:text-outline rounded-t-lg" 
                    id="email" 
                    placeholder="curator@university.edu" 
                    type="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-sm font-semibold text-on-surface" htmlFor="password">Secure Password</label>
                  <a className="text-xs font-bold text-primary hover:underline underline-offset-4" href="#">Forgot?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all text-on-surface outline-none placeholder:text-outline rounded-t-lg" 
                    id="password" 
                    placeholder="••••••••••••" 
                    type="password"
                    required
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface">visibility</span>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox" />
                <label className="text-sm font-medium text-secondary" htmlFor="remember">Keep me signed in for 30 days</label>
              </div>

              <Button type="submit" className="w-full py-5 text-lg" variant="primary">
                Access Logbook
              </Button>
            </form>

            <div className="mt-12 pt-8 border-t border-outline-variant/20 text-center">
              <p className="text-secondary font-medium">New curator on campus? <a className="text-primary font-bold hover:underline underline-offset-4 ml-1" href="#">Establish your account</a></p>
            </div>

            <div className="mt-8 flex justify-center gap-6 opacity-30 grayscale items-center">
              <div className="h-8 w-8 bg-slate-400 rounded-full"></div>
              <div className="h-8 w-12 bg-slate-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-8 right-8">
        <button className="w-14 h-14 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-xl text-primary hover:bg-primary hover:text-white transition-all group">
          <span className="material-symbols-outlined">help</span>
        </button>
      </div>
    </div>
  );
};
