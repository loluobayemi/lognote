import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button, Card } from '../components/UI';
import { View } from '../types';
import { useFirebase, handleFirestoreError } from '../context/FirebaseContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface RegistrationScreenProps {
  onComplete: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onComplete }) => {
  const { user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    regNumber: '',
    department: '',
    supervisorId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: formData.name,
        regNumber: formData.regNumber,
        department: formData.department,
        supervisorId: formData.supervisorId,
      });
      onComplete();
    } catch (error) {
      handleFirestoreError(error, 'update' as any, `users/${user.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-12 bg-surface">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Hero Content Section */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8 pr-0 lg:pr-8">
          <div>
            <h2 className="text-5xl font-headline font-extrabold tracking-tight text-primary leading-tight mb-4">
              Begin Your <br/>Curated Journey.
            </h2>
            <p className="text-on-surface-variant text-lg font-body leading-relaxed max-w-md">
              Join the elite academic environment where every log, every insight, and every milestone is treated as a masterpiece of professional development.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-on-tertiary-container bg-tertiary-fixed p-2 rounded-lg">verified_user</span>
              <div>
                <h4 className="font-headline font-bold text-indigo-950">Secure Identity</h4>
                <p className="text-sm text-slate-500">Unique registration IDs ensure your intellectual property remains yours.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-on-primary-container bg-primary-fixed p-2 rounded-lg">supervisor_account</span>
              <div>
                <h4 className="font-headline font-bold text-indigo-950">Expert Guidance</h4>
                <p className="text-sm text-slate-500">Directly link with assigned academic supervisors for seamless mentoring.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onboarding Form Card */}
        <div className="lg:col-span-7 bg-surface-container-low p-1 rounded-3xl">
          <Card className="rounded-[1.25rem] p-8 lg:p-12 shadow-2xl h-full">
            <div className="mb-10">
              <span className="text-xs font-label uppercase tracking-[0.2em] text-secondary-fixed-dim font-bold">Onboarding Phase 01</span>
              <h3 className="text-2xl font-headline font-bold text-indigo-950 mt-2">Student Registration</h3>
            </div>
            
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="group">
                <label className="block text-xs font-label font-semibold text-slate-500 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-primary" htmlFor="name">Full Name</label>
                <input 
                  className="w-full bg-surface-container-low border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 px-0 py-3 text-on-surface font-body text-lg transition-all placeholder:text-slate-300 focus:bg-surface-container-lowest" 
                  id="name" 
                  placeholder="e.g. Alexander Sterling" 
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-xs font-label font-semibold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-primary" htmlFor="regNumber">Registration Number</label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-sm">fingerprint</span>
                    <input 
                      className="w-full bg-surface-container-low border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 pl-7 py-3 text-on-surface font-body text-lg transition-all placeholder:text-slate-300 focus:bg-surface-container-lowest" 
                      id="regNumber" 
                      placeholder="AC-2024-XXXX" 
                      type="text"
                      value={formData.regNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-label font-semibold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-primary" htmlFor="department">Department</label>
                  <select 
                    className="w-full bg-surface-container-low border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 px-0 py-3 text-on-surface font-body text-lg transition-all focus:bg-surface-container-lowest" 
                    id="department" 
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option disabled value="">Select Department</option>
                    <option value="Architecture & Design">Architecture & Design</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Classical Philosophy">Classical Philosophy</option>
                    <option value="Applied Mathematics">Applied Mathematics</option>
                  </select>
                </div>
              </div>

              <div className="group p-6 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5">
                <label className="block text-xs font-label font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2" htmlFor="supervisorId">
                  <span className="material-symbols-outlined text-sm">link</span>
                  Assigned Supervisor
                </label>
                <div className="relative">
                  <select 
                    className="appearance-none w-full bg-surface-container-lowest border-2 border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface font-body font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 cursor-pointer" 
                    id="supervisorId" 
                    value={formData.supervisorId}
                    onChange={handleChange}
                    required
                  >
                    <option disabled value="">Choose from available curators...</option>
                    <option value="dr-wells">Dr. Julian Wells — Senior Curator (Arch)</option>
                    <option value="prof-chen">Prof. Elena Chen — Lead Analyst (CS)</option>
                    <option value="dr-moris">Dr. Arthur Moris — Ethics & Theory</option>
                    <option value="prof-zaha">Prof. Zaha Hadid — Structural Design</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-900">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400 italic font-body">
                  * Your supervisor will be notified immediately to approve your registration.
                </p>
              </div>

              <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                  <span className="text-xs font-label font-medium uppercase tracking-tighter">Fields marked * are mandatory</span>
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-full md:w-auto px-10" 
                  icon="arrow_forward"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Complete Profile'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
};
