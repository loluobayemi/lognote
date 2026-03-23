import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, Button } from '../components/UI';
import { useFirebase } from '../context/FirebaseContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export const ProfileSettings: React.FC = () => {
  const { user } = useFirebase();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [regNumber, setRegNumber] = useState(user?.regNumber || '');
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name,
        department,
        regNumber,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.id}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        avatar: downloadURL,
      });
      alert('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-headline font-extrabold text-4xl text-on-surface mb-8">Profile Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <Card className="p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10 ring-4 ring-surface shadow-xl">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-white text-3xl">
                  {uploading ? 'sync' : 'photo_camera'}
                </span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-1">{user.name}</h3>
            <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">{user.role}</p>
            <p className="text-on-surface-variant text-xs mt-2">{user.email}</p>
          </Card>

          {/* Details Section */}
          <Card className="md:col-span-2 p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>

              {user.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Department</label>
                    <input 
                      type="text" 
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Registration Number</label>
                    <input 
                      type="text" 
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-4"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
