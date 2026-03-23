import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Button, Card } from '../components/UI';
import { View, LogEntry } from '../types';
import { useFirebase, handleFirestoreError } from '../context/FirebaseContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface NewLogEntryProps {
  onViewChange: (view: View) => void;
}

export const NewLogEntry: React.FC<NewLogEntryProps> = ({ onViewChange }) => {
  const { user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    observations: '',
    challenges: '',
    comments: '',
    category: 'General',
    location: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      setSelectedFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of selectedFiles) {
      const fileRef = ref(storage, `logs/${user?.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapshot.ref);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'Pending' | 'Draft') => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let evidenceUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploading(true);
        evidenceUrls = await uploadFiles();
        setUploading(false);
      }

      const logData = {
        studentId: user.id,
        studentName: user.name,
        supervisorId: user.supervisorId || 'unassigned',
        title: formData.title || 'Untitled Log Entry',
        date: formData.date,
        duration: formData.duration,
        status: status,
        content: formData.observations, // Using 'content' as per types.ts
        challenges: formData.challenges,
        comments: formData.comments,
        category: formData.category,
        location: formData.location,
        evidence: evidenceUrls, // Using 'evidence' as per types.ts
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'logs'), logData);
      onViewChange('dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'logs');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 pt-12 pb-32">
      {/* Hero Title Section */}
      <section className="mb-16">
        <span className="font-label text-on-primary-fixed-variant font-semibold tracking-widest uppercase text-[10px] mb-2 block">Curation Module</span>
        <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tight mb-4">New Log Entry</h2>
        <p className="font-body text-secondary max-w-2xl leading-relaxed">Document your academic journey with precision. Your entries are the artifacts of your professional growth.</p>
      </section>

      {/* Asymmetric Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Inputs Column */}
        <form className="lg:col-span-8 space-y-12" onSubmit={(e) => handleSubmit(e, 'Pending')}>
          {/* Entry Meta Section */}
          <Card variant="flat" className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-headline text-sm font-bold text-primary tracking-tight" htmlFor="title">Log Title</label>
                <input 
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg p-4 font-body transition-all" 
                  id="title" 
                  type="text" 
                  placeholder="e.g. Neural Network Optimization Lab"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-headline text-sm font-bold text-primary tracking-tight" htmlFor="date">Date of Activity</label>
                <input 
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg p-4 font-body transition-all" 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-headline text-sm font-bold text-primary tracking-tight" htmlFor="duration">Duration</label>
                <input 
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg p-4 font-body transition-all" 
                  id="duration" 
                  type="text" 
                  placeholder="e.g. 4.5 Hours"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="font-headline text-sm font-bold text-primary tracking-tight" htmlFor="location">Location</label>
                <input 
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant/20 focus:border-primary focus:ring-0 rounded-lg p-4 font-body transition-all" 
                  id="location" 
                  type="text" 
                  placeholder="e.g. Advanced Physics Lab B"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* Narrative Sections */}
          <div className="space-y-10">
            <div className="space-y-3">
              <label className="font-headline text-lg font-bold text-primary-container tracking-tight block" htmlFor="observations">Experience & Observations</label>
              <p className="text-xs text-secondary font-medium mb-2">Reflect on the insights gained during this experience. How does this connect to your theory?</p>
              <textarea 
                className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:border-primary focus:bg-surface-container-lowest focus:ring-0 rounded-xl p-6 font-body transition-all placeholder:text-slate-400" 
                id="observations" 
                placeholder="What were your key takeaways?" 
                rows={6}
                value={formData.observations}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="font-headline text-lg font-bold text-primary-container tracking-tight block" htmlFor="challenges">Challenges</label>
                <textarea 
                  className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:border-primary focus:bg-surface-container-lowest focus:ring-0 rounded-xl p-6 font-body transition-all placeholder:text-slate-400" 
                  id="challenges" 
                  placeholder="Any obstacles faced?" 
                  rows={4}
                  value={formData.challenges}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="space-y-3">
                <label className="font-headline text-lg font-bold text-primary-container tracking-tight block" htmlFor="comments">Optional Comments</label>
                <textarea 
                  className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:border-primary focus:bg-surface-container-lowest focus:ring-0 rounded-xl p-6 font-body transition-all placeholder:text-slate-400" 
                  id="comments" 
                  placeholder="Additional context..." 
                  rows={4}
                  value={formData.comments}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              type="submit" 
              className="flex-1 py-4 text-lg" 
              variant="primary" 
              icon="send"
              disabled={loading || uploading}
            >
              {uploading ? 'Uploading Media...' : loading ? 'Submitting...' : 'Submit Entry'}
            </Button>
            <Button 
              type="button" 
              className="flex-1 py-4 text-lg" 
              variant="secondary" 
              icon="draft"
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={loading || uploading}
            >
              Save as Draft
            </Button>
          </div>
        </form>

        {/* Sidebar Column: Evidence & Info */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Image Upload Bento Card */}
          <Card className="p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">add_a_photo</span>
            </div>
            <h3 className="font-headline text-xl font-bold text-primary mb-2">Evidence Curation</h3>
            <p className="text-xs text-secondary mb-6">Upload photos, certificates, or screenshots to validate your entry.</p>
            
            <input 
              type="file" 
              multiple 
              accept="image/*,application/pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant/40 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed">cloud_upload</span>
              </div>
              <div className="text-center">
                <span className="font-body font-bold text-sm text-on-surface block">Select Media</span>
                <span className="font-label text-[10px] text-slate-400">JPG, PNG, PDF up to 10MB</span>
              </div>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-outline-variant/20">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Status Card */}
          <div className="bg-indigo-50/50 rounded-xl p-6">
            <h4 className="font-headline text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              Entry Guidelines
            </h4>
            <ul className="space-y-3">
              {[
                'Minimum 150 words for professional depth.',
                'Attach at least one form of evidence.',
                'Link your observations to curriculum modules.'
              ].map((guide, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sm text-indigo-400 mt-0.5">check_circle</span>
                  <span className="text-xs text-indigo-800 leading-tight">{guide}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
};
