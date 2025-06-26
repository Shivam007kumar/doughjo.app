import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgress {
  lesson_id: string;
  completed: boolean;
  progress: number;
  time_spent: number;
  completed_at: string | null;
}

interface QuizAttempt {
  quiz_id: string;
  selected_answer: number;
  is_correct: boolean;
  time_taken: number;
  completed_at: string;
}

export function useUserProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchQuizAttempts();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching progress:', error);
      } else {
        setProgress(data || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizAttempts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching quiz attempts:', error);
      } else {
        setQuizAttempts(data || []);
      }
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
    }
  };

  const updateLessonProgress = async (
    lessonId: string, 
    progressValue: number, 
    timeSpent: number = 0,
    completed: boolean = false
  ) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          progress: progressValue,
          time_spent: timeSpent,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });

      if (error) {
        return { error };
      }

      // Update local state
      await fetchUserProgress();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const recordQuizAttempt = async (
    quizId: string,
    selectedAnswer: number,
    isCorrect: boolean,
    timeTaken: number = 0
  ) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken: timeTaken,
          completed_at: new Date().toISOString()
        });

      if (error) {
        return { error };
      }

      // Update local state
      await fetchQuizAttempts();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getLessonProgress = (lessonId: string): UserProgress | null => {
    return progress.find(p => p.lesson_id === lessonId) || null;
  };

  const getQuizAttempts = (quizId: string): QuizAttempt[] => {
    return quizAttempts.filter(attempt => attempt.quiz_id === quizId);
  };

  const getCompletedLessonsCount = (): number => {
    return progress.filter(p => p.completed).length;
  };

  const getCorrectQuizzesCount = (): number => {
    return quizAttempts.filter(attempt => attempt.is_correct).length;
  };

  const getTotalStudyTime = (): number => {
    // Convert seconds to minutes for display
    const totalSeconds = progress.reduce((total, p) => total + p.time_spent, 0);
    return Math.round(totalSeconds / 60);
  };

  const getStreakData = () => {
    if (!user) return { currentStreak: 0, longestStreak: 0 };
    
    // This would typically come from the profile, but we can calculate it from progress
    const completedDates = progress
      .filter(p => p.completed && p.completed_at)
      .map(p => new Date(p.completed_at!).toDateString())
      .sort();
    
    // Remove duplicates (same day completions)
    const uniqueDates = [...new Set(completedDates)];
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toDateString();
    
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const date = new Date(uniqueDates[i]);
      const daysDiff = Math.floor((new Date(today).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return { currentStreak, longestStreak: currentStreak }; // Simplified for now
  };

  return {
    progress,
    quizAttempts,
    loading,
    updateLessonProgress,
    recordQuizAttempt,
    getLessonProgress,
    getQuizAttempts,
    getCompletedLessonsCount,
    getCorrectQuizzesCount,
    getTotalStudyTime,
    getStreakData,
    refreshProgress: fetchUserProgress,
    refreshQuizAttempts: fetchQuizAttempts
  };
}