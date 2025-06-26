export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  translation?: {
    from: string;
    to: string;
  };
  tags?: string[];
  metadata?: {
    estimatedTime?: number;
    points?: number;
    source?: string;
  };
}

export interface Translation {
  id: string;
  type: 'translation';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  from: string;
  to: string;
  alternatives?: string[];
  context?: string;
  tags?: string[];
  metadata?: {
    estimatedTime?: number;
    points?: number;
    language?: string;
  };
}

export interface Exercise {
  id: string;
  type: 'exercise';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  scenario?: any;
  tasks?: string[];
  solution?: any;
  tags?: string[];
  metadata?: {
    estimatedTime?: number;
    points?: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  xpReward: number;
  estimatedTime: number;
  prerequisites?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  hearts: number;
  attempts: number;
  bestScore: number;
  totalTimeSpent: number; // in seconds
  lastAttempt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  id: string;
  type: 'question' | 'translation' | 'exercise';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  metadata?: {
    estimatedTime?: number;
    points?: number;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonFilters {
  category?: string;
  difficulty?: string;
  tags?: string[];
  minDuration?: number;
  maxDuration?: number;
}

export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}