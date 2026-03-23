import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Badge } from '../components/UI';
import { View, User, LogEntry } from '../types';
import { SystemAnalytics } from './SystemAnalytics';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../context/FirebaseContext';

interface AdminDashboardProps {
  onViewChange: (view: View) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewChange }) => {
  const { logout, handleFirestoreError } = useFirebase();
  const [students, setStudents] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [subView, setSubView] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const supervisorsQuery = query(collection(db, 'users'), where('role', '==', 'supervisor'));
    const logsQuery = collection(db, 'logs');

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    }, (error) => handleFirestoreError(error, 'get' as any, 'users'));

    const unsubSupervisors = onSnapshot(supervisorsQuery, (snapshot) => {
      setSupervisors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    }, (error) => handleFirestoreError(error, 'get' as any, 'users'));

    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, 'get' as any, 'logs'));

    return () => {
      unsubStudents();
      unsubSupervisors();
      unsubLogs();
    };
  }, [handleFirestoreError]);

  const stats = {
    totalStudents: students.length,
    totalLogs: logs.length,
    approvedLogs: logs.filter(l => l.status === 'Approved').length,
    pendingLogs: logs.filter(l => l.status === 'Pending').length,
    approvalRate: logs.length > 0 ? Math.round((logs.filter(l => l.status === 'Approved').length / logs.length) * 100) : 0
  };

  const getSupervisorName = (id?: string) => {
    if (!id) return null;
    return supervisors.find(s => s.id === id)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* NavigationDrawer (Desktop Only) */}
      <aside className="hidden lg:flex flex-col h-screen w-80 sticky top-0 p-6 gap-2 bg-slate-50 border-r border-outline-variant/10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-12 w-12 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-white">school</span>
          </div>
          <div>
            <div className="font-headline font-black text-indigo-900">Academic Curator</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Admin Console</div>
          </div>
        </div>
        <a 
          onClick={() => setSubView('overview')}
          className={`flex items-center gap-4 p-3 font-bold rounded-lg shadow-sm cursor-pointer hover:translate-x-1 transition-transform ${subView === 'overview' ? 'bg-white text-indigo-900' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span>Overview</span>
        </a>
        <a className="flex items-center gap-4 p-3 text-slate-600 hover:bg-slate-100 transition-all rounded-lg cursor-pointer hover:translate-x-1">
          <span className="material-symbols-outlined">groups</span>
          <span>User Management</span>
        </a>
        <a 
          onClick={() => setSubView('analytics')}
          className={`flex items-center gap-4 p-3 font-bold rounded-lg shadow-sm cursor-pointer hover:translate-x-1 transition-transform ${subView === 'analytics' ? 'bg-white text-indigo-900' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>System Analytics</span>
        </a>
        <a 
          onClick={() => onViewChange('profile')}
          className="flex items-center gap-4 p-3 text-slate-600 hover:bg-slate-100 transition-all rounded-lg cursor-pointer hover:translate-x-1"
        >
          <span className="material-symbols-outlined">person</span>
          <span>Profile Settings</span>
        </a>
        <div className="mt-auto pt-6 border-t border-slate-200 space-y-2">
          <a className="flex items-center gap-4 p-3 text-slate-600 hover:bg-slate-100 transition-all rounded-lg cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </a>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-3 text-error hover:bg-error-container/10 transition-all rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto w-full">
        {subView === 'analytics' ? (
          <SystemAnalytics logs={logs} students={students} supervisors={supervisors} />
        ) : (
          <>
            {/* Hero Header with Stats */}
            <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-headline font-extrabold tracking-tight text-primary leading-none mb-2">Institutional Pulse</h2>
              <p className="text-slate-500 font-body text-lg">Curating academic excellence through data-driven oversight.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" icon="picture_as_pdf">Export PDF</Button>
              <Button variant="primary" icon="description">Export DOCX</Button>
            </div>
          </div>
        </header>

        {/* Bento Grid Stats & Charts */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {/* Large Chart Card */}
          <Card className="md:col-span-2 lg:col-span-2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-headline text-xl font-bold text-indigo-950">Log Submission Volume</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="h-48 w-full flex items-end gap-2 px-2">
                {[40, 60, 90, 50, 75, 100, 85].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`flex-1 rounded-t-lg ${i === 2 || i === 5 ? 'bg-primary-container' : i === 1 || i === 4 ? 'bg-indigo-200' : i === 6 ? 'bg-indigo-500' : 'bg-surface-container-high'}`}
                  ></motion.div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">{stats.totalLogs} total logs submitted to date</span>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                <span className="h-2 w-2 rounded-full bg-indigo-200"></span>
                <span className="h-2 w-2 rounded-full bg-surface-container-high"></span>
              </div>
            </div>
          </Card>

          {/* Approval Rates Circle */}
          <div className="bg-primary text-white p-8 rounded-xl shadow-lg shadow-indigo-900/10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full"></div>
            <div className="z-10">
              <span className="font-headline text-5xl font-extrabold mb-2 block">{stats.approvalRate}%</span>
              <span className="font-body text-sm text-indigo-200 uppercase tracking-widest font-semibold">Overall Approval Rate</span>
              <div className="mt-6 w-full bg-indigo-950/50 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.approvalRate}%` }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-white rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>

          {/* Active Students Quick Stat */}
          <Card variant="flat" className="p-8 flex flex-col justify-between border border-outline-variant/10">
            <div>
              <span className="material-symbols-outlined text-indigo-600 mb-4 text-3xl">groups</span>
              <h3 className="font-headline text-3xl font-bold text-indigo-950">{stats.totalStudents}</h3>
              <p className="text-slate-500 text-sm font-medium">Enrolled Students</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>{supervisors.length} ACTIVE SUPERVISORS</span>
            </div>
          </Card>
        </section>

        {/* Directory Oversight Table */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h3 className="font-headline text-2xl font-bold text-indigo-950">Directory Oversight</h3>
            <div className="flex w-full md:w-auto gap-3">
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                <input className="w-full pl-10 pr-4 py-2 bg-white border-none focus:ring-2 focus:ring-primary rounded-lg text-sm shadow-sm outline-none" placeholder="Search students..." type="text" />
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/5">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Student Identity</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Supervisor</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {students.map((student, i) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 overflow-hidden">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            student.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-indigo-950">{student.name}</div>
                          <div className="text-xs text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {student.supervisorId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">{getSupervisorName(student.supervisorId)}</span>
                        </div>
                      ) : (
                        <span className="text-xs italic text-slate-400 font-medium">— Unassigned</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-on-surface-variant">{student.department || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-indigo-600 font-bold text-sm hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant italic">
                      No students found in the directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        </>
        )}
      </main>
    </div>
  );
};
