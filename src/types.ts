export type Role = 'student' | 'supervisor' | 'admin';

export type View = 'login' | 'registration' | 'dashboard' | 'new-log' | 'review-log' | 'analytics' | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  department?: string;
  regNumber?: string;
  supervisor?: string;
}

export interface LogEntry {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  date: string;
  duration: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Draft';
  description: string;
  observations: string;
  challenges: string;
  comments?: string;
  category: string;
  location: string;
  images: string[];
}

export interface Feedback {
  id: string;
  logId: string;
  supervisorName: string;
  supervisorAvatar: string;
  content: string;
  date: string;
}
