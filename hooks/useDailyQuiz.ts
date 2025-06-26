import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DailyQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  completed_date: string;
  is_correct: boolean;
  reward_earned: number;
  created_at: string;
}

export function useDailyQuiz() {
  const { user, profile, updateProfile } = useAuth();
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkTodaysQuizzes();
    }
  }, [user]);

  const checkTodaysQuizzes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const { data, error } = await supabase
        .from('daily_quiz_attempts')
        .select('quiz_id')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (error) {
        console.error('Error checking daily quiz attempts:', error);
        return;
      }

      const completedIds = data?.map(attempt => attempt.quiz_id) || [];
      setCompletedQuizzes(completedIds);
    } catch (error) {
      console.error('Error in checkTodaysQuizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeQuiz = async (quizId: string, isCorrect: boolean, reward: number) => {
    if (!user || !profile) return { error: 'No user logged in' };

    // Check if already completed today
    if (completedQuizzes.includes(quizId)) {
      return { error: 'Quiz already completed today' };
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // Record the quiz attempt
      const { error: insertError } = await supabase
        .from('daily_quiz_attempts')
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          completed_date: today,
          is_correct: isCorrect,
          reward_earned: isCorrect ? reward : 0
        });

      if (insertError) {
        console.error('Error recording quiz attempt:', insertError);
        return { error: 'Failed to record quiz attempt' };
      }

      // Update profile if correct answer
      if (isCorrect) {
        await updateProfile({
          dough_coins: profile.dough_coins + reward,
          total_quizzes_completed: profile.total_quizzes_completed + 1
        });
      }

      // Update local state
      setCompletedQuizzes(prev => [...prev, quizId]);

      return { error: null };
    } catch (error) {
      console.error('Error completing quiz:', error);
      return { error: 'Failed to complete quiz' };
    }
  };

  const isQuizCompleted = (quizId: string): boolean => {
    return completedQuizzes.includes(quizId);
  };

  const getTimeUntilReset = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return {
    completedQuizzes,
    loading,
    completeQuiz,
    isQuizCompleted,
    getTimeUntilReset,
    refreshQuizzes: checkTodaysQuizzes
  };
}