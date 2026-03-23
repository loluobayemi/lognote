import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button, Card, Badge } from '../components/UI';
import { View, LogEntry } from '../types';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../context/FirebaseContext';

interface ReviewLogEntryProps {
  logId: string | null;
  onViewChange: (view: View) => void;
}

export const ReviewLogEntry: React.FC<ReviewLogEntryProps> = ({ logId, onViewChange }) => {
  const { handleFirestoreError } = useFirebase();
  const [log, setLog] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [isGradeable, setIsGradeable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLog = async () => {
      if (!logId) {
        onViewChange('dashboard');
        return;
      }

      try {
        const logDoc = await getDoc(doc(db, 'logs', logId));
        if (logDoc.exists()) {
          const data = logDoc.data() as any;
          setLog({
            id: logDoc.id,
            ...data,
            createdAt: data.createdAt?.toDate()?.toISOString() || new Date().toISOString()
          });
          setFeedback(data.feedback || '');
          setIsGradeable(data.isGradeable || false);
        } else {
          onViewChange('dashboard');
        }
      } catch (error) {
        handleFirestoreError(error, 'get' as any, `logs/${logId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [logId, onViewChange, handleFirestoreError]);

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (!logId) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'logs', logId), {
        status,
        feedback,
        isGradeable,
        reviewedAt: serverTimestamp()
      });
      onViewChange('dashboard');
    } catch (error) {
      handleFirestoreError(error, 'update' as any, `logs/${logId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!log) return null;

  return (
    <main className="max-w-7xl mx-auto px-6 pt-10 pb-32">
      {/* Pagination & Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-2">
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant font-medium mb-2">
            <span className="hover:text-primary cursor-pointer" onClick={() => onViewChange('dashboard')}>All Submissions</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-primary-container">Entry #{log.id.slice(-4).toUpperCase()}</span>
          </nav>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Review Log Entry</h2>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed overflow-hidden flex items-center justify-center text-white bg-primary">
              <span className="material-symbols-outlined text-sm">person</span>
            </div>
            <div>
              <p className="font-headline text-lg font-bold text-on-surface leading-none">{log.studentName}</p>
              <p className="text-xs text-on-surface-variant">Student ID: {log.studentId.slice(-6)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Log Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Entry Content Card */}
          <section className="bg-surface-container-lowest p-8 lg:p-10 rounded-xl shadow-sm border border-outline-variant/5">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-1">Session Date</span>
                <p className="font-headline text-2xl font-bold text-on-surface">
                  {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Badge variant={log.status === 'Approved' ? 'approved' : log.status === 'Rejected' ? 'rejected' : 'pending'}>
                {log.status}
              </Badge>
            </div>
            <div className="space-y-10">
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface-variant mb-4">Observation Notes</h3>
                <p className="font-body text-lg leading-relaxed text-on-surface/90 whitespace-pre-wrap">
                  {log.content}
                </p>
              </div>
              {log.evidence && log.evidence.length > 0 && (
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface-variant mb-6">Visual Documentation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.evidence.map((url, index) => (
                      <div key={index} className="group relative overflow-hidden rounded-xl bg-surface-container-high aspect-video cursor-zoom-in">
                        <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-8 border-t border-outline-variant/20">
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-xs uppercase font-bold text-outline mb-2">Duration</p>
                    <p className="font-headline text-xl font-bold">{log.duration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-outline mb-2">Location</p>
                    <p className="font-headline text-xl font-bold">{log.location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-outline mb-2">Category</p>
                    <p className="font-headline text-xl font-bold">{log.category || 'General'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Action Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            {/* Feedback Form */}
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/5">
              <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Supervisor Assessment</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant" htmlFor="feedback">Comments & Feedback</label>
                  <textarea 
                    className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary focus:bg-surface-container-lowest transition-all rounded-t-lg p-4 font-body text-sm placeholder:text-outline/50" 
                    id="feedback" 
                    placeholder="Provide constructive feedback for the student..." 
                    rows={5}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>
                </div>
                <label className="flex items-center gap-4 group cursor-pointer p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors">
                  <input 
                    className="peer h-6 w-6 rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary-container" 
                    type="checkbox" 
                    checked={isGradeable}
                    onChange={(e) => setIsGradeable(e.target.checked)}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Mark as Gradeable Entry</span>
                    <span className="text-xs text-on-surface-variant">This entry contributes to the final portfolio grade.</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button 
                    variant="secondary" 
                    className="hover:bg-error-container hover:text-error" 
                    icon="close" 
                    disabled={submitting}
                    onClick={() => handleAction('Rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="primary" 
                    icon="check_circle" 
                    disabled={submitting}
                    onClick={() => handleAction('Approved')}
                  >
                    {submitting ? 'Processing...' : 'Approve'}
                  </Button>
                </div>
              </div>
            </section>
            
            <div className="bg-indigo-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-indigo-700">info</span>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-indigo-950">Reviewer Note</p>
                  <p className="text-xs text-indigo-900/70 leading-relaxed">
                    Approval will notify the student and lock this entry for editing. Ensure all feedback is finalized before submitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
