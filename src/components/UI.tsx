import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 font-headline font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'academic-gradient text-white shadow-lg shadow-primary/20 hover:opacity-90',
    secondary: 'bg-surface-container-highest text-on-primary-fixed-variant hover:bg-outline-variant/30',
    tertiary: 'text-primary hover:underline underline-offset-4',
    ghost: 'text-slate-500 hover:bg-slate-50'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-md',
    md: 'px-6 py-3 text-sm rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl'
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[1.2em]">{icon}</span>}
      {children}
    </motion.button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'elevated' | 'flat' | 'low';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'elevated' }) => {
  const variants = {
    elevated: 'bg-surface-container-lowest shadow-sm border border-outline-variant/5',
    flat: 'bg-surface-container-low',
    low: 'bg-surface-container-lowest border border-outline-variant/10'
  };

  return (
    <div className={`${variants[variant]} rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'approved' | 'pending' | 'rejected' | 'draft';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'pending', className = '' }) => {
  const variants = {
    approved: 'bg-tertiary-fixed text-on-tertiary-container',
    pending: 'bg-secondary-fixed text-on-secondary-container',
    rejected: 'bg-error-container text-on-error-container',
    draft: 'bg-surface-container-highest text-on-surface-variant'
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
