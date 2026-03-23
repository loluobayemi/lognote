import { LogEntry } from './types';

export const MOCK_LOGS: LogEntry[] = [
  {
    id: '1',
    studentId: 's1',
    studentName: 'Julian Thorne',
    title: 'Applied Data Structures in ML',
    date: 'October 24, 2023',
    duration: '4.5 Hours',
    status: 'Approved',
    description: 'Focused on calibrating the interferometers for the double-slit experiment variant.',
    observations: 'Environmental vibration from adjacent cooling units introduced noise.',
    challenges: 'Noise in the sub-micrometer range.',
    category: 'Experimental Methodology',
    location: 'Advanced Physics Lab B',
    images: [
      'https://picsum.photos/seed/lab1/800/600',
      'https://picsum.photos/seed/lab2/800/600'
    ]
  },
  {
    id: '2',
    studentId: 's1',
    studentName: 'Julian Thorne',
    title: 'Weekly Seminar: Quantum Ethics',
    date: 'October 21, 2023',
    duration: '2.0 Hours',
    status: 'Pending',
    description: 'Discussion on the ethical implications of quantum computing.',
    observations: 'Strong focus on data privacy and encryption.',
    challenges: 'Balancing innovation with security.',
    category: 'Theoretical Ethics',
    location: 'Seminar Room 4',
    images: []
  },
  {
    id: '3',
    studentId: 's1',
    studentName: 'Julian Thorne',
    title: 'Literature Review: Neural Nets',
    date: 'October 19, 2023',
    duration: '6.0 Hours',
    status: 'Rejected',
    description: 'Reviewing foundational papers on convolutional neural networks.',
    observations: 'Need more peer-reviewed citations.',
    challenges: 'Synthesizing diverse viewpoints.',
    category: 'Literature Review',
    location: 'Main Library',
    images: []
  }
];

export const MOCK_STUDENTS = [
  { id: 's1', name: 'Julian Casablancas', lastActivity: 'Oct 24, 2023', cohort: 'Cohort A', progress: 82, pendingCount: 3, avatar: 'https://picsum.photos/seed/student1/100/100' },
  { id: 's2', name: 'Eliza Vance', lastActivity: 'Oct 23, 2023', cohort: 'Cohort B', progress: 45, pendingCount: 0, avatar: 'https://picsum.photos/seed/student2/100/100' },
  { id: 's3', name: 'Marcus Thorne', lastActivity: 'Oct 22, 2023', cohort: 'Cohort A', progress: 94, pendingCount: 1, avatar: 'https://picsum.photos/seed/student3/100/100' },
  { id: 's4', name: 'Sasha Grey', lastActivity: 'Oct 19, 2023', cohort: 'Cohort C', progress: 12, pendingCount: 0, avatar: 'https://picsum.photos/seed/student4/100/100', status: 'In Draft' },
];
