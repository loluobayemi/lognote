import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Badge } from '../components/UI';
import { View, LogEntry } from '../types';
import { useFirebase, handleFirestoreError } from '../context/FirebaseContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface StudentDashboardProps {
  onViewChange: (view: View) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onViewChange }) => {
  const { user, isAuthReady } = useFirebase();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady || !user || user.role !== 'student') return;

    const q = query(
      collection(db, 'logs'),
      where('studentId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LogEntry[];
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });

    return () => unsubscribe();
  }, [user, isAuthReady]);

  const stats = {
    total: logs.length,
    approved: logs.filter(l => l.status === 'Approved').length,
    pending: logs.filter(l => l.status === 'Pending').length
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:pb-24">
      {/* Welcome Hero Section */}
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="font-headline font-extrabold text-5xl md:text-6xl text-on-surface tracking-tighter mb-4">Welcome back, Curator.</h2>
            <p className="text-on-surface-variant text-lg max-w-xl">Your academic journey is a collection of milestones. Review your curated logs and progress below.</p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            icon="add_circle" 
            className="px-8 py-5"
            onClick={() => onViewChange('new-log')}
          >
            New Log Entry
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {/* Quick Stats Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-8">
              <span className="font-label text-indigo-700 uppercase tracking-widest text-xs font-bold block mb-4">Total Logs</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-5xl font-extrabold text-primary">{stats.total}</span>
                <span className="text-on-surface-variant font-medium">entries</span>
              </div>
            </Card>
            <Card className="p-8">
              <span className="font-label text-on-tertiary-container uppercase tracking-widest text-xs font-bold block mb-4">Approved</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-5xl font-extrabold text-on-tertiary-container">{stats.approved}</span>
                <span className="text-on-surface-variant font-medium">curated</span>
              </div>
            </Card>
            <Card className="p-8">
              <span className="font-label text-on-secondary-container uppercase tracking-widest text-xs font-bold block mb-4">Pending</span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-5xl font-extrabold text-on-secondary-container">{stats.pending}</span>
                <span className="text-on-surface-variant font-medium">in review</span>
              </div>
            </Card>
          </div>

          {/* Recent Logs Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline text-2xl font-bold tracking-tight text-indigo-950">Recent Artifacts</h3>
              <a className="text-primary-container font-semibold text-sm hover:underline" href="#">View All History</a>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center p-12 bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/20">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">history_edu</span>
                  <p className="text-on-surface-variant">No log entries found. Start curating your journey!</p>
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    whileHover={{ x: 4 }}
                    className="group bg-surface-container-lowest hover:bg-white p-6 rounded-2xl transition-all border border-outline-variant/5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined">
                          {log.status === 'Approved' ? 'description' : log.status === 'Pending' ? 'lab_research' : 'history_edu'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-on-surface text-lg">{log.title}</h4>
                        <p className="text-on-surface-variant text-sm mt-1">{log.date} • {log.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge variant={log.status.toLowerCase() as any}>{log.status}</Badge>
                      <span className="material-symbols-outlined text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Supervisor Feedback Card */}
          <div className="bg-primary-container text-on-primary-container p-8 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-on-primary-container/20">
                  <img src="https://picsum.photos/seed/supervisor/100/100" alt="Supervisor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white tracking-tight leading-tight">Your Supervisor</h4>
                  <span className="text-on-primary-container/80 text-xs font-label">Academic Guidance</span>
                </div>
              </div>
              <h5 className="font-headline font-bold text-xl text-white mb-3">Latest Feedback</h5>
              <blockquote className="italic text-indigo-100 leading-relaxed mb-6">
                {logs.find(l => l.feedback)?.feedback || "No feedback received yet. Submit your logs for review."}
              </blockquote>
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="bg-surface-container-low p-8 rounded-3xl">
            <h4 className="font-headline font-bold text-on-surface text-xl mb-6">Curator Progress</h4>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label text-sm font-semibold text-on-surface-variant">Monthly Target</span>
                  <span className="font-headline text-sm font-bold text-primary">
                    {Math.min(100, Math.round((stats.total / 10) * 100))}%
                  </span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (stats.total / 10) * 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FAB for mobile */}
      <button 
        onClick={() => onViewChange('new-log')}
        className="fixed bottom-28 right-6 md:bottom-12 md:right-12 bg-primary text-on-primary w-16 h-16 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 lg:hidden"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};
