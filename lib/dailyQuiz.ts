import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Lesson, Question } from '@/types/lesson';

export interface DailyQuizResult {
  quiz: Lesson | null;
  alreadyCompleted: boolean;
  userProgress?: Database['public']['Tables']['user_progress']['Row'];
}

export async function fetchDailyQuiz(userId: string): Promise<DailyQuizResult> {
  // 1. Check if user has already completed a daily quiz today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoToday = today.toISOString();

  const { data: progress, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', isoToday)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (progressError) {
    throw new Error('Failed to check daily quiz progress');
  }

  if (progress && progress.completed) {
    // Already completed a quiz today
    return { quiz: null, alreadyCompleted: true, userProgress: progress };
  }

  // 2. Fetch all lessons with questions (could add a 'daily' flag if needed)
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*');

  if (lessonsError || !lessons || lessons.length === 0) {
    throw new Error('No daily quizzes available');
  }

  // Only select lessons with questions
  const lessonsWithQuestions = lessons.filter(
    (l: any) => l.content && Array.isArray(l.content.questions) && l.content.questions.length > 0
  );
  if (lessonsWithQuestions.length === 0) {
    throw new Error('No quiz lessons available');
  }

  // Pick a random lesson
  const randomLesson = lessonsWithQuestions[Math.floor(Math.random() * lessonsWithQuestions.length)];

  return { quiz: randomLesson as Lesson, alreadyCompleted: false };
}

export async function completeDailyQuiz({
  userId,
  lessonId,
  correctAnswers,
  totalQuestions,
  coinsRewarded
}: {
  userId: string;
  lessonId: string;
  correctAnswers: number;
  totalQuestions: number;
  coinsRewarded: number;
}) {
  // Upsert user_progress for today
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('user_progress')
    .upsert([
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        progress: 1.0,
        time_spent: 120, // 2 min
        completed_at: now,
        updated_at: now
      }
    ], { onConflict: 'user_id,lesson_id' });
  if (error) throw new Error('Failed to update user progress');

  // Award coins (update profile)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ dough_coins: coinsRewarded })
    .eq('id', userId);
  if (profileError) throw new Error('Failed to award coins');

  return true;
} 