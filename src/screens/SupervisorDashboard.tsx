import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, Button, Badge } from '../components/UI';
import { View, User, LogEntry } from '../types';
import { useFirebase, handleFirestoreError } from '../context/FirebaseContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface SupervisorDashboardProps {
  onViewChange: (view: View, logId?: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onViewChange }) => {
  const { user } = useFirebase();
  const [students, setStudents] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const studentsQuery = query(
      collection(db, 'users'),
      where('supervisorId', '==', user.id),
      where('role', '==', 'student')
    );

    const logsQuery = query(
      collection(db, 'logs'),
      where('supervisorId', '==', user.id)
    );

    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => doc.data() as User);
      setStudents(studentsData);
    }, (error) => handleFirestoreError(error, 'list' as any, 'users'));

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => doc.data() as LogEntry);
      setLogs(logsData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, 'list' as any, 'logs'));

    return () => {
      unsubscribeStudents();
      unsubscribeLogs();
    };
  }, [user]);

  const pendingLogs = logs.filter(log => log.status === 'Pending');
  const approvedThisMonth = logs.filter(log => {
    if (log.status !== 'Approved' || !log.createdAt) return false;
    const logDate = new Date(log.createdAt);
    const now = new Date();
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
  });

  const getStudentStats = (studentId: string) => {
    const studentLogs = logs.filter(log => log.studentId === studentId);
    const pendingCount = studentLogs.filter(log => log.status === 'Pending').length;
    const approvedCount = studentLogs.filter(log => log.status === 'Approved').length;
    const totalCount = studentLogs.length;
    const progress = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
    
    // Find last activity
    let lastActivity = 'No activity';
    if (studentLogs.length > 0) {
      const sortedLogs = [...studentLogs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastDate = new Date(sortedLogs[0].createdAt);
      lastActivity = lastDate.toLocaleDateString();
    }

    return { pendingCount, progress, lastActivity };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      <header className="mb-12">
        <p className="font-label text-on-secondary-fixed-variant font-semibold tracking-widest uppercase mb-2">Faculty Portal</p>
        <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-4">Curator Dashboard</h2>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
          Welcome back, {user?.name}. You have <span className="font-bold text-primary">{pendingLogs.length} pending submissions</span> requiring your academic review across {students.length} active student mentees.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        <Card className="p-6 flex flex-col gap-1">
          <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">Total Students</span>
          <span className="font-headline text-4xl font-extrabold text-primary-container">{students.length}</span>
        </Card>
        <Card className="p-6 flex flex-col gap-1 border-b-4 border-tertiary-fixed">
          <span className="font-label text-xs uppercase tracking-widest text-on-tertiary-fixed-variant font-bold">Pending Reviews</span>
          <span className="font-headline text-4xl font-extrabold text-tertiary">{pendingLogs.length}</span>
        </Card>
        <Card className="p-6 flex flex-col gap-1">
          <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">Avg. Response Time</span>
          <span className="font-headline text-4xl font-extrabold text-primary-container">1.4d</span>
        </Card>
        <Card className="p-6 flex flex-col gap-1">
          <span className="font-label text-xs uppercase tracking-widest text-secondary font-bold">Approved This Month</span>
          <span className="font-headline text-4xl font-extrabold text-primary-container">{approvedThisMonth.length}</span>
        </Card>
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="font-headline text-2xl font-bold text-on-surface">Assigned Students</h3>
            <p className="text-on-surface-variant font-body mt-1">Manage and track progress for your assigned mentees.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-lg self-start">
            <button className="px-5 py-2 bg-white text-primary font-bold rounded-md shadow-sm transition-all text-sm">All Students</button>
            <button className="px-5 py-2 text-on-surface-variant hover:bg-white/50 rounded-md transition-all text-sm">Pending</button>
            <button className="px-5 py-2 text-on-surface-variant hover:bg-white/50 rounded-md transition-all text-sm">Approved</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Pending Logs Section */}
            <div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">Pending Submissions</h3>
              <div className="flex flex-col gap-4">
                {pendingLogs.length === 0 ? (
                  <Card className="p-8 text-center bg-surface-container-low">
                    <p className="text-on-surface-variant">No pending submissions to review.</p>
                  </Card>
                ) : (
                  pendingLogs.map((log) => (
                    <motion.div 
                      key={log.id}
                      whileHover={{ x: 4 }}
                      onClick={() => onViewChange('review-log', log.id)}
                      className="bg-surface-container-lowest p-5 rounded-xl group hover:bg-indigo-50/30 transition-all cursor-pointer border border-outline-variant/10 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div>
                            <h4 className="font-headline font-bold text-primary-container">{log.title}</h4>
                            <p className="text-on-surface-variant text-xs font-medium">
                              From: <span className="text-primary font-bold">{log.studentName}</span> • {new Date(log.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="pending">Review Now</Badge>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Assigned Students Section */}
            <div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">Assigned Students</h3>
              <div className="flex flex-col gap-4">
                {students.length === 0 ? (
                  <Card className="p-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-outline/20 mb-4">person_off</span>
                    <p className="text-on-surface-variant font-body">No students assigned to you yet.</p>
                  </Card>
                ) : (
                  students.map((student) => {
                    const stats = getStudentStats(student.id);
                    return (
                      <motion.div 
                        key={student.id}
                        whileHover={{ x: 4 }}
                        className="bg-surface-container-lowest p-6 rounded-xl group hover:bg-indigo-50/30 transition-all border border-outline-variant/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                              <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <h4 className="font-headline font-bold text-xl text-primary-container">{student.name}</h4>
                              <p className="text-on-surface-variant text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                Last activity: {stats.lastActivity}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right">
                            {stats.pendingCount > 0 ? (
                              <Badge variant="pending">{stats.pendingCount} Pending Reviews</Badge>
                            ) : (
                              <Badge variant="approved">No Pending Tasks</Badge>
                            )}
                            <span className="text-[11px] text-on-surface-variant font-medium">{student.department || 'No Department'} · {stats.progress}% Complete</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-indigo-950 text-white p-8 rounded-2xl relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <h5 className="font-headline text-2xl font-bold mb-4">Quick Batch Approval</h5>
                <p className="text-indigo-200 text-sm leading-relaxed mb-6">Review all minor status updates from the last 24 hours in one click.</p>
                <Button variant="secondary" className="w-full py-4 text-primary font-bold bg-primary-fixed">Begin Batch Review</Button>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <span className="material-symbols-outlined text-9xl">verified</span>
              </div>
            </div>

            <Card className="p-8 bg-surface-container-low">
              <h5 className="font-headline text-lg font-bold text-indigo-950 mb-6">Cohort Distribution</h5>
              <div className="space-y-6">
                {Array.from(new Set(students.map(s => s.department || 'Unassigned'))).map((dept) => {
                  const deptStudents = students.filter(s => (s.department || 'Unassigned') === dept);
                  const deptLogs = logs.filter(l => deptStudents.some(s => s.id === l.studentId));
                  const approvedCount = deptLogs.filter(l => l.status === 'Approved').length;
                  const totalCount = deptLogs.length;
                  const progress = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-on-surface-variant">
                        <span>{dept}</span>
                        <span>{deptStudents.length} Students</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
