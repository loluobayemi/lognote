import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

const VerifyEmailScreen: React.FC = () => {
  const { logout, sendVerification, reloadUser, emailVerified } = useFirebase();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  const handleResend = async () => {
    setSending(true);
    setMessage(null);
    try {
      await sendVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send verification email.');
    } finally {
      setSending(false);
    }
  };

  const handleReload = async () => {
    setReloading(true);
    try {
      await reloadUser();
    } catch (error) {
      console.error('Failed to reload user:', error);
    } finally {
      setReloading(false);
    }
  };

  // Auto-reload every 5 seconds to check if verified
  useEffect(() => {
    const interval = setInterval(() => {
      if (!emailVerified) {
        reloadUser();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [emailVerified, reloadUser]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-on-surface mb-4">Verify your email</h1>
        <p className="text-on-surface-variant mb-8">
          We've sent a verification link to your email address. Please click the link to verify your account and access your dashboard.
        </p>

        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleReload}
            disabled={reloading}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${reloading ? 'animate-spin' : ''}`} />
            {reloading ? 'Checking...' : 'I have verified my email'}
          </button>

          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full py-3 border border-outline text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Resend verification email'}
          </button>

          <button
            onClick={() => logout()}
            className="w-full py-3 text-on-surface-variant font-medium flex items-center justify-center gap-2 hover:text-on-surface transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-outline-variant">
          <div className="flex items-center justify-center gap-2 text-sm text-on-surface-variant">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Automatic check every 5 seconds</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailScreen;
